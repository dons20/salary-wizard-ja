import { create } from 'zustand'

import { DEFAULT_VISIBLE_SECTIONS } from '../../lib/constants'
import type { SupportedCurrency } from '../currency/currency-types'
import type { SalaryMode, VisibleSalarySections } from '../salary/salary-types'
import { readPersistentJson, writePersistentJson } from './persistence'

const STORAGE_KEY = 'salary-wizard.preferences'

type BreakdownCurrencyOverrides = Partial<Record<SalaryMode, SupportedCurrency>>

type PreferencesState = {
  visibleSalarySections: VisibleSalarySections
  breakdownCurrencies: BreakdownCurrencyOverrides
  toggleSectionVisibility: (section: SalaryMode) => void
  setBreakdownCurrency: (section: SalaryMode, currency: SupportedCurrency) => void
  resetPreferences: () => void
  loadPreferences: () => void
  savePreferences: () => void
}

function persistPreferences(
  visibleSalarySections: VisibleSalarySections,
  breakdownCurrencies: BreakdownCurrencyOverrides,
) {
  writePersistentJson(STORAGE_KEY, { visibleSalarySections, breakdownCurrencies })
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  visibleSalarySections: { ...DEFAULT_VISIBLE_SECTIONS },
  breakdownCurrencies: {},
  toggleSectionVisibility(section) {
    set((state) => {
      const next = {
        ...state.visibleSalarySections,
        [section]: !state.visibleSalarySections[section],
      }

      persistPreferences(next, state.breakdownCurrencies)
      return { visibleSalarySections: next }
    })
  },
  setBreakdownCurrency(section, currency) {
    set((state) => {
      const next = {
        ...state.breakdownCurrencies,
        [section]: currency,
      }

      persistPreferences(state.visibleSalarySections, next)
      return { breakdownCurrencies: next }
    })
  },
  resetPreferences() {
    const defaults = { ...DEFAULT_VISIBLE_SECTIONS }
    persistPreferences(defaults, {})
    set({ visibleSalarySections: defaults, breakdownCurrencies: {} })
  },
  loadPreferences() {
    const persisted = readPersistentJson<{
      visibleSalarySections?: VisibleSalarySections
      breakdownCurrencies?: BreakdownCurrencyOverrides
    }>(
      STORAGE_KEY,
    )

    if (persisted) {
      set({
        visibleSalarySections: {
          ...DEFAULT_VISIBLE_SECTIONS,
          ...persisted.visibleSalarySections,
        },
        breakdownCurrencies: persisted.breakdownCurrencies ?? {},
      })
    }
  },
  savePreferences() {
    persistPreferences(get().visibleSalarySections, get().breakdownCurrencies)
  },
}))