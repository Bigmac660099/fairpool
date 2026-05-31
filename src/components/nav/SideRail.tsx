"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeft, ChevronUp } from "lucide-react";
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

/**
 * Desktop sidebar (hidden on mobile). Collapsible to icon mode with Ctrl+B.
 * The account menu uses onClick + router.push (not <Link>) so navigation is
 * not swallowed when the menu unmounts.
 */
export function SideRail() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  function go(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  function doLogout() {
    setMenuOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Header / logo */}
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
          F
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">{bn.app.name}</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent"
          aria-label="সাইডবার টগল"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: theme toggle + Radix account dropdown */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-2 rounded-lg p-1.5 text-left outline-none hover:bg-sidebar-accent"
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
              {/* onClick + router.push (NOT asChild + Link) so the portal
                  closing does not swallow navigation. */}
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
