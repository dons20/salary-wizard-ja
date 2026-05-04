import { BIWEEKLY_PERIODS_PER_YEAR, MONTHS_PER_YEAR } from '../../lib/constants'
import { roundTo } from '../../lib/math'
import type { EmploymentStatus } from '../salary/salary-types'
import { getActiveTaxConfig, getCalendarYearTaxFreeThresholdBreakdown } from './tax-config'
import type { TaxBandBreakdown, TaxConfig, TaxResult } from './tax-types'

const EMPLOYEE_NIS_RATE = 0.03

export function calculateIncomeTaxBreakdown(
  taxableIncome: number,
  bands: TaxConfig['incomeTaxBands'],
): TaxBandBreakdown[] {
  let previousUpperLimit = 0
  let remainingIncome = taxableIncome
  const breakdown: TaxBandBreakdown[] = []

  for (const band of bands) {
    if (remainingIncome <= 0) {
      break
    }

    const upperLimit = band.upTo ?? Number.POSITIVE_INFINITY
    const taxableWithinBand = Math.min(remainingIncome, upperLimit - previousUpperLimit)

    if (taxableWithinBand > 0) {
      breakdown.push({
        taxableAmount: roundTo(taxableWithinBand),
        rate: band.rate,
        tax: roundTo(taxableWithinBand * band.rate),
      })
      remainingIncome -= taxableWithinBand
    }

    previousUpperLimit = upperLimit
  }

  return breakdown
}

export function calculateIncomeTax(
  taxableIncome: number,
  bands: TaxConfig['incomeTaxBands'],
): number {
  return roundTo(
    calculateIncomeTaxBreakdown(taxableIncome, bands).reduce((total, band) => total + band.tax, 0),
  )
}

function getNisRate(employmentStatus: EmploymentStatus, config: TaxConfig): number {
  return employmentStatus === 'employee' ? EMPLOYEE_NIS_RATE : config.nis.rate
}

export function calculateTax(
  grossAnnualJmd: number,
  employmentStatus: EmploymentStatus,
  config: TaxConfig = getActiveTaxConfig(),
  pensionAnnualJmd = 0,
  calculationDate = new Date(),
): TaxResult {
  const taxFreeThresholdBreakdown = getCalendarYearTaxFreeThresholdBreakdown(calculationDate)
  const grossAnnual = roundTo(grossAnnualJmd)
  const pension = roundTo(Math.max(0, pensionAnnualJmd))
  const contributionRates = {
    nis: getNisRate(employmentStatus, config),
    nht: config.nht.rate,
    educationTax: config.educationTax.rate,
  }
  const nis = roundTo(Math.min(grossAnnual, config.nis.annualCap) * contributionRates.nis)
  const statutoryIncome = roundTo(Math.max(0, grossAnnual - nis - pension))
  const nht = roundTo(grossAnnual * contributionRates.nht)
  const educationTax = roundTo(statutoryIncome * contributionRates.educationTax)
  const totalContributions = roundTo(nis + pension + nht + educationTax)
  const taxableIncome = roundTo(
    Math.max(0, statutoryIncome - taxFreeThresholdBreakdown.totalThreshold),
  )
  const incomeTaxBandBreakdown = calculateIncomeTaxBreakdown(taxableIncome, config.incomeTaxBands)
  const incomeTax = roundTo(incomeTaxBandBreakdown.reduce((total, band) => total + band.tax, 0))
  const totalDeductions = roundTo(totalContributions + incomeTax)
  const netAnnual = roundTo(grossAnnual - totalDeductions)

  return {
    employmentStatus,
    calendarYear: taxFreeThresholdBreakdown.calendarYear,
    grossAnnual,
    contributionRates,
    nis,
    pension,
    nht,
    educationTax,
    totalContributions,
    taxFreeThreshold: taxFreeThresholdBreakdown.totalThreshold,
    taxFreeThresholdBreakdown,
    statutoryIncome,
    taxableIncome,
    incomeTaxBandBreakdown,
    incomeTax,
    totalDeductions,
    netAnnual,
    netMonthly: roundTo(netAnnual / MONTHS_PER_YEAR),
    netBiweekly: roundTo(netAnnual / BIWEEKLY_PERIODS_PER_YEAR),
  }
}

export function calculateSelfEmployedTax(
  grossAnnualJmd: number,
  config: TaxConfig = getActiveTaxConfig(),
  pensionAnnualJmd = 0,
  calculationDate = new Date(),
): TaxResult {
  return calculateTax(grossAnnualJmd, 'self-employed', config, pensionAnnualJmd, calculationDate)
}

export function calculateEmployeeTax(
  grossAnnualJmd: number,
  config: TaxConfig = getActiveTaxConfig(),
  pensionAnnualJmd = 0,
  calculationDate = new Date(),
): TaxResult {
  return calculateTax(grossAnnualJmd, 'employee', config, pensionAnnualJmd, calculationDate)
}