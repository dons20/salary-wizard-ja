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

export type TaxResult = {
  grossAnnual: number
  nis: number
  nht: number
  educationTax: number
  totalDeductibleContributions: number
  taxFreeThreshold: number
  chargeableIncome: number
  taxableIncome: number
  incomeTax: number
  totalDeductions: number
  netAnnual: number
  netMonthly: number
  netBiweekly: number
}