import type { ExchangeRates, SupportedCurrency } from '../../features/currency/currency-types'
import { getSupportedCurrencies } from '../../features/currency/currency-utils'
import { BREAKDOWN_SALARY_MODES } from '../../lib/constants'
import type {
  SalaryBreakdown,
  SalaryMode,
  VisibleSalarySections,
} from '../../features/salary/salary-types'
import { Card } from '../shared/Card'
import { SalaryRow } from './SalaryRow'

type SalaryBreakdownCardProps = {
  sourceCurrency: SupportedCurrency
  breakdown: SalaryBreakdown | null
  exchangeRates: ExchangeRates | null
  currencyOverrides: Partial<Record<SalaryMode, SupportedCurrency>>
  visibleSections: VisibleSalarySections
  onToggle: (section: SalaryMode) => void
  onCurrencyChange: (section: SalaryMode, currency: SupportedCurrency) => void
}

const supportedCurrencies = getSupportedCurrencies()

export function SalaryBreakdownCard({
  sourceCurrency,
  breakdown,
  exchangeRates,
  currencyOverrides,
  visibleSections,
  onToggle,
  onCurrencyChange,
}: SalaryBreakdownCardProps) {
  const visibleModes = BREAKDOWN_SALARY_MODES.filter((mode) => visibleSections[mode])
  const hiddenModes = BREAKDOWN_SALARY_MODES.filter((mode) => !visibleSections[mode])

  const content = (
    <div className="mt-2 grid gap-1">
      {breakdown ? (
        <>
          {visibleModes.map((mode) => (
            <SalaryRow
              key={mode}
              mode={mode}
              value={breakdown[mode]}
              sourceCurrency={sourceCurrency}
              displayCurrency={currencyOverrides[mode] ?? sourceCurrency}
              exchangeRates={exchangeRates}
              supportedCurrencies={supportedCurrencies}
              isLast={mode === visibleModes[visibleModes.length - 1]}
              onToggleVisibility={onToggle}
              onCurrencyChange={onCurrencyChange}
            />
          ))}

          {hiddenModes.length ? (
            <details className="group mt-4 border-t border-slate-200 pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Hidden ({hiddenModes.length})</span>
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="mt-3 grid gap-1 bg-slate-50/70 px-4 py-2">
                {hiddenModes.map((mode) => (
                  <SalaryRow
                    key={mode}
                    mode={mode}
                    value={breakdown[mode]}
                    sourceCurrency={sourceCurrency}
                    displayCurrency={currencyOverrides[mode] ?? sourceCurrency}
                    exchangeRates={exchangeRates}
                    supportedCurrencies={supportedCurrencies}
                    hidden
                    isLast={mode === hiddenModes[hiddenModes.length - 1]}
                    onToggleVisibility={onToggle}
                    onCurrencyChange={onCurrencyChange}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <p className="border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
          Correct the input values to see salary conversions.
        </p>
      )}
    </div>
  )

  return (
    <>
      <div className="sm:hidden">
        <details className="border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)]" data-testid="salary-breakdown-mobile-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Salary breakdown</h2>
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
          {content}
        </details>
      </div>
      <div className="hidden sm:block">
        <Card
          title="Salary breakdown"
          description="All salary periods normalize through annual pay, then convert back out."
        >
          {content}
        </Card>
      </div>
    </>
  )
}