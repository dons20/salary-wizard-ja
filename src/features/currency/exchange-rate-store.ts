import { create } from 'zustand'

import { getExchangeRatesWithFallback, loadCachedExchangeRates } from './exchange-rate-service'
import type { ExchangeRateSource, ExchangeRates } from './currency-types'

type ExchangeRateState = {
  rates: ExchangeRates | null
  fetchedAt: string | null
  isLoading: boolean
  error: string | null
  source: ExchangeRateSource
  fetchRates: () => Promise<void>
  loadCachedRates: () => void
  refreshRates: () => Promise<void>
}

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  rates: null,
  fetchedAt: null,
  isLoading: false,
  error: null,
  source: 'unavailable',
  async fetchRates() {
    set((state) => ({ ...state, isLoading: true, error: null }))

    try {
      const snapshot = await getExchangeRatesWithFallback()
      set({
        rates: snapshot.rates,
        fetchedAt: snapshot.fetchedAt,
        isLoading: false,
        error: snapshot.source === 'cached' ? 'Using cached exchange rates.' : null,
        source: snapshot.source,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load exchange rates.'
      set({ isLoading: false, error: message, source: 'unavailable' })
    }
  },
  loadCachedRates() {
    const cached = loadCachedExchangeRates()

    if (!cached) {
      return
    }

    set({
      rates: cached.rates,
      fetchedAt: cached.fetchedAt,
      source: 'cached',
      error: 'Using cached exchange rates.',
    })
  },
  async refreshRates() {
    await get().fetchRates()
  },
}))