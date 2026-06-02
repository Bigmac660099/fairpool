"use client";

import { useRouter } from "next/navigation";
import { Vote, BarChart3, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
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
          <Card variant="glow">
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
        {/* ── Greeting hero ─────────────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-teal-400/5 to-transparent p-5">
            {/* Large faded initial in background */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-6 select-none text-[7rem] font-black leading-none text-primary/8"
            >
              {user?.name?.trim().charAt(0) ?? "F"}
            </span>

            <div className="relative flex items-center gap-4">
              <Avatar name={user?.name ?? "?"} size="lg" glow />
              <div>
                <p className="text-sm text-muted-foreground">{bn.dashboard.greeting},</p>
                <h1 className="text-display-xs font-bold tracking-tight">{user?.name}</h1>
                {voted && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    ভোট দেওয়া হয়েছে
                  </span>
                )}
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </Reveal>

        {/* ── Election timer ────────────────────────────────────────── */}
        <Reveal delay={0.05}>
          <ElectionTimer endsAt={election.endsAt} title={election.title} />
        </Reveal>

        {/* ── KPI tiles ─────────────────────────────────────────────── */}
        <RevealStack className="grid grid-cols-3 gap-3">
          <RevealItem>
            <KpiTile
              icon={<Vote className="h-5 w-5" />}
              value={toBn(totalVotes)}
              label={bn.dashboard.statVotes}
              accent="from-primary to-teal-400"
            />
          </RevealItem>
          <RevealItem>
            <KpiTile
              icon={<Users className="h-5 w-5" />}
              value={toBn(candidates.length)}
              label={bn.dashboard.statCandidates}
              accent="from-teal-400 to-emerald-400"
            />
          </RevealItem>
          <RevealItem>
            <KpiTile
              icon={<TrendingUp className="h-5 w-5" />}
              value={election.geoRequired ? "GPS" : "খোলা"}
              label="যাচাই"
              accent="from-emerald-400 to-teal-600"
            />
          </RevealItem>
        </RevealStack>

        {/* ── Leaderboard ───────────────────────────────────────────── */}
        <Reveal>
          <Card variant="raised">
            <CardBody>
              <RankingGraph candidates={candidates} tallies={tallies} />
            </CardBody>
          </Card>
        </Reveal>

        {/* ── Candidate carousel ────────────────────────────────────── */}
        <Reveal>
          <MotionCarousel
            slides={candidates}
            dotLabels={candidates.map((c) => firstName(c.name))}
            renderSlide={(c) => (
              <CandidatePhoto
                name={c.name}
                photoUrl={c.photoUrl}
                department={c.promises[0] ?? ""}
                className="h-56 w-full"
              />
            )}
          />
        </Reveal>

        {/* ── CTA buttons ───────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row">
            {voted ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/8 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
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

function KpiTile({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
      {/* Glowing icon circle */}
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white shadow-glow-sm`}
      >
        {icon}
      </div>

      {/* Value */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fp-gradient text-3xl font-black tabular-nums leading-none`}
      >
        {value}
      </motion.div>

      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>

      {/* Bottom accent line */}
      <div
        className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${accent}`}
      />
    </div>
  );
}
