import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "raised" | "outline" | "ghost" | "tinted";

const variants: Record<CardVariant, string> = {
  /* Subtle 1px border + light shadow — the workhorse */
  default:
    "bg-card border border-border/70 shadow-card",
  /* Slightly elevated — hover lifts for interactive cards */
  raised:
    "bg-card border border-border/60 shadow-card-md transition-shadow duration-200 hover:shadow-card-lg",
  /* No fill, just border — for secondary groupings */
  outline:
    "bg-transparent border border-border",
  /* No shadow, no border — for subtle groupings within a card */
  ghost:
    "bg-muted/50 border border-transparent",
  /* Very light primary tint — for status/info zones */
  tinted:
    "bg-primary/5 border border-primary/15 dark:bg-primary/8 dark:border-primary/20",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl text-card-foreground", variants[variant], className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 pt-5 pb-4 border-b border-border/50", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground mt-0.5", className)}
      {...props}
    />
  );
}
