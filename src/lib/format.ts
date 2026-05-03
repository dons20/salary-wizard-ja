export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-JM', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}