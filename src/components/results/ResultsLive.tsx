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

const podiumColors = [
  // 2nd — silver
  "from-slate-300/30 to-slate-400/20 border-slate-300/40",
  // 1st — gold
  "from-yellow-400/30 to-amber-400/20 border-yellow-400/50",
  // 3rd — bronze
  "from-amber-600/25 to-amber-700/15 border-amber-600/35",
];
const podiumHeights = ["h-20", "h-32", "h-14"];
const rankLabels    = ["", "🥇", "🥈", "🥉"];

export function ResultsLive({ electionId }: { electionId: string }) {
  useStoreSync();
  const election  = getElection(electionId);
  const candidates = getCandidates(electionId);
  const tallies    = getTallies(electionId);

  if (!election) {
    return <p className="text-muted-foreground">{bn.common.empty}</p>;
  }

  const totalVotes = tallies.reduce((s, t) => s + t.count, 0);

  const ranked = candidates
    .map((c) => ({
      candidate: c,
      count: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const top3 = ranked.slice(0, 3);
  // Podium visual order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-display-xs font-bold tracking-tight">{election.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bn.results.totalVotes}:{" "}
              <span className="fp-gradient-soft font-semibold">{toBn(totalVotes)}</span>{" "}
              {bn.results.votes}
            </p>
          </div>
          <span className="fp-scan relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            <Zap className="h-3 w-3" />
            {bn.results.live}
          </span>
        </div>
      </Reveal>

      {/* ── Top-3 carousel ────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">{bn.results.top3}</h2>
        </div>
        <MotionCarousel
          slides={top3}
          autoPlay={false}
          dotLabels={top3.map((t) => firstName(t.candidate.name))}
          renderSlide={(t, i) => (
            <div className="group relative">
              <CandidatePhoto
                name={t.candidate.name}
                photoUrl={t.candidate.photoUrl}
                className="h-56 w-full"
              />
              {/* Rank badge */}
              <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg backdrop-blur-sm">
                {rankLabels[i + 1]}
              </span>
              {/* Vote count */}
              <div className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
                {toBn(t.count)} {bn.results.votes}
              </div>
            </div>
          )}
        />
      </Reveal>

      {/* ── Premium podium ────────────────────────────────────────── */}
      <Reveal>
        <Card variant="raised">
          <CardBody>
            <h3 className="mb-4 text-sm font-semibold tracking-tight text-muted-foreground">
              শীর্ষস্থান
            </h3>
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map((t, podiumIdx) => {
                const realRank  = top3.indexOf(t) + 1 as 1 | 2 | 3;
                const isWinner  = realRank === 1;

                return (
                  <motion.div
                    key={t.candidate.id}
                    className="flex flex-1 flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIdx * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Avatar
                      name={t.candidate.name}
                      photoUrl={t.candidate.photoUrl}
                      size={isWinner ? "lg" : "md"}
                      rank={realRank}
                    />
                    <p
                      className={cn(
                        "max-w-full truncate text-center text-xs font-semibold",
                        isWinner ? "fp-gradient text-sm" : "",
                      )}
                    >
                      {firstName(t.candidate.name)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {toBn(t.count)} {bn.results.votes}
                    </p>
                    {/* Podium step */}
                    <div
                      className={cn(
                        "flex w-full items-start justify-center rounded-t-xl border border-b-0 pt-2 text-base font-black",
                        podiumHeights[podiumIdx],
                        `bg-gradient-to-t ${podiumColors[podiumIdx]}`,
                      )}
                    >
                      {rankLabels[realRank]}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {/* ── Full leaderboard + chart ───────────────────────────────── */}
      <Reveal>
        <Card variant="raised">
          <CardBody className="space-y-6">
            <ResultsChart candidates={candidates} tallies={tallies} />
            <div className="border-t border-border/40 pt-4">
              <RankingGraph candidates={candidates} tallies={tallies} />
            </div>
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
