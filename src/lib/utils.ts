import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and de-duplicate Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convert Western digits to Bengali numerals for display. */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBn(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** First name from a full Bengali name (used for carousel dot labels). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Both admin tiers count as "admin" for access gating. */
export function isAdminRole(role?: string): boolean {
  return role === "admin" || role === "trueAdmin";
}
