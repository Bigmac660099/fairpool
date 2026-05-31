"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { GeoPickerMap } from "@/components/maps/GeoPickerMap";
import {
  deleteElection,
  getElections,
  upsertElection,
} from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import type { Election } from "@/lib/types";
import { bn } from "@/i18n/bn";

function blankElection(): Election {
  return {
    id: `elec-${Date.now()}`,
    title: "",
    description: "",
    status: "active",
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 48 * 3_600_000).toISOString(),
    geoRequired: false,
    geoLat: 23.7806,
    geoLon: 90.4074,
    geoRadiusM: 2000,
  };
}

export function ElectionsManager() {
  useStoreSync();
  const elections = getElections();
  const [editing, setEditing] = useState<Election | null>(null);

  function save() {
    if (!editing || !editing.title.trim()) return;
    upsertElection(editing);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(blankElection())}>
          <Plus className="h-4 w-4" />
          {bn.admin.add}
        </Button>
      </div>

      {editing && (
        <Card className="border-primary/40">
          <CardBody className="space-y-4">
            <Field label="শিরোনাম">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="বিবরণ">
              <Input
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </Field>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={editing.geoRequired}
                onChange={(e) =>
                  setEditing({ ...editing, geoRequired: e.target.checked })
                }
                className="h-4 w-4 accent-primary"
              />
              {bn.admin.geoRequired}
            </label>

            {editing.geoRequired && (
              <GeoPickerMap
                lat={editing.geoLat ?? 23.7806}
                lon={editing.geoLon ?? 90.4074}
                radiusM={editing.geoRadiusM ?? 2000}
                onChange={({ lat, lon, radiusM }) =>
                  setEditing({
                    ...editing,
                    geoLat: lat,
                    geoLon: lon,
                    geoRadiusM: radiusM,
                  })
                }
              />
            )}

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

      {elections.map((e) => (
        <Card key={e.id}>
          <CardBody className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{e.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {e.geoRequired ? "📍 GPS · " : ""}
                {e.status}
              </p>
            </div>
            <button onClick={() => setEditing(e)} aria-label={bn.admin.edit}>
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
            <button
              onClick={() => confirm("মুছবেন?") && deleteElection(e.id)}
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
