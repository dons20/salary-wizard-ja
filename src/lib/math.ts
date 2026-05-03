export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}