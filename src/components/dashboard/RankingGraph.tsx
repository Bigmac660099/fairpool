"use client";

import { motion } from "framer-motion";
import type { Candidate, Tally } from "@/lib/types";
import { toBn } from "@/lib/utils";
import { bn } from "@/i18n/bn";

/** Live horizontal bar chart of vote tallies, sorted descending. */
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {bn.dashboard.leaderboard}
      </h3>
      {rows.map(({ candidate, count }, i) => (
        <div key={candidate.id} className="flex items-center gap-3">
          <span className="w-5 text-sm font-bold text-muted-foreground">
            {toBn(i + 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate font-medium">{candidate.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {toBn(count)} {bn.results.votes}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
