const NUMBER_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>()
const DATE_TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

function getNumberFormatter(options: Intl.NumberFormatOptions) {
  const key = JSON.stringify(options)
  let formatter = NUMBER_FORMATTER_CACHE.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat('en-JM', options)
    NUMBER_FORMATTER_CACHE.set(key, formatter)
  }

  return formatter
}

function getDateTimeFormatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options)
  let formatter = DATE_TIME_FORMATTER_CACHE.get(key)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-JM', options)
    DATE_TIME_FORMATTER_CACHE.set(key, formatter)
  }

  return formatter
}

export function formatMoney(amount: number, currency: string): string {
  return getNumberFormatter({
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
  return getNumberFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyNumber(amount: number): string {
  return getNumberFormatter({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatExchangeRate(amount: number): string {
  const showMorePrecision = amount < 1

  return getNumberFormatter({
    minimumFractionDigits: showMorePrecision ? 4 : 2,
    maximumFractionDigits: showMorePrecision ? 4 : 2,
  }).format(amount)
}

export function formatPercentage(rate: number): string {
  return `${getNumberFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate * 100)}%`
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return getDateTimeFormatter({
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}