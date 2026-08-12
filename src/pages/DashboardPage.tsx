import { Link } from "react-router-dom";
import { Badge, Card, EmptyState, SectionHeader } from "../components/ui";
import { isResumeUsable } from "../lib/formatResume";
import { useApplicationsStore } from "../store/applicationsStore";
import { useJobBoardsStore } from "../store/jobBoardsStore";
import { useResumeStore } from "../store/resumeStore";
import { useSettingsStore } from "../store/settingsStore";
import type { ApplicationStatus } from "../types";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}

export function DashboardPage() {
  const applications = useApplicationsStore((s) => s.applications);
  const profiles = useJobBoardsStore((s) => s.profiles);
  const resume = useResumeStore((s) => s.resume);
  const apiKey = useSettingsStore((s) => s.apiKey);

  const countByStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;

  const active = applications.filter((a) => !["rejected", "withdrawn"].includes(a.status));
  const upcoming = applications
    .filter((a) => a.nextStepDate)
    .sort((a, b) => (a.nextStepDate! < b.nextStepDate! ? -1 : 1))
    .slice(0, 5);

  const tailoredCount = applications.filter((a) => a.tailoredAt).length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" subtitle="Your job search at a glance." />

      {!apiKey && (
        <Card className="p-4 border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Add your free Gemini API key in{" "}
            <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 underline">
              Settings
            </Link>{" "}
            to unlock AI resume and cover letter tailoring.
          </p>
        </Card>
      )}
      {apiKey && !isResumeUsable(resume) && (
        <Card className="p-4 border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Fill in your{" "}
            <Link to="/resume" className="text-indigo-600 dark:text-indigo-400 underline">
              base resume
            </Link>{" "}
            so tailoring has something real to work from.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Active" value={active.length} />
        <StatCard label="Applied" value={countByStatus("applied")} />
        <StatCard label="Interviewing" value={countByStatus("interviewing")} />
        <StatCard label="Offers" value={countByStatus("offer")} />
        <StatCard label="Tailored" value={tailoredCount} />
        <StatCard label="Saved searches" value={profiles.length} />
      </div>

      <div>
        <SectionHeader title="Upcoming next steps" />
        {upcoming.length === 0 ? (
          <Card>
            <EmptyState icon="📅" title="Nothing scheduled" subtitle="Next-step dates you add to applications will show here." />
          </Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map((app) => (
              <Card key={app.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {app.role} — {app.company}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{app.status}</p>
                </div>
                <Badge color="amber">{new Date(app.nextStepDate!).toLocaleDateString()}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
