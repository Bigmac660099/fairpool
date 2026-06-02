# FAIRPOOL — Security Posture

This document records the security controls **enforced in code** and the
**production infrastructure** steps required to complete the security-by-default
posture. Each control names the vulnerability class it mitigates.

> Honesty note: FAIRPOOL ships a **local demo mode** (in-browser `localStorage`)
> and a **production mode** (Clerk auth + Supabase/Postgres). Some controls below
> (KMS, encrypted backups, server-side lockout, Argon2 hashing, MFA) are only
> meaningful in production and are delivered as **wired code + documented infra
> steps**, not as fake demo theatre.

---

## 1. Encryption in transit (TLS 1.3 + HSTS)

- **HSTS** header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
  is sent on every response — see `next.config.mjs`. Defeats SSL-strip /
  protocol-downgrade MITM.
- **TLS 1.3** is terminated at the edge host (Cloudflare Pages / Vercel). Set the
  minimum TLS version to **1.3** in the host dashboard; HSTS forces the browser
  to never fall back to plaintext HTTP.
- `upgrade-insecure-requests` in the CSP rewrites any stray `http://` subresource
  to `https://`.

## 2. Encryption at rest (AES-256-GCM)

- `src/lib/server/crypto.ts` provides `encryptField` / `decryptField`
  (AES-256-GCM, authenticated) and a `blindIndex` (HMAC-SHA256) for equality
  lookups on encrypted columns.
- Sensitive PII (e.g. `name`) is encrypted before being written to Supabase in
  `actions.ts` and the Clerk webhook. Mitigates DB/backup compromise.
- **Key management:** `ENCRYPTION_KEY` is read from the environment, never
  hardcoded. In production load it from **AWS KMS** or **HashiCorp Vault**.
- **Key rotation:** ciphertext is prefixed with a key id (`v1:`). To rotate:
  add the new key, decrypt-then-re-encrypt lazily on read, retire the old key.
- For searchable fields (email, student id) use the `blindIndex` HMAC so you can
  `WHERE blind_index = ?` without storing plaintext.

## 3. Input sanitization (XSS)

- `src/lib/sanitize.ts` — strict **allowlist** sanitizers strip all HTML tags and
  control characters on **write** (`sanitizeName`, `sanitizeText`, `sanitizeEmail`).
- Applied in `data.ts` (register) and the server `registerAction` / webhook.
- React auto-escapes on render and the codebase uses **no `dangerouslySetInnerHTML`**.
- The **CSP** (`next.config.mjs`) is the runtime containment layer:
  `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.

## 4. Database security (SQLi)

- All DB access goes through the **Supabase JS client** (parameterized) and the
  **`cast_vote` SECURITY DEFINER RPC** — see `supabase/migrations/0001_init.sql`.
  No string concatenation into SQL anywhere.
- Vote writes happen **only** through `cast_vote`, never a direct client insert.

## 5. Access control & least privilege (RBAC / IDOR)

- Route guards in `src/middleware.ts` — `/admin/*` requires `admin`/`trueAdmin`.
- Two-tier admin hierarchy enforced in `data.ts → canManage()` (an `admin`
  cannot act on a `trueAdmin`; nobody can act on themselves).
- **RLS** policies in the migration restrict row access by owner/role.
- One-vote-per-person enforced by a `unique(election_id, voter_id)` constraint +
  the RPC — prevents IDOR-style vote stuffing.
- The Supabase **service-role key is server-only** (`supabase.ts` is `server-only`).

## 6. Data masking & redaction

- `src/lib/mask.ts` — `maskEmail`, `maskStudentId`, `maskPhone`. The admin user
  list shows **masked** student id + email by default (anti shoulder-surf /
  screenshot leak).
- `src/lib/server/log.ts` — `logError`/`logInfo` deep-redact `password`, `token`,
  `authorization`, `cookie`, `email`, `student_id`, etc. before anything reaches
  stdout / a log aggregator.

## 7. Authentication

- **Production (Clerk):** Argon2/bcrypt password hashing, **MFA**, and
  **server-side account lockout** are enabled in the Clerk dashboard
  (User & Authentication → Attack protection → enable; Multi-factor → enable).
  These cannot be bypassed client-side.
- **Demo (local):** `data.ts` enforces a **5-attempt / 15-minute lockout**
  (`lockoutRemaining`) as a defense-in-depth demonstration of the control.
- **Session cookies** (`actions.ts`): `httpOnly` (no JS access → XSS can't steal
  the token), `secure` in production (HTTPS-only), `sameSite=lax` (CSRF defense
  while allowing OAuth return redirects). JWT signed with `SESSION_SECRET` (jose).

## 8. Error handling & logging

- Production server paths return **generic messages** to the client
  (`"নিবন্ধন ব্যর্থ হয়েছে"`, `"ভোট রেকর্ড করা যায়নি"`); the detailed error is
  logged server-side via the redacting logger. Prevents internal-detail leakage.
- `poweredByHeader: false` removes the `X-Powered-By` framework banner.
- Production logs suppress stack traces (`log.ts` checks `NODE_ENV`).

---

## Production infrastructure checklist (do before launch)

- [ ] Host: set **minimum TLS 1.3**; confirm HSTS preload submission.
- [ ] `ENCRYPTION_KEY`, `SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`,
      `CLERK_SECRET_KEY` stored in **KMS/Vault**, injected as runtime secrets
      (never committed, never in `NEXT_PUBLIC_*`).
- [ ] Enable Clerk **MFA**, **attack protection / lockout**, and **breach
      password detection**.
- [ ] Supabase: run the migration so **RLS is ON** for every table; verify the
      anon key has no table-level bypass.
- [ ] Add the encrypted columns + `blind_index` columns for `email` / `student_id`
      if you need encrypted-yet-searchable identifiers.
- [ ] **Backups:** enable automated **encrypted** Postgres backups (Supabase PITR),
      store in a **geographically isolated** bucket, and **test restoration**
      on a schedule.
- [ ] Make the `audit_log` table **append-only** (revoke UPDATE/DELETE; insert via
      a SECURITY DEFINER function) for an immutable data-access trail.
- [ ] Run `npm audit` / Dependabot; patch the flagged Next.js advisory.
- [ ] Tighten the CSP to a **per-request nonce** (remove `'unsafe-inline'` /
      `'unsafe-eval'` from `script-src`).
