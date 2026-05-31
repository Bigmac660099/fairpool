"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import {
  deleteDepartment,
  getDepartments,
  upsertDepartment,
} from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import type { Department } from "@/lib/types";
import { bn } from "@/i18n/bn";

export function DepartmentsClient() {
  useStoreSync();
  const departments = getDepartments();
  const [editing, setEditing] = useState<Department | null>(null);

  function save() {
    if (!editing || !editing.name.trim() || !editing.code.trim()) return;
    upsertDepartment(editing);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() =>
            setEditing({ id: `dept-${Date.now()}`, name: "", code: "" })
          }
        >
          <Plus className="h-4 w-4" />
          {bn.admin.add}
        </Button>
      </div>

      {editing && (
        <Card className="border-primary/40">
          <CardBody className="space-y-4">
            <Field label="বিভাগের নাম">
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="কোড">
              <Input
                value={editing.code}
                onChange={(e) =>
                  setEditing({ ...editing, code: e.target.value.toUpperCase() })
                }
              />
            </Field>
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

      {departments.map((d) => (
        <Card key={d.id}>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {d.code}
            </span>
            <p className="min-w-0 flex-1 truncate font-medium">{d.name}</p>
            <button onClick={() => setEditing(d)} aria-label={bn.admin.edit}>
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
            <button
              onClick={() => confirm("মুছবেন?") && deleteDepartment(d.id)}
              aria-label={bn.admin.delete}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
