"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";

interface Props { endsAt: string; title: string; }

export function ElectionTimer({ endsAt, title }: Props) {
  const [remaining, setRemaining] = useState(() => diff(endsAt));

  useEffect(() => {
    const t = setInterval(() => setRemaining(diff(endsAt)), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const ended = remaining.total <= 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-teal-400/5 p-5">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <p className="max-w-[70%] truncate text-sm font-medium text-foreground/80">{title}</p>
        {!ended && (
          <span className="fp-scan relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
            চলমান
          </span>
        )}
      </div>

      {ended ? (
        <p className="text-lg font-bold text-destructive">{bn.dashboard.timeEnded}</p>
      ) : (
        <div className="flex items-stretch gap-2.5">
          {[
            { v: remaining.days,    l: bn.common.days },
            { v: remaining.hours,   l: bn.common.hours },
            { v: remaining.minutes, l: bn.common.minutes },
            { v: remaining.seconds, l: bn.common.seconds },
          ].map(({ v, l }, idx) => (
            <GlassUnit key={l} value={v} label={l} delay={idx * 0.04} />
          ))}
        </div>
      )}

      {/* Bottom teal accent line */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="h-3 w-3 text-primary" />
        <span>রিয়েল-টাইম কাউন্টডাউন</span>
      </div>
    </div>
  );
}

function GlassUnit({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-primary/20 bg-primary/6 py-2.5 shadow-sm backdrop-blur-sm"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y:  8, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fp-gradient text-2xl font-bold tabular-nums leading-none"
        >
          {toBn(String(value).padStart(2, "0"))}
        </motion.span>
      </AnimatePresence>
      <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

function diff(iso: string) {
  const total = Math.max(0, new Date(iso).getTime() - Date.now());
  return {
    total,
    days:    Math.floor(total / 86_400_000),
    hours:   Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
