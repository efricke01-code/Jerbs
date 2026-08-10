import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { SavedSearchProfile } from "../types";

interface JobBoardsState {
  profiles: SavedSearchProfile[];
  addProfile: (profile: Omit<SavedSearchProfile, "id" | "createdAt">) => void;
  updateProfile: (id: string, updates: Partial<SavedSearchProfile>) => void;
  removeProfile: (id: string) => void;
}

export const useJobBoardsStore = create<JobBoardsState>()(
  persist(
    (set) => ({
      profiles: [],
      addProfile: (profile) =>
        set((state) => ({
          profiles: [
            { ...profile, id: uuid(), createdAt: new Date().toISOString() },
            ...state.profiles,
          ],
        })),
      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removeProfile: (id) =>
        set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) })),
    }),
    { name: "jerbs-job-boards" },
  ),
);
