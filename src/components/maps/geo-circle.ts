/**
 * Build a GeoJSON polygon approximating a circle of `radiusM` metres around a
 * [lon, lat] centre. Used for the voting-zone overlay on the MapLibre map.
 */
export function circlePolygon(
  centerLon: number,
  centerLat: number,
  radiusM: number,
  points = 72,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const earth = 6_378_137;
  const dLat = (radiusM / earth) * (180 / Math.PI);
  const dLon =
    (radiusM / (earth * Math.cos((Math.PI * centerLat) / 180))) * (180 / Math.PI);

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([
      centerLon + dLon * Math.cos(theta),
      centerLat + dLat * Math.sin(theta),
    ]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}
