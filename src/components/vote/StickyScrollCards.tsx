"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CandidatePhoto } from "@/components/ui/avatar";
import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StickyScrollCards({
  candidates,
  selected,
  onSelect,
}: {
  candidates: Candidate[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = scrollRef.current;
    if (!wrapper) return;
    const lenis = new Lenis({
      wrapper,
      content: wrapper.firstElementChild as HTMLElement,
      duration: 1.1,
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <div ref={scrollRef} className="fp-scroll max-h-[62vh] overflow-y-auto pr-1">
      <div className="space-y-3">
        {candidates.map((c, idx) => {
          const active = selected === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "group w-full overflow-hidden rounded-2xl border text-left transition-all duration-200",
                active
                  ? "border-primary/60 shadow-glow-sm ring-2 ring-primary/25"
                  : "border-border/50 hover:border-primary/30 hover:shadow-card-raised",
              )}
            >
              {/* Full-bleed photo */}
              <CandidatePhoto
                name={c.name}
                photoUrl={c.photoUrl}
                className="h-44 w-full"
                selected={active}
              />

              {/* Content row */}
              <div className="flex items-center justify-between bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  {/* Promise chips */}
                  {c.promises.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.promises.slice(0, 2).map((p, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] text-primary"
                        >
                          {p}
                        </span>
                      ))}
                      {c.promises.length > 2 && (
                        <span className="rounded-full border border-border/50 bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          +{c.promises.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div
                  className={cn(
                    "ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                    active
                      ? "border-primary bg-primary text-white scale-110"
                      : "border-border group-hover:border-primary/50",
                  )}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{  scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
