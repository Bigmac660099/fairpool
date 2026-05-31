"use client";

import { Trophy } from "lucide-react";
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

export function ResultsLive({ electionId }: { electionId: string }) {
  useStoreSync();
  const election = getElection(electionId);
  const candidates = getCandidates(electionId);
  const tallies = getTallies(electionId);

  if (!election) {
    return <p className="text-muted-foreground">{bn.common.empty}</p>;
  }

  const totalVotes = tallies.reduce((s, t) => s + t.count, 0);

  // Rank candidates by votes; build the top-3 for the podium.
  const ranked = candidates
    .map((c) => ({
      candidate: c,
      count: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const top3 = ranked.slice(0, 3);
  // Podium display order: 2nd, 1st, 3rd.
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = ["h-20", "h-28", "h-14"];

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{election.title}</h1>
            <p className="text-sm text-muted-foreground">
              {bn.results.totalVotes}: {toBn(totalVotes)} {bn.results.votes}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            {bn.results.live}
          </span>
        </div>
      </Reveal>

      {/* Top 3 carousel */}
      <Reveal>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          {bn.results.top3}
        </h2>
        <MotionCarousel
          slides={top3}
          autoPlay={false}
          dotLabels={top3.map((t) => firstName(t.candidate.name))}
          renderSlide={(t, i) => (
            <div className="relative">
              <CandidatePhoto
                name={t.candidate.name}
                photoUrl={t.candidate.photoUrl}
                className="h-52 w-full"
              />
              <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow">
                {toBn(i + 1)}
              </span>
              <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-sm font-semibold text-white">
                {toBn(t.count)} {bn.results.votes}
              </div>
            </div>
          )}
        />
      </Reveal>

      {/* Podium */}
      <Reveal>
        <Card>
          <CardBody>
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map((t, idx) => {
                const realRank = top3.indexOf(t) + 1;
                return (
                  <div key={t.candidate.id} className="flex flex-1 flex-col items-center gap-2">
                    <Avatar name={t.candidate.name} photoUrl={t.candidate.photoUrl} size="md" />
                    <p className="max-w-full truncate text-center text-xs font-medium">
                      {firstName(t.candidate.name)}
                    </p>
                    <div
                      className={`flex w-full ${heights[idx]} items-start justify-center rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/70 pt-1 text-sm font-bold text-primary-foreground`}
                    >
                      {toBn(realRank)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {/* Full results */}
      <Reveal>
        <Card>
          <CardBody className="space-y-5">
            <ResultsChart candidates={candidates} tallies={tallies} />
            <RankingGraph candidates={candidates} tallies={tallies} />
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
