import { describe, expect, it } from 'vitest'

import {
  denormalizeFromAnnual,
  deriveSalaryBreakdown,
  getRegularOvertimeHours,
  normalizeBreakdownValueToAnnual,
  normalizePensionToAnnual,
  normalizeToAnnual,
} from '../../features/salary/salary-utils'

describe('salary-utils', () => {
  it('converts hourly salary to annual', () => {
    expect(
      normalizeToAnnual({
        amount: 1000,
        mode: 'hourly',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        specialOvertimeHours: 0,
        pension: 0,
        pensionMode: 'amount',
      }),
    ).toBe(2080000)
  })

  it('converts daily salary to annual', () => {
    expect(
      normalizeToAnnual({
        amount: 8000,
        mode: 'daily',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        specialOvertimeHours: 0,
        pension: 0,
        pensionMode: 'amount',
      }),
    ).toBe(2080000)
  })

  it('converts monthly salary to annual', () => {
    expect(
      normalizeToAnnual({
        amount: 175000,
        mode: 'monthly',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        specialOvertimeHours: 0,
        pension: 0,
        pensionMode: 'amount',
      }),
    ).toBe(2100000)
  })

  it('adds overtime and special overtime premiums to hourly annual income', () => {
    expect(
      normalizeToAnnual({
        amount: 1000,
        mode: 'hourly',
        hoursPerWeek: 45,
        daysPerWeek: 5,
        specialOvertimeHours: 2,
        pension: 0,
        pensionMode: 'amount',
      }),
    ).toBe(2522000)
  })

  it('converts pension percentages into annual deductions from annual salary', () => {
    expect(
      normalizePensionToAnnual({
        amount: 200000,
        mode: 'monthly',
        hoursPerWeek: 40,
        daysPerWeek: 5,
        specialOvertimeHours: 0,
        pension: 5,
        pensionMode: 'percent',
      }),
    ).toBe(120000)
  })

  it('treats fixed pension amounts as monthly contributions', () => {
    expect(
      normalizePensionToAnnual({
        amount: 1000,
        mode: 'hourly',
        hoursPerWeek: 45,
        daysPerWeek: 5,
        specialOvertimeHours: 2,
        pension: 10000,
        pensionMode: 'amount',
      }),
    ).toBe(120000)
  })

  it('derives the remaining regular overtime hours after special overtime is allocated', () => {
    expect(getRegularOvertimeHours(45, 2)).toBe(3)
  })

  it('converts a weekly breakdown value back to annual salary', () => {
    expect(normalizeBreakdownValueToAnnual(40000, 'weekly', 40, 5)).toBe(2080000)
  })

  it('projects annual salary back into the selected input mode', () => {
    expect(denormalizeFromAnnual(2080000, 'monthly', 40, 5)).toBeCloseTo(173333.33333333334)
  })

  it('derives annual salary into all supported periods', () => {
    expect(deriveSalaryBreakdown(2080000, 40, 5)).toEqual({
      annual: 2080000,
      monthly: 173333.33333333334,
      weekly: 40000,
      biweekly: 80000,
      daily: 8000,
      hourly: 1000,
    })
  })
})