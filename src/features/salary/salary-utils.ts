import {
  BIWEEKLY_PERIODS_PER_YEAR,
  MONTHS_PER_YEAR,
  REGULAR_HOURS_PER_WEEK,
  REGULAR_OVERTIME_RATE,
  SPECIAL_OVERTIME_RATE,
  WEEKS_PER_YEAR,
} from '../../lib/constants'
import type { InputSalaryMode, SalaryBreakdown, SalaryInput, SalaryMode } from './salary-types'

function clampSpecialOvertimeHours(hoursPerWeek: number, specialOvertimeHours: number) {
  return Math.min(Math.max(specialOvertimeHours, 0), getTotalOvertimeHours(hoursPerWeek))
}

export function getTotalOvertimeHours(hoursPerWeek: number): number {
  return Math.max(0, hoursPerWeek - REGULAR_HOURS_PER_WEEK)
}

export function getRegularOvertimeHours(hoursPerWeek: number, specialOvertimeHours: number): number {
  return Math.max(0, getTotalOvertimeHours(hoursPerWeek) - clampSpecialOvertimeHours(hoursPerWeek, specialOvertimeHours))
}

function getWeightedOvertimeHours(hoursPerWeek: number, specialOvertimeHours: number): number {
  return (
    getRegularOvertimeHours(hoursPerWeek, specialOvertimeHours) * REGULAR_OVERTIME_RATE +
    clampSpecialOvertimeHours(hoursPerWeek, specialOvertimeHours) * SPECIAL_OVERTIME_RATE
  )
}

function getAnnualizationFactor(
  mode: InputSalaryMode,
  hoursPerWeek: number,
  daysPerWeek: number,
  specialOvertimeHours: number,
): number {
  const weightedOvertimeHours = getWeightedOvertimeHours(hoursPerWeek, specialOvertimeHours)

  switch (mode) {
    case 'hourly':
      return (Math.min(hoursPerWeek, REGULAR_HOURS_PER_WEEK) + weightedOvertimeHours) * WEEKS_PER_YEAR
    case 'daily':
      return daysPerWeek * WEEKS_PER_YEAR + (daysPerWeek / REGULAR_HOURS_PER_WEEK) * weightedOvertimeHours * WEEKS_PER_YEAR
    case 'biweekly':
      return BIWEEKLY_PERIODS_PER_YEAR + (weightedOvertimeHours * WEEKS_PER_YEAR) / (REGULAR_HOURS_PER_WEEK * 2)
    case 'monthly':
      return MONTHS_PER_YEAR + (weightedOvertimeHours * MONTHS_PER_YEAR) / REGULAR_HOURS_PER_WEEK
    case 'annual':
      return 1 + weightedOvertimeHours / REGULAR_HOURS_PER_WEEK
  }
}

export function normalizeToAnnual(input: SalaryInput): number {
  return input.amount * getAnnualizationFactor(
    input.mode,
    input.hoursPerWeek,
    input.daysPerWeek,
    input.specialOvertimeHours,
  )
}

export function denormalizeFromAnnual(
  annual: number,
  mode: InputSalaryMode,
  hoursPerWeek: number,
  daysPerWeek: number,
  specialOvertimeHours = 0,
): number {
  return annual / getAnnualizationFactor(mode, hoursPerWeek, daysPerWeek, specialOvertimeHours)
}

export function normalizeBreakdownValueToAnnual(
  amount: number,
  mode: SalaryMode,
  hoursPerWeek: number,
  daysPerWeek: number,
): number {
  switch (mode) {
    case 'hourly':
      return amount * hoursPerWeek * WEEKS_PER_YEAR
    case 'daily':
      return amount * daysPerWeek * WEEKS_PER_YEAR
    case 'weekly':
      return amount * WEEKS_PER_YEAR
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