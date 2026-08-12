import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GeminiApiError, parseResumeText } from "../lib/gemini";
import { isResumeUsable } from "../lib/formatResume";
import { extractResumeText, ResumeFileParseError } from "../lib/parseResumeFile";
import { useResumeStore } from "../store/resumeStore";
import { useSettingsStore } from "../store/settingsStore";
import { Button, Modal, Spinner } from "./ui";

type Stage = "idle" | "reading" | "parsing" | "error";

export function ResumeUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { apiKey, model } = useSettingsStore();
  const resume = useResumeStore((s) => s.resume);
  const applyParsedResume = useResumeStore((s) => s.applyParsedResume);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  function reset() {
    setStage("idle");
    setError("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    if (isResumeUsable(resume)) {
      const confirmed = window.confirm(
        "This will replace your current base resume with what's extracted from this file. Continue?",
      );
      if (!confirmed) return;
    }

    setFileName(file.name);
    setError("");
    setStage("reading");
    try {
      const text = await extractResumeText(file);
      setStage("parsing");
      const parsed = await parseResumeText({ apiKey, model, resumeText: text });
      applyParsedResume(parsed);
      handleClose();
    } catch (err) {
      const message =
        err instanceof ResumeFileParseError || err instanceof GeminiApiError
          ? err.message
          : "Something went wrong reading that file. Try again.";
      setError(message);
      setStage("error");
    }
  }

  const busy = stage === "reading" || stage === "parsing";

  return (
    <Modal open={open} onClose={handleClose} title="Upload your resume">
      <div className="space-y-4">
        {!apiKey ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Add your free Gemini API key in{" "}
            <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 underline" onClick={handleClose}>
              Settings
            </Link>{" "}
            first — extracting your resume into structured fields uses Gemini, same as tailoring.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a PDF, DOCX, or plain text resume and Gemini will read it into the fields below —
              contact info, summary, skills, experience, education, and projects — so you don't have to
              retype everything. Review the result afterward; extraction can occasionally miss or
              misplace something, especially from a heavily-designed PDF layout.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:font-medium hover:file:bg-indigo-700 file:cursor-pointer disabled:opacity-50"
            />

            {busy && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Spinner />
                {stage === "reading" ? `Reading ${fileName}...` : "Extracting resume data with Gemini..."}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
                <div className="mt-2">
                  <Button variant="secondary" onClick={reset}>
                    Try again
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose} disabled={busy}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
