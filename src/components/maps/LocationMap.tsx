"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, CheckCircle2, XCircle, MapPin, Navigation } from "lucide-react";
import { haversineMeters } from "@/lib/geo";
import { circlePolygon } from "./geo-circle";
import { bn } from "@/i18n/bn";
import { cn, toBn } from "@/lib/utils";

interface Props {
  centerLat: number;
  centerLon: number;
  radiusM: number;
  /** Reports geofence state to the parent (vote-button gating). */
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

const TEAL = "#1B7C8A";
const TEAL_DARK = "#0E4B55";
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

/**
 * Voting-location map. With a MapTiler key this renders a tilted 3D isometric
 * city (pitch 45°, bearing -15°, scroll-zoom off) with teal-recoloured extruded
 * buildings, a glowing geo-fence circle, a live animated GPS marker, and a
 * distance line to the zone centre — styled after the Marseille (laphase5)
 * isometric look. Without a key it falls back to a teal SVG. The component
 * reports {inside, coords} so the vote button is enabled only inside the zone.
 */
export function LocationMap({ centerLat, centerLon, radiusM, onResult }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const flewRef = useRef(false);

  const [status, setStatus] = useState<Status>("locating");
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Track viewport so tilt and layout differ on mobile vs desktop.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ── Build the MapLibre map (only when a key is configured) ───────────────
  useEffect(() => {
    if (!MAPTILER_KEY || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [centerLon, centerLat],
      zoom: 15.4,
      pitch: isMobile ? 35 : 45, // reduced tilt on mobile
      bearing: -15,
      scrollZoom: false,
      attributionControl: false,
      dragRotate: !isMobile,
    });
    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);
      // 3D extruded buildings (teal) — Marseille-style isometric massing.
      const firstSymbol = map
        .getStyle()
        .layers?.find((l) => l.type === "symbol")?.id;

      if (map.getSource("openmaptiles") && !map.getLayer("fp-3d-buildings")) {
        map.addLayer(
          {
            id: "fp-3d-buildings",
            type: "fill-extrusion",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["get", "render_height"], 8],
                0,
                "#10565F",
                40,
                TEAL_DARK,
                120,
                "#0A3A42",
              ],
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.92,
            },
          },
          firstSymbol,
        );
      }

      // Geo-fence zone: semi-transparent teal fill + glowing teal border.
      const poly = circlePolygon(centerLon, centerLat, radiusM);
      map.addSource("fp-zone", { type: "geojson", data: poly });
      map.addLayer({
        id: "fp-zone-fill",
        type: "fill",
        source: "fp-zone",
        paint: { "fill-color": TEAL, "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: "fp-zone-glow",
        type: "line",
        source: "fp-zone",
        paint: { "line-color": TEAL, "line-width": 10, "line-blur": 12, "line-opacity": 0.8 },
      });
      map.addLayer({
        id: "fp-zone-line",
        type: "line",
        source: "fp-zone",
        paint: { "line-color": "#5FE0E6", "line-width": 2.5, "line-opacity": 0.95 },
      });

      // Zone centre dot.
      map.addSource("fp-center", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [centerLon, centerLat] },
        },
      });
      map.addLayer({
        id: "fp-center-dot",
        type: "circle",
        source: "fp-center",
        paint: {
          "circle-radius": 5,
          "circle-color": "#5FE0E6",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Distance line (user → centre), updated on each GPS tick.
      map.addSource("fp-distance", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: "fp-distance-line",
        type: "line",
        source: "fp-distance",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#5FE0E6",
          "line-width": 2,
          "line-dasharray": [1.5, 1.5],
          "line-opacity": 0.7,
        },
      });
    });

    // Graceful fallback: any tile/style request failure → show teal SVG.
    map.on("error", (e) => {
      const msg = (e as { error?: { message?: string } }).error?.message ?? "";
      if (msg.includes("401") || msg.includes("403") || msg.includes("Failed")) {
        setMapError(true);
        map.remove();
        mapRef.current = null;
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      flewRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLon, radiusM]);

  // Keep tilt in sync if the viewport crosses the breakpoint.
  useEffect(() => {
    mapRef.current?.easeTo({ pitch: isMobile ? 35 : 45, duration: 400 });
  }, [isMobile]);

  // ── Live GPS watch (drives status, marker, distance line, flyTo) ─────────
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
        setStatus(inside ? "inside" : "outside");
        onResult?.(inside, { lat, lon });

        const map = mapRef.current;
        if (!map) return;

        // Animated HTML marker (custom element, not the default marker).
        if (!markerRef.current) {
          const el = document.createElement("div");
          el.className = "fp-user-marker";
          el.innerHTML =
            '<span class="fp-user-ping"></span><span class="fp-user-dot"></span>';
          markerRef.current = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]);
          if (map.loaded()) markerRef.current.addTo(map);
          else map.once("load", () => markerRef.current?.addTo(map));
        } else {
          markerRef.current.setLngLat([lon, lat]);
        }

        // Distance line user → centre.
        const src = map.getSource("fp-distance") as maplibregl.GeoJSONSource | undefined;
        src?.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [lon, lat],
              [centerLon, centerLat],
            ],
          },
        });

        // Smooth flyTo on first lock.
        if (!flewRef.current && map.loaded()) {
          flewRef.current = true;
          map.flyTo({
            center: inside
              ? [centerLon, centerLat]
              : [(lon + centerLon) / 2, (lat + centerLat) / 2],
            zoom: inside ? 16 : 14,
            pitch: isMobile ? 35 : 45,
            bearing: -15,
            duration: 2200,
            essential: true,
          });
        }
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

  // ── Status card content ──────────────────────────────────────────────────
  const cards: CardSpec = {
    locating: {
      Icon: Loader2,
      spin: true,
      ring: "border-white/20 bg-black/40",
      dot: "bg-white/60",
      text: bn.vote.locationCheck,
      sub: null,
    },
    inside: {
      Icon: CheckCircle2,
      spin: false,
      ring: "border-emerald-400/60 bg-emerald-500/15",
      dot: "bg-emerald-400",
      text: "ভোট দেওয়া যাবে — আপনি এলাকার ভিতরে আছেন",
      sub: null,
    },
    outside: {
      Icon: XCircle,
      spin: false,
      ring: "border-red-400/60 bg-red-500/15",
      dot: "bg-red-400",
      text: "অনেক দূরে — ভোট দেওয়া যাবে না",
      sub: distanceM != null ? `দূরত্ব: ${fmtDist(distanceM)}` : null,
    },
    denied: {
      Icon: MapPin,
      spin: false,
      ring: "border-white/20 bg-white/5",
      dot: "bg-zinc-400",
      text: "অবস্থান চালু করুন",
      sub: null,
    },
  }[status];

  // ── Fallback: teal SVG when no MapTiler key or map errors ───────────────
  if (!MAPTILER_KEY || mapError) {
    return <TealFallback radiusM={radiusM} cards={cards} />;
  }

  // ── Live map ──────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/60 bg-[#0E1215]",
        isMobile ? "h-[58vh] min-h-[360px]" : "h-[480px]",
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading skeleton — shows teal grid until first tile renders. */}
      {!mapLoaded && (
        <div className="pointer-events-none absolute inset-0 bg-[#0E4B55]/20">
          <svg className="h-full w-full opacity-20" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice">
            {[40,80,120,160,200,240].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#1B7C8A" />)}
            {[50,100,150,200].map((y) => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#1B7C8A" />)}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              মানচিত্র লোড হচ্ছে…
            </div>
          </div>
        </div>
      )}

      {/* Teal colour-grade + vignette overlay for the isometric look. */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 10%, rgba(27,124,138,0.35), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 140px 30px rgba(7,20,24,0.65)" }}
      />

      {/* Radius label chip. */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow">
        <Navigation className="h-3 w-3" />
        ব্যাসার্ধ {fmtRadius(radiusM)}
      </div>

      {/* Floating status card — top-left on desktop, bottom sheet on mobile. */}
      <StatusCard cards={cards} isMobile={isMobile} />
    </div>
  );
}

/** Glass status card (green / red / gray). */
function StatusCard({ cards, isMobile }: { cards: CardSpec; isMobile: boolean }) {
  const { Icon } = cards;
  return (
    <div
      className={cn(
        "absolute z-10 border text-white backdrop-blur-xl",
        cards.ring,
        isMobile
          ? "inset-x-2 bottom-2 rounded-2xl p-4"
          : "left-3 top-3 max-w-xs rounded-xl p-3.5",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-opacity-25",
            cards.dot,
          )}
        >
          <Icon className={cn("h-5 w-5", cards.spin && "animate-spin")} />
        </span>
        <div className="min-w-0">
          <p className={cn("font-semibold leading-snug", isMobile ? "text-base" : "text-sm")}>
            {cards.text}
          </p>
          {cards.sub && <p className="mt-0.5 text-sm text-white/70">{cards.sub}</p>}
        </div>
      </div>
    </div>
  );
}

/** Teal SVG fallback shown when NEXT_PUBLIC_MAPTILER_KEY is absent. */
function TealFallback({ radiusM, cards }: { radiusM: number; cards: CardSpec }) {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-border/60 bg-[#0E4B55]/15">
      <svg viewBox="0 0 300 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {[40, 90, 140, 190, 240, 290].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="220" stroke={TEAL_DARK} strokeOpacity="0.18" />
        ))}
        {[50, 100, 150, 200].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="300" y2={y} stroke={TEAL_DARK} strokeOpacity="0.18" />
        ))}
        <circle cx="150" cy="110" r="80" fill={TEAL} fillOpacity="0.14" stroke="#5FE0E6" strokeOpacity="0.8" strokeDasharray="5 4" />
        <g transform="translate(150 110)">
          <circle r="16" fill={TEAL} fillOpacity="0.25">
            <animate attributeName="r" values="6;18;6" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle r="6" fill={TEAL} stroke="white" strokeWidth="2" />
        </g>
      </svg>
      <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
        {fmtRadius(radiusM)}
      </div>
      <StatusCard cards={cards} isMobile={false} />
    </div>
  );
}

function fmtRadius(m: number): string {
  return m >= 1000 ? toBn(`${(m / 1000).toFixed(1)} কিমি`) : toBn(`${m} মি`);
}

function fmtDist(m: number): string {
  return m >= 1000 ? `${toBn((m / 1000).toFixed(2))} কিমি` : `${toBn(Math.round(m))} মি`;
}
