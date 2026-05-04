import type { EmploymentStatus } from '../salary/salary-types'

export type TaxConfig = {
  effectiveFrom: string
  taxFreeThreshold: number
  nis: {
    rate: number
    annualCap: number
  }
  nht: {
    rate: number
  }
  educationTax: {
    rate: number
  }
  incomeTaxBands: Array<{
    upTo: number | null
    rate: number
  }>
}

export type TaxFreeThresholdBreakdown = {
  calendarYear: number
  janMarThreshold: number
  aprDecThreshold: number
  totalThreshold: number
}

export type TaxBandBreakdown = {
  taxableAmount: number
  rate: number
  tax: number
}

export type TaxResult = {
  employmentStatus: EmploymentStatus
  calendarYear: number
  grossAnnual: number
  contributionRates: {
    nis: number
    nht: number
    educationTax: number
  }
  nis: number
  pension: number
  nht: number
  educationTax: number
  totalContributions: number
  taxFreeThreshold: number
  taxFreeThresholdBreakdown: TaxFreeThresholdBreakdown
  statutoryIncome: number
  taxableIncome: number
  incomeTaxBandBreakdown: TaxBandBreakdown[]
  incomeTax: number
  totalDeductions: number
  netAnnual: number
  netMonthly: number
  netBiweekly: number
}