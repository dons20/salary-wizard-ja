import { parseIsoDate } from '../../lib/dates'
import { roundTo } from '../../lib/math'
import type { TaxConfig } from './tax-types'

export const TAX_CONFIGS: TaxConfig[] = [
  {
    effectiveFrom: '2025-04-01',
    taxFreeThreshold: 1799376,
    nis: { rate: 0.06, annualCap: 5000000 },
    nht: { rate: 0.02 },
    educationTax: { rate: 0.0225 },
    incomeTaxBands: [
      { upTo: 6000000, rate: 0.25 },
      { upTo: null, rate: 0.3 },
    ],
  },
  {
    effectiveFrom: '2026-04-01',
    taxFreeThreshold: 1902360,
    nis: { rate: 0.06, annualCap: 5000000 },
    nht: { rate: 0.02 },
    educationTax: { rate: 0.0225 },
    incomeTaxBands: [
      { upTo: 6000000, rate: 0.25 },
      { upTo: null, rate: 0.3 },
    ],
  },
  {
    effectiveFrom: '2027-04-01',
    taxFreeThreshold: 2003496,
    nis: { rate: 0.06, annualCap: 5000000 },
    nht: { rate: 0.02 },
    educationTax: { rate: 0.0225 },
    incomeTaxBands: [
      { upTo: 6000000, rate: 0.25 },
      { upTo: null, rate: 0.3 },
    ],
  },
]

export function getActiveTaxConfig(date = new Date()): TaxConfig {
  const activeConfig = [...TAX_CONFIGS]
    .sort(
      (left, right) =>
        parseIsoDate(left.effectiveFrom).getTime() - parseIsoDate(right.effectiveFrom).getTime(),
    )
    .reduce<TaxConfig | null>((selected, config) => {
      if (parseIsoDate(config.effectiveFrom).getTime() <= date.getTime()) {
        return config
      }

      return selected
    }, null)

  return activeConfig ?? TAX_CONFIGS[0]
}

export function getCalendarYearTaxFreeThresholdBreakdown(date = new Date()) {
  const calendarYear = date.getFullYear()
  const janMarConfig = getActiveTaxConfig(new Date(Date.UTC(calendarYear, 0, 1)))
  const aprDecConfig = getActiveTaxConfig(new Date(Date.UTC(calendarYear, 3, 1)))
  const janMarThreshold = roundTo(janMarConfig.taxFreeThreshold * 0.25)
  const aprDecThreshold = roundTo(aprDecConfig.taxFreeThreshold * 0.75)

  return {
    calendarYear,
    janMarThreshold,
    aprDecThreshold,
    totalThreshold: roundTo(janMarThreshold + aprDecThreshold),
  }
}