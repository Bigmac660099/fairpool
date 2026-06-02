import dynamic from "next/dynamic";
import { SignIn } from "@clerk/nextjs";
import { isClerkMode } from "@/lib/auth-mode";

const HeroGeometric = dynamic(
  () => import("@/components/ui/hero-geometric").then((m) => m.HeroGeometric),
  { ssr: false },
);

/**
 * Password-reset landing page. Clerk email-link and OTP flows redirect here
 * after the user clicks the link in their inbox. The ClerkProvider's
 * `signInUrl` is set to `/sign-in` and Clerk handles the reset step internally
 * within the <SignIn/> component, so rendering it here continues the flow
 * seamlessly.
 *
 * Configure in Clerk dashboard → Paths:
 *   Sign-in URL: /sign-in
 *   Task URLs → "Reset password": /session-tasks/reset-password
 */

const clerkAppearance = {
  variables: {
    colorPrimary: "#0891B2",
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

export default function ResetPasswordPage() {
  if (!isClerkMode) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-4">
        <HeroGeometric color1="#0891B2" color2="#08112A" />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            F
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">পাসওয়ার্ড রিসেট</h1>
          <p className="text-sm text-white/60">
            Clerk কনফিগার করলে এখানে পাসওয়ার্ড রিসেটের ফর্ম দেখাবে।
            <br />
            <span className="mt-2 inline-block opacity-60">
              (ডেমো মোডে পাসওয়ার্ড রিসেট নেই)
            </span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <HeroGeometric color1="#0891B2" color2="#08112A" />
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </main>
  );
}
