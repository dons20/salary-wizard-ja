import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  DEFAULT_AMOUNT,
  DEFAULT_CURRENCY,
  DEFAULT_DAYS_PER_WEEK,
  DEFAULT_EMPLOYMENT_STATUS,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_PENSION,
  DEFAULT_PENSION_MODE,
  DEFAULT_SALARY_MODE,
  DEFAULT_SPECIAL_OVERTIME_HOURS,
  HOURS_PER_WEEK_MAX,
  REGULAR_HOURS_PER_WEEK,
} from '../../lib/constants'
import type { SupportedCurrency } from '../currency/currency-types'
import type { EmploymentStatus, InputSalaryMode, PensionInputMode } from './salary-types'

function clampSpecialOvertimeHours(hoursPerWeek: number, specialOvertimeHours: number) {
  return Math.min(Math.max(specialOvertimeHours, 0), Math.max(0, hoursPerWeek - REGULAR_HOURS_PER_WEEK))
}

function clampHoursPerWeek(hoursPerWeek: number) {
  return Math.min(Math.max(hoursPerWeek, 0), HOURS_PER_WEEK_MAX)
}

type SalaryState = {
  amount: number
  mode: InputSalaryMode
  currency: SupportedCurrency
  employmentStatus: EmploymentStatus
  hoursPerWeek: number
  specialOvertimeHours: number
  pension: number
  pensionMode: PensionInputMode
  daysPerWeek: number
  setAmount: (amount: number) => void
  setMode: (mode: InputSalaryMode) => void
  setCurrency: (currency: SupportedCurrency) => void
  setEmploymentStatus: (employmentStatus: EmploymentStatus) => void
  setHoursPerWeek: (hoursPerWeek: number) => void
  setSpecialOvertimeHours: (specialOvertimeHours: number) => void
  setPension: (pension: number) => void
  setPensionMode: (pensionMode: PensionInputMode) => void
  setDaysPerWeek: (daysPerWeek: number) => void
  reset: () => void
}

const initialState: Pick<
  SalaryState,
  'amount' | 'mode' | 'currency' | 'employmentStatus' | 'hoursPerWeek' | 'specialOvertimeHours' | 'pension' | 'pensionMode' | 'daysPerWeek'
> = {
  amount: DEFAULT_AMOUNT,
  mode: DEFAULT_SALARY_MODE,
  currency: DEFAULT_CURRENCY,
  employmentStatus: DEFAULT_EMPLOYMENT_STATUS,
  hoursPerWeek: DEFAULT_HOURS_PER_WEEK,
  specialOvertimeHours: DEFAULT_SPECIAL_OVERTIME_HOURS,
  pension: DEFAULT_PENSION,
  pensionMode: DEFAULT_PENSION_MODE,
  daysPerWeek: DEFAULT_DAYS_PER_WEEK,
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set) => ({
      ...initialState,
      setAmount: (amount) => set({ amount }),
      setMode: (mode) => set({ mode }),
      setCurrency: (currency) => set({ currency }),
      setEmploymentStatus: (employmentStatus) => set({ employmentStatus }),
      setHoursPerWeek: (hoursPerWeek) =>
        set((state) => {
          const clampedHoursPerWeek = clampHoursPerWeek(hoursPerWeek)

          return {
            hoursPerWeek: clampedHoursPerWeek,
            specialOvertimeHours: clampSpecialOvertimeHours(clampedHoursPerWeek, state.specialOvertimeHours),
          }
        }),
      setSpecialOvertimeHours: (specialOvertimeHours) =>
        set((state) => ({
          specialOvertimeHours: clampSpecialOvertimeHours(state.hoursPerWeek, specialOvertimeHours),
        })),
      setPension: (pension) => set({ pension }),
      setPensionMode: (pensionMode) => set({ pensionMode }),
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
        employmentStatus: state.employmentStatus,
        hoursPerWeek: state.hoursPerWeek,
        specialOvertimeHours: state.specialOvertimeHours,
        pension: state.pension,
        pensionMode: state.pensionMode,
        daysPerWeek: state.daysPerWeek,
      }),
    },
  ),
)