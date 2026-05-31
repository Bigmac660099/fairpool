# AGENT.md — instructions for the VS Code cloud coding agent

This file tells an automated coding agent (Claude Code, Cursor, Copilot
Workspace, Cloudflare's agent, etc.) exactly what FAIRPOOL is, what is already
done, and what remains. Read this first, then `README.md`.

---

## What FAIRPOOL is

A mobile-first, **Bengali-language** university voting platform. Stack:

- **Next.js 14** (App Router, route groups `(auth)` `(app)` `(admin)`), **TypeScript**, **Tailwind v3**
- **Framer Motion**, **Three.js + R3F** (GLSL auth shader), **Embla**, **Lenis**, **Recharts**
- **MapLibre GL + MapTiler** (3D isometric voting map)
- **Clerk** (auth, dual-mode — see below), **Zod**, **jose**
- **Supabase** schema + RLS + `cast_vote` RPC (production data path, written, not yet wired)
- Package manager: **pnpm**

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # must stay green — verify after any change
pnpm typecheck  # must stay clean
```

The app runs **out of the box in local demo mode** (no keys). Demo logins:
student ID = any 14 digits; password `super` → প্রধান প্রশাসক (true admin),
`admin` → প্রশাসক (admin), anything else → student.

---

## ✅ Already done — do NOT rebuild

- All pages: login/register (Clerk-themed tabs + GLSL shader), dashboard, vote,
  results, profile, terms, full admin panel.
- **3D isometric voting map** (`src/components/maps/LocationMap.tsx`): MapLibre +
  MapTiler `streets-v2`, teal 3D buildings, live GPS pin, glowing geofence,
  distance line, floating green/red/gray status card, error→teal-SVG fallback,
  loading skeleton.
- **Candidate photos**: admin upload (file→base64 / URL) via
  `src/components/ui/photo-upload.tsx`; full-bleed `CandidatePhoto` cards.
- **Footer** (`src/components/SiteFooter.tsx`): Election-Commission style, fully
  CMS-driven.
- **CMS** (`/admin/settings`): edit brand, logo/favicon/banner (file upload),
  and all footer text — live everywhere.
- **Two-tier admin** (`/admin/users`): প্রধান প্রশাসক (`trueAdmin`) can
  block/delete/reset **anyone**; প্রশাসক (`admin`) can act on everyone **except**
  the true admin. Per-user **GPS log** viewer. Hierarchy enforced in
  `src/lib/data.ts` → `canManage()`.
- **Inactivity lock** (`src/components/InactivityGuard.tsx`): re-auth after 3h
  idle; new-device detection (local mode).
- **Clerk dual-mode**: `AUTH_MODE=local` (default) or `clerk`. Provider
  (`src/components/auth/AuthProvider.tsx`) and middleware only activate when
  Clerk is configured, so local preview never breaks.

---

## 🔧 TASK 1 — Turn on Clerk (email OTP login + reset + Google)

> Clerk is **Next.js** here — use `@clerk/nextjs`, NOT `@clerk/react`/Vite.
> Package + provider + middleware are already wired. You only need keys + dashboard config.

1. Create an app at https://dashboard.clerk.com → **API keys** → choose **Next.js**.
2. Put keys in `.env.local`:
   ```
   NEXT_PUBLIC_AUTH_MODE=clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```
3. In the Clerk dashboard:
   - **User & Authentication → Email/Phone/Username**: enable **Email address**,
     and under verification enable **Email verification code** (this is the OTP).
   - **Password reset**: enabled by default — Clerk's prebuilt `<SignIn/>` shows
     the "forgot password" → email-code reset flow automatically.
   - **Social connections → Google**: enable with **custom credentials** (required
     for `<GoogleOneTap/>`). Add Google OAuth client ID/secret.
   - **Sessions → Inactivity timeout**: set to **3 hours** (this is the proper,
     server-side version of the local InactivityGuard).
   - **Multi-factor / device verification**: enable to require OTP on new devices.
4. Verify: `pnpm dev`, open `/sign-in` → you should see Clerk's UI (teal-themed),
   not the local fallback. Sign-in routes are at `app/(auth)/sign-in/[[...sign-in]]`.

> The Clerk pages already exist and are themed (`ClerkAuthScreen.tsx`). Prebuilt
> `<SignIn/>`/`<SignUp/>` cover email-OTP + reset + Google from dashboard config.
> Only swap to `@clerk/elements` custom flows if you need bespoke markup.

### TASK 1b — Map Clerk users → app roles
The app's role model (`student` / `admin` / `trueAdmin`) lives in our data layer.
To carry roles through Clerk, store the role in Clerk **public metadata** and read
it via `auth().sessionClaims`. Designate exactly **one** `trueAdmin`. Wire
`resetUserPassword` / `deleteUser` in `src/lib/data.ts` to the **Clerk Backend API**
(`clerkClient.users.deleteUser`, `...updateUser`) when `isClerkMode`.

---

## 🔧 TASK 2 — Deploy to Cloudflare

Target: **Cloudflare Pages** (or Workers) with the Next-on-Pages adapter.

```bash
pnpm add -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages   # builds .vercel/output for Pages
```

- In `next.config.mjs`, Cloudflare's runtime is edge-based; routes using Node
  APIs (the Supabase service client, jose) should set
  `export const runtime = 'edge'` where needed, or keep them server-action only.
- Set all `.env.local` vars as **Pages environment variables** in the Cloudflare
  dashboard (Production + Preview).
- Build command: `npx @cloudflare/next-on-pages`. Output dir: `.vercel/output/static`.
- Restrict the **MapTiler key** to your Pages domain (MapTiler dashboard →
  allowed origins) and add `localhost:3000` for dev.

> Note: `@clerk/nextjs` works on Cloudflare via `clerkMiddleware`. Confirm the
> middleware matcher excludes static assets (it already does).

---

## 🔧 TASK 3 — Wire the Supabase production data layer (optional)

Everything is written; it just isn't connected.

1. `supabase db push --linked` applies `supabase/migrations/0001_init.sql`
   (schema + RLS + `cast_vote` / `cast_vote_as` SECURITY DEFINER RPCs).
2. Switch the calls in `src/lib/data.ts` to the server actions in
   `src/lib/server/actions.ts` (Zod-validated; vote writes go only through the RPC).
3. Replace `PhotoUpload`'s base64 path with a **Supabase Storage** upload, using
   the returned public URL.
4. Use `src/lib/server/realtime.ts` on the results page for live tallies.

---

## Guardrails for the agent

- After **every** change: `pnpm typecheck` and `pnpm build` must both pass.
- Do not introduce `localStorage`/`sessionStorage` in artifacts/SSR paths.
- Keep all user-facing strings **Bengali** (`src/i18n/bn.ts`).
- Keep the **local demo mode working** — never make keys mandatory to boot.
- Vote writes must always go through `cast_vote` (never a direct insert).
- The map must keep its error→teal-SVG fallback (never a black box).
