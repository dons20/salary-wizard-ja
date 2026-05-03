import { describe, expect, it } from 'vitest'

import { getActiveTaxConfig } from '../../features/tax/tax-config'
import { calculateIncomeTax, calculateSelfEmployedTax } from '../../features/tax/tax-engine'

describe('tax-engine', () => {
  it('keeps income below the threshold free of income tax', () => {
    const result = calculateSelfEmployedTax(1500000)
    expect(result.taxableIncome).toBe(0)
    expect(result.incomeTax).toBe(0)
  })

  it('applies the threshold after deductible contributions', () => {
    const result = calculateSelfEmployedTax(2500000)
    expect(result.chargeableIncome).toBe(2243750)
    expect(result.taxableIncome).toBe(341390)
  })

  it('caps NIS at the configured annual limit', () => {
    const result = calculateSelfEmployedTax(8000000)
    expect(result.nis).toBe(300000)
  })

  it('calculates income tax within the first band', () => {
    expect(
      calculateIncomeTax(1000000, getActiveTaxConfig().incomeTaxBands),
    ).toBe(250000)
  })

  it('calculates income tax above the first band', () => {
    expect(
      calculateIncomeTax(7000000, getActiveTaxConfig().incomeTaxBands),
    ).toBe(1800000)
  })

  it('selects the 2027 threshold once it becomes effective', () => {
    expect(getActiveTaxConfig(new Date('2027-04-01T00:00:00Z')).taxFreeThreshold).toBe(
      2003496,
    )
  })
})