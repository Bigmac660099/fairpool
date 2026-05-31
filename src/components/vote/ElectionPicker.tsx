"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Vote, BarChart3 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Reveal } from "@/components/motion/primitives";
import { getElections } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

/** Lists elections and routes to the vote or results detail page. */
export function ElectionPicker({ mode }: { mode: "vote" | "results" }) {
  useStoreSync();
  const router = useRouter();
  const elections = getElections();
  const Icon = mode === "vote" ? Vote : BarChart3;
  const title = mode === "vote" ? bn.nav.vote : bn.nav.results;

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Icon className="h-6 w-6 text-primary" />
        {title}
      </h1>

      {elections.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-muted-foreground">
            {bn.dashboard.noElection}
          </CardBody>
        </Card>
      ) : (
        elections.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.05}>
            <Card
              className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/40"
              onClick={() => router.push(`/${mode}/${e.id}`)}
            >
              <CardBody className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {e.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {e.status === "active" ? bn.dashboard.activeElection : e.status}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardBody>
            </Card>
          </Reveal>
        ))
      )}
    </div>
  );
}
