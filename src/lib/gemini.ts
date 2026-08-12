import type { BaseResume, CoverLetterBase, GeminiModel, ParsedResume } from "../types";
import { formatCoverLetterBaseAsText, formatResumeAsText } from "./formatResume";

const RESUME_MARKER = "<<<TAILORED_RESUME>>>";
const COVER_LETTER_MARKER = "<<<TAILORED_COVER_LETTER>>>";

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[]; role?: string };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

export class GeminiApiError extends Error {}

function endpointFor(model: GeminiModel): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function callGemini(params: {
  apiKey: string;
  model: GeminiModel;
  system: string;
  userMessage: string;
  maxOutputTokens?: number;
  responseSchema?: Record<string, unknown>;
}): Promise<string> {
  const { apiKey, model, system, userMessage, maxOutputTokens = 8000, responseSchema } = params;

  const generationConfig: Record<string, unknown> = { maxOutputTokens };
  if (responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = responseSchema;
  }

  let res: Response;
  try {
    res = await fetch(endpointFor(model), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig,
      }),
    });
  } catch {
    throw new GeminiApiError(
      "Couldn't reach the Gemini API from the browser. Check your internet connection.",
    );
  }

  if (!res.ok) {
    let message = `Gemini API request failed (HTTP ${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    if (res.status === 400 && /API key/i.test(message)) {
      message = "That API key was rejected. Double-check it in Settings.";
    } else if (res.status === 429) {
      message =
        "You've hit Gemini's free-tier rate limit. Wait a bit and try again, or switch to a lighter model in Settings.";
    }
    throw new GeminiApiError(message);
  }

  const data = (await res.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    throw new GeminiApiError(
      `Gemini declined to generate this (reason: ${data.promptFeedback.blockReason}). Try trimming or rephrasing the job description.`,
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new GeminiApiError("Gemini returned an empty response. Try again.");
  }
  if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
    throw new GeminiApiError(
      `Gemini declined to generate this (reason: ${candidate.finishReason}). Try trimming or rephrasing the job description.`,
    );
  }

  const text = (candidate.content?.parts ?? []).map((p) => p.text ?? "").join("");
  if (!text) {
    throw new GeminiApiError("Gemini returned an empty response. Try again.");
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
    throw new GeminiApiError(
      "Gemini's response wasn't in the expected format. Try regenerating.",
    );
  }
  const resume = raw.slice(resumeIdx + RESUME_MARKER.length, coverIdx).trim();
  const coverLetter = raw.slice(coverIdx + COVER_LETTER_MARKER.length).trim();
  return { resume, coverLetter };
}

export async function tailorApplication(params: {
  apiKey: string;
  model: GeminiModel;
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

  const raw = await callGemini({
    apiKey,
    model,
    system: TAILOR_SYSTEM_PROMPT,
    userMessage,
    maxOutputTokens: 8000,
  });

  return parseTailorResponse(raw);
}

const EXPERIENCE_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    company: { type: "STRING" },
    title: { type: "STRING" },
    location: { type: "STRING" },
    startDate: { type: "STRING" },
    endDate: { type: "STRING" },
    bullets: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["company", "title", "location", "startDate", "endDate", "bullets"],
};

const EDUCATION_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    school: { type: "STRING" },
    degree: { type: "STRING" },
    field: { type: "STRING" },
    startDate: { type: "STRING" },
    endDate: { type: "STRING" },
    details: { type: "STRING" },
  },
  required: ["school", "degree", "field", "startDate", "endDate", "details"],
};

const PROJECT_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    description: { type: "STRING" },
    bullets: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["name", "description", "bullets"],
};

const RESUME_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    fullName: { type: "STRING" },
    email: { type: "STRING" },
    phone: { type: "STRING" },
    location: { type: "STRING" },
    linkedin: { type: "STRING" },
    website: { type: "STRING" },
    summary: { type: "STRING" },
    skills: { type: "ARRAY", items: { type: "STRING" } },
    experience: { type: "ARRAY", items: EXPERIENCE_ITEM_SCHEMA },
    education: { type: "ARRAY", items: EDUCATION_ITEM_SCHEMA },
    projects: { type: "ARRAY", items: PROJECT_ITEM_SCHEMA },
  },
  required: [
    "fullName",
    "email",
    "phone",
    "location",
    "linkedin",
    "website",
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
  ],
};

const PARSE_RESUME_SYSTEM_PROMPT = `You extract structured data from a resume's raw text (pulled from a PDF/DOCX, so spacing and line breaks may be imperfect).

Rules:
- Only use information present in the text. Never invent an employer, title, date, degree, or achievement.
- If a field isn't present anywhere in the text, use an empty string ("") for scalar fields or an empty array ([]) for list fields. Never use placeholder text like "N/A" or "Unknown".
- Preserve dates as they appear (e.g. "Jan 2021", "2021", "06/2021") — don't reformat them.
- Split experience bullet points as they were in the original (one bullet per accomplishment/line), lightly cleaning up obvious OCR/extraction artifacts (stray line breaks mid-sentence, repeated whitespace) without changing wording or meaning.
- "linkedin" and "website" are URLs/handles if present in the header/contact area — leave blank if not present.
- If the resume includes a distinct "Projects" section, put those under projects; don't duplicate them under experience.`;

export async function parseResumeText(params: {
  apiKey: string;
  model: GeminiModel;
  resumeText: string;
}): Promise<ParsedResume> {
  const { apiKey, model, resumeText } = params;

  const raw = await callGemini({
    apiKey,
    model,
    system: PARSE_RESUME_SYSTEM_PROMPT,
    userMessage: `RESUME TEXT:\n"""\n${resumeText}\n"""\n\nExtract this into the required structured format.`,
    maxOutputTokens: 8000,
    responseSchema: RESUME_RESPONSE_SCHEMA,
  });

  try {
    return JSON.parse(raw) as ParsedResume;
  } catch {
    throw new GeminiApiError("Gemini's response couldn't be parsed as resume data. Try again.");
  }
}
