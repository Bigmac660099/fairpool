"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AuthModal } from "./AuthModal";

/** R3F shader is browser-only — load without SSR. */
const HeroGeometric = dynamic(
  () => import("@/components/ui/hero-geometric").then((m) => m.HeroGeometric),
  { ssr: false },
);

/**
 * Auth screen: animated login/register tabs over the GLSL shader background.
 * Switching tabs smoothly shifts the shader palette (login = teal-on-navy,
 * register = brighter aqua-on-deep-teal).
 */
export function AuthShell({ initialTab }: { initialTab: "login" | "register" }) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  const palette =
    tab === "login"
      ? { color1: "#1B7C8A", color2: "#0A1628" }
      : { color1: "#2BB7B0", color2: "#08222B" };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-y-auto px-4 py-10">
      <HeroGeometric color1={palette.color1} color2={palette.color2} />
      <AuthModal tab={tab} onTabChange={setTab} />
    </main>
  );
}
