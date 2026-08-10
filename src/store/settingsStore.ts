import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "../types";

interface SettingsState extends Settings {
  setApiKey: (key: string) => void;
  setModel: (model: Settings["model"]) => void;
  clearApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: "claude-opus-5",
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      clearApiKey: () => set({ apiKey: "" }),
    }),
    { name: "jerbs-settings" },
  ),
);
