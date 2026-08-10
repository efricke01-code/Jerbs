import { useState } from "react";
import { Button, Card, Input, Label, SectionHeader, Select } from "../components/ui";
import { useSettingsStore } from "../store/settingsStore";
import type { ClaudeModel } from "../types";

const MODEL_OPTIONS: { value: ClaudeModel; label: string; blurb: string }[] = [
  { value: "claude-opus-5", label: "Claude Opus 5", blurb: "Most capable — best for nuanced tailoring. Higher cost." },
  { value: "claude-sonnet-5", label: "Claude Sonnet 5", blurb: "Strong quality, faster and cheaper than Opus." },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5", blurb: "Fastest and cheapest — good for quick drafts." },
  { value: "claude-fable-5", label: "Claude Fable 5", blurb: "Anthropic's most capable model overall. Premium cost." },
];

export function SettingsPage() {
  const { apiKey, model, setApiKey, setModel, clearApiKey } = useSettingsStore();
  const [draftKey, setDraftKey] = useState(apiKey);
  const [reveal, setReveal] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Configure AI-powered tailoring." />

      <Card className="p-4 space-y-4">
        <div>
          <Label>Anthropic API key</Label>
          <div className="flex gap-2">
            <Input
              type={reveal ? "text" : "password"}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
            />
            <Button variant="secondary" onClick={() => setReveal((r) => !r)}>
              {reveal ? "Hide" : "Show"}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Stored only in this browser's local storage — never sent anywhere except directly to Anthropic's API when
            you tailor an application. This app has no backend or server of its own. Because the key lives in the
            browser, anyone with access to this device/browser profile could read it — don't use this on a shared
            computer. Get a key at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              console.anthropic.com
            </a>
            .
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
          <Select value={model} onChange={(e) => setModel(e.target.value as ClaudeModel)}>
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
