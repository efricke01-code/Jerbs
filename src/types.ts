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

export interface CoverLetterBase {
  tone: string;
  talkingPoints: string;
  closing: string;
}

export type ClaudeModel =
  | "claude-opus-5"
  | "claude-sonnet-5"
  | "claude-haiku-4-5"
  | "claude-fable-5";

export interface Settings {
  apiKey: string;
  model: ClaudeModel;
}

export interface SavedSearchProfile {
  id: string;
  name: string;
  keywords: string;
  location: string;
  remote: boolean;
  createdAt: string;
}
