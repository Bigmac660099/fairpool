"use client";

import { useEffect, useState } from "react";
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
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground/80">{title}</p>
        {!ended && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            চলমান
          </span>
        )}
      </div>

      {ended ? (
        <p className="text-base font-semibold text-destructive">{bn.dashboard.timeEnded}</p>
      ) : (
        <div className="flex items-stretch gap-2">
          {[
            { v: remaining.days,    l: bn.common.days },
            { v: remaining.hours,   l: bn.common.hours },
            { v: remaining.minutes, l: bn.common.minutes },
            { v: remaining.seconds, l: bn.common.seconds },
          ].map(({ v, l }) => (
            <div
              key={l}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border/60 bg-muted/40 py-3"
            >
              <span className="text-xl font-bold tabular-nums text-primary leading-none">
                {toBn(String(v).padStart(2, "0"))}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {l}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
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
