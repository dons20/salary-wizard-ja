import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchExchangeRates,
  getExchangeRatesWithFallback,
} from '../../features/currency/exchange-rate-service'
import { convertCurrency } from '../../features/currency/currency-utils'
import type { ExchangeRates } from '../../features/currency/currency-types'

const sampleRates: ExchangeRates = {
  USD: 1,
  JMD: 156.2,
  CAD: 1.37,
  GBP: 0.79,
  EUR: 0.92,
}

function createStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size
    },
  }
}

describe('currency utilities', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
    })
  })

  it('converts between supported currencies', () => {
    expect(convertCurrency(100000, 'JMD', 'USD', sampleRates)).toBeCloseTo(640.2, 1)
  })

  it('supports a direct USD to JMD path', () => {
    expect(convertCurrency(100, 'USD', 'JMD', sampleRates)).toBe(15620)
  })

  it('accepts the worker-backed exchange rate payload', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: sampleRates,
        fetchedAt: '2026-05-03T12:00:00.000Z',
      }),
    } as Response)

    const snapshot = await fetchExchangeRates(fetchMock)

    expect(snapshot.source).toBe('live')
    expect(snapshot.rates.USD).toBe(1)
    expect(snapshot.fetchedAt).toBe('2026-05-03T12:00:00.000Z')
  })

  it('falls back to cached exchange rates when fetch fails', async () => {
    localStorage.setItem(
      'salary-wizard.exchange-rates',
      JSON.stringify({ rates: sampleRates, fetchedAt: '2026-05-03T12:00:00.000Z' }),
    )

    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'))
    const snapshot = await getExchangeRatesWithFallback(fetchMock)

    expect(snapshot.source).toBe('cached')
    expect(snapshot.rates.JMD).toBe(sampleRates.JMD)
  })
})