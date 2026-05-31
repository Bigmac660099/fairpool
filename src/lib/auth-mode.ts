/**
 * Auth mode switch.
 *  - "local"  → built-in demo auth (in-browser store). Runs with zero setup.
 *  - "clerk"  → Clerk-hosted auth (email OTP, Google, password reset, sessions).
 *
 * Set NEXT_PUBLIC_AUTH_MODE=clerk in .env.local to enable Clerk. Clerk only
 * activates when a publishable key is also present, so a missing key safely
 * falls back to local mode rather than crashing.
 */
export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "local";

export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** True only when Clerk is requested AND configured. */
export const isClerkMode = AUTH_MODE === "clerk" && Boolean(clerkPublishableKey);
