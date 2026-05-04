import { EMPLOYMENT_STATUSES, INPUT_SALARY_MODES } from '../../lib/constants'
import { getSupportedCurrencies } from '../../features/currency/currency-utils'
import type { SupportedCurrency } from '../../features/currency/currency-types'
import type {
  EmploymentStatus,
  InputSalaryMode,
} from '../../features/salary/salary-types'
import {
  getRegularOvertimeHours,
  getTotalOvertimeHours,
} from '../../features/salary/salary-utils'
import { formatCurrencyNumber, formatNumberInputDraft, getCurrencySymbol } from '../../lib/format'
import type { SalaryValidationErrors } from '../../lib/validation'
import { NumberField } from '../shared/NumberField'
import { SelectField } from '../shared/SelectField'

type SalaryInputCardProps = {
  amount: number
  mode: InputSalaryMode
  currency: SupportedCurrency
  employmentStatus: EmploymentStatus
  hoursPerWeek: number
  specialOvertimeHours: number
  pension: number
  errors: SalaryValidationErrors
  onAmountChange: (value: number) => void
  onModeChange: (value: InputSalaryMode) => void
  onCurrencyChange: (value: SupportedCurrency) => void
  onEmploymentStatusChange: (value: EmploymentStatus) => void
  onHoursChange: (value: number) => void
  onSpecialOvertimeHoursChange: (value: number) => void
  onPensionChange: (value: number) => void
}

export function SalaryInputCard(props: SalaryInputCardProps) {
  const inputTerm = props.employmentStatus === 'employee' ? 'Salary' : 'Income'
  const totalOvertimeHours = getTotalOvertimeHours(props.hoursPerWeek)
  const regularOvertimeHours = getRegularOvertimeHours(
    props.hoursPerWeek,
    props.specialOvertimeHours,
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-1 py-4">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-3 text-3xl uppercase font-semibold tracking-tight text-slate-950">
          Salary
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your salary details below to see a breakdown of your income and taxes. All data is processed on your device and is never sent to any servers or exposed elsewhere.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-3xl py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            id="salary-amount"
            label={`${inputTerm} amount`}
            dataTestId="salary-amount-input"
            emptyWhenZero
            value={props.amount}
            onChange={props.onAmountChange}
            leadingAdornment={getCurrencySymbol(props.currency)}
            formatInputValue={formatNumberInputDraft}
            formatDisplayValue={formatCurrencyNumber}
            maxFractionDigits={2}
            min={0}
            step={0.01}
            error={props.errors.amount}
          />
          <NumberField
            id="salary-hours"
            label="Hours per week"
            dataTestId="salary-hours-input"
            value={props.hoursPerWeek}
            onChange={props.onHoursChange}
            min={1}
            max={168}
            step={0.5}
            error={props.errors.hoursPerWeek}
          />
          <SelectField
            id="salary-mode"
            label={`${inputTerm} mode`}
            value={props.mode}
            onChange={props.onModeChange}
            options={INPUT_SALARY_MODES.map((mode) => ({
              value: mode,
              label: mode.charAt(0).toUpperCase() + mode.slice(1),
            }))}
            error={props.errors.mode}
          />
          <SelectField
            id="salary-currency"
            label="Default Currency"
            value={props.currency}
            onChange={props.onCurrencyChange}
            options={getSupportedCurrencies().map((currency) => ({ value: currency, label: currency }))}
            error={props.errors.currency}
          />
        </div>

        <details className="group mt-4 rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-4" data-testid="salary-advanced-section">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Advanced</span>
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {totalOvertimeHours > 0 ? (
              <NumberField
                id="salary-overtime-hours"
                label="Overtime hours"
                dataTestId="salary-overtime-hours-input"
                value={regularOvertimeHours}
                onChange={() => undefined}
                min={0}
                step={0.5}
                readOnly
                hint="Calculated automatically from weekly hours above 40 after special overtime hours are deducted."
              />
            ) : null}
            {totalOvertimeHours > 0 ? (
              <NumberField
                id="salary-special-overtime-hours"
                label="Special overtime hours"
                dataTestId="salary-special-overtime-hours-input"
                value={props.specialOvertimeHours}
                onChange={props.onSpecialOvertimeHoursChange}
                min={0}
                max={totalOvertimeHours}
                step={0.5}
                error={props.errors.specialOvertimeHours}
                hint="These hours are paid at 2x instead of the regular overtime rate of 1.5x."
              />
            ) : null}
            <NumberField
              id="salary-pension"
              label="Pension"
              dataTestId="salary-pension-input"
              emptyWhenZero
              value={props.pension}
              onChange={props.onPensionChange}
              leadingAdornment={getCurrencySymbol(props.currency)}
              formatInputValue={formatNumberInputDraft}
              formatDisplayValue={formatCurrencyNumber}
              maxFractionDigits={2}
              min={0}
              step={0.01}
              error={props.errors.pension}
            />
            <SelectField
              id="salary-employment-status"
              label="Employment status"
              value={props.employmentStatus}
              onChange={props.onEmploymentStatusChange}
              options={EMPLOYMENT_STATUSES.map((employmentStatus) => ({
                value: employmentStatus,
                label: employmentStatus === 'self-employed' ? 'Self Employed' : 'Employee',
              }))}
            />
          </div>
        </details>
      </div>
    </section>
  )
}