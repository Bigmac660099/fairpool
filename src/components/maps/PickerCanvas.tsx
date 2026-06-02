"use client";

import { MapContainer, TileLayer, Circle, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TEAL = "#0891B2";

interface CanvasProps {
  lat: number;
  lon: number;
  radiusM: number;
  onPick: (lat: number, lon: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Pure Leaflet picker canvas — imported ssr:false by GeoPickerMap. */
export default function PickerCanvas({ lat, lon, radiusM, onPick }: CanvasProps) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={14}
      scrollWheelZoom={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#0b1f24" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <ClickHandler onPick={onPick} />
      <Circle
        center={[lat, lon]}
        radius={radiusM}
        pathOptions={{ color: "#5FE0E6", weight: 2, fillColor: TEAL, fillOpacity: 0.18 }}
      />
      <CircleMarker
        center={[lat, lon]}
        radius={6}
        pathOptions={{ color: "#fff", weight: 2, fillColor: TEAL, fillOpacity: 1 }}
      />
    </MapContainer>
  );
}
