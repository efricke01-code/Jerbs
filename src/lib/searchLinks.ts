import type { SavedSearchProfile } from "../types";

export interface JobBoardDef {
  id: string;
  name: string;
  buildUrl: (profile: SavedSearchProfile) => string;
}

function q(value: string): string {
  return encodeURIComponent(value);
}

const combinedKeywords = (profile: SavedSearchProfile): string =>
  profile.remote ? `${profile.keywords} remote`.trim() : profile.keywords;

// LinkedIn is deliberately excluded — not a board, not a fallback. Never add it back
// without checking with the user first: they don't have a LinkedIn account for
// personal safety reasons and don't want it appearing anywhere in this app.
export const JOB_BOARDS: JobBoardDef[] = [
  {
    id: "indeed",
    name: "Indeed",
    buildUrl: (p) =>
      `https://www.indeed.com/jobs?q=${q(p.keywords)}&l=${q(p.remote ? "Remote" : p.location)}`,
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    buildUrl: (p) =>
      `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q(p.keywords)}&locT=&locId=&locKeyword=${q(
        p.remote ? "Remote" : p.location,
      )}`,
  },
  {
    id: "ziprecruiter",
    name: "ZipRecruiter",
    buildUrl: (p) =>
      `https://www.ziprecruiter.com/candidate/search?search=${q(p.keywords)}&location=${q(
        p.remote ? "Remote" : p.location,
      )}`,
  },
  {
    id: "google",
    name: "Google Jobs",
    buildUrl: (p) => `https://www.google.com/search?q=${q(`${combinedKeywords(p)} jobs ${p.location}`)}&ibp=htl;jobs`,
  },
  {
    id: "monster",
    name: "Monster",
    buildUrl: (p) =>
      `https://www.monster.com/jobs/search?q=${q(p.keywords)}&where=${q(p.remote ? "Remote" : p.location)}`,
  },
  {
    id: "wellfound",
    name: "Wellfound (AngelList)",
    buildUrl: (p) => `https://wellfound.com/jobs?query=${q(p.keywords)}`,
  },
  {
    id: "dice",
    name: "Dice",
    buildUrl: (p) =>
      `https://www.dice.com/jobs?q=${q(p.keywords)}&location=${q(p.remote ? "Remote" : p.location)}`,
  },
  {
    id: "remoteok",
    name: "RemoteOK",
    buildUrl: (p) => `https://remoteok.com/remote-${q(p.keywords.replace(/\s+/g, "-"))}-jobs`,
  },
  {
    id: "weworkremotely",
    name: "We Work Remotely",
    buildUrl: (p) => `https://weworkremotely.com/remote-jobs/search?term=${q(p.keywords)}`,
  },
  {
    id: "builtin",
    name: "Built In",
    buildUrl: (p) => `https://builtin.com/jobs?search=${q(p.keywords)}`,
  },
  {
    id: "simplyhired",
    name: "SimplyHired",
    buildUrl: (p) =>
      `https://www.simplyhired.com/search?q=${q(p.keywords)}&l=${q(p.remote ? "Remote" : p.location)}`,
  },
];

export function buildBoardUrls(profile: SavedSearchProfile): { board: JobBoardDef; url: string }[] {
  return JOB_BOARDS.map((board) => ({ board, url: board.buildUrl(profile) }));
}
