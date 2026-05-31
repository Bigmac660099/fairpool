import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Glassy surface card. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card/80 text-card-foreground shadow-sm backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
