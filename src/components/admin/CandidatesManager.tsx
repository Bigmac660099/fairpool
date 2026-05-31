"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { PhotoUpload } from "@/components/ui/photo-upload";
import {
  deleteCandidate,
  getCandidates,
  getDepartments,
  getElections,
  upsertCandidate,
} from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import type { Candidate } from "@/lib/types";
import { bn } from "@/i18n/bn";

function blankCandidate(electionId: string): Candidate {
  return {
    id: `cand-${Date.now()}`,
    electionId,
    name: "",
    departmentId: null,
    photoUrl: null,
    symbolUrl: null,
    promises: [""],
  };
}

export function CandidatesManager() {
  useStoreSync();
  const elections = getElections();
  const departments = getDepartments();
  const [electionId, setElectionId] = useState(elections[0]?.id ?? "");
  const [editing, setEditing] = useState<Candidate | null>(null);

  const candidates = electionId ? getCandidates(electionId) : [];

  function save() {
    if (!editing || !editing.name.trim()) return;
    upsertCandidate({
      ...editing,
      promises: editing.promises.filter((p) => p.trim()).slice(0, 8),
    });
    setEditing(null);
  }

  function setPromise(i: number, value: string) {
    if (!editing) return;
    const next = [...editing.promises];
    next[i] = value;
    setEditing({ ...editing, promises: next });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={electionId}
          onChange={(e) => setElectionId(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm"
        >
          {elections.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <Button onClick={() => setEditing(blankCandidate(electionId))} disabled={!electionId}>
          <Plus className="h-4 w-4" />
          {bn.admin.add}
        </Button>
      </div>

      {editing && (
        <Card className="border-primary/40">
          <CardBody className="space-y-5">
            <Field label="প্রার্থীর নাম">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>

            <Field label="বিভাগ">
              <select
                value={editing.departmentId ?? ""}
                onChange={(e) => setEditing({ ...editing, departmentId: e.target.value || null })}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm"
              >
                <option value="">-- নির্বাচন করুন --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </Field>

            {/* ── Photo upload ── */}
            <PhotoUpload
              label="প্রার্থীর ছবি"
              value={editing.photoUrl}
              onChange={(url) => setEditing({ ...editing, photoUrl: url })}
              aspect="square"
            />

            {/* ── Symbol URL ── */}
            <Field label="প্রতীকের URL" hint={bn.admin.uploadHints.symbol}>
              <Input
                value={editing.symbolUrl ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, symbolUrl: e.target.value || null })
                }
                placeholder="https://..."
              />
            </Field>

            {/* ── Promises ── */}
            <div>
              <p className="mb-2 text-sm font-medium">{bn.vote.promises} (সর্বোচ্চ ৮)</p>
              <div className="space-y-2">
                {editing.promises.map((p, i) => (
                  <Input
                    key={i}
                    value={p}
                    onChange={(e) => setPromise(i, e.target.value)}
                    placeholder={`প্রতিশ্রুতি ${i + 1}`}
                  />
                ))}
              </div>
              {editing.promises.length < 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    setEditing({ ...editing, promises: [...editing.promises, ""] })
                  }
                >
                  <Plus className="h-4 w-4" /> আরও যোগ করুন
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                {bn.admin.cancel}
              </Button>
              <Button className="flex-1" onClick={save}>
                {bn.admin.save}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {candidates.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">{bn.common.empty}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {candidates.map((c) => {
          const dept = departments.find((d) => d.id === c.departmentId);
          return (
            <Card key={c.id} className="group overflow-hidden">
              <div className="relative">
                {/* Candidate photo — full bleed mini card */}
                <div className="relative h-28 w-full bg-gradient-to-br from-primary/20 to-primary/5">
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Avatar name={c.name} size="lg" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    {dept && <p className="text-xs text-white/70">{dept.code}</p>}
                  </div>
                  {/* Edit / Delete on hover */}
                  <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(c)}
                      className="rounded-full bg-black/50 p-1.5 text-white hover:bg-primary"
                      aria-label={bn.admin.edit}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => confirm("মুছবেন?") && deleteCandidate(c.id)}
                      className="rounded-full bg-black/50 p-1.5 text-white hover:bg-destructive"
                      aria-label={bn.admin.delete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <CardBody className="py-2 text-xs text-muted-foreground">
                {c.promises[0] ?? "কোনো প্রতিশ্রুতি নেই"}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
