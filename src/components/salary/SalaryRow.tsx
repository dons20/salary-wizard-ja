import { useEffect, useRef, useState } from 'react'

import {
  convertCurrency,
} from '../../features/currency/currency-utils'
import { formatCurrencyNumber, formatNumberInputDraft, getCurrencySymbol } from '../../lib/format'
import type { ExchangeRates, SupportedCurrency } from '../../features/currency/currency-types'
import type { SalaryMode } from '../../features/salary/salary-types'
import { NumberField } from '../shared/NumberField'

type SalaryRowProps = {
  mode: SalaryMode
  value: number
  sourceCurrency: SupportedCurrency
  displayCurrency: SupportedCurrency
  exchangeRates: ExchangeRates | null
  supportedCurrencies: SupportedCurrency[]
  hidden?: boolean
  isLast?: boolean
  onToggleVisibility: (mode: SalaryMode) => void
  onCurrencyChange: (mode: SalaryMode, currency: SupportedCurrency) => void
  onValueChange: (mode: SalaryMode, value: number) => void
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" strokeLinecap="round" />
      <path d="M9.9 5.1A10.9 10.9 0 0 1 12 4.9c5.2 0 8.9 4.1 10 6.1a.8.8 0 0 1 0 .8 15.1 15.1 0 0 1-3.4 3.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.7 6.7A15.3 15.3 0 0 0 2 11a.8.8 0 0 0 0 .8c1.2 2 4.8 6.1 10 6.1 1.7 0 3.2-.4 4.6-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SalaryRow({
  mode,
  value,
  sourceCurrency,
  displayCurrency,
  exchangeRates,
  supportedCurrencies,
  hidden = false,
  isLast = false,
  onToggleVisibility,
  onCurrencyChange,
  onValueChange,
}: SalaryRowProps) {
  const currencyPickerRef = useRef<HTMLDivElement>(null)
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false)
  const convertedValue =
    displayCurrency === sourceCurrency
      ? value
      : exchangeRates
        ? convertCurrency(value, sourceCurrency, displayCurrency, exchangeRates)
        : null

  useEffect(() => {
    if (!isCurrencyMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!currencyPickerRef.current?.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCurrencyMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isCurrencyMenuOpen])

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    onCurrencyChange(mode, currency)
    setIsCurrencyMenuOpen(false)
  }

  const valueControl = convertedValue === null ? (
    <p className="text-sm font-semibold text-amber-700 text-right">Exchange rates required</p>
  ) : (
    <NumberField
      id={`salary-row-input-${mode}`}
      label={`${mode} salary amount`}
      hideLabel
      dataTestId={`salary-row-input-${mode}`}
      value={convertedValue}
      onChange={(nextValue) => onValueChange(mode, nextValue)}
      leadingAdornment={getCurrencySymbol(displayCurrency)}
      formatInputValue={formatNumberInputDraft}
      formatDisplayValue={formatCurrencyNumber}
      maxFractionDigits={2}
      min={0}
      step={0.01}
      labelClassName="gap-0"
      inputClassName="w-32 rounded-xl px-3 py-2 text-right text-base font-semibold sm:w-40 sm:text-lg"
    />
  )

  return (
    <div
      className={`flex flex-col items-start gap-2 px-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${isLast ? '' : 'border-b border-slate-200'} ${hidden ? 'opacity-75' : ''}`}
      data-testid={`${hidden ? 'hidden-' : ''}salary-row-${mode}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{mode}</p>
      </div>
      <div className="flex w-full items-center justify-between gap-3 pl-0 sm:w-auto sm:justify-end">
        {valueControl}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div ref={currencyPickerRef} className="relative inline-block">
            <button
              type="button"
              className="inline-flex cursor-pointer list-none select-none items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-200"
              aria-expanded={isCurrencyMenuOpen}
              data-testid={`salary-currency-trigger-${mode}`}
              onClick={() => setIsCurrencyMenuOpen((current) => !current)}
            >
              <span>{displayCurrency}</span>
              <svg
                viewBox="0 0 20 20"
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isCurrencyMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isCurrencyMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-10 min-w-28 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/8">
                {supportedCurrencies.map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    data-testid={`salary-currency-option-${mode}-${currency}`}
                    className={`flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${currency === displayCurrency ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'}`}
                    onClick={() => handleCurrencyChange(currency)}
                  >
                    <span>{currency}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center self-center p-2 text-slate-600/45 transition hover:text-slate-900"
            aria-label={`${hidden ? 'Show' : 'Hide'} ${mode}`}
            data-testid={`salary-visibility-toggle-${mode}`}
            onClick={() => onToggleVisibility(mode)}
          >
            <EyeIcon hidden={hidden} />
          </button>
        </div>
      </div>
    </div>
  )
}