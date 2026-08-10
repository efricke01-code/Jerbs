import { useState } from "react";
import { Badge, Button, Card, EmptyState, Input, Label, SectionHeader } from "../components/ui";
import { buildBoardUrls } from "../lib/searchLinks";
import { useJobBoardsStore } from "../store/jobBoardsStore";

export function JobBoardsPage() {
  const profiles = useJobBoardsStore((s) => s.profiles);
  const addProfile = useJobBoardsStore((s) => s.addProfile);
  const removeProfile = useJobBoardsStore((s) => s.removeProfile);

  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);

  function handleAdd() {
    if (!keywords.trim()) return;
    addProfile({ name: name.trim() || keywords, keywords, location, remote });
    setName("");
    setKeywords("");
    setLocation("");
    setRemote(false);
  }

  function openAll(urls: string[]) {
    for (const url of urls) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Job boards"
        subtitle="Save a search once, then one-click open it across every major board — no re-typing the same query on each site."
      />

      <Card className="p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          This can't search job boards on your behalf (most don't offer that publicly) — but it builds a pre-filled
          search link for each one, so opening ten tabs is one click instead of ten searches. Your browser may block
          pop-ups when opening many tabs at once; allow pop-ups for this site if so.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          LinkedIn is intentionally left off this list — it's never included as a board here, and search results won't
          send you there. One caveat worth knowing: aggregators like Google Jobs pull listings from across the web and
          may occasionally surface a posting that itself links back to LinkedIn's own apply page; that's the source
          job's choice, not something this app can filter out of an aggregator's results.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label>Profile name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Senior PM, remote" />
          </div>
          <div>
            <Label>Keywords / title *</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Product Manager" />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Chicago, IL" />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1.5">
              <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
              Remote only
            </label>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={handleAdd} disabled={!keywords.trim()}>
            + Save search
          </Button>
        </div>
      </Card>

      {profiles.length === 0 ? (
        <Card>
          <EmptyState icon="🔎" title="No saved searches yet" subtitle="Save one above to get quick-launch links." />
        </Card>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => {
            const boardUrls = buildBoardUrls(profile);
            return (
              <Card key={profile.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {profile.keywords}
                      {profile.location && ` · ${profile.location}`}
                      {profile.remote && (
                        <>
                          {" "}
                          <Badge color="green">Remote</Badge>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openAll(boardUrls.map((b) => b.url))}>Open all boards</Button>
                    <Button variant="danger" onClick={() => removeProfile(profile.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {boardUrls.map(({ board, url }) => (
                    <a
                      key={board.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {board.name} ↗
                    </a>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
