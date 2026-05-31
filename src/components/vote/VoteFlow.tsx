"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/primitives";
import { LocationMap } from "@/components/maps/LocationMap";
import { StickyScrollCards } from "./StickyScrollCards";
import { VoteSuccessPanel } from "./VoteSuccessPanel";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { castVote, getCandidates, getElection, hasVoted, recordGps } from "@/lib/data";
import { haversineMeters } from "@/lib/geo";
import { useAuth, useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

export function VoteFlow({ electionId }: { electionId: string }) {
  useStoreSync();
  const router = useRouter();
  const { user } = useAuth();

  const election = getElection(electionId);
  const candidates = getCandidates(electionId);

  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [geo, setGeo] = useState<{
    inside: boolean;
    coords: { lat: number; lon: number } | null;
  }>({ inside: false, coords: null });

  const alreadyVoted = user ? hasVoted(electionId, user.id) : false;

  // Redirect to results after the success animation plays.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.push(`/results/${electionId}`), 2200);
    return () => clearTimeout(t);
  }, [success, router, electionId]);

  if (!election) return <p className="text-muted-foreground">{bn.common.empty}</p>;
  if (success) return <VoteSuccessPanel />;

  const geoBlocked = election.geoRequired && !geo.inside;

  // GPS coords flow straight into castVote (the cast_vote RPC analog).
  function doVote() {
    if (!user || !selected) return;
    // Record the GPS sample for the admin audit log.
    if (election && election.geoLat != null && election.geoLon != null && geo.coords) {
      recordGps({
        userId: user.id,
        userName: user.name,
        electionId,
        lat: geo.coords.lat,
        lon: geo.coords.lon,
        distanceM: haversineMeters(geo.coords.lat, geo.coords.lon, election.geoLat, election.geoLon),
        inside: geo.inside,
      });
    }
    const res = castVote(electionId, selected, user.id, geo.coords ?? undefined);
    setOpen(false);
    if (res.ok) setSuccess(true);
    else setError(res.message);
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <Card>
          <CardBody>
            <h1 className="text-xl font-bold">{election.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{election.description}</p>
          </CardBody>
        </Card>
      </Reveal>

      {election.geoRequired && election.geoLat != null && election.geoLon != null && (
        <Reveal>
          <LocationMap
            centerLat={election.geoLat}
            centerLon={election.geoLon}
            radiusM={election.geoRadiusM ?? 1000}
            onResult={(inside, coords) => setGeo({ inside, coords })}
          />
        </Reveal>
      )}

      {alreadyVoted ? (
        <Card>
          <CardBody className="py-10 text-center font-medium text-primary">
            {bn.dashboard.alreadyVoted}
          </CardBody>
        </Card>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground">
            {bn.vote.chooseCandidate}
          </h2>

          <StickyScrollCards
            candidates={candidates}
            selected={selected}
            onSelect={(id) => {
              setSelected(id);
              setError("");
            }}
          />

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Sticky action bar with the Radix confirm dialog. */}
          <div className="sticky bottom-24 z-20 md:bottom-4">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full shadow-lg"
                  disabled={!selected || geoBlocked}
                  onClick={() => {
                    if (!selected) {
                      setError(bn.vote.selectFirst);
                      return;
                    }
                    setError("");
                    setOpen(true);
                  }}
                >
                  {geoBlocked
                    ? geo.coords
                      ? bn.vote.locationFail
                      : bn.vote.locationCheck
                    : bn.vote.castVote}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>{bn.vote.confirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>{bn.vote.confirmBody}</AlertDialogDescription>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    {bn.vote.cancel}
                  </Button>
                  <Button className="flex-1" onClick={doVote}>
                    {bn.vote.confirm}
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
