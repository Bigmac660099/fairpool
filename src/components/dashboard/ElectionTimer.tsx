"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";

/** Counts down to an election's end time. No airport/flight metaphors. */
export function ElectionTimer({ endsAt, title }: { endsAt: string; title: string }) {
  const [remaining, setRemaining] = useState(() => diff(endsAt));

  useEffect(() => {
    const t = setInterval(() => setRemaining(diff(endsAt)), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const ended = remaining.total <= 0;

  return (
    <Card className="overflow-hidden">
      <CardBody className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Clock className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          {ended ? (
            <p className="text-lg font-bold text-destructive">{bn.dashboard.timeEnded}</p>
          ) : (
            <div className="mt-1 flex gap-3">
              <TimeBox value={remaining.days} label={bn.common.days} />
              <TimeBox value={remaining.hours} label={bn.common.hours} />
              <TimeBox value={remaining.minutes} label={bn.common.minutes} />
              <TimeBox value={remaining.seconds} label={bn.common.seconds} />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold tabular-nums text-primary">
        {toBn(String(value).padStart(2, "0"))}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function diff(iso: string) {
  const total = Math.max(0, new Date(iso).getTime() - Date.now());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
