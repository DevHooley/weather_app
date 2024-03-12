export function convertKelvinToFahrenheit(tempInKelvin: number): number {
  const tempInCelsius = tempInKelvin - 273.15;
  const tempInFahrenheit = (tempInCelsius * 9) / 5 + 32;
  return Math.round(tempInFahrenheit); // Round to the nearest whole number
}
