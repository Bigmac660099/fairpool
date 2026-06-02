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
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function SideRail() {
  const { user }   = useAuth();
  const router     = useRouter();
  const pathname   = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault(); setCollapsed((c) => !c);
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
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
          FP
        </div>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">
            {bn.app.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="সাইডবার টগল"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-2 rounded-lg p-1.5 outline-none transition-colors hover:bg-sidebar-accent"
              >
                <Avatar name={user?.name ?? "?"} size="sm" />
                {!collapsed && (
                  <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">
                    {user ? firstName(user.name) : ""}
                  </span>
                )}
                {!collapsed && <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />}
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
