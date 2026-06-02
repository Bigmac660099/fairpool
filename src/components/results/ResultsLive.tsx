"use client";

import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar, CandidatePhoto } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/primitives";
import { MotionCarousel } from "@/components/ui/motion-carousel";
import { RankingGraph } from "@/components/dashboard/RankingGraph";
import { ResultsChart } from "./ResultsChart";
import { getCandidates, getElection, getTallies } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { firstName, toBn } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* Rank colour system — no emojis */
const rankStyles: Record<number, { bar: string; ring: string; label: string }> = {
  1: { bar: "bg-amber-400",  ring: "ring-2 ring-amber-400/60", label: "১ম" },
  2: { bar: "bg-slate-400",  ring: "ring-2 ring-slate-300/60", label: "২য়" },
  3: { bar: "bg-amber-600",  ring: "ring-2 ring-amber-600/50", label: "৩য়" },
};

const podiumHeights = ["h-20", "h-32", "h-14"]; // 2nd, 1st, 3rd

export function ResultsLive({ electionId }: { electionId: string }) {
  useStoreSync();
  const election   = getElection(electionId);
  const candidates = getCandidates(electionId);
  const tallies    = getTallies(electionId);

  if (!election) return <p className="text-muted-foreground">{bn.common.empty}</p>;

  const totalVotes = tallies.reduce((s, t) => s + t.count, 0);

  const ranked = candidates
    .map((c) => ({
      candidate: c,
      count: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const top3 = ranked.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-display-xs font-bold tracking-tight">{election.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bn.results.totalVotes}:{" "}
              <span className="font-semibold text-foreground">{toBn(totalVotes)}</span>{" "}
              {bn.results.votes}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Zap className="h-3 w-3" />
            {bn.results.live}
          </span>
        </div>
      </Reveal>

      {/* ── Top-3 carousel ────────────────────────────────────── */}
      <Reveal>
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{bn.results.top3}</h2>
        </div>
        <MotionCarousel
          slides={top3}
          autoPlay={false}
          dotLabels={top3.map((t) => firstName(t.candidate.name))}
          renderSlide={(t, i) => {
            const rs = rankStyles[i + 1] ?? rankStyles[3];
            return (
              <div className="relative">
                <CandidatePhoto
                  name={t.candidate.name}
                  photoUrl={t.candidate.photoUrl}
                  className="h-52 w-full"
                />
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-xs font-bold text-white backdrop-blur-sm">
                  {rs.label}
                </span>
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {toBn(t.count)} {bn.results.votes}
                </div>
              </div>
            );
          }}
        />
      </Reveal>

      {/* ── Podium ────────────────────────────────────────────── */}
      <Reveal>
        <Card>
          <CardBody>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              শীর্ষ প্রার্থী
            </p>
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map((t, podiumIdx) => {
                const realRank = top3.indexOf(t) + 1;
                const rs = rankStyles[realRank] ?? rankStyles[3];
                return (
                  <motion.div
                    key={t.candidate.id}
                    className="flex flex-1 flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIdx * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Avatar
                      name={t.candidate.name}
                      photoUrl={t.candidate.photoUrl}
                      size={realRank === 1 ? "lg" : "md"}
                      className={rs.ring}
                    />
                    <p className={cn(
                      "max-w-full truncate text-center text-xs font-semibold",
                      realRank === 1 ? "text-foreground" : "text-muted-foreground",
                    )}>
                      {firstName(t.candidate.name)}
                    </p>
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {toBn(t.count)} {bn.results.votes}
                    </p>
                    <div
                      className={cn(
                        "flex w-full items-start justify-center rounded-t-lg pt-2 text-xs font-bold text-white",
                        podiumHeights[podiumIdx],
                        rs.bar,
                      )}
                    >
                      {rs.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {/* ── Full results ──────────────────────────────────────── */}
      <Reveal>
        <Card>
          <CardBody className="space-y-6">
            <ResultsChart candidates={candidates} tallies={tallies} />
            <div className="border-t border-border/50 pt-5">
              <RankingGraph candidates={candidates} tallies={tallies} />
            </div>
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
