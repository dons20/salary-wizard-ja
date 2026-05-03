import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  DEFAULT_AMOUNT,
  DEFAULT_CURRENCY,
  DEFAULT_DAYS_PER_WEEK,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_SALARY_MODE,
} from '../../lib/constants'
import type { SupportedCurrency } from '../currency/currency-types'
import type { InputSalaryMode } from './salary-types'

type SalaryState = {
  amount: number
  mode: InputSalaryMode
  currency: SupportedCurrency
  hoursPerWeek: number
  daysPerWeek: number
  setAmount: (amount: number) => void
  setMode: (mode: InputSalaryMode) => void
  setCurrency: (currency: SupportedCurrency) => void
  setHoursPerWeek: (hoursPerWeek: number) => void
  setDaysPerWeek: (daysPerWeek: number) => void
  reset: () => void
}

const initialState: Pick<
  SalaryState,
  'amount' | 'mode' | 'currency' | 'hoursPerWeek' | 'daysPerWeek'
> = {
  amount: DEFAULT_AMOUNT,
  mode: DEFAULT_SALARY_MODE,
  currency: DEFAULT_CURRENCY,
  hoursPerWeek: DEFAULT_HOURS_PER_WEEK,
  daysPerWeek: DEFAULT_DAYS_PER_WEEK,
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      ...initialState,
      setAmount: (amount) => set({ amount }),
      setMode: (mode) => set({ mode }),
      setCurrency: (currency) => set({ currency }),
      setHoursPerWeek: (hoursPerWeek) => set({ hoursPerWeek }),
      setDaysPerWeek: (daysPerWeek) => set({ daysPerWeek }),
      reset: () => set(initialState),
    }),
    {
      name: 'salary-wizard.salary',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        amount: state.amount,
        mode: state.mode,
        currency: state.currency,
        hoursPerWeek: state.hoursPerWeek,
        daysPerWeek: state.daysPerWeek,
      }),
    },
  ),
)