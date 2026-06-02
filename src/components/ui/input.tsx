"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border px-3.5 text-sm transition-colors",
        "bg-background text-foreground placeholder:text-muted-foreground/60",
        "outline-none",
        // Default border
        error
          ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
          : "border-input focus:border-primary focus:ring-2 focus:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/* Labeled field wrapper — always use this for forms */
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium leading-none text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}

/* Ghost input for dark/glass auth backgrounds */
export const GhostInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        /* fp-auth-input class targets the autofill override in globals.css */
        "fp-auth-input",
        "h-11 w-full rounded-lg border border-white/20 bg-white/10 px-4 text-sm text-white",
        "placeholder:text-white/45 outline-none transition-colors",
        "focus:border-white/40 focus:bg-white/14 focus:ring-2 focus:ring-white/15",
        "caret-white",
        className,
      )}
      {...props}
    />
  ),
);
GhostInput.displayName = "GhostInput";
