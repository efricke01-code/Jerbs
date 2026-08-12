export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string;
  salaryRange: string;
  jobDescription: string;
  status: ApplicationStatus;
  createdAt: string;
  dateApplied: string | null;
  nextStepDate: string | null;
  contactName: string;
  contactEmail: string;
  notes: string;
  tailoredResume: string;
  tailoredCoverLetter: string;
  tailoredAt: string | null;
  tailorError: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  bullets: string[];
}

export interface BaseResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
}

// Same shape as BaseResume but without generated `id` fields — this is what the AI
// returns when parsing an uploaded resume file. IDs get assigned locally afterward.
export interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string[];
  experience: Omit<ResumeExperience, "id">[];
  education: Omit<ResumeEducation, "id">[];
  projects: Omit<ResumeProject, "id">[];
}

export interface CoverLetterBase {
  tone: string;
  talkingPoints: string;
  closing: string;
}

export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-2.0-flash";

export interface Settings {
  apiKey: string;
  model: GeminiModel;
}

export interface SavedSearchProfile {
  id: string;
  name: string;
  keywords: string;
  location: string;
  remote: boolean;
  createdAt: string;
}
