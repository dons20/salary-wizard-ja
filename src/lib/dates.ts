export function parseIsoDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

export function toIsoDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString()
}