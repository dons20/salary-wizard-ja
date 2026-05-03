import { EXCHANGE_RATE_API_URL, EXCHANGE_RATE_STORAGE_KEY } from '../../lib/constants'
import { readPersistentJson, writePersistentJson } from '../preferences/persistence'
import type { ExchangeRateSnapshot, ExchangeRates } from './currency-types'

type WorkerExchangeRateResponse = {
  rates?: Partial<ExchangeRates>
  fetchedAt?: string
}

function assertRates(
  rates: Partial<ExchangeRates> | undefined,
): asserts rates is ExchangeRates {
  if (!rates?.USD || !rates.JMD || !rates.CAD || !rates.GBP || !rates.EUR) {
    throw new Error('Exchange rate response is missing one or more supported currencies.')
  }
}

export function cacheExchangeRates(snapshot: Omit<ExchangeRateSnapshot, 'source'>) {
  writePersistentJson(EXCHANGE_RATE_STORAGE_KEY, snapshot)
}

export function loadCachedExchangeRates(): ExchangeRateSnapshot | null {
  const cached = readPersistentJson<Omit<ExchangeRateSnapshot, 'source'>>(
    EXCHANGE_RATE_STORAGE_KEY,
  )

  if (!cached) {
    return null
  }

  return {
    ...cached,
    source: 'cached',
  }
}

export async function fetchExchangeRates(
  requestImpl: typeof fetch = fetch,
): Promise<ExchangeRateSnapshot> {
  const response = await requestImpl(EXCHANGE_RATE_API_URL)

  if (!response.ok) {
    throw new Error('Unable to fetch exchange rates right now.')
  }

  const data = (await response.json()) as WorkerExchangeRateResponse

  assertRates(data.rates)

  if (!data.fetchedAt) {
    throw new Error('Exchange rate response is missing its timestamp.')
  }

  const snapshot = {
    rates: data.rates,
    fetchedAt: data.fetchedAt,
    source: 'live' as const,
  }

  cacheExchangeRates({ rates: snapshot.rates, fetchedAt: snapshot.fetchedAt })
  return snapshot
}

export async function getExchangeRatesWithFallback(
  requestImpl: typeof fetch = fetch,
): Promise<ExchangeRateSnapshot> {
  try {
    return await fetchExchangeRates(requestImpl)
  } catch (error) {
    const cached = loadCachedExchangeRates()
    if (cached) {
      return cached
    }

    throw error
  }
}