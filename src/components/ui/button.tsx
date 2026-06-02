"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "destructive" | "pill" | "glow";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-gradient-to-r from-primary via-teal-500 to-teal-400 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 before:absolute before:inset-0 before:translate-x-[-100%] before:skew-x-[-12deg] before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent hover:before:translate-x-[200%] before:transition-transform before:duration-700",
  outline:
    "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/40 transition-colors",
  ghost:
    "bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  pill:
    "relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-teal-400 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:brightness-110 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent hover:before:translate-x-[200%] before:transition-transform before:duration-700",
  glow:
    "relative overflow-hidden border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 shadow-glow-sm hover:shadow-glow-md transition-all",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-9  px-3.5 text-sm",
  md: "h-11 px-5   text-sm",
  lg: "h-12 px-7   text-base",
  xl: "h-14 px-8   text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
