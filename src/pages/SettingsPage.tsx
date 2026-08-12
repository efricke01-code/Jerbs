import { useState } from "react";
import { Button, Card, Input, Label, SectionHeader, Select } from "../components/ui";
import { useSettingsStore } from "../store/settingsStore";
import type { GeminiModel } from "../types";

const MODEL_OPTIONS: { value: GeminiModel; label: string; blurb: string }[] = [
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    blurb: "Recommended default — strong quality and speed, comfortably within free-tier limits.",
  },
  {
    value: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    blurb: "Fastest and lightest — good if you're hitting rate limits on Flash.",
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    blurb: "Previous-generation Flash model — a fallback if 2.5 models are ever unavailable.",
  },
];

export function SettingsPage() {
  const { apiKey, model, setApiKey, setModel, clearApiKey } = useSettingsStore();
  const [draftKey, setDraftKey] = useState(apiKey);
  const [reveal, setReveal] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Configure AI-powered tailoring — free, via Google's Gemini API." />

      <Card className="p-4 space-y-4">
        <div>
          <Label>Gemini API key</Label>
          <div className="flex gap-2">
            <Input
              type={reveal ? "text" : "password"}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="AIza..."
              autoComplete="off"
            />
            <Button variant="secondary" onClick={() => setReveal((r) => !r)}>
              {reveal ? "Hide" : "Show"}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Stored only in this browser's local storage — never sent anywhere except directly to Google's Gemini API
            when you tailor an application or upload a resume. This app has no backend or server of its own. Because
            the key lives in the browser, anyone with access to this device/browser profile could read it — don't use
            this on a shared computer.
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Get a free key at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              aistudio.google.com/apikey
            </a>{" "}
            — sign in with a Google account and click "Create API key." No credit card and no billing account
            required; the free tier is rate-limited (per-minute and per-day request caps) but plenty for personal use.
            If you ever hit a rate limit, wait a bit and try again, or switch to a lighter model below.
          </p>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setApiKey(draftKey.trim())} disabled={draftKey.trim() === apiKey}>
              Save key
            </Button>
            {apiKey && (
              <Button
                variant="danger"
                onClick={() => {
                  clearApiKey();
                  setDraftKey("");
                }}
              >
                Remove key
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label>Model</Label>
          <Select value={model} onChange={(e) => setModel(e.target.value as GeminiModel)}>
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-400 mt-1">
            {MODEL_OPTIONS.find((o) => o.value === model)?.blurb}
          </p>
        </div>
      </Card>
    </div>
  );
}
