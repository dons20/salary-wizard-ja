import {
  BIWEEKLY_PERIODS_PER_YEAR,
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR,
} from '../../lib/constants'
import type { SalaryBreakdown, SalaryInput } from './salary-types'

export function normalizeToAnnual(input: SalaryInput): number {
  const { amount, mode, hoursPerWeek, daysPerWeek } = input

  switch (mode) {
    case 'hourly':
      return amount * hoursPerWeek * WEEKS_PER_YEAR
    case 'daily':
      return amount * daysPerWeek * WEEKS_PER_YEAR
    case 'biweekly':
      return amount * BIWEEKLY_PERIODS_PER_YEAR
    case 'monthly':
      return amount * MONTHS_PER_YEAR
    case 'annual':
      return amount
  }
}

export function deriveSalaryBreakdown(
  annual: number,
  hoursPerWeek: number,
  daysPerWeek: number,
): SalaryBreakdown {
  return {
    annual,
    monthly: annual / MONTHS_PER_YEAR,
    weekly: annual / WEEKS_PER_YEAR,
    biweekly: annual / BIWEEKLY_PERIODS_PER_YEAR,
    daily: annual / (daysPerWeek * WEEKS_PER_YEAR),
    hourly: annual / (hoursPerWeek * WEEKS_PER_YEAR),
  }
}