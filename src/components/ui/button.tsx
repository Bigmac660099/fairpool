"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type Size    = "xs" | "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  /* Clean vertical gradient — barely perceptible, used by Stripe/Linear */
  primary:
    "bg-primary text-primary-foreground shadow-primary-sm " +
    "hover:bg-[hsl(185_65%_29%)] active:bg-[hsl(185_65%_26%)] " +
    "dark:shadow-none",
  secondary:
    "bg-secondary text-secondary-foreground " +
    "hover:bg-secondary/70 active:bg-secondary/90",
  outline:
    "border border-border bg-card text-foreground " +
    "hover:bg-accent hover:text-accent-foreground hover:border-primary/40",
  ghost:
    "bg-transparent text-foreground " +
    "hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground shadow-xs " +
    "hover:bg-destructive/88 active:bg-destructive/95",
  link:
    "bg-transparent text-primary underline-offset-4 " +
    "hover:underline p-0 h-auto",
};

const sizes: Record<Size, string> = {
  xs: "h-7  px-2.5 text-xs  rounded-md",
  sm: "h-9  px-4   text-sm  rounded-lg",
  md: "h-10 px-5   text-sm  rounded-lg",
  lg: "h-11 px-6   text-base rounded-xl",
  xl: "h-13 px-8   text-base rounded-xl",
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
        // Base
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-all duration-150 select-none",
        // States
        "active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-40",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variants[variant],
        variant !== "link" ? sizes[size] : "",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
