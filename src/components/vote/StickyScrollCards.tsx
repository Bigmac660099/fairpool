"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { Check, Info } from "lucide-react";
import { Avatar, CandidatePhoto } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Candidate } from "@/lib/types";
import { bn } from "@/i18n/bn";
import { cn } from "@/lib/utils";

/**
 * Sticky-scroll candidate picker. Each candidate has a photo-header card;
 * Lenis provides momentum smooth-scrolling. Tap a card to select; the info
 * popover shows the candidate's promises.
 */
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
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className="fp-scroll max-h-[62vh] overflow-y-auto pr-1"
    >
      <div className="space-y-3">
        {candidates.map((c) => {
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full overflow-hidden rounded-2xl border bg-card text-left transition-all",
                active
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border/60 hover:border-primary/40",
              )}
            >
              {/* Full-bleed photo header (inspired by Medicy product cards) */}
              <CandidatePhoto
                name={c.name}
                photoUrl={c.photoUrl}
                className="h-40 w-full"
              />

              {/* Promises popover + selection indicator */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary"
                      >
                        <Info className="h-3 w-3" />
                        {bn.vote.promises}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent onClick={(e) => e.stopPropagation()}>
                      <p className="mb-2 text-sm font-semibold">{c.name}</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {c.promises.map((p, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-primary">•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </div>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {active && <Check className="h-4 w-4" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
