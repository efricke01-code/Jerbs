import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  BaseResume,
  CoverLetterBase,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from "../types";

interface ResumeState {
  resume: BaseResume;
  coverLetter: CoverLetterBase;
  setResumeField: <K extends keyof BaseResume>(field: K, value: BaseResume[K]) => void;
  setSkills: (skills: string[]) => void;
  addExperience: () => void;
  updateExperience: (id: string, updates: Partial<ResumeExperience>) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<ResumeEducation>) => void;
  removeEducation: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<ResumeProject>) => void;
  removeProject: (id: string) => void;
  setCoverLetterField: <K extends keyof CoverLetterBase>(
    field: K,
    value: CoverLetterBase[K],
  ) => void;
}

const emptyResume: BaseResume = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
};

const emptyCoverLetter: CoverLetterBase = {
  tone: "Professional and direct, confident but not boastful.",
  talkingPoints: "",
  closing: "",
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: emptyResume,
      coverLetter: emptyCoverLetter,
      setResumeField: (field, value) =>
        set((state) => ({ resume: { ...state.resume, [field]: value } })),
      setSkills: (skills) =>
        set((state) => ({ resume: { ...state.resume, skills } })),
      addExperience: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: [
              ...state.resume.experience,
              {
                id: uuid(),
                company: "",
                title: "",
                location: "",
                startDate: "",
                endDate: "",
                bullets: [""],
              },
            ],
          },
        })),
      updateExperience: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((e) =>
              e.id === id ? { ...e, ...updates } : e,
            ),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.filter((e) => e.id !== id),
          },
        })),
      addEducation: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [
              ...state.resume.education,
              {
                id: uuid(),
                school: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                details: "",
              },
            ],
          },
        })),
      updateEducation: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((e) =>
              e.id === id ? { ...e, ...updates } : e,
            ),
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((e) => e.id !== id),
          },
        })),
      addProject: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: [
              ...state.resume.projects,
              { id: uuid(), name: "", description: "", bullets: [""] },
            ],
          },
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((p) =>
              p.id === id ? { ...p, ...updates } : p,
            ),
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.filter((p) => p.id !== id),
          },
        })),
      setCoverLetterField: (field, value) =>
        set((state) => ({ coverLetter: { ...state.coverLetter, [field]: value } })),
    }),
    { name: "jerbs-resume" },
  ),
);
