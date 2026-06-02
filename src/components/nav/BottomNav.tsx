"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/data";
import { useAuth } from "@/lib/hooks";
import { navItems } from "./nav-items";

/**
 * Mobile floating navigation — a teal circle button fixed at bottom-right that
 * EXPANDS on tap to reveal navigation items stacked vertically above it.
 * Hidden on desktop (md:hidden). Never uses a dock or pill style.
 */
export function BottomNav() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const items = navItems(user?.role);
  const [open, setOpen] = useState(false);

  const activeItem = items.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const TriggerIcon = activeItem?.icon ?? items[0].icon;

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB + expanded items */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3 md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              key="items"
              className="flex flex-col items-center gap-3"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{ open: {}, closed: {} }}
            >
              {/* Logout */}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: 24, scale: 0.6 },
                }}
                transition={{ delay: items.length * 0.045, type: "spring", stiffness: 320, damping: 24 }}
              >
                <NavCircle
                  label="লগআউট"
                  onClick={handleLogout}
                  className="bg-destructive/90 text-white shadow-lg shadow-destructive/30"
                >
                  <LogOut className="h-5 w-5" />
                </NavCircle>
              </motion.div>

              {/* Nav items, closest to the trigger last (visually nearest) */}
              {[...items].reverse().map((item, idx) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      open: { opacity: 1, y: 0, scale: 1 },
                      closed: { opacity: 0, y: 24, scale: 0.6 },
                    }}
                    transition={{
                      delay: idx * 0.045,
                      type: "spring",
                      stiffness: 320,
                      damping: 24,
                    }}
                  >
                    <NavCircle
                      label={item.label}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "shadow-md",
                        active
                          ? "bg-primary text-primary-foreground shadow-primary/30"
                          : "border border-border/70 bg-card/95 text-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </NavCircle>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main trigger circle */}
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.88 }}
          className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 ring-2 ring-primary/20"
          aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
        >
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <TriggerIcon className="h-6 w-6" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}

function NavCircle({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition-colors",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
