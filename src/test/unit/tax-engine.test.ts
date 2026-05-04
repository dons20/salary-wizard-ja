import { describe, expect, it } from 'vitest'

import { getActiveTaxConfig, getCalendarYearTaxFreeThresholdBreakdown } from '../../features/tax/tax-config'
import {
  calculateEmployeeTax,
  calculateIncomeTax,
  calculateIncomeTaxBreakdown,
  calculateSelfEmployedTax,
} from '../../features/tax/tax-engine'

describe('tax-engine', () => {
  const calculationDate = new Date('2026-05-04T00:00:00Z')
  const activeConfig = getActiveTaxConfig(calculationDate)

  it('keeps income below the threshold free of income tax', () => {
    const result = calculateSelfEmployedTax(1500000, activeConfig, 0, calculationDate)
    expect(result.taxableIncome).toBe(0)
    expect(result.incomeTax).toBe(0)
  })

  it('applies the threshold after deductible contributions', () => {
    const result = calculateSelfEmployedTax(2500000, activeConfig, 0, calculationDate)
    expect(result.statutoryIncome).toBe(2350000)
    expect(result.taxableIncome).toBe(473386)
    expect(result.nht).toBe(50000)
    expect(result.educationTax).toBe(52875)
    expect(result.incomeTax).toBe(118346.5)
  })

  it('caps NIS at the configured annual limit', () => {
    const result = calculateSelfEmployedTax(8000000, activeConfig, 0, calculationDate)
    expect(result.nis).toBe(300000)
  })

  it('uses a lower NIS rate for employees', () => {
    const selfEmployedResult = calculateSelfEmployedTax(2400000, activeConfig, 0, calculationDate)
    const employeeResult = calculateEmployeeTax(2400000, activeConfig, 0, calculationDate)

    expect(selfEmployedResult.nis).toBe(144000)
    expect(employeeResult.nis).toBe(72000)
    expect(employeeResult.contributionRates.nis).toBe(0.03)
    expect(selfEmployedResult.contributionRates.nis).toBe(0.06)
    expect(employeeResult.statutoryIncome).toBe(2328000)
    expect(employeeResult.totalContributions).toBe(172380)
  })

  it('deducts pension before calculating statutory income', () => {
    const result = calculateEmployeeTax(2400000, activeConfig, 120000, calculationDate)

    expect(result.pension).toBe(120000)
    expect(result.statutoryIncome).toBe(2208000)
    expect(result.nht).toBe(48000)
    expect(result.educationTax).toBe(49680)
    expect(result.totalContributions).toBe(289680)
  })

  it('calculates income tax within the first band', () => {
    expect(
      calculateIncomeTax(1000000, activeConfig.incomeTaxBands),
    ).toBe(250000)
  })

  it('calculates income tax above the first band', () => {
    expect(
      calculateIncomeTax(7000000, activeConfig.incomeTaxBands),
    ).toBe(1800000)
  })

  it('returns an income tax breakdown by rate band', () => {
    expect(calculateIncomeTaxBreakdown(7000000, activeConfig.incomeTaxBands)).toEqual([
      { taxableAmount: 6000000, rate: 0.25, tax: 1500000 },
      { taxableAmount: 1000000, rate: 0.3, tax: 300000 },
    ])
  })

  it('selects the 2027 threshold once it becomes effective', () => {
    expect(getActiveTaxConfig(new Date('2027-04-01T00:00:00Z')).taxFreeThreshold).toBe(
      2003496,
    )
  })

  it('builds the 2026 calendar-year threshold from jan-mar and apr-dec figures', () => {
    expect(getCalendarYearTaxFreeThresholdBreakdown(new Date('2026-05-04T00:00:00Z'))).toEqual({
      calendarYear: 2026,
      janMarThreshold: 449844,
      aprDecThreshold: 1426770,
      totalThreshold: 1876614,
    })
  })

  it('builds the 2027 calendar-year threshold from jan-mar and apr-dec figures', () => {
    expect(getCalendarYearTaxFreeThresholdBreakdown(new Date('2027-05-04T00:00:00Z'))).toEqual({
      calendarYear: 2027,
      janMarThreshold: 475590,
      aprDecThreshold: 1502622,
      totalThreshold: 1978212,
    })
  })
})