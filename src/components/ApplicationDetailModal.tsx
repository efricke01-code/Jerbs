import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplicationsStore } from "../store/applicationsStore";
import { useResumeStore } from "../store/resumeStore";
import { useSettingsStore } from "../store/settingsStore";
import { GeminiApiError, tailorApplication } from "../lib/gemini";
import { isResumeUsable } from "../lib/formatResume";
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from "../types";
import { Badge, Button, Input, Label, Modal, Select, Spinner, TextArea } from "./ui";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function ApplicationDetailModal({
  application,
  onClose,
}: {
  application: JobApplication | null;
  onClose: () => void;
}) {
  const updateApplication = useApplicationsStore((s) => s.updateApplication);
  const removeApplication = useApplicationsStore((s) => s.removeApplication);
  const resume = useResumeStore((s) => s.resume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const { apiKey, model } = useSettingsStore();
  const [tailoring, setTailoring] = useState(false);
  const [showResult, setShowResult] = useState<"resume" | "coverLetter">("resume");

  if (!application) return null;
  const app = application;

  async function handleTailor() {
    if (!apiKey) return;
    setTailoring(true);
    updateApplication(app.id, { tailorError: "" });
    try {
      const result = await tailorApplication({
        apiKey,
        model,
        resume,
        coverLetter,
        company: app.company,
        role: app.role,
        jobDescription: app.jobDescription,
      });
      updateApplication(app.id, {
        tailoredResume: result.resume,
        tailoredCoverLetter: result.coverLetter,
        tailoredAt: new Date().toISOString(),
        tailorError: "",
      });
    } catch (err) {
      const message = err instanceof GeminiApiError ? err.message : "Something went wrong generating your materials.";
      updateApplication(app.id, { tailorError: message });
    } finally {
      setTailoring(false);
    }
  }

  return (
    <Modal open={Boolean(application)} onClose={onClose} title={`${app.role} — ${app.company}`} wide>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Status</Label>
            <Select
              value={app.status}
              onChange={(e) => updateApplication(app.id, { status: e.target.value as ApplicationStatus })}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Job posting URL</Label>
            <Input
              value={app.url}
              onChange={(e) => updateApplication(app.id, { url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Salary range</Label>
            <Input
              value={app.salaryRange}
              onChange={(e) => updateApplication(app.id, { salaryRange: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact name</Label>
            <Input
              value={app.contactName}
              onChange={(e) => updateApplication(app.id, { contactName: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input
              value={app.contactEmail}
              onChange={(e) => updateApplication(app.id, { contactEmail: e.target.value })}
            />
          </div>
          <div>
            <Label>Next step date</Label>
            <Input
              type="date"
              value={app.nextStepDate ?? ""}
              onChange={(e) => updateApplication(app.id, { nextStepDate: e.target.value || null })}
            />
          </div>
        </div>

        <div>
          <Label>Job description</Label>
          <TextArea
            value={app.jobDescription}
            onChange={(e) => updateApplication(app.id, { jobDescription: e.target.value })}
            rows={6}
          />
        </div>

        <div>
          <Label>Notes</Label>
          <TextArea
            value={app.notes}
            onChange={(e) => updateApplication(app.id, { notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Tailored resume &amp; cover letter</h4>
            {app.tailoredAt && <Badge color="green">Generated {new Date(app.tailoredAt).toLocaleString()}</Badge>}
          </div>

          {!apiKey && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Add your free Gemini API key in{" "}
              <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 underline" onClick={onClose}>
                Settings
              </Link>{" "}
              to enable AI tailoring.
            </p>
          )}

          {apiKey && !isResumeUsable(resume) && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Fill in your{" "}
              <Link to="/resume" className="text-indigo-600 dark:text-indigo-400 underline" onClick={onClose}>
                base resume
              </Link>{" "}
              first — at minimum your name and a summary or one job.
            </p>
          )}

          {apiKey && isResumeUsable(resume) && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Generates a tailored resume and cover letter from your base resume and this job description, using
                Gemini ({model}). Nothing is invented — only your real background is reworded and reordered to fit.
              </p>
              <Button onClick={handleTailor} disabled={tailoring || !app.jobDescription.trim()}>
                {tailoring ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Tailoring...
                  </span>
                ) : app.tailoredAt ? (
                  "Regenerate"
                ) : (
                  "Tailor with AI"
                )}
              </Button>
              {!app.jobDescription.trim() && (
                <p className="text-xs text-slate-400 mt-1">Add a job description above first.</p>
              )}
              {app.tailorError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{app.tailorError}</p>}
            </>
          )}

          {app.tailoredAt && (
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <Button
                  variant={showResult === "resume" ? "primary" : "secondary"}
                  onClick={() => setShowResult("resume")}
                >
                  Resume
                </Button>
                <Button
                  variant={showResult === "coverLetter" ? "primary" : "secondary"}
                  onClick={() => setShowResult("coverLetter")}
                >
                  Cover letter
                </Button>
              </div>
              <TextArea
                readOnly
                value={showResult === "resume" ? app.tailoredResume : app.tailoredCoverLetter}
                rows={14}
                className="font-mono text-xs"
              />
              <div className="flex gap-2 mt-2">
                <CopyButton
                  text={showResult === "resume" ? app.tailoredResume : app.tailoredCoverLetter}
                  label="Copy to clipboard"
                />
                <Button
                  variant="secondary"
                  onClick={() =>
                    download(
                      `${app.company || "application"}-${showResult === "resume" ? "resume" : "cover-letter"}.txt`,
                      showResult === "resume" ? app.tailoredResume : app.tailoredCoverLetter,
                    )
                  }
                >
                  Download .txt
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="danger"
            onClick={() => {
              removeApplication(app.id);
              onClose();
            }}
          >
            Delete application
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
