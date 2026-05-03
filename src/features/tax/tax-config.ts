import { parseIsoDate } from '../../lib/dates'
import type { TaxConfig } from './tax-types'

export const TAX_CONFIGS: TaxConfig[] = [
  {
    effectiveFrom: '2024-04-01',
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