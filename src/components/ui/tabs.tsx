"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Radix tabs with an animated active pill (animate-ui style). */
export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { active?: boolean }
>(({ className, children, active, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative z-10 rounded-full px-5 py-2 text-sm font-medium outline-none transition-colors",
      "data-[state=active]:text-primary-foreground text-white/70",
      className,
    )}
    {...props}
  >
    {active && (
      <motion.span
        layoutId="fp-tab-pill"
        className="absolute inset-0 -z-10 rounded-full bg-primary"
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      />
    )}
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = TabsPrimitive.Content;
