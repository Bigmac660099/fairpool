"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Shield,
  Ban,
  CircleCheck,
  Trash2,
  KeyRound,
  MapPin,
  X,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  getProfiles,
  getGpsLogs,
  setBlocked,
  deleteUser,
  resetUserPassword,
  canManage,
} from "@/lib/data";
import { useAuth, useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";
import { toBn } from "@/lib/utils";
import { maskStudentId, maskEmail } from "@/lib/mask";
import type { Profile } from "@/lib/types";

/**
 * Admin user management. Enforces the two-tier hierarchy:
 *  - প্রধান প্রশাসক (trueAdmin) can block/delete/reset ANYONE else.
 *  - প্রশাসক (admin) can act on everyone EXCEPT the trueAdmin.
 * Also surfaces the per-user GPS audit log.
 */
export default function AdminUsersPage() {
  useStoreSync();
  const { user } = useAuth();
  const profiles = getProfiles();
  const [gpsFor, setGpsFor] = useState<Profile | null>(null);
  const [msg, setMsg] = useState("");

  if (!user) return null;
  const actor = { id: user.id, role: user.role };

  function act(fn: () => { ok: boolean; message: string }) {
    const res = fn();
    setMsg(res.message);
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className="rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">{msg}</div>
      )}

      {profiles.map((p) => {
        const manageable = canManage(actor.role, p, actor.id);
        const isTrue = p.role === "trueAdmin";
        const isAdmin = p.role === "admin";
        const gpsCount = getGpsLogs(p.id).length;
        return (
          <Card key={p.id} className={p.blocked ? "opacity-60" : undefined}>
            <CardBody className="flex flex-wrap items-center gap-3">
              <Avatar name={p.name} photoUrl={null} size="md" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  {p.name}
                  {isTrue && <ShieldCheck className="h-4 w-4 text-amber-500" />}
                  {isAdmin && <Shield className="h-4 w-4 text-primary" />}
                  {p.blocked && (
                    <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      ব্লকড
                    </span>
                  )}
                </p>
                {/* PII masked in the admin list (anti shoulder-surf / screenshot leak) */}
                <p className="text-sm tabular-nums text-muted-foreground">{toBn(maskStudentId(p.studentId))}</p>
                <p className="truncate text-xs text-muted-foreground">{maskEmail(p.email)}</p>
              </div>

              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                {isTrue ? "প্রধান প্রশাসক" : isAdmin ? "প্রশাসক" : "শিক্ষার্থী"}
              </span>

              {/* GPS log */}
              <button
                onClick={() => setGpsFor(p)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs hover:bg-accent"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                GPS ({toBn(gpsCount)})
              </button>

              {/* Management actions (only if permitted by hierarchy) */}
              {manageable && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => act(() => setBlocked(actor, p.id, !p.blocked))}
                    className="rounded-lg border border-border/60 p-2 hover:bg-accent"
                    title={p.blocked ? "আনব্লক" : "ব্লক"}
                  >
                    {p.blocked ? (
                      <CircleCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Ban className="h-4 w-4 text-amber-500" />
                    )}
                  </button>
                  <button
                    onClick={() => act(() => resetUserPassword(actor, p.id))}
                    className="rounded-lg border border-border/60 p-2 hover:bg-accent"
                    title="পাসওয়ার্ড রিসেট"
                  >
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() =>
                      confirm(`${p.name} ও তার সব তথ্য মুছবেন?`) &&
                      act(() => deleteUser(actor, p.id))
                    }
                    className="rounded-lg border border-border/60 p-2 hover:bg-accent"
                    title="মুছুন"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}

      {/* GPS log modal */}
      {gpsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="max-h-[80vh] w-full max-w-lg overflow-hidden">
            <CardBody className="space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold">
                  <MapPin className="h-5 w-5 text-primary" /> {gpsFor.name} — GPS লগ
                </h3>
                <button onClick={() => setGpsFor(null)} aria-label="বন্ধ">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              {getGpsLogs(gpsFor.id).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  কোনো GPS লগ নেই
                </p>
              ) : (
                <div className="space-y-2">
                  {getGpsLogs(gpsFor.id).map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="tabular-nums">
                          {toBn(l.lat.toFixed(5))}, {toBn(l.lon.toFixed(5))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(l.at).toLocaleString("bn-BD")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          l.inside
                            ? "bg-primary/15 text-primary"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {l.inside ? "ভিতরে" : "বাইরে"} · {toBn(Math.round(l.distanceM))}মি
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
