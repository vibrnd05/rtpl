# RTPL — Round Table Premier League

Landing page + team registration for the Round Table Premier League, Season 5.
Next.js 15 (App Router, TypeScript, Tailwind v4) on the front end, Supabase for storage.

Built to match the **"Modernist"** Claude Design project
(`claude.ai/design/p/f57a6d46-53b4-4831-b2a9-edfe5ade1a50`), artboards
`RTPL Landing.dc.html` and `RTPL Registration.dc.html`.

## Pages

| Route       | What it is                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `/`         | Hero → live countdown → the league → schedule table → teams grid → venue → FAQ → CTA band → footer |
| `/register` | Four-part captain-led entry form with a dynamic 11–14 player squad sheet                          |

## Design system

Tokens live in `app/globals.css` and are the same values as the design project:

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

Season facts — dates, fee, squad limits, venue, contacts — are centralised in
`lib/league.ts`. Change them there and every page follows.

## Setup

1. **Create the Supabase table.** In the Supabase dashboard open **SQL → New query**,
   paste `supabase/schema.sql` and run it.

   > If you ran an earlier version of this file, both the table shape and its
   > name have changed (it used to be `team_registrations`). Drop the old one
   > first:
   > `drop table if exists public.team_registrations cascade;`

2. **Add your keys.**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   **Project Settings → API**.

3. **Run it.**

   ```bash
   npm install
   npm run dev      # http://localhost:3000
   ```

## How the form works

`app/register/RegistrationForm.tsx` is a client component posting to the `registerTeam`
server action in `app/register/actions.ts`. Fields are controlled so nothing is lost
when a failed submission re-renders the form; the squad sheet lives in React state and
rides along as a JSON hidden input.

The action:

- ignores submissions that fill the hidden `website` honeypot field,
- validates server-side and returns per-field errors plus the design's status line,
- enforces the squad rules — at least 11 named, at most 14, at most 3 guests,
- drops blank player rows before saving,
- allocates an entry reference (`RTPL5-1234`), retrying on the rare collision,
- inserts with the Supabase **anon** key, so RLS is the real gate,
- maps a `23505` on team name to a "that name is already entered" message,
- returns the success state that swaps the form for the confirmation panel.

No service-role key is used anywhere, so nothing privileged ships to the client.

### Reading the entries

RLS lets anonymous visitors **insert only** — they cannot read entries back. View
submissions in the Supabase dashboard (**Table editor → owner_registrations**), or sign
an organiser in with Supabase Auth and build an admin page; the
`authenticated organisers can read entries` policy already allows the select.

Rows land as `status = 'pending'`; move them to `confirmed`, `waitlisted` or `rejected`
as fees come in. The squad sits in the `players` jsonb column as
`[{ name, role, status }]`.

The "no more than three guests" rule is enforced in the server action rather than in
SQL — counting elements inside a jsonb array needs a set-returning function, which a
`CHECK` constraint cannot call.

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

Push to Vercel (or any Node host) and set the two `NEXT_PUBLIC_SUPABASE_*` environment
variables in the project settings. `npm run build` must pass first — it does today.
