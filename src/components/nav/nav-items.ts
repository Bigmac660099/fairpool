import {
  LayoutDashboard,
  Vote,
  BarChart3,
  User,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { bn } from "@/i18n/bn";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Nav items depend on role — admins get an extra entry. */
export function navItems(role: Role | undefined): NavItem[] {
  const base: NavItem[] = [
    { href: "/dashboard", label: bn.nav.dashboard, icon: LayoutDashboard },
    { href: "/vote", label: bn.nav.vote, icon: Vote },
    { href: "/results", label: bn.nav.results, icon: BarChart3 },
    { href: "/profile", label: bn.nav.profile, icon: User },
  ];
  if (role === "admin" || role === "trueAdmin") {
    base.push({ href: "/admin", label: bn.nav.admin, icon: Shield });
  }
  return base;
}
