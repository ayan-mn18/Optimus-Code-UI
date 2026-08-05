# Optimus Code — UI

Frontend for **Optimus Code**, a daily DSA challenge platform built on the
[Striver SDE Sheet](https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems)
and [A2Z Sheet](https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z) — 544 problems across 19 topics.

Sign up, join the challenge, and get **5 problems every morning** — each from a different
topic. Clear all five and the day goes green. Fall short and it turns **red**: the problems
you skipped drop back into the pool and resurface later. Solve more than five and the extras
count as bonus.

API lives in [Optimus-Code](https://github.com/ayan-mn18/Optimus-Code).

## Stack

| Piece      | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | React 18 + Vite + TypeScript (strict)     |
| Styling    | Tailwind CSS v4 (`@theme` design tokens)  |
| Data       | TanStack Query, with optimistic solve toggles |
| Routing    | React Router 6                            |
| Motion     | Framer Motion                             |
| Icons      | lucide-react                              |

## Getting started

```bash
cp .env.example .env      # point VITE_API_URL at the running API
npm install
npm run dev
```

Opens on `http://localhost:5173`. The API must be running on the URL in `VITE_API_URL`
(default `http://localhost:4000`).

```bash
npm run build      # typecheck + production bundle
npm run typecheck  # types only
```

## Screens

| Route         | What it does                                                                 |
| ------------- | ---------------------------------------------------------------------------- |
| `/`           | Marketing landing page — 3D parallax hero, waitlist, sheet coverage           |
| `/signup`     | Split-screen signup — the pitch on the left, three fields on the right        |
| `/login`      | Same shell, sign-in form                                                     |
| `/onboarding` | Pick a daily target (3 / 5 / 8) and start the challenge                       |
| `/dashboard`  | Today's set, day ring, streak, consistency heatmap, topic mastery, difficulty |
| `/problems`   | All 544 problems — filter by topic, difficulty, solve state, or title         |
| `/settings`   | Profile, timezone, daily target                                              |

## The landing page

The hero is a CSS 3D scene rather than a WebGL canvas — a shared `perspective`, layers at
different `translateZ`, and pointer-driven `rotateX`/`rotateY` damped through Framer Motion
springs. Nearer layers parallax further, which is what sells the depth. No 3D library, so it
costs nothing in bundle size, and the whole thing flattens to a static layout under
`prefers-reduced-motion`.

The waitlist form posts to `POST /api/waitlist` and shows the live signup count. Joining
twice is a success state, not an error.

## Design notes

Dark-first, tokens declared once in `src/index.css` under Tailwind v4's `@theme`.

The charts follow one rule: **every mark encodes magnitude, so the whole system runs on a
single violet hue.** The ramp is validated against the card surface — monotone lightness,
visible steps, and the step nearest the surface clears 2:1 contrast.

Day state is deliberately *not* a second hue. A red day is drawn as a **ring** around the
cell rather than a red fill, so status sits on its own visual channel and stays legible for
red-green colorblind readers — the exact case a green/red heatmap gets wrong. Difficulty
badges keep their conventional green/amber/red, but the word is always rendered beside the
color, so difficulty is never carried by hue alone.

Reduced-motion is respected globally; every interactive mark has a label, and the heatmap
exposes a per-cell readout on hover and focus.

## Project layout

```
src/
  components/
    charts/      DayRing, Heatmap, TopicMastery, DifficultySplit, palette
    landing/     HeroScene, WaitlistForm, TiltCard, useTilt
    dashboard/   TodayPanel, ProblemRow, StatTiles
    layout/      AppShell, Logo
    ui/          Button, Card, Field, badges, skeletons
  hooks/         TanStack Query hooks + optimistic solve toggle
  lib/           api client (token refresh), types, helpers
  pages/         Landing, AuthPage, Onboarding, Dashboard, Problems, Settings
  store/         auth context
```

## Licence

MIT
