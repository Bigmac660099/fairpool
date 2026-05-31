"use client";

import Link from "next/link";
import { SideRail } from "@/components/nav/SideRail";
import { BottomNav } from "@/components/nav/BottomNav";
import { BackChip } from "@/components/nav/BackChip";
import { SiteFooter } from "@/components/SiteFooter";
import { InactivityGuard } from "@/components/InactivityGuard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

/**
 * Shared shell for all authenticated student-facing routes.
 * - Desktop: persistent SideRail on the left.
 * - Mobile: sticky header + floating BottomNav.
 * - requireSession(): unauthenticated users are redirected to /login.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth("student");

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {bn.common.loading}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <InactivityGuard />
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile sticky header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              F
            </span>
            <span className="font-bold">{bn.app.name}</span>
          </Link>
          <ThemeToggle className="h-9 w-9" />
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-8 md:pb-8 md:pt-8">
          <div className="mb-4">
            <BackChip />
          </div>
          {children}
        </main>
        <SiteFooter />
      </div>
      <BottomNav />
    </div>
  );
}
