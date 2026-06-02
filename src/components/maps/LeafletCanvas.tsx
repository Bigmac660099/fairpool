"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TEAL = "#0891B2";

interface CanvasProps {
  centerLat: number;
  centerLon: number;
  radiusM: number;
  userPos: { lat: number; lon: number } | null;
  located: boolean;
  showZoom: boolean;
}

/** Recenters once the user GPS position first locks. */
function Recenter({ lat, lon, done }: { lat: number | null; lon: number | null; done: boolean }) {
  const map = useMap();
  const flew = useRef(false);
  useEffect(() => {
    if (lat == null || lon == null || flew.current || !done) return;
    flew.current = true;
    map.flyTo([lat, lon], 15, { duration: 1.6 });
  }, [lat, lon, done, map]);
  return null;
}

/**
 * Pure Leaflet canvas (no GPS logic). Imported with ssr:false by LocationMap
 * so leaflet never touches `window` during server rendering.
 */
export default function LeafletCanvas({
  centerLat, centerLon, radiusM, userPos, located, showZoom,
}: CanvasProps) {
  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={14}
      scrollWheelZoom={false}
      zoomControl={showZoom}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#0b1f24" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      <Circle
        center={[centerLat, centerLon]}
        radius={radiusM}
        pathOptions={{ color: "#5FE0E6", weight: 2, fillColor: TEAL, fillOpacity: 0.18 }}
      />
      <CircleMarker
        center={[centerLat, centerLon]}
        radius={5}
        pathOptions={{ color: "#fff", weight: 2, fillColor: "#5FE0E6", fillOpacity: 1 }}
      />

      {userPos && (
        <>
          <Polyline
            positions={[[userPos.lat, userPos.lon], [centerLat, centerLon]]}
            pathOptions={{ color: "#5FE0E6", weight: 2, dashArray: "6 6", opacity: 0.7 }}
          />
          <CircleMarker
            center={[userPos.lat, userPos.lon]}
            radius={8}
            pathOptions={{ color: "#fff", weight: 3, fillColor: TEAL, fillOpacity: 1 }}
          />
        </>
      )}

      <Recenter lat={userPos?.lat ?? null} lon={userPos?.lon ?? null} done={located} />
    </MapContainer>
  );
}
