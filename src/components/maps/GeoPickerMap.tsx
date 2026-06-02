"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { toBn } from "@/lib/utils";

const PickerCanvas = dynamic(() => import("./PickerCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

interface Props {
  lat: number;
  lon: number;
  radiusM: number;
  onChange: (next: { lat: number; lon: number; radiusM: number }) => void;
}

const RADIUS_STEPS = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000];

/**
 * Admin geofence picker on a real Leaflet + OpenStreetMap map (no API key).
 * Click to move the zone centre; slider sizes the radius.
 */
export function GeoPickerMap({ lat, lon, radiusM, onChange }: Props) {
  const stepIndex = Math.max(0, RADIUS_STEPS.findIndex((s) => s >= radiusM));

  return (
    <div className="space-y-3">
      <div className="h-56 w-full overflow-hidden rounded-xl border border-border">
        <PickerCanvas
          lat={lat}
          lon={lon}
          radiusM={radiusM}
          onPick={(la, lo) =>
            onChange({ lat: Number(la.toFixed(6)), lon: Number(lo.toFixed(6)), radiusM })
          }
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        মানচিত্রে ক্লিক করে ভোটিং এলাকার কেন্দ্র নির্ধারণ করুন
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">Lat</span>
          <p className="tabular-nums">{toBn(lat.toFixed(5))}</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">Lon</span>
          <p className="tabular-nums">{toBn(lon.toFixed(5))}</p>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> ব্যাসার্ধ
          </span>
          <span className="font-medium text-primary">
            {radiusM >= 1000 ? `${toBn(radiusM / 1000)} কিমি` : `${toBn(radiusM)} মি`}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={RADIUS_STEPS.length - 1}
          value={stepIndex}
          onChange={(e) => onChange({ lat, lon, radiusM: RADIUS_STEPS[Number(e.target.value)] })}
          className="mt-2 w-full accent-primary"
        />
      </div>
    </div>
  );
}
