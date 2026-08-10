# Jerbs — Job Application Tracker

A personal app for running a job search: track every application in one place, and
generate a tailored resume and cover letter from a pasted job description in one click.

## Features

- **Applications** — track company, role, location, salary range, status (Saved →
  Applied → Interviewing → Offer / Rejected / Withdrawn), contact info, notes, and
  next-step dates for every application. Board view grouped by status; drag a card
  between columns or change status from the detail view.
- **Resume & Cover Letter** — maintain one base resume (contact info, summary,
  skills, experience, projects, education) and cover-letter guidance (tone, recurring
  talking points, closing style). This is the single source of truth for tailoring.
- **AI tailoring** — on any application, paste the job description and click
  "Tailor with AI." Claude reorders and rewords your *real* base resume and writes a
  cover letter specific to that company and role — it's instructed never to invent
  employers, titles, or accomplishments that aren't in your base resume. Results are
  copyable and downloadable as `.txt`.
- **Job Boards** — save a search profile (keywords, location, remote) once and get
  one-click, pre-filled search links across Indeed, Glassdoor, ZipRecruiter, Google
  Jobs, Monster, Wellfound, Dice, RemoteOK, We Work Remotely, Built In, and
  SimplyHired — so you don't have to re-type the same search on every site.
  LinkedIn is intentionally excluded and never appears in this app.
- **Dashboard** — at-a-glance counts by status, upcoming next-step dates, and how
  many applications have a tailored resume/cover letter ready.

## AI tailoring setup

Tailoring calls the Claude API directly from your browser using your own Anthropic
API key — there is no backend. Add a key in **Settings** (get one at
[console.anthropic.com](https://console.anthropic.com/settings/keys)). The key is
stored only in this browser's `localStorage` and is sent only to Anthropic's API;
don't use this on a shared computer, since anyone with access to the browser profile
could read it from local storage.

## Data & privacy

All data (applications, resume, saved searches, and your API key) is stored locally
in the browser via `localStorage` — no account, no backend, nothing leaves your
machine except the specific tailoring request sent directly to Anthropic when you
click "Tailor with AI."

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Zustand (with localStorage persistence),
React Router.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint      # run oxlint
```
