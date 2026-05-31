"use client";

import { SideRail } from "@/components/nav/SideRail";
import { BottomNav } from "@/components/nav/BottomNav";
import { BackChip } from "@/components/nav/BackChip";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { useAuth } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

/** Admin shell. requireAdmin(): non-admins are redirected to /dashboard. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth("admin");

  if (!ready || !user || !(user.role === "admin" || user.role === "trueAdmin")) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {bn.common.loading}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-8 md:pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">{bn.admin.title}</h1>
            <BackChip />
          </div>
          <AdminTabBar />
          {children}
        </main>
        <footer className="hidden border-t border-border/60 py-4 text-center text-xs text-muted-foreground md:block">
          {bn.app.name} Admin © {new Date().getFullYear()}
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
