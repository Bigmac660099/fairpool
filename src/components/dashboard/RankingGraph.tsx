"use client";

import { motion } from "framer-motion";
import type { Candidate, Tally } from "@/lib/types";
import { toBn } from "@/lib/utils";
import { bn } from "@/i18n/bn";
import { cn } from "@/lib/utils";

export function RankingGraph({
  candidates,
  tallies,
}: {
  candidates: Candidate[];
  tallies: Tally[];
}) {
  const max = Math.max(1, ...tallies.map((t) => t.count));
  const total = tallies.reduce((s, t) => s + t.count, 0);
  const rows = candidates
    .map((c) => ({
      candidate: c,
      count: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{bn.dashboard.leaderboard}</p>
        {total > 0 && (
          <p className="text-xs text-muted-foreground">
            {bn.results.totalVotes}: {toBn(total)}
          </p>
        )}
      </div>

      {rows.map(({ candidate, count }, i) => {
        const pct = (count / max) * 100;
        const isFirst = i === 0;
        return (
          <div key={candidate.id} className="flex items-center gap-3">
            {/* Rank number */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isFirst
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {toBn(i + 1)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{candidate.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground text-xs">
                  {toBn(count)} {bn.results.votes}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isFirst ? "bg-primary" : "bg-primary/40",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.65, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {max > 0 ? `${toBn(Math.round(pct))}%` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
