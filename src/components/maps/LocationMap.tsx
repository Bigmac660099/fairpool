"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, CheckCircle2, XCircle, MapPin, Navigation } from "lucide-react";
import { haversineMeters } from "@/lib/geo";
import { cn, toBn } from "@/lib/utils";

/** Leaflet canvas loaded client-only (leaflet touches `window`). */
const LeafletCanvas = dynamic(() => import("./LeafletCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b1f24] text-white/60">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

interface Props {
  centerLat: number;
  centerLon: number;
  radiusM: number;
  onResult?: (inside: boolean, coords: { lat: number; lon: number } | null) => void;
}

type Status = "locating" | "inside" | "outside" | "denied";

interface CardSpec {
  Icon: React.ComponentType<{ className?: string }>;
  spin: boolean;
  ring: string;
  dot: string;
  text: string;
  sub: string | null;
}

/**
 * Voting-location map (Leaflet + free OpenStreetMap/CartoDB tiles — no API key).
 * Shows the geofence circle, live GPS marker, distance line, and a floating
 * green/red/gray status card. Reports {inside, coords} for vote-button gating.
 */
export function LocationMap({ centerLat, centerLon, radiusM, onResult }: Props) {
  const [status, setStatus] = useState<Status>("locating");
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("denied");
      onResult?.(false, null);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const dist = haversineMeters(lat, lon, centerLat, centerLon);
        const inside = dist <= radiusM;
        setDistanceM(dist);
        setUserPos({ lat, lon });
        setStatus(inside ? "inside" : "outside");
        onResult?.(inside, { lat, lon });
      },
      () => {
        setStatus("denied");
        onResult?.(false, null);
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLon, radiusM]);

  const cards: CardSpec = {
    locating: {
      Icon: Loader2, spin: true,
      ring: "border-white/20 bg-black/60", dot: "bg-white/25",
      text: "অবস্থান যাচাই করা হচ্ছে…", sub: null,
    },
    inside: {
      Icon: CheckCircle2, spin: false,
      ring: "border-emerald-400/60 bg-emerald-600/90", dot: "bg-emerald-400/40",
      text: "ভোট দেওয়া যাবে — আপনি এলাকার ভিতরে আছেন", sub: null,
    },
    outside: {
      Icon: XCircle, spin: false,
      ring: "border-red-400/60 bg-red-600/90", dot: "bg-red-400/40",
      text: "অনেক দূরে — ভোট দেওয়া যাবে না",
      sub: distanceM != null ? `দূরত্ব: ${fmtDist(distanceM)}` : null,
    },
    denied: {
      Icon: MapPin, spin: false,
      ring: "border-white/20 bg-black/70", dot: "bg-zinc-400/40",
      text: "অবস্থান চালু করুন", sub: null,
    },
  }[status];

  const height = isMobile ? "h-[56vh] min-h-[340px]" : "h-[460px]";

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl border border-border", height)}>
      <LeafletCanvas
        centerLat={centerLat}
        centerLon={centerLon}
        radiusM={radiusM}
        userPos={userPos}
        located={status !== "locating"}
        showZoom={!isMobile}
      />

      {/* Radius chip */}
      <div className="pointer-events-none absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow">
        <Navigation className="h-3 w-3" />
        ব্যাসার্ধ {fmtRadius(radiusM)}
      </div>

      <StatusCard cards={cards} isMobile={isMobile} />
    </div>
  );
}

function StatusCard({ cards, isMobile }: { cards: CardSpec; isMobile: boolean }) {
  const { Icon } = cards;
  return (
    <div
      className={cn(
        "absolute z-[1000] border text-white shadow-lg backdrop-blur-md",
        cards.ring,
        isMobile ? "inset-x-3 bottom-3 rounded-2xl p-4" : "left-3 top-3 max-w-xs rounded-xl p-3.5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", cards.dot)}>
          <Icon className={cn("h-5 w-5", cards.spin && "animate-spin")} />
        </span>
        <div className="min-w-0">
          <p className={cn("font-semibold leading-snug", isMobile ? "text-base" : "text-sm")}>
            {cards.text}
          </p>
          {cards.sub && <p className="mt-0.5 text-sm text-white/80">{cards.sub}</p>}
        </div>
      </div>
    </div>
  );
}

function fmtRadius(m: number): string {
  return m >= 1000 ? toBn(`${(m / 1000).toFixed(1)} কিমি`) : toBn(`${m} মি`);
}
function fmtDist(m: number): string {
  return m >= 1000 ? `${toBn((m / 1000).toFixed(2))} কিমি` : `${toBn(Math.round(m))} মি`;
}
