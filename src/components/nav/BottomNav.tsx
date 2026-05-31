"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/data";
import { useAuth } from "@/lib/hooks";
import { navItems } from "./nav-items";

/**
 * Mobile bottom navigation — a floating "magnetic dock" pill. Items gently
 * scale up on press. Hidden on desktop (md:hidden).
 */
export function BottomNav() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const items = navItems(user?.role);

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden">
      <nav className="flex items-center gap-1 rounded-full border border-border/60 bg-card/85 px-2 py-2 shadow-lg shadow-black/10 backdrop-blur-xl">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <motion.button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.12 }}
              aria-label={item.label}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <item.icon className="h-5 w-5" />
            </motion.button>
          );
        })}
        <motion.button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.12 }}
          aria-label="লগআউট"
          className="flex h-11 w-11 items-center justify-center rounded-full text-destructive hover:bg-accent"
        >
          <LogOut className="h-5 w-5" />
        </motion.button>
      </nav>
    </div>
  );
}
