"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkMode } from "@/lib/auth-mode";

/**
 * Wraps the app in <ClerkProvider> ONLY when Clerk is enabled and configured.
 * In local demo mode it renders children untouched, so the app runs with no
 * Clerk keys. ClerkProvider reads the publishable key from the environment —
 * we never pass it as a prop (per Clerk's guidance).
 *
 * taskUrls: configures where Clerk redirects after task flows like password
 * reset. The /session-tasks/reset-password route renders <SignIn/> which
 * continues the reset step in context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (isClerkMode) {
    return (
      <ClerkProvider
        afterSignOutUrl="/login"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        {children}
      </ClerkProvider>
    );
  }
  return <>{children}</>;
}
