"use client";

import { Users, Vote, ClipboardList, UserCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/primitives";
import { getKpis, resetDemoData } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";

export default function AdminOverviewPage() {
  useStoreSync();
  const kpis = getKpis();

  const tiles = [
    { icon: <Users className="h-6 w-6" />, label: bn.admin.kpiUsers, value: kpis.users },
    { icon: <ClipboardList className="h-6 w-6" />, label: bn.admin.kpiElections, value: kpis.elections },
    { icon: <UserCheck className="h-6 w-6" />, label: bn.admin.kpiCandidates, value: kpis.candidates },
    { icon: <Vote className="h-6 w-6" />, label: bn.admin.kpiVotes, value: kpis.votes },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 0.05}>
            <Card>
              <CardBody className="flex flex-col gap-2">
                <span className="text-primary">{t.icon}</span>
                <span className="text-3xl font-bold tabular-nums">{toBn(t.value)}</span>
                <span className="text-sm text-muted-foreground">{t.label}</span>
              </CardBody>
            </Card>
          </Reveal>
        ))}
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            ডেমো ডেটা পুনরায় সেট করুন (সব ভোট মুছে যাবে)
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("সব ডেটা রিসেট করতে চান?")) resetDemoData();
            }}
          >
            {bn.admin.seedDemo}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
