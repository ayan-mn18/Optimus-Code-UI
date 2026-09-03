# Optimus Code — UI

Frontend for **Optimus Code**, covering daily DSA, Low Level Design, and High Level
Design practice. Users set separate category goals. DSA solves directly; System Design
completion requires passing a ten-question Optimus assessment.

Optimus supports generated question sets, rubric grading, and isolated JavaScript coding
tasks with visible and hidden tests. Google Identity Services handles sign-in and signup.
Dodo Payments provides the $10 monthly and $80 annual subscription checkout.

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
| Editor     | Monaco, loaded only inside Optimus           |

## Getting started

```bash
cp .env.example .env      # set API URL and Google web client ID
npm install
npm run dev
```

Opens on `http://localhost:5173`. The API defaults to `http://localhost:4000`.

```bash
npm run build      # typecheck + production bundle
npm run typecheck  # types only
```

## Screens

| Route                    | What it does                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| `/`                      | Marketing landing page and waitlist                                 |
| `/login`                 | Password and Google sign-in/signup                                  |
| `/invite`                | Secure one-time invite acceptance                                   |
| `/onboarding`            | Pick DSA, LLD, and HLD daily goals                                  |
| `/dashboard`             | Mixed daily set, per-track progress, streak, and analytics          |
| `/dsa`                   | DSA catalogue with filters                                          |
| `/system-design/lld`     | Topic-wise Low Level Design catalogue                               |
| `/system-design/hld`     | Topic-wise High Level Design catalogue                              |
| `/optimus/:attemptId`    | Locked ten-question assessment and Monaco coding workspace          |
| `/pricing`               | $10 monthly and $80 annual Dodo plans                               |
| `/billing/success`       | Hosted checkout return state                                        |
| `/recap`                 | Weekly recap export                                                 |
| `/leaderboard`           | Streak, solved, and consistency standings                           |
| `/settings`              | Profile, subscription, and category goals                          |

## The landing page

The hero is a CSS 3D scene rather than a WebGL canvas — a shared `perspective`, layers at
different `translateZ`, and pointer-driven `rotateX`/`rotateY` damped through Framer Motion
springs. Nearer layers parallax further, which is what sells the depth. No 3D library, so it
costs nothing in bundle size, and the whole thing flattens to a static layout under
`prefers-reduced-motion`.

The waitlist form posts to `POST /api/waitlist` and shows the live signup count. Joining
twice is a success state, not an error.

## The recap card

The card is **pure SVG** — no `foreignObject`, no web fonts, no html-to-image dependency.
That is what makes it exportable: the browser serialises the SVG, loads it as an image, draws
it onto a canvas at 2× and hands back a PNG (2160×2700, sized for a story or a post).
`navigator.share` is offered when the browser supports sharing files, with download as the
fallback everywhere else.

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
    auth/        Google Identity Services button
    charts/      Dashboard visualizations
    dashboard/   Mixed daily work and progress
    landing/     Marketing interactions
    layout/      AppShell with nested LLD/HLD navigation
    recap/       SVG recap export
    ui/          Shared controls
  hooks/         Challenge, System Design, and assessment queries
  lib/           Authenticated API client and contracts
  pages/         DSA, System Design, Optimus, Pricing, and account screens
  store/         Auth and enrollment state
```

## Licence

MIT
