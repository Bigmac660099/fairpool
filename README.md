# ফেয়ারপুল (FAIRPOOL)

A premium, mobile-first, Bengali-language university voting platform. Students
vote in elections with one vote per person and optional GPS verification.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and
**Framer Motion**. The whole app runs out of the box in **local demo mode** with
an in-browser data store — no backend or API keys required to try it.

### Libraries actually wired in

- **Radix UI** primitives (shadcn pattern): `dropdown-menu`, `popover`,
  `alert-dialog`, animated `tabs` — in `src/components/ui/`.
- **Three.js + React Three Fiber (v8)** — GLSL shader background on the auth
  screen (`hero-geometric.tsx`), loaded `ssr:false`. Login and register use
  different palettes that tween smoothly when you switch tabs.
- **Embla Carousel** (+ autoplay) — powers `MotionCarousel`.
- **Lenis** — momentum smooth-scroll inside the `StickyScrollCards` candidate
  picker on the vote screen.
- **Recharts** — bar chart on the results page.
- **MapLibre GL + MapTiler** — the 3D isometric voting map.
- **Zod** — runtime validation for every server-action input (`src/lib/schemas.ts`).
- **jose** — JWT session signing/verification for the production auth path.
- **@supabase/supabase-js** — server clients + Realtime helper for the
  production data path.

> **MUI** is listed in the original spec as legacy/admin-only. It is intentionally
> **not** included here — the emotion SSR setup in the App Router adds fragility
> for no user-facing gain. The admin forms use the same Tailwind components as
> the rest of the app.

### Demo vs production

The app ships in **local demo mode** (`NEXT_PUBLIC_AUTH_MODE=local`): auth and
data use an in-browser store (`src/lib/data.ts`) so it previews with zero
backend. The **production path** is fully written and deployable:

- `supabase/migrations/0001_init.sql` — schema, RLS, and the `cast_vote` /
  `cast_vote_as` **SECURITY DEFINER** RPCs (server-side window/geo/idempotency
  checks). Apply with `supabase db push --linked`.
- `src/lib/server/actions.ts` — Zod-validated server actions that call the RPC
  (vote writes never bypass it).
- `src/lib/server/session.ts` + `src/middleware.ts` — JWT cookie auth. The
  middleware **passes through in local mode** and enforces in production.
- `src/lib/server/realtime.ts` — Supabase Realtime subscription for live tallies.

To go live: fill `.env.local`, set `NEXT_PUBLIC_AUTH_MODE=supabase`, push the
migration, and switch the calls in `src/lib/data.ts` to the server actions.

---

## Quick start (VS Code)

1. Open the folder in VS Code: `File → Open Folder…` and pick `fairpool/`.
2. Open the integrated terminal: `Terminal → New Terminal` (or `` Ctrl+` ``).
3. Install dependencies and start the dev server:

   ```bash
   # pnpm is recommended (the project ships a pnpm lockfile)
   npm install -g pnpm        # skip if you already have pnpm
   pnpm install
   pnpm dev
   ```

   > Prefer npm or yarn? Both work too: `npm install && npm run dev`.

4. Open **http://localhost:3000** in your browser.

VS Code will suggest the recommended extensions (ESLint, Prettier, Tailwind
IntelliSense) the first time you open the project.

---

## Demo accounts

The app starts in `local` auth mode. **Any 14-digit student ID** logs in.

| Role    | Student ID       | Password               |
| ------- | ---------------- | ---------------------- |
| Admin   | `99999999999999` | `admin`                |
| Student | any 14 digits    | anything (not `admin`) |

> Typing the password `admin` promotes **any** account to the admin role.

All data lives in your browser's `localStorage` under the `fairpool:v1` key.
Use **Admin → Settings → Reset** to wipe it and reseed the demo data.

---

## Available scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the dev server (hot reload)         |
| `pnpm build`     | Production build                          |
| `pnpm start`     | Serve the production build                |
| `pnpm lint`      | Run ESLint                                |
| `pnpm typecheck` | Type-check with `tsc --noEmit`            |

---

## Project structure

```
fairpool/
├─ src/
│  ├─ app/                      # Next.js App Router
│  │  ├─ (auth)/                # /login /register /terms  (no shared shell)
│  │  ├─ (app)/                 # dashboard, vote, results, profile + shell
│  │  ├─ (admin)/admin/         # admin panel + shell
│  │  ├─ fonts/                 # self-hosted Noto Sans Bengali (woff2)
│  │  ├─ globals.css            # design tokens (light/dark) + base styles
│  │  └─ layout.tsx             # root layout + font wiring
│  ├─ components/
│  │  ├─ ui/                    # button, card, input, avatar, theme toggle, carousel, backgrounds
│  │  ├─ nav/                   # SideRail, BottomNav, BackChip
│  │  ├─ maps/                  # LocationMap, GeoPickerMap (teal SVG fallback)
│  │  ├─ motion/                # Reveal / RevealStack / Tactile primitives
│  │  ├─ dashboard/             # DashboardLive, ElectionTimer, RankingGraph
│  │  ├─ vote/                  # VoteFlow, VoteSuccessPanel, ElectionPicker
│  │  ├─ results/               # ResultsLive (top-3 carousel, podium, chart)
│  │  └─ admin/                 # managers for elections/candidates/departments + tab bar
│  ├─ lib/
│  │  ├─ data.ts                # in-browser data store + cast_vote logic
│  │  ├─ types.ts               # domain types
│  │  ├─ geo.ts                 # haversine / radius checks
│  │  ├─ hooks.ts               # useAuth (route guards), useStoreSync
│  │  └─ utils.ts               # cn(), Bengali numerals, first-name helper
│  └─ i18n/bn.ts                # central Bengali string table
├─ .vscode/                     # editor settings + recommended extensions
├─ .env.example                 # copy to .env.local when wiring real services
├─ tailwind.config.ts           # teal design system + sidebar tokens
└─ next.config.mjs
```

---

## How the core rules are enforced

The `castVote()` function in `src/lib/data.ts` mirrors the server-side
`cast_vote` RPC contract and enforces, in order:

1. **Rate limiting** — one attempt per few seconds per user.
2. **Active window** — election status `active` and within start/end dates.
3. **Valid candidate** — candidate belongs to the election.
4. **Geo check** — when `geoRequired`, the voter must be within the haversine
   radius of the election centre.
5. **One vote per person / idempotency** — a second vote is rejected.

Route protection lives in `src/lib/hooks.ts`:
`useAuth("student")` ≈ `requireSession()`, `useAuth("admin")` ≈ `requireAdmin()`.

---

## Design system

- **Brand:** teal `#1B7C8A` (`--primary`), deep navy auth backdrop `#0A1628`.
- **Theme:** light + dark via the `class` strategy; `ThemeToggle` flips the
  `dark` class on `<html>`. Both themes share one HSL token set.
- **Typography:** Noto Sans Bengali, self-hosted (`src/app/fonts`).
- **Motion:** reveal-on-scroll uses opacity + translate only — **no blur
  filter** (blur made the Y-movement invisible on mobile).
- **Maps:** the `LocationMap` / `GeoPickerMap` render a teal SVG fallback (never
  purple). With a MapTiler key they can be upgraded to a live MapLibre renderer.

---

## Going to production (optional)

The app ships fully working in demo mode. To wire real services later:

1. Copy `.env.example` to `.env.local` and fill in the values you need.
2. Swap the in-browser store in `src/lib/data.ts` for Supabase calls, keeping
   the same function signatures.
3. Replace the SVG fallback in the map components with a MapLibre renderer when
   `NEXT_PUBLIC_MAPTILER_KEY` is present.

> **Security note:** never commit `.env.local`. Keep service-role keys
> server-side only — never behind a `NEXT_PUBLIC_` prefix.
