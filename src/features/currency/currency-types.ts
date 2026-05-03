import type { SUPPORTED_CURRENCIES } from '../../lib/constants'

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export type ExchangeRates = Record<SupportedCurrency, number>

export type ExchangeRateSource = 'live' | 'cached' | 'unavailable'

export type ExchangeRateSnapshot = {
  rates: ExchangeRates
  fetchedAt: string
  source: Exclude<ExchangeRateSource, 'unavailable'>
}