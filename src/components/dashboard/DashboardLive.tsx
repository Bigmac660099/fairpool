"use client";

import { useRouter } from "next/navigation";
import { Vote, BarChart3, Users, CheckCircle2, Activity } from "lucide-react";
import { LiquidBlob } from "@/components/ui/liquid-blob";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, CandidatePhoto } from "@/components/ui/avatar";
import { Reveal, RevealStack, RevealItem } from "@/components/motion/primitives";
import { ElectionTimer } from "./ElectionTimer";
import { RankingGraph } from "./RankingGraph";
import { MotionCarousel } from "@/components/ui/motion-carousel";
import {
  getActiveElection, getCandidates, getTallies, hasVoted,
} from "@/lib/data";
import { useAuth, useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { firstName, toBn } from "@/lib/utils";

export function DashboardLive() {
  useStoreSync();
  const router  = useRouter();
  const { user } = useAuth();
  const election = getActiveElection();

  if (!election) {
    return (
      <>
        <LiquidBlob />
        <Reveal>
          <Card>
            <CardBody className="py-16 text-center text-muted-foreground">
              {bn.dashboard.noElection}
            </CardBody>
          </Card>
        </Reveal>
      </>
    );
  }

  const candidates = getCandidates(election.id);
  const tallies    = getTallies(election.id);
  const totalVotes = tallies.reduce((s, t) => s + t.count, 0);
  const voted      = user ? hasVoted(election.id, user.id) : false;

  return (
    <>
      <LiquidBlob />

      <div className="space-y-5">
        {/* ── Greeting ──────────────────────────────────────────── */}
        <Reveal>
          <div className="flex items-center gap-3.5">
            <Avatar name={user?.name ?? "?"} size="lg" />
            <div>
              <p className="text-xs text-muted-foreground">{bn.dashboard.greeting}</p>
              <h1 className="text-xl font-bold tracking-tight">{user?.name}</h1>
              {voted && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  ভোট দেওয়া হয়েছে
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── Timer ─────────────────────────────────────────────── */}
        <Reveal delay={0.04}>
          <ElectionTimer endsAt={election.endsAt} title={election.title} />
        </Reveal>

        {/* ── KPI tiles ─────────────────────────────────────────── */}
        <RevealStack className="grid grid-cols-3 gap-3">
          <RevealItem>
            <StatTile
              icon={<Vote className="h-4 w-4" />}
              value={toBn(totalVotes)}
              label={bn.dashboard.statVotes}
            />
          </RevealItem>
          <RevealItem>
            <StatTile
              icon={<Users className="h-4 w-4" />}
              value={toBn(candidates.length)}
              label={bn.dashboard.statCandidates}
            />
          </RevealItem>
          <RevealItem>
            <StatTile
              icon={<Activity className="h-4 w-4" />}
              value={election.geoRequired ? "GPS" : "খোলা"}
              label="যাচাই"
            />
          </RevealItem>
        </RevealStack>

        {/* ── Leaderboard ───────────────────────────────────────── */}
        <Reveal>
          <Card>
            <CardBody>
              <RankingGraph candidates={candidates} tallies={tallies} />
            </CardBody>
          </Card>
        </Reveal>

        {/* ── Candidate carousel ────────────────────────────────── */}
        <Reveal>
          <MotionCarousel
            slides={candidates}
            dotLabels={candidates.map((c) => firstName(c.name))}
            renderSlide={(c) => (
              <CandidatePhoto
                name={c.name}
                photoUrl={c.photoUrl}
                department={c.promises[0] ?? ""}
                className="h-52 w-full"
              />
            )}
          />
        </Reveal>

        {/* ── CTAs ──────────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row">
            {voted ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {bn.dashboard.alreadyVoted}
              </div>
            ) : (
              <Button
                size="lg"
                className="flex-1"
                onClick={() => router.push(`/vote/${election.id}`)}
              >
                <Vote className="h-4 w-4" />
                {bn.dashboard.voteNow}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/results/${election.id}`)}
            >
              <BarChart3 className="h-4 w-4" />
              {bn.dashboard.seeResults}
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-1.5 p-4 text-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </CardBody>
    </Card>
  );
}
