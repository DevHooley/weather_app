export function convertWindSpeed(speedInMetersPerSecond: number): string {
  const speedInMilesPerHour = speedInMetersPerSecond * 2.237;
  return `${speedInMilesPerHour.toFixed(0)} mph`;
}
