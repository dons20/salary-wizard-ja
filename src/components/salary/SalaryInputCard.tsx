import { INPUT_SALARY_MODES } from '../../lib/constants'
import { getSupportedCurrencies } from '../../features/currency/currency-utils'
import type { SupportedCurrency } from '../../features/currency/currency-types'
import type { InputSalaryMode } from '../../features/salary/salary-types'
import { formatCurrencyNumber, formatNumberInputDraft, getCurrencySymbol } from '../../lib/format'
import type { SalaryValidationErrors } from '../../lib/validation'
import { NumberField } from '../shared/NumberField'
import { SelectField } from '../shared/SelectField'

type SalaryInputCardProps = {
  amount: number
  mode: InputSalaryMode
  currency: SupportedCurrency
  hoursPerWeek: number
  errors: SalaryValidationErrors
  onAmountChange: (value: number) => void
  onModeChange: (value: InputSalaryMode) => void
  onCurrencyChange: (value: SupportedCurrency) => void
  onHoursChange: (value: number) => void
}

export function SalaryInputCard(props: SalaryInputCardProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-1 py-4">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-3 text-3xl uppercase font-semibold tracking-tight text-slate-950">
          Salary
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your salary details below to see a breakdown of your income and taxes.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-3xl py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            id="salary-amount"
            label="Salary amount"
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
            label="Salary mode"
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
      </div>
    </section>
  )
}