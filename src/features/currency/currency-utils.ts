import {
  EXCHANGE_RATE_MAX_AGE_MS,
  SUPPORTED_CURRENCIES,
} from '../../lib/constants'
import { formatDateTime } from '../../lib/format'
import { roundTo } from '../../lib/math'
import type { ExchangeRates, SupportedCurrency } from './currency-types'

export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: ExchangeRates,
): number {
  if (from === to) {
    return amount
  }

  const fromRate = rates[from]
  const toRate = rates[to]

  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rate for ${from} or ${to}.`)
  }

  const usdAmount = amount / fromRate
  return roundTo(usdAmount * toRate)
}

export function getSupportedCurrencies(): SupportedCurrency[] {
  return [...SUPPORTED_CURRENCIES]
}

export function getRateTimestampLabel(fetchedAt: string | null): string {
  if (!fetchedAt) {
    return 'No cached exchange rates yet.'
  }

  return `Rates updated ${formatDateTime(fetchedAt)}`
}

export function isRateDataStale(fetchedAt: string | null): boolean {
  if (!fetchedAt) {
    return true
  }

  return Date.now() - new Date(fetchedAt).getTime() > EXCHANGE_RATE_MAX_AGE_MS
}