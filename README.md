# Jerbs — Job Application Tracker

A personal app for running a job search: track every application in one place, upload
your resume once, and generate a tailored resume and cover letter from a pasted job
description in one click — all for free.

## Features

- **Applications** — track company, role, location, salary range, status (Saved →
  Applied → Interviewing → Offer / Rejected / Withdrawn), contact info, notes, and
  next-step dates for every application. Board view grouped by status; drag a card
  between columns or change status from the detail view.
- **Resume & Cover Letter** — maintain one base resume (contact info, summary,
  skills, experience, projects, education) and cover-letter guidance (tone, recurring
  talking points, closing style). This is the single source of truth for tailoring.
  Upload an existing resume (PDF, DOCX, or plain text) and Gemini reads it into these
  fields for you, instead of retyping everything by hand.
- **AI tailoring** — on any application, paste the job description and click
  "Tailor with AI." Gemini reorders and rewords your *real* base resume and writes a
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

## AI setup — free, no payment required

Tailoring and resume upload both call Google's **Gemini API** directly from your
browser using your own free API key — there is no backend, and no payment or billing
account of any kind is needed.

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in
   with a Google account.
2. Click **Create API key**. No credit card, no billing setup.
3. Paste the key into this app's **Settings** page.

The free tier is rate-limited (requests per minute/day), not paid-only-above-a-cap —
for personal job-search use you're unlikely to hit it. If you ever do, wait a bit and
retry, or switch to the lighter "Gemini 2.5 Flash Lite" model in Settings.

The key is stored only in this browser's `localStorage` and sent only to Google's API;
don't use this on a shared computer, since anyone with access to the browser profile
could read it from local storage.

## Data & privacy

All data (applications, resume, saved searches, and your API key) is stored locally
in the browser via `localStorage` — no account, no backend, nothing leaves your
machine except the specific request sent directly to Google's Gemini API when you
click "Tailor with AI" or upload a resume.

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Zustand (with localStorage persistence),
React Router. Resume file parsing runs entirely client-side via `pdfjs-dist` (PDF) and
`mammoth` (DOCX).

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint      # run oxlint
```

## Deploying (Render)

This is a static site (no backend), so it deploys as a Render **Static Site**:

1. On [render.com](https://render.com), **New +** → **Blueprint**, and point it at this
   repo — it picks up `render.yaml` automatically. (Or **New +** → **Static Site**
   manually: build command `npm install && npm run build`, publish directory `dist`.)
2. Deploy. Render gives you a URL like `https://jerbs.onrender.com`.

That URL is public by default — anyone with the link can open the app. That's lower-risk
than it sounds since there's no backend or shared database: each visitor's browser has
its own separate `localStorage`, so nobody else can see your applications, resume, or
API key just by visiting the same URL. But if you'd rather it not be guessable/public at
all, keep it to `npm run dev` locally instead, or ask about adding access restriction.
