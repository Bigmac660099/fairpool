"use client";

import { motion } from "framer-motion";
import type { Candidate, Tally } from "@/lib/types";
import { toBn } from "@/lib/utils";
import { bn } from "@/i18n/bn";
import { cn } from "@/lib/utils";

const MEDAL = ["🥇", "🥈", "🥉"];

const barColors = [
  "from-yellow-400 to-amber-400",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
];
const barGlow = [
  "shadow-yellow-400/30",
  "shadow-slate-300/20",
  "shadow-amber-600/20",
];

export function RankingGraph({
  candidates,
  tallies,
}: {
  candidates: Candidate[];
  tallies: Tally[];
}) {
  const max = Math.max(1, ...tallies.map((t) => t.count));
  const rows = candidates
    .map((c) => ({
      candidate: c,
      count: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{bn.dashboard.leaderboard}</h3>
        <span className="text-xs text-muted-foreground">
          {bn.results.totalVotes}: {toBn(tallies.reduce((s, t) => s + t.count, 0))}
        </span>
      </div>

      {rows.map(({ candidate, count }, i) => {
        const pct = max > 0 ? (count / max) * 100 : 0;
        const isTop3 = i < 3;
        return (
          <div key={candidate.id} className="group flex items-center gap-3">
            {/* Rank badge */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                isTop3
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isTop3 ? MEDAL[i] : toBn(i + 1)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="truncate font-semibold">{candidate.name}</span>
                <span className="ml-2 tabular-nums text-muted-foreground">
                  {toBn(count)} {bn.results.votes}
                </span>
              </div>

              {/* Bar */}
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r shadow-sm",
                    isTop3 ? barColors[i] : "from-primary/70 to-primary/40",
                    isTop3 ? barGlow[i] : "",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.75, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Percentage */}
            <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
              {max > 0 ? `${toBn(Math.round(pct))}%` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
