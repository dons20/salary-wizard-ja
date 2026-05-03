import { BIWEEKLY_PERIODS_PER_YEAR, MONTHS_PER_YEAR } from '../../lib/constants'
import { roundTo } from '../../lib/math'
import { getActiveTaxConfig } from './tax-config'
import type { TaxConfig, TaxResult } from './tax-types'

export function calculateIncomeTax(
  taxableIncome: number,
  bands: TaxConfig['incomeTaxBands'],
): number {
  let previousUpperLimit = 0
  let remainingIncome = taxableIncome
  let totalIncomeTax = 0

  for (const band of bands) {
    if (remainingIncome <= 0) {
      break
    }

    const upperLimit = band.upTo ?? Number.POSITIVE_INFINITY
    const taxableWithinBand = Math.min(remainingIncome, upperLimit - previousUpperLimit)

    if (taxableWithinBand > 0) {
      totalIncomeTax += taxableWithinBand * band.rate
      remainingIncome -= taxableWithinBand
    }

    previousUpperLimit = upperLimit
  }

  return roundTo(totalIncomeTax)
}

export function calculateSelfEmployedTax(
  grossAnnualJmd: number,
  config: TaxConfig = getActiveTaxConfig(),
): TaxResult {
  const grossAnnual = roundTo(grossAnnualJmd)
  const nis = roundTo(Math.min(grossAnnual, config.nis.annualCap) * config.nis.rate)
  const nht = roundTo(grossAnnual * config.nht.rate)
  const educationTax = roundTo(grossAnnual * config.educationTax.rate)
  const totalDeductibleContributions = roundTo(nis + nht + educationTax)
  const chargeableIncome = roundTo(grossAnnual - totalDeductibleContributions)
  const taxableIncome = roundTo(Math.max(0, chargeableIncome - config.taxFreeThreshold))
  const incomeTax = calculateIncomeTax(taxableIncome, config.incomeTaxBands)
  const totalDeductions = roundTo(totalDeductibleContributions + incomeTax)
  const netAnnual = roundTo(grossAnnual - totalDeductions)

  return {
    grossAnnual,
    nis,
    nht,
    educationTax,
    totalDeductibleContributions,
    taxFreeThreshold: config.taxFreeThreshold,
    chargeableIncome,
    taxableIncome,
    incomeTax,
    totalDeductions,
    netAnnual,
    netMonthly: roundTo(netAnnual / MONTHS_PER_YEAR),
    netBiweekly: roundTo(netAnnual / BIWEEKLY_PERIODS_PER_YEAR),
  }
}