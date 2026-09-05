# RTPL — Round Table Premier League

Landing page + team registration for the Round Table Premier League.
Next.js 15 (App Router, TypeScript, Tailwind v4) in `frontend/`, an Express +
MongoDB backend in `backend/`.

```
rtpl/
├── frontend/   Next.js 15 site — landing page and the registration form
└── backend/    Express + Mongoose API — MVC, plain JavaScript
```

The site never talks to MongoDB. The registration server action calls the API
server-to-server over `BACKEND_URL`, so no database credential and no API base
URL ever reaches the browser.

Built to match the **"Modernist"** Claude Design project
(`claude.ai/design/p/f57a6d46-53b4-4831-b2a9-edfe5ade1a50`), artboards
`RTPL Landing.dc.html` and `RTPL Registration.dc.html`.

## Pages

| Route       | What it is                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `/`         | Hero → live countdown → the league → schedule table → teams grid → venue → FAQ → CTA band → footer |
| `/register` | Three-part owner entry form — the owners, the team, the commitments                            |

## Design system

Tokens live in `frontend/app/globals.css` and are the same values as the design project:

| Token                | Value     | Role                                       |
| -------------------- | --------- | ------------------------------------------ |
| `--color-paper`      | `#F6F4F1` | page ground                                |
| `--color-surface`    | `#ECEAE6` | inputs, ground plan fill                   |
| `--color-ink`        | `#1B1917` | text, and the dark open-slot tile          |
| `--color-accent`     | `#F97316` | orange **fills** — buttons, CTA band, tile |
| `--color-accent-600` | `#E2600C` | orange **display text**, button hover      |
| `--color-accent-700` | `#B4400B` | orange **body text** — eyebrows, links     |
| `--color-divider`    | `#B0AAA3` | every 2px rule and grid line               |
| `--color-stone`      | `#7A6F68` | third band of the tricolor stripe          |

The theme is light: near-white ground, near-black text, orange accent. The accent
ramp runs **darker** as the number rises, which is the inverse of a dark theme —
`#F97316` on the light ground is only 2.5:1, so bright orange is reserved for
fills. Orange text uses `-600` at display sizes (3.2:1, clears the 3:1 large-text
bar) and `-700` at body sizes (5.2:1). Dark text sits on every orange fill (6.3:1),
never light text.

Typeface is **Archivo** (400/600/800), loaded from Google Fonts; headings are 800.
**Border radius is 0 everywhere** and separators are 2px — both are load-bearing to
the look, so avoid reintroducing rounded corners.

The design-system component classes (`.btn`, `.btn-primary/secondary/ghost`, `.input`,
`.field`, `.table`, `.rule`, `.tricolor`, `.eyebrow`, `.shell`) are ported verbatim
from the project's `styles.css`. Layout and spacing use Tailwind utilities with the
design's exact px/clamp values.

Season facts — dates, fee, venue, contacts — are centralised in
`frontend/lib/league.ts`. Change them there and every page follows.

## Setup

You need a MongoDB to point at — a local `mongod`, or a MongoDB Atlas cluster.
Run the two services in separate terminals.

### 1. Backend

```bash
cd backend
npm install
npm run dev               # http://localhost:4000
```

`backend/.env` holds `MONGODB_URI`, `MONGODB_DB`, `PORT` and `LEAGUE_SEASON`.
Set `MONGODB_DB` rather than putting the database in the connection string — a
URI that ends at the host would otherwise land everything in MongoDB's default
`test` database. The collection and its indexes are created on first connect —
no migration step, no schema file to run by hand.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # BACKEND_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:3000
```

## The API

No authentication — owners submit the form, the entry is saved.

| Method | Route                       | What it does                                      |
| ------ | --------------------------- | ------------------------------------------------- |
| `GET`  | `/api/health`               | Liveness check                                     |
| `POST` | `/api/registrations`        | Saves an entry, returns it with its reference      |
| `GET`  | `/api/registrations`        | Every entry, newest first                          |
| `GET`  | `/api/registrations/:id`    | One entry                                          |

`POST /api/registrations` takes the seven questions:

```jsonc
{
  "owners": "Arjun Mehta (RT 187, L) and Ravi Sharma (RT 221, XL)",
  "ownersMobile": "+91 98110 00000",
  "playerOwner": "Arjun Mehta (RT 187) — confirmed",
  "teamName": "Gurgaon Gladiators",
  "financialCommitment": "Yes",   // Yes/No
  "mentor": "Yes",                // Yes/No
  "auctionAvailability": "Maybe"  // Yes/No/Maybe
}
```

and answers `201` with `{ "registration": { ... } }`. Every failure has the same
body: `{ "error": { "code", "message", "fieldErrors" } }`, where `fieldErrors`
is keyed by model field and carries the message to show under that input.

### Layout

```
backend/
├── server.js                 connect to MongoDB, then listen
├── .env                      MONGODB_URI, MONGODB_DB, PORT, LEAGUE_SEASON
└── src/
    ├── app.js                express app — cors, json, routes, 404
    ├── config/db.js          the mongoose connection
    ├── models/               registration.model.js — fields, rules, indexes
    ├── controllers/          registration.controller.js
    └── routes/               registration.routes.js
```

Validation lives in the model, as Mongoose rules. The messages attached to each
rule are what the owner reads next to the field, so keep them plain.

## How the form works

`frontend/app/register/RegistrationForm.tsx` is a client component posting to the
`registerTeam` server action in `frontend/app/register/actions.ts`. Fields are
controlled so nothing is lost when a failed submission re-renders the form.

The action:

- ignores submissions that fill the hidden `website` honeypot field,
- forwards the answers to `POST /api/registrations`,
- translates the API's field errors onto the inputs they belong to — the API
  names fields after the data (`ownersMobile`), the form after the questions
  (`mobile`),
- returns the success state that swaps the form for the confirmation panel.

On the backend, `createRegistration`:

- allocates an entry reference (`RTPL8-1234`), retrying on the rare collision,
- rejects a second entry under the same team name, ignoring case, and returns it
  as an error on the team name rather than a generic failure,
- saves every entry as `status = 'pending'`.

### Reading the entries

```bash
curl http://localhost:4000/api/registrations
```

Or open the `registrations` collection in Atlas / Compass. Entries land as
`pending`; `confirmed`, `waitlisted` and `rejected` are the other values the
`status` field accepts as fees come in.

## Before launch

- **Cricket assets.** The design's two `<image-slot>` frames are filled in:
  the hero uses `public/duce-ball.png` (a transparent-background photograph of a red
  leather ball) through `next/image` with `priority`, and the venue section uses
  `components/GroundPlan.tsx`, a drawn top-down plan of the main ground.
  `components/CricketBall.tsx` still supplies `BallMark`, the miniature ball used as
  the wordmark's full stop; its full `CricketBall` SVG is the hand-drawn ball the
  photograph replaced, kept as a no-dependency fallback (unused, so it tree-shakes out).
- **Hero ball placement.** It is centred with `self-center` rather than inheriting the
  hero grid's `items-end`, and `rtpl-float` drifts symmetrically (+8px to −8px) so
  the average position stays exactly centred.
- **Team list.** The ten confirmed sides in `app/page.tsx` (`TEAMS`) come from the
  design and are illustrative. The last two tiles are the open slots and link to
  `/register`.
- **Fixtures.** `FIXTURES` in `app/page.tsx` is the design's draft schedule.
- **Countdown.** Driven by `LEAGUE.firstBallISO` (`2026-11-13T18:00:00+05:30`). It
  renders `--` on the server and fills in on mount, so hydration stays quiet.

## Deploying

Two deployments, not one.

**Backend** — any Node host (Render, Railway, Fly, a VM): `npm start`, with
`MONGODB_URI`, `MONGODB_DB` and `LEAGUE_SEASON` set. On Atlas, allow the host's IP in
**Network Access**.

**Frontend** — Vercel or any Node host, with `BACKEND_URL` set to the deployed
API. Keep it unprefixed: `NEXT_PUBLIC_BACKEND_URL` would expose the API to the
browser and bypass the server action.

`npm run build` must pass in the frontend — it does today.
