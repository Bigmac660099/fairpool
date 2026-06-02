import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "glow" | "raised" | "flat" | "glass" | "dark";

const cardVariants: Record<CardVariant, string> = {
  default:
    "rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm backdrop-blur-sm transition-shadow",
  glass:
    "rounded-2xl border border-white/12 bg-white/6 text-card-foreground shadow-sm backdrop-blur-xl",
  glow:
    "rounded-2xl border border-primary/30 bg-card text-card-foreground shadow-lg shadow-primary/10 ring-1 ring-primary/15 backdrop-blur-sm transition-all hover:shadow-primary/20 hover:border-primary/45",
  raised:
    "rounded-2xl border border-border/40 bg-card text-card-foreground shadow-card-raised backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
  flat:
    "rounded-2xl border border-border/40 bg-card text-card-foreground",
  dark:
    "rounded-2xl border border-white/8 bg-black/30 text-white shadow-xl backdrop-blur-xl",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants[variant], className)}
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
      className={cn("flex flex-col gap-1.5 border-b border-border/40 px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}
