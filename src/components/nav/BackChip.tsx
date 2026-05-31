"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { bn } from "@/i18n/bn";

/**
 * Back chip. Hidden on /dashboard, visible everywhere else.
 * Goes back in history, or to /dashboard when there is no history.
 */
export function BackChip() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/dashboard") return null;

  function onBack() {
    if (window.history.length > 1) router.back();
    else router.push("/dashboard");
  }

  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-sm text-foreground/80 backdrop-blur transition-colors hover:bg-accent"
    >
      <ArrowLeft className="h-4 w-4" />
      {bn.nav.back}
    </button>
  );
}
