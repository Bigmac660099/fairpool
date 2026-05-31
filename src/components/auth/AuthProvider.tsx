"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkMode } from "@/lib/auth-mode";

/**
 * Wraps the app in <ClerkProvider> ONLY when Clerk is enabled and configured.
 * In local demo mode it renders children untouched, so the app runs with no
 * Clerk keys. ClerkProvider reads the publishable key from the environment —
 * we never pass it as a prop (per Clerk's guidance).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (isClerkMode) {
    return <ClerkProvider afterSignOutUrl="/login">{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
