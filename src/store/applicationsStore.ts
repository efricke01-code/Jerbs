import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { ApplicationStatus, JobApplication } from "../types";

interface ApplicationsState {
  applications: JobApplication[];
  addApplication: (
    app: Partial<
      Pick<
        JobApplication,
        "company" | "role" | "location" | "url" | "salaryRange" | "jobDescription" | "notes"
      >
    >,
  ) => string;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  removeApplication: (id: string) => void;
  setStatus: (id: string, status: ApplicationStatus) => void;
}

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: (app) => {
        const id = uuid();
        const newApp: JobApplication = {
          id,
          company: app.company ?? "",
          role: app.role ?? "",
          location: app.location ?? "",
          url: app.url ?? "",
          salaryRange: app.salaryRange ?? "",
          jobDescription: app.jobDescription ?? "",
          status: "saved",
          createdAt: new Date().toISOString(),
          dateApplied: null,
          nextStepDate: null,
          contactName: "",
          contactEmail: "",
          notes: app.notes ?? "",
          tailoredResume: "",
          tailoredCoverLetter: "",
          tailoredAt: null,
          tailorError: "",
        };
        set((state) => ({ applications: [newApp, ...state.applications] }));
        return id;
      },
      updateApplication: (id, updates) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),
      removeApplication: (id) =>
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        })),
      setStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  dateApplied:
                    status === "applied" && !a.dateApplied
                      ? new Date().toISOString()
                      : a.dateApplied,
                }
              : a,
          ),
        })),
    }),
    { name: "jerbs-applications" },
  ),
);
