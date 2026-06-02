"use client";

import { useState } from "react";
import { MapPin, Vote, Clock, CheckCircle2, XCircle, Shield } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Reveal, RevealStack, RevealItem } from "@/components/motion/primitives";
import { getGpsLogs, getElections } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { cn, toBn } from "@/lib/utils";
import { bn } from "@/i18n/bn";

type FilterType = "all" | "inside" | "outside";

export default function AuditLogPage() {
  useStoreSync();
  const logs = getGpsLogs();
  const elections = getElections();
  const [filter, setFilter] = useState<FilterType>("all");

  const electionMap = Object.fromEntries(elections.map((e) => [e.id, e.title]));

  const filtered =
    filter === "all"
      ? logs
      : logs.filter((l) => (filter === "inside" ? l.inside : !l.inside));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <RevealStack className="grid grid-cols-3 gap-3">
        <RevealItem>
          <SummaryCard
            icon={<MapPin className="h-5 w-5" />}
            value={toBn(logs.length)}
            label="মোট লগ"
            color="text-primary"
          />
        </RevealItem>
        <RevealItem>
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={toBn(logs.filter((l) => l.inside).length)}
            label="এলাকার ভেতরে"
            color="text-emerald-500"
          />
        </RevealItem>
        <RevealItem>
          <SummaryCard
            icon={<XCircle className="h-5 w-5" />}
            value={toBn(logs.filter((l) => !l.inside).length)}
            label="এলাকার বাইরে"
            color="text-rose-500"
          />
        </RevealItem>
      </RevealStack>

      {/* Filter tabs */}
      <Reveal>
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "সব" },
              { key: "inside", label: "ভেতরে" },
              { key: "outside", label: "বাইরে" },
            ] as { key: FilterType; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Log entries */}
      {filtered.length === 0 ? (
        <Reveal>
          <Card>
            <CardBody className="py-12 text-center text-muted-foreground">
              {bn.common.empty}
            </CardBody>
          </Card>
        </Reveal>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => (
            <Reveal key={log.id} delay={i * 0.03}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                  log.inside
                    ? "border-emerald-500/25 bg-emerald-500/5"
                    : "border-rose-500/25 bg-rose-500/5",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    log.inside ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500",
                  )}
                >
                  {log.inside ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{log.userName}</span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {electionMap[log.electionId] ?? log.electionId}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.lat.toFixed(5)}, {log.lon.toFixed(5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Vote className="h-3 w-3" />
                      দূরত্ব: {toBn(Math.round(log.distanceM))} মি
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.at).toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Note about production audit log */}
      <Reveal>
        <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            প্রোডাকশনে Supabase-এর <code className="text-primary">audit_log</code> টেবিলে
            সব ভোটিং ও অ্যাডমিন কার্যক্রম সংরক্ষিত হয়। ডেমো মোডে শুধু GPS লগ দেখানো
            হচ্ছে।
          </p>
        </div>
      </Reveal>
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-1.5 p-4 text-center">
        <span className={color}>{icon}</span>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </CardBody>
    </Card>
  );
}
