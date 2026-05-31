"use client";

import { MapPin } from "lucide-react";
import { toBn } from "@/lib/utils";

interface Props {
  lat: number;
  lon: number;
  radiusM: number;
  onChange: (next: { lat: number; lon: number; radiusM: number }) => void;
}

const RADIUS_STEPS = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000];

/**
 * Admin geofence picker (SVG fallback). Clicking the map sets lat/lon,
 * and the slider sets the radius. With a MapTiler key, a MapLibre picker
 * can be swapped in here (see PENDING WORKFLOWS).
 */
export function GeoPickerMap({ lat, lon, radiusM, onChange }: Props) {
  function onMapClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    // Map the click to a small lat/lon delta around the current centre (demo).
    const nextLon = lon + (px - 0.5) * 0.02;
    const nextLat = lat - (py - 0.5) * 0.02;
    onChange({ lat: Number(nextLat.toFixed(6)), lon: Number(nextLon.toFixed(6)), radiusM });
  }

  const stepIndex = Math.max(
    0,
    RADIUS_STEPS.findIndex((s) => s >= radiusM),
  );

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 300 180"
        onClick={onMapClick}
        className="h-44 w-full cursor-crosshair rounded-lg border border-border/60 bg-[#0E4B55]/15"
      >
        {[40, 90, 140, 190, 240].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="#0E4B55" strokeOpacity="0.18" />
        ))}
        {[40, 90, 140].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#0E4B55" strokeOpacity="0.18" />
        ))}
        <circle cx="150" cy="90" r={Math.min(80, 14 + stepIndex * 8)} fill="#1B7C8A" fillOpacity="0.12" stroke="#1B7C8A" strokeOpacity="0.6" />
        <circle cx="150" cy="90" r="7" fill="#1B7C8A" stroke="white" strokeWidth="2" />
      </svg>

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
            {radiusM >= 1000 ? `${toBn(radiusM / 1000)} km` : `${toBn(radiusM)} m`}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={RADIUS_STEPS.length - 1}
          value={stepIndex}
          onChange={(e) =>
            onChange({ lat, lon, radiusM: RADIUS_STEPS[Number(e.target.value)] })
          }
          className="mt-2 w-full accent-primary"
        />
      </div>
    </div>
  );
}
