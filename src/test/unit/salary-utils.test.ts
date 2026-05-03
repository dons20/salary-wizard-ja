import { describe, expect, it } from 'vitest'

import { deriveSalaryBreakdown, normalizeToAnnual } from '../../features/salary/salary-utils'

describe('salary-utils', () => {
  it('converts hourly salary to annual', () => {
    expect(
      normalizeToAnnual({
        amount: 1000,
        mode: 'hourly',
        hoursPerWeek: 40,
        daysPerWeek: 5,
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
      }),
    ).toBe(2100000)
  })

  it('derives annual salary into all supported periods', () => {
    expect(deriveSalaryBreakdown(2080000, 40, 5)).toEqual({
      annual: 2080000,
      monthly: 173333.33333333334,
      biweekly: 80000,
      daily: 8000,
      hourly: 1000,
    })
  })
})