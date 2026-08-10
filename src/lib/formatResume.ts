import type { BaseResume, CoverLetterBase } from "../types";

export function formatResumeAsText(resume: BaseResume): string {
  const lines: string[] = [];

  lines.push(resume.fullName || "(name not set)");
  const contactBits = [resume.email, resume.phone, resume.location, resume.linkedin, resume.website].filter(
    Boolean,
  );
  if (contactBits.length) lines.push(contactBits.join(" | "));
  lines.push("");

  if (resume.summary) {
    lines.push("SUMMARY");
    lines.push(resume.summary);
    lines.push("");
  }

  if (resume.skills.length) {
    lines.push("SKILLS");
    lines.push(resume.skills.join(", "));
    lines.push("");
  }

  if (resume.experience.length) {
    lines.push("EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push(`${exp.title} — ${exp.company}${exp.location ? `, ${exp.location}` : ""}`);
      lines.push(`${exp.startDate} – ${exp.endDate || "Present"}`);
      for (const bullet of exp.bullets.filter(Boolean)) {
        lines.push(`- ${bullet}`);
      }
      lines.push("");
    }
  }

  if (resume.projects.length) {
    lines.push("PROJECTS");
    for (const proj of resume.projects) {
      lines.push(proj.name);
      if (proj.description) lines.push(proj.description);
      for (const bullet of proj.bullets.filter(Boolean)) {
        lines.push(`- ${bullet}`);
      }
      lines.push("");
    }
  }

  if (resume.education.length) {
    lines.push("EDUCATION");
    for (const edu of resume.education) {
      lines.push(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""} — ${edu.school}`);
      lines.push(`${edu.startDate} – ${edu.endDate || "Present"}`);
      if (edu.details) lines.push(edu.details);
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export function formatCoverLetterBaseAsText(coverLetter: CoverLetterBase): string {
  const lines: string[] = [];
  if (coverLetter.tone) lines.push(`Preferred tone: ${coverLetter.tone}`);
  if (coverLetter.talkingPoints) {
    lines.push("Talking points / recurring themes to draw on:");
    lines.push(coverLetter.talkingPoints);
  }
  if (coverLetter.closing) {
    lines.push(`Preferred closing style: ${coverLetter.closing}`);
  }
  return lines.join("\n");
}

export function isResumeUsable(resume: BaseResume): boolean {
  return Boolean(resume.fullName.trim() && (resume.summary.trim() || resume.experience.length > 0));
}
