import { useState } from 'react'

import type { EmploymentStatus } from '../../features/salary/salary-types'
import type { TaxResult } from '../../features/tax/tax-types'
import { DEFAULT_DAYS_PER_WEEK, WEEKS_PER_YEAR } from '../../lib/constants'
import { formatMoney, formatPercentage } from '../../lib/format'
import { Card } from '../shared/Card'
import { TaxLineItem } from './TaxLineItem'

type TaxSummaryCardProps = {
  employmentStatus: EmploymentStatus
  hoursPerWeek: number
  result: TaxResult | null
  unavailableReason: string | null
}

function getEmploymentStatusLabel(employmentStatus: EmploymentStatus) {
  return employmentStatus === 'employee' ? 'Employee' : 'Self Employed'
}

export function TaxSummaryCard({ employmentStatus, hoursPerWeek, result, unavailableReason }: TaxSummaryCardProps) {
  const [showMoreNetPeriods, setShowMoreNetPeriods] = useState(false)
  const calendarYear = result?.calendarYear ?? new Date().getFullYear()
  const statusMessage = `You are now seeing your ${getEmploymentStatusLabel(employmentStatus)} tax estimates calculated in JMD for calendar year ${calendarYear}.`
  const hasTaxableIncome = Boolean(result?.incomeTaxBandBreakdown.length)
  const extraNetPeriods = result
    ? {
        biweekly: result.netBiweekly,
        weekly: result.netAnnual / WEEKS_PER_YEAR,
        daily: result.netAnnual / (DEFAULT_DAYS_PER_WEEK * WEEKS_PER_YEAR),
        hourly: result.netAnnual / (hoursPerWeek * WEEKS_PER_YEAR),
      }
    : null
  const taxableIncomeDetail = hasTaxableIncome && result
    ? result.incomeTaxBandBreakdown.map((band) => (
        <p key={`taxable-${band.rate}`}>
          {formatMoney(band.taxableAmount, 'JMD')} at {formatPercentage(band.rate)}
        </p>
      ))
    : undefined
  const incomeTaxDetail = hasTaxableIncome && result
    ? result.incomeTaxBandBreakdown.map((band) => (
        <p key={`income-tax-${band.rate}`}>
          {formatMoney(band.tax, 'JMD')} on {formatMoney(band.taxableAmount, 'JMD')} at {formatPercentage(band.rate)}
        </p>
      ))
    : undefined
  const previousFiscalYearLabel = result ? `${result.calendarYear - 1}-${result.calendarYear}` : null
  const currentFiscalYearLabel = result ? `${result.calendarYear}-${result.calendarYear + 1}` : null
  const previousFiscalYearMonthlyThreshold = result ? result.taxFreeThresholdBreakdown.janMarThreshold / 3 : null
  const currentFiscalYearMonthlyThreshold = result ? result.taxFreeThresholdBreakdown.aprDecThreshold / 9 : null
  const taxFreeThresholdDetail = result
    ? (
        <>
          <p>Jan-Mar: {formatMoney(result.taxFreeThresholdBreakdown.janMarThreshold, 'JMD')}</p>
          <p>Apr-Dec: {formatMoney(result.taxFreeThresholdBreakdown.aprDecThreshold, 'JMD')}</p>
          <p>Calendar year {result.calendarYear}: {formatMoney(result.taxFreeThresholdBreakdown.totalThreshold, 'JMD')}</p>
          <br />
          <p>
            The split exists because the tax-free threshold changed between last fiscal year ({previousFiscalYearLabel}) and this fiscal year ({currentFiscalYearLabel}).
          </p>
          <p>Fiscal year {previousFiscalYearLabel}: {formatMoney(previousFiscalYearMonthlyThreshold ?? 0, 'JMD')} per month</p>
          <p>Fiscal year {currentFiscalYearLabel}: {formatMoney(currentFiscalYearMonthlyThreshold ?? 0, 'JMD')} per month</p>
        </>
      )
    : undefined

  const content = (
    <div className="grid gap-4" data-testid="tax-summary-card">
      {result ? (
        <div>
          <TaxLineItem label="Gross annual income" value={result.grossAnnual} emphasize />
          <TaxLineItem
            label={`NIS (${formatPercentage(result.contributionRates.nis)})`}
            value={result.nis}
          />
          {result.pension > 0 ? <TaxLineItem label="Pension" value={result.pension} /> : null}
          <TaxLineItem
            label={`NHT (${formatPercentage(result.contributionRates.nht)})`}
            value={result.nht}
          />
          <TaxLineItem
            label={`Education tax (${formatPercentage(result.contributionRates.educationTax)})`}
            value={result.educationTax}
          />
          <TaxLineItem
            label="Total contributions"
            value={result.totalContributions}
          />
          <TaxLineItem
            label="Tax-free threshold"
            value={result.taxFreeThreshold}
            detail={taxFreeThresholdDetail}
            dataTestId="tax-line-item-tax-free-threshold"
          />
          <TaxLineItem label="Statutory income" value={result.statutoryIncome} />
          <TaxLineItem
            label="Taxable income"
            value={result.taxableIncome}
            detail={taxableIncomeDetail}
            dataTestId="tax-line-item-taxable-income"
          />
          <TaxLineItem
            label="Income tax"
            value={result.incomeTax}
            detail={incomeTaxDetail}
            dataTestId="tax-line-item-income-tax"
          />
          <TaxLineItem label="Total deductions" value={result.totalDeductions} emphasize />
          <TaxLineItem label="Net annual income" value={result.netAnnual} emphasize />
          <TaxLineItem label="Net monthly income" value={result.netMonthly} />
          {showMoreNetPeriods && extraNetPeriods ? (
            <>
              <TaxLineItem label="Net biweekly income" value={extraNetPeriods.biweekly} />
              <TaxLineItem label="Net weekly income" value={extraNetPeriods.weekly} />
              <TaxLineItem label="Net daily income" value={extraNetPeriods.daily} />
              <TaxLineItem label="Net hourly income" value={extraNetPeriods.hourly} />
            </>
          ) : null}
          <div className="flex justify-center pt-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
              data-testid="tax-summary-view-more-toggle"
              onClick={() => setShowMoreNetPeriods((current) => !current)}
            >
              <span>{showMoreNetPeriods ? 'View Less' : 'View More'}</span>
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition-transform duration-200 ${showMoreNetPeriods ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
          {unavailableReason ?? 'Tax figures will appear once the salary inputs are valid.'}
        </p>
      )}
    </div>
  )

  return (
    <>
      <div className="sm:hidden">
        <details className="group border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)]" data-testid="tax-summary-mobile-card" open>
          <summary className="relative list-none cursor-pointer">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Tax summary</h2>
              <p className="mt-3 hidden rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 group-open:block" data-testid="tax-summary-status-message">
                {statusMessage}
              </p>
            </div>
            <svg
              viewBox="0 0 20 20"
              className="absolute right-0 top-1 h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
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
      <div className="hidden sm:block" data-testid="tax-summary-desktop-card">
        <Card title="Tax summary" description={statusMessage} descriptionTone="highlight">
          {content}
        </Card>
      </div>
    </>
  )
}