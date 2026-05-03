import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useShallow } from 'zustand/react/shallow'

import { Disclaimer, Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { InstallButton } from './components/pwa/InstallButton'
import { SalaryBreakdownCard } from './components/salary/SalaryBreakdownCard'
import { SalaryInputCard } from './components/salary/SalaryInputCard'
import { TaxSummaryCard } from './components/tax/TaxSummaryCard'
import {
  convertCurrency,
  getRateTimestampLabel,
  isRateDataStale,
} from './features/currency/currency-utils'
import { useExchangeRateStore } from './features/currency/exchange-rate-store'
import { usePreferencesStore } from './features/preferences/preferences-store'
import { useSalaryStore } from './features/salary/salary-store'
import { deriveSalaryBreakdown, normalizeToAnnual } from './features/salary/salary-utils'
import { getActiveTaxConfig } from './features/tax/tax-config'
import { calculateSelfEmployedTax } from './features/tax/tax-engine'
import { DEFAULT_DAYS_PER_WEEK } from './lib/constants'
import { validateSalaryInput } from './lib/validation'

export function App() {
  const salary = useSalaryStore(
    useShallow((state) => ({
      amount: state.amount,
      mode: state.mode,
      currency: state.currency,
      hoursPerWeek: state.hoursPerWeek,
      setAmount: state.setAmount,
      setMode: state.setMode,
      setCurrency: state.setCurrency,
      setHoursPerWeek: state.setHoursPerWeek,
      reset: state.reset,
    })),
  )
  const preferences = usePreferencesStore(
    useShallow((state) => ({
      visibleSalarySections: state.visibleSalarySections,
      breakdownCurrencies: state.breakdownCurrencies,
      toggleSectionVisibility: state.toggleSectionVisibility,
      setBreakdownCurrency: state.setBreakdownCurrency,
      resetPreferences: state.resetPreferences,
    })),
  )
  const exchangeRates = useExchangeRateStore(
    useShallow((state) => ({
      rates: state.rates,
      fetchedAt: state.fetchedAt,
      isLoading: state.isLoading,
      error: state.error,
      source: state.source,
      refreshRates: state.refreshRates,
    })),
  )
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const { needRefresh, updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    const updateNetworkState = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateNetworkState)
    window.addEventListener('offline', updateNetworkState)

    return () => {
      window.removeEventListener('online', updateNetworkState)
      window.removeEventListener('offline', updateNetworkState)
    }
  }, [])

  const validationErrors = validateSalaryInput({
    amount: salary.amount,
    mode: salary.mode,
    currency: salary.currency,
    hoursPerWeek: salary.hoursPerWeek,
  })

  const hasValidationErrors = Object.keys(validationErrors).length > 0
  const annualSalary = hasValidationErrors
    ? null
    : normalizeToAnnual({
        amount: salary.amount,
        mode: salary.mode,
        hoursPerWeek: salary.hoursPerWeek,
        daysPerWeek: DEFAULT_DAYS_PER_WEEK,
      })
  const breakdown =
    annualSalary === null
      ? null
      : deriveSalaryBreakdown(annualSalary, salary.hoursPerWeek, DEFAULT_DAYS_PER_WEEK)

  let taxUnavailableReason: string | null = null
  let taxResult = null

  if (breakdown) {
    try {
      const grossAnnualJmd =
        salary.currency === 'JMD'
          ? breakdown.annual
          : exchangeRates.rates
            ? convertCurrency(breakdown.annual, salary.currency, 'JMD', exchangeRates.rates)
            : null

      if (grossAnnualJmd === null) {
        taxUnavailableReason = 'Exchange rates are required to calculate taxes for non-JMD salaries.'
      } else {
        taxResult = calculateSelfEmployedTax(grossAnnualJmd, getActiveTaxConfig(new Date()))
      }
    } catch (error) {
      taxUnavailableReason = error instanceof Error ? error.message : 'Unable to calculate taxes.'
    }
  }

  if (!taxResult && hasValidationErrors) {
    taxUnavailableReason = 'Fix the salary inputs to calculate taxes.'
  }

  const usingCachedRates = Boolean(exchangeRates.rates) && (!isOnline || exchangeRates.source === 'cached')
  const staleRates = isRateDataStale(exchangeRates.fetchedAt)
  const exchangeStatus = exchangeRates.isLoading && !exchangeRates.rates
    ? 'Loading rates'
    : usingCachedRates
      ? staleRates
        ? 'Using stale cached rates'
        : 'Using cached rates'
      : exchangeRates.rates
        ? 'Live rates'
        : 'Rates unavailable'
  const exchangeTone = exchangeRates.rates
    ? usingCachedRates
      ? 'warning'
      : 'success'
    : exchangeRates.error
      ? 'danger'
      : 'neutral'

  return (
    <div className="relative flex min-h-screen w-full flex-col gap-8 bg-white px-4 sm:px-6 lg:px-8">
      <InstallButton className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4 lg:right-8 lg:top-8" />
      <Header
        isOnline={isOnline}
        exchangeTone={exchangeTone}
        exchangeStatus={exchangeStatus}
        exchangeTimestamp={getRateTimestampLabel(exchangeRates.fetchedAt)}
        showUpdateBanner={needRefresh[0]}
        onUpdateApp={() => void updateServiceWorker(true)}
      />

      <SalaryInputCard
        amount={salary.amount}
        mode={salary.mode}
        currency={salary.currency}
        hoursPerWeek={salary.hoursPerWeek}
        errors={validationErrors}
        onAmountChange={salary.setAmount}
        onModeChange={salary.setMode}
        onCurrencyChange={salary.setCurrency}
        onHoursChange={salary.setHoursPerWeek}
      />

      <div className="h-[2px] w-full bg-[linear-gradient(90deg,rgba(148,163,184,0.18),rgba(100,116,139,0.82),rgba(148,163,184,0.18))]" />

      <Disclaimer />

      <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <SalaryBreakdownCard
            sourceCurrency={salary.currency}
            breakdown={breakdown}
            exchangeRates={exchangeRates.rates}
            currencyOverrides={preferences.breakdownCurrencies}
            visibleSections={preferences.visibleSalarySections}
            onToggle={preferences.toggleSectionVisibility}
            onCurrencyChange={preferences.setBreakdownCurrency}
          />
        </div>

        <div className="grid gap-6">
          <TaxSummaryCard result={taxResult} unavailableReason={taxUnavailableReason} />
        </div>
      </main>

      <section className="flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          onClick={() => void exchangeRates.refreshRates()}
        >
          {exchangeRates.isLoading ? 'Refreshing rates...' : 'Refresh exchange rates'}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          onClick={salary.reset}
        >
          Reset salary defaults
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          onClick={preferences.resetPreferences}
        >
          Reset visibility defaults
        </button>
      </section>

      <Footer />
    </div>
  )
}