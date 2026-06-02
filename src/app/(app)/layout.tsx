"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SideRail } from "@/components/nav/SideRail";
import { BottomNav } from "@/components/nav/BottomNav";
import { BackChip } from "@/components/nav/BackChip";
import { SiteFooter } from "@/components/SiteFooter";
import { InactivityGuard } from "@/components/InactivityGuard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/hooks";
import { navItems } from "@/components/nav/nav-items";
import { bn } from "@/i18n/bn";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth("student");
  const pathname = usePathname();

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{bn.common.loading}</p>
        </div>
      </div>
    );
  }

  // Derive current page title from nav items for the mobile header
  const items = navItems(user.role);
  const activeItem = items.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const pageTitle = activeItem?.label ?? bn.app.name;

  return (
    <div className="flex min-h-screen">
      <InactivityGuard />
      <SideRail />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile sticky header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/85 px-4 backdrop-blur-xl md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 text-xs font-black text-white shadow-glow-sm">
              FP
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/15" />
            </span>
            <span className="text-sm font-bold tracking-tight">{pageTitle}</span>
          </Link>
          <ThemeToggle className="h-9 w-9" />
        </header>

        <main className="relative mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-8 md:pb-8 md:pt-8">
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
