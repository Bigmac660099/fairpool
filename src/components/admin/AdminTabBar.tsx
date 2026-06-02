"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { bn } from "@/i18n/bn";

const tabs = [
  { href: "/admin", label: bn.admin.overview },
  { href: "/admin/elections", label: bn.admin.elections },
  { href: "/admin/candidates", label: bn.admin.candidates },
  { href: "/admin/departments", label: bn.admin.departments },
  { href: "/admin/users", label: bn.admin.users },
  { href: "/admin/audit-log", label: bn.admin.auditLog },
  { href: "/admin/settings", label: bn.admin.settings },
];

/** Scrollable admin section tabs. */
export function AdminTabBar() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
