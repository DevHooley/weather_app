export function metersToMiles(visabilityInMeters: number): string {
  const visabilityInMiles = visabilityInMeters / 100;
  return `${visabilityInMiles.toFixed(0)} miles`;
}
