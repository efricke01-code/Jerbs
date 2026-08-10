import { useMemo, useState } from "react";
import { ApplicationDetailModal } from "../components/ApplicationDetailModal";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import { Badge, Button, Card, EmptyState, SectionHeader } from "../components/ui";
import { useApplicationsStore } from "../store/applicationsStore";
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from "../types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  saved: "slate",
  applied: "blue",
  interviewing: "amber",
  offer: "green",
  rejected: "red",
  withdrawn: "slate",
};

function ApplicationCard({ app, onClick }: { app: JobApplication; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card className="p-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
        <p className="font-medium text-slate-900 dark:text-white truncate">{app.role}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{app.company}</p>
        {app.location && <p className="text-xs text-slate-400 truncate mt-1">{app.location}</p>}
        <div className="flex items-center gap-2 mt-2">
          {app.tailoredAt && <Badge color="purple">Tailored</Badge>}
          {app.nextStepDate && <Badge color="amber">{new Date(app.nextStepDate).toLocaleDateString()}</Badge>}
        </div>
      </Card>
    </button>
  );
}

export function ApplicationsPage() {
  const applications = useApplicationsStore((s) => s.applications);
  const setStatus = useApplicationsStore((s) => s.setStatus);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const byStatus = useMemo(() => {
    const map = new Map<ApplicationStatus, JobApplication[]>();
    for (const status of APPLICATION_STATUSES) map.set(status, []);
    for (const app of applications) map.get(app.status)?.push(app);
    return map;
  }, [applications]);

  return (
    <div>
      <SectionHeader
        title="Applications"
        subtitle={`${applications.length} tracked`}
        action={<Button onClick={() => setFormOpen(true)}>+ Add application</Button>}
      />

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            icon="🗂️"
            title="No applications yet"
            subtitle="Add one and paste in a job description to get started."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {APPLICATION_STATUSES.map((status) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-2">
                <Badge color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Badge>
                <span className="text-xs text-slate-400">{byStatus.get(status)?.length ?? 0}</span>
              </div>
              <div
                className="space-y-2 min-h-[2rem]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) setStatus(id, status);
                }}
              >
                {byStatus.get(status)?.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", app.id)}
                  >
                    <ApplicationCard app={app} onClick={() => setSelectedId(app.id)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplicationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(id) => setSelectedId(id)}
      />
      <ApplicationDetailModal application={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
