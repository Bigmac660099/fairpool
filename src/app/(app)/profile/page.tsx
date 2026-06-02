"use client";

import { ShieldCheck, GraduationCap, Mail, Hash, UserCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, RevealStack, RevealItem } from "@/components/motion/primitives";
import { getDepartments } from "@/lib/data";
import { useAuth } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, ready } = useAuth();

  if (!ready || !user) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        {bn.common.loading}
      </div>
    );
  }

  const dept    = getDepartments().find((d) => d.id === user.departmentId);
  const isAdmin = user.role === "admin" || user.role === "trueAdmin";

  const roleLabel = user.role === "trueAdmin" ? "প্রধান প্রশাসক"
    : user.role === "admin" ? bn.profile.roleAdmin
    : bn.profile.roleStudent;

  return (
    <div className="space-y-5">
      <PageHeader title={bn.profile.title} />

      {/* ── Identity card ──────────────────────────────────── */}
      <Reveal>
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
            <Avatar name={user.name} size="xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {roleLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              {!isAdmin && (
                <span className="mt-2 inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                  {roleLabel}
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      </Reveal>

      {/* ── Info tiles ─────────────────────────────────────── */}
      <RevealStack className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RevealItem>
          <InfoRow
            icon={<Hash className="h-4 w-4" />}
            label={bn.auth.studentId}
            value={toBn(user.studentId)}
            mono
          />
        </RevealItem>
        <RevealItem>
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label={bn.auth.email}
            value={user.email || "—"}
          />
        </RevealItem>
        <RevealItem>
          <InfoRow
            icon={<GraduationCap className="h-4 w-4" />}
            label={bn.profile.department}
            value={dept?.name ?? "—"}
          />
        </RevealItem>
        <RevealItem>
          <InfoRow
            icon={<UserCircle className="h-4 w-4" />}
            label={bn.profile.status}
            value={user.active ? bn.profile.active : bn.profile.inactive}
            accent={user.active ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
          />
        </RevealItem>
      </RevealStack>
    </div>
  );
}

function InfoRow({
  icon, label, value, mono, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`truncate text-sm font-semibold ${mono ? "font-mono tracking-tight" : ""} ${accent ?? ""}`}>
            {value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
