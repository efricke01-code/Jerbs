import type { BaseResume, ClaudeModel, CoverLetterBase } from "../types";
import { formatCoverLetterBaseAsText, formatResumeAsText } from "./formatResume";

const API_URL = "https://api.anthropic.com/v1/messages";
const RESUME_MARKER = "<<<TAILORED_RESUME>>>";
const COVER_LETTER_MARKER = "<<<TAILORED_COVER_LETTER>>>";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  content: AnthropicContentBlock[];
  stop_reason: string;
  stop_details?: { category: string | null; explanation?: string } | null;
}

export class ClaudeApiError extends Error {}

async function callClaude(params: {
  apiKey: string;
  model: ClaudeModel;
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const { apiKey, model, system, userMessage, maxTokens = 8000 } = params;

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch {
    throw new ClaudeApiError(
      "Couldn't reach the Claude API from the browser. Check your internet connection.",
    );
  }

  if (!res.ok) {
    let message = `Claude API request failed (HTTP ${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    if (res.status === 401) {
      message = "That API key was rejected. Double-check it in Settings.";
    }
    throw new ClaudeApiError(message);
  }

  const data = (await res.json()) as AnthropicMessageResponse;

  if (data.stop_reason === "refusal") {
    const category = data.stop_details?.category ?? "unspecified";
    throw new ClaudeApiError(
      `Claude declined to generate this (category: ${category}). Try trimming the job description or rephrasing it.`,
    );
  }

  const text = data.content.find((b) => b.type === "text")?.text;
  if (!text) {
    throw new ClaudeApiError("Claude returned an empty response. Try again.");
  }
  return text;
}

const TAILOR_SYSTEM_PROMPT = `You are an expert resume writer and career coach helping a job seeker tailor their application materials to one specific job posting.

Ground rules:
- Use only facts present in the candidate's base resume below. Never invent employers, job titles, dates, degrees, or accomplishments that aren't there.
- You may reorder, re-emphasize, and rephrase existing experience and skills to foreground what's most relevant to the job description, and tighten wording for clarity and impact.
- Keep the resume ATS-friendly: plain text, no tables, standard section headers, quantify impact where the source material already supports a number.
- The cover letter should be genuine and specific to this company and role — reference concrete details from the job description — and should reflect the candidate's stated tone preference. Avoid generic filler and cliches ("team player", "results-driven").
- Do not fabricate a hiring manager's name if none is given; use a neutral greeting instead.
- Output length: resume roughly one page equivalent; cover letter 3-4 short paragraphs.

Output format (exactly, no extra commentary before/after):
${RESUME_MARKER}
<the full tailored resume as plain text>
${COVER_LETTER_MARKER}
<the full tailored cover letter as plain text, including greeting and sign-off>`;

export interface TailorResult {
  resume: string;
  coverLetter: string;
}

function parseTailorResponse(raw: string): TailorResult {
  const resumeIdx = raw.indexOf(RESUME_MARKER);
  const coverIdx = raw.indexOf(COVER_LETTER_MARKER);
  if (resumeIdx === -1 || coverIdx === -1 || coverIdx < resumeIdx) {
    throw new ClaudeApiError(
      "Claude's response wasn't in the expected format. Try regenerating.",
    );
  }
  const resume = raw.slice(resumeIdx + RESUME_MARKER.length, coverIdx).trim();
  const coverLetter = raw.slice(coverIdx + COVER_LETTER_MARKER.length).trim();
  return { resume, coverLetter };
}

export async function tailorApplication(params: {
  apiKey: string;
  model: ClaudeModel;
  resume: BaseResume;
  coverLetter: CoverLetterBase;
  company: string;
  role: string;
  jobDescription: string;
}): Promise<TailorResult> {
  const { apiKey, model, resume, coverLetter, company, role, jobDescription } = params;

  const userMessage = `BASE RESUME:
${formatResumeAsText(resume)}

COVER LETTER GUIDANCE:
${formatCoverLetterBaseAsText(coverLetter) || "(no specific guidance given — use a professional, confident tone)"}

TARGET COMPANY: ${company || "(not specified — infer from the job description if possible)"}
TARGET ROLE: ${role || "(not specified — infer from the job description)"}

JOB DESCRIPTION (pasted by the candidate):
"""
${jobDescription}
"""

Produce the tailored resume and cover letter now, following the required output format exactly.`;

  const raw = await callClaude({
    apiKey,
    model,
    system: TAILOR_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 8000,
  });

  return parseTailorResponse(raw);
}
