"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users, Vote, ClipboardList, UserCheck,
  ShieldCheck, AlertTriangle, Activity, TrendingUp,
  CheckCircle2, Clock, XCircle, ChevronRight,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealStack, RevealItem } from "@/components/motion/primitives";
import { getKpis, getElections, getGpsLogs, resetDemoData } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  active: "border-emerald-400/40 bg-emerald-400/8 text-emerald-600 dark:text-emerald-400",
  draft:  "border-amber-400/40 bg-amber-400/8 text-amber-600 dark:text-amber-400",
  closed: "border-border/50 bg-muted/50 text-muted-foreground",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  active: CheckCircle2,
  draft:  Clock,
  closed: XCircle,
};
const STATUS_LABELS: Record<string, string> = {
  active: "চলমান",
  draft:  "খসড়া",
  closed: "সমাপ্ত",
};

export default function AdminOverviewPage() {
  useStoreSync();
  const router   = useRouter();
  const kpis     = getKpis();
  const elections = getElections();
  const gpsLogs  = getGpsLogs();
  const insideCount  = gpsLogs.filter((l) => l.inside).length;
  const outsideCount = gpsLogs.filter((l) => !l.inside).length;

  const kpiTiles = [
    {
      icon: Users,
      label: bn.admin.kpiUsers,
      value: kpis.users,
      accent: "from-primary to-teal-400",
      href: "/admin/users",
    },
    {
      icon: ClipboardList,
      label: bn.admin.kpiElections,
      value: kpis.elections,
      accent: "from-teal-400 to-emerald-400",
      href: "/admin/elections",
    },
    {
      icon: UserCheck,
      label: bn.admin.kpiCandidates,
      value: kpis.candidates,
      accent: "from-emerald-400 to-teal-500",
      href: "/admin/candidates",
    },
    {
      icon: Vote,
      label: bn.admin.kpiVotes,
      value: kpis.votes,
      accent: "from-primary via-teal-400 to-emerald-400",
      href: "/admin/audit-log",
    },
  ];

  const securityTiles = [
    {
      icon: ShieldCheck,
      label: "এলাকার ভেতরে",
      value: insideCount,
      color: "text-emerald-500",
      bg: "border-emerald-400/25 bg-emerald-400/6",
    },
    {
      icon: AlertTriangle,
      label: "এলাকার বাইরে",
      value: outsideCount,
      color: "text-rose-500",
      bg: "border-rose-400/25 bg-rose-400/6",
    },
    {
      icon: Activity,
      label: "মোট GPS লগ",
      value: gpsLogs.length,
      color: "text-primary",
      bg: "border-primary/25 bg-primary/6",
    },
    {
      icon: TrendingUp,
      label: "যাচাইয়ের হার",
      value: gpsLogs.length > 0 ? `${Math.round((insideCount / gpsLogs.length) * 100)}%` : "—",
      color: "text-amber-500",
      bg: "border-amber-400/25 bg-amber-400/6",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Main KPI tiles ────────────────────────────────────────── */}
      <RevealStack className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiTiles.map((t, i) => (
          <RevealItem key={t.label}>
            <motion.button
              type="button"
              onClick={() => router.push(t.href)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full overflow-hidden rounded-2xl border border-primary/15 bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-card-raised"
            >
              {/* Gradient icon */}
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.accent} text-white shadow-glow-sm`}
              >
                <t.icon className="h-5 w-5" />
              </div>

              <motion.div
                key={t.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="fp-gradient text-3xl font-black tabular-nums leading-none"
              >
                {toBn(t.value)}
              </motion.div>
              <p className="mt-1.5 text-sm font-medium text-muted-foreground">{t.label}</p>

              {/* Hover arrow */}
              <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Bottom accent line */}
              <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${t.accent}`} />
            </motion.button>
          </RevealItem>
        ))}
      </RevealStack>

      {/* ── Security monitoring ───────────────────────────────────── */}
      <Reveal>
        <Card variant="raised">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                নিরাপত্তা পর্যবেক্ষণ
              </CardTitle>
              <Button
                size="xs"
                variant="outline"
                onClick={() => router.push("/admin/audit-log")}
              >
                সব লগ দেখুন
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {securityTiles.map((t) => (
                <div
                  key={t.label}
                  className={cn(
                    "rounded-xl border p-4 text-center",
                    t.bg,
                  )}
                >
                  <t.icon className={cn("mx-auto h-5 w-5 mb-2", t.color)} />
                  <div className={cn("text-2xl font-black tabular-nums", t.color)}>
                    {typeof t.value === "number" ? toBn(t.value) : t.value}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{t.label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {/* ── Election health ───────────────────────────────────────── */}
      <Reveal>
        <Card variant="raised">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                নির্বাচনের অবস্থা
              </CardTitle>
              <Button
                size="xs"
                variant="outline"
                onClick={() => router.push("/admin/elections")}
              >
                পরিচালনা করুন
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {elections.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{bn.common.empty}</p>
            ) : (
              <div className="space-y-2">
                {elections.slice(0, 5).map((e, i) => {
                  const StatusIcon = STATUS_ICONS[e.status] ?? CheckCircle2;
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.endsAt).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                          STATUS_COLORS[e.status],
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_LABELS[e.status]}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </Reveal>

      {/* ── Recent GPS activity ───────────────────────────────────── */}
      {gpsLogs.length > 0 && (
        <Reveal>
          <Card variant="raised">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                সাম্প্রতিক GPS কার্যক্রম
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {gpsLogs.slice(0, 4).map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                      log.inside
                        ? "border-emerald-400/25 bg-emerald-400/5"
                        : "border-rose-400/25 bg-rose-400/5",
                    )}
                  >
                    <div
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        log.inside ? "bg-emerald-400" : "bg-rose-400",
                      )}
                    />
                    <span className="flex-1 truncate font-medium">{log.userName}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {toBn(Math.round(log.distanceM))} মি
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        log.inside ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {log.inside ? "ভেতরে" : "বাইরে"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Reveal>
      )}

      {/* ── Danger zone ───────────────────────────────────────────── */}
      <Reveal>
        <Card className="border-destructive/20">
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-destructive">ডেমো ডেটা রিসেট</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                সব ভোট ও তথ্য মুছে প্রাথমিক অবস্থায় ফিরে যাবে।
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("সব ডেটা রিসেট করতে চান?")) resetDemoData();
              }}
            >
              {bn.admin.seedDemo}
            </Button>
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
