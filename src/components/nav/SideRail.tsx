"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeft, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn, firstName } from "@/lib/utils";
import { bn } from "@/i18n/bn";
import { logout } from "@/lib/data";
import { useAuth } from "@/lib/hooks";
import { navItems } from "./nav-items";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function SideRail() {
  const { user } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = navItems(user?.role);

  function go(href: string) { setMenuOpen(false); router.push(href); }
  function doLogout() { setMenuOpen(false); logout(); router.push("/login"); }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* ── Wordmark / logo ─────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 font-black text-white shadow-glow-sm">
          FP
          {/* Subtle inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/15" />
        </div>
        {!collapsed && (
          <span className="fp-gradient text-lg font-black tracking-tighter">
            ফেয়ারপুল
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="সাইডবার টগল"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Nav items ───────────────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {/* Active left accent bar */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  active ? "text-primary" : "group-hover:scale-110",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {/* Active dot when collapsed */}
              {collapsed && active && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: theme + account menu ────────────────────────── */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-2.5 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent"
              >
                <Avatar name={user?.name ?? "?"} size="sm" />
                {!collapsed && (
                  <span className="flex-1 truncate text-sm font-medium">
                    {user ? firstName(user.name) : ""}
                  </span>
                )}
                {!collapsed && <ChevronUp className="h-4 w-4 text-muted-foreground" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem onClick={() => go("/profile")}>
                {bn.nav.profile}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={doLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {bn.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!collapsed && <ThemeToggle />}
        </div>
      </div>
    </aside>
  );
}
