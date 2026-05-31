"use client";

import { useRouter } from "next/navigation";
import { Vote, BarChart3, Users, Clock, CheckCircle2 } from "lucide-react";
import { LiquidBlob } from "@/components/ui/liquid-blob";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, CandidatePhoto } from "@/components/ui/avatar";
import { Reveal, RevealStack, RevealItem } from "@/components/motion/primitives";
import { ElectionTimer } from "./ElectionTimer";
import { RankingGraph } from "./RankingGraph";
import { MotionCarousel } from "@/components/ui/motion-carousel";
import {
  getActiveElection,
  getCandidates,
  getTallies,
  hasVoted,
} from "@/lib/data";
import { useAuth, useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { firstName, toBn } from "@/lib/utils";

export function DashboardLive() {
  useStoreSync();
  const router = useRouter();
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
  const tallies = getTallies(election.id);
  const totalVotes = tallies.reduce((s, t) => s + t.count, 0);
  const voted = user ? hasVoted(election.id, user.id) : false;

  return (
    <>
      <LiquidBlob />

      <div className="space-y-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <Avatar name={user?.name ?? "?"} size="lg" />
            <div>
              <p className="text-sm text-muted-foreground">{bn.dashboard.greeting}</p>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ElectionTimer endsAt={election.endsAt} title={election.title} />
        </Reveal>

        <RevealStack className="grid grid-cols-3 gap-3">
          <RevealItem>
            <Stat icon={<Vote className="h-5 w-5" />} value={toBn(totalVotes)} label={bn.dashboard.statVotes} />
          </RevealItem>
          <RevealItem>
            <Stat icon={<Users className="h-5 w-5" />} value={toBn(candidates.length)} label={bn.dashboard.statCandidates} />
          </RevealItem>
          <RevealItem>
            <Stat icon={<Clock className="h-5 w-5" />} value={election.geoRequired ? "GPS" : "—"} label={bn.dashboard.statTime} />
          </RevealItem>
        </RevealStack>

        <Reveal>
          <Card>
            <CardBody>
              <RankingGraph candidates={candidates} tallies={tallies} />
            </CardBody>
          </Card>
        </Reveal>

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

        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row">
            {voted ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                <CheckCircle2 className="h-5 w-5" />
                {bn.dashboard.alreadyVoted}
              </div>
            ) : (
              <Button
                size="lg"
                className="flex-1"
                onClick={() => router.push(`/vote/${election.id}`)}
              >
                <Vote className="h-5 w-5" />
                {bn.dashboard.voteNow}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/results/${election.id}`)}
            >
              <BarChart3 className="h-5 w-5" />
              {bn.dashboard.seeResults}
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}

function Stat({
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
      <CardBody className="flex flex-col items-center gap-1 p-4 text-center">
        <span className="text-primary">{icon}</span>
        <span className="text-xl font-bold tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </CardBody>
    </Card>
  );
}
