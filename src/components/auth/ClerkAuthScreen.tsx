"use client";

import dynamic from "next/dynamic";
import { SignIn, SignUp } from "@clerk/nextjs";
import { isClerkMode } from "@/lib/auth-mode";
import { AuthShell } from "./AuthShell";

/** The teal shader background (browser-only). */
const HeroGeometric = dynamic(
  () => import("@/components/ui/hero-geometric").then((m) => m.HeroGeometric),
  { ssr: false },
);

/**
 * Renders Clerk's prebuilt <SignIn/> or <SignUp/> over the teal shader. These
 * components handle email-OTP, password reset, and Google sign-in based on
 * what you enable in the Clerk dashboard. When Clerk is NOT configured, this
 * falls back to the local AuthShell so the route still works in demo mode.
 */
export function ClerkAuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  if (!isClerkMode) {
    return <AuthShell initialTab={mode === "sign-in" ? "login" : "register"} />;
  }

  // Teal-themed Clerk appearance.
  const appearance = {
    variables: {
      colorPrimary: "#1B7C8A",
      colorBackground: "rgba(255,255,255,0.06)",
      colorText: "#ffffff",
      colorInputBackground: "rgba(255,255,255,0.08)",
      colorInputText: "#ffffff",
      borderRadius: "0.75rem",
    },
    elements: {
      card: "bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl",
      headerTitle: "text-white",
      headerSubtitle: "text-white/60",
    },
  } as const;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <HeroGeometric color1="#1B7C8A" color2="#0A1628" />
      {mode === "sign-in" ? (
        <SignIn appearance={appearance} signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
      ) : (
        <SignUp appearance={appearance} signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      )}
    </main>
  );
}
