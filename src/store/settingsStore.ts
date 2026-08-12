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
      model: "gemini-2.5-flash",
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      clearApiKey: () => set({ apiKey: "" }),
    }),
    {
      name: "jerbs-settings",
      version: 2,
      // v1 stored an Anthropic model id / key; discard both if a browser still has them.
      migrate: (persisted) => {
        const state = persisted as Partial<SettingsState>;
        if (typeof state.model !== "string" || !state.model.startsWith("gemini-")) {
          state.model = "gemini-2.5-flash";
        }
        if (typeof state.apiKey !== "string" || state.apiKey.startsWith("sk-ant-")) {
          state.apiKey = "";
        }
        return state as SettingsState;
      },
    },
  ),
);
