import type { TaxResult } from '../../features/tax/tax-types'
import { Card } from '../shared/Card'
import { TaxLineItem } from './TaxLineItem'

type TaxSummaryCardProps = {
  result: TaxResult | null
  unavailableReason: string | null
}

export function TaxSummaryCard({ result, unavailableReason }: TaxSummaryCardProps) {
  const content = result ? (
    <div data-testid="tax-summary-card">
      <TaxLineItem label="Gross annual income" value={result.grossAnnual} emphasize />
      <TaxLineItem label="NIS" value={result.nis} />
      <TaxLineItem label="NHT" value={result.nht} />
      <TaxLineItem label="Education tax" value={result.educationTax} />
      <TaxLineItem
        label="Total deductible contributions"
        value={result.totalDeductibleContributions}
      />
      <TaxLineItem label="Tax-free threshold" value={result.taxFreeThreshold} />
      <TaxLineItem label="Chargeable income" value={result.chargeableIncome} />
      <TaxLineItem label="Taxable income" value={result.taxableIncome} />
      <TaxLineItem label="Income tax" value={result.incomeTax} />
      <TaxLineItem label="Total deductions" value={result.totalDeductions} emphasize />
      <TaxLineItem label="Net annual income" value={result.netAnnual} emphasize />
      <TaxLineItem label="Net monthly income" value={result.netMonthly} />
      <TaxLineItem label="Net biweekly income" value={result.netBiweekly} />
    </div>
  ) : (
    <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
      {unavailableReason ?? 'Tax figures will appear once the salary inputs are valid.'}
    </p>
  )

  return (
    <>
      <div className="sm:hidden">
        <details className="border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)]" data-testid="tax-summary-mobile-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Tax summary</h2>
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 transition-transform duration-200 [&_details[open]_&]:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="mt-5">{content}</div>
        </details>
      </div>
      <div className="hidden sm:block">
        <Card
          title="Tax summary"
          description="Self-employed taxes are always calculated in JMD using the active configured rules."
        >
          {content}
        </Card>
      </div>
    </>
  )
}