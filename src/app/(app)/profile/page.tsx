"use client";

import { ShieldCheck, GraduationCap, CircleCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/primitives";
import { getDepartments } from "@/lib/data";
import { useAuth } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, ready } = useAuth();

  if (!ready || !user) {
    return <p className="text-muted-foreground">{bn.common.loading}</p>;
  }

  const dept = getDepartments().find((d) => d.id === user.departmentId);
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <Reveal>
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
            <Avatar name={user.name} size="xl" />
            <div>
              <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
                {user.name}
                {isAdmin && <ShieldCheck className="h-5 w-5 text-primary" />}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {bn.auth.studentId}: {toBn(user.studentId)}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {isAdmin ? bn.profile.roleAdmin : bn.profile.roleStudent}
            </span>
          </CardBody>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<GraduationCap className="h-5 w-5" />}
            label={bn.profile.department}
            value={dept?.name ?? "—"}
          />
          <InfoTile
            icon={<GraduationCap className="h-5 w-5" />}
            label={bn.profile.semester}
            value={user.semester ? toBn(user.semester) : "—"}
          />
          <InfoTile
            icon={<CircleCheck className="h-5 w-5" />}
            label={bn.profile.status}
            value={user.active ? bn.profile.active : bn.profile.inactive}
          />
        </div>
      </Reveal>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate font-semibold">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}
