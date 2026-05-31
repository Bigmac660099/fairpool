/** Haversine distance in metres between two lat/lon points. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000; // earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** True when a point is within `radiusM` of the centre. */
export function withinRadius(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radiusM: number,
): boolean {
  return haversineMeters(lat, lon, centerLat, centerLon) <= radiusM;
}
