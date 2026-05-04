export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  JMD: '$',
  USD: '$',
  CAD: '$',
  GBP: '£',
  EUR: '€',
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency
}

export function formatNumberInputDraft(value: string): string {
  if (value === '') {
    return ''
  }

  const [integerPart, decimalPart] = value.split('.')
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (decimalPart === undefined) {
    return groupedInteger
  }

  return `${groupedInteger}.${decimalPart}`
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyNumber(amount: number): string {
  return new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatExchangeRate(amount: number): string {
  const showMorePrecision = amount < 1

  return new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: showMorePrecision ? 4 : 2,
    maximumFractionDigits: showMorePrecision ? 4 : 2,
  }).format(amount)
}

export function formatPercentage(rate: number): string {
  return `${new Intl.NumberFormat('en-JM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate * 100)}%`
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-JM', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}