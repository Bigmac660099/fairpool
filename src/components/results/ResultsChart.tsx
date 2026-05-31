"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candidate, Tally } from "@/lib/types";
import { firstName, toBn } from "@/lib/utils";

/** Recharts bar chart of vote tallies. */
export function ResultsChart({
  candidates,
  tallies,
}: {
  candidates: Candidate[];
  tallies: Tally[];
}) {
  const data = candidates
    .map((c) => ({
      name: firstName(c.name),
      votes: tallies.find((t) => t.candidateId === c.id)?.count ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => toBn(v)}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--popover-foreground))",
              fontSize: 13,
            }}
            formatter={(v: number) => [toBn(v), "ভোট"]}
          />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="hsl(var(--primary))" fillOpacity={1 - i * 0.12} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
