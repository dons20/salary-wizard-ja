import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useShallow } from 'zustand/react/shallow'

import { Disclaimer } from './components/layout/Disclaimer'
import { Header } from './components/layout/Header'
import { SalaryInputCard } from './components/salary/SalaryInputCard'
import {
  convertCurrency,
  getRateTimestampLabel,
  isRateDataStale,
} from './features/currency/currency-utils'
import type { SupportedCurrency } from './features/currency/currency-types'
import { useExchangeRateStore } from './features/currency/exchange-rate-store'
import { usePreferencesStore } from './features/preferences/preferences-store'
import { useSalaryStore } from './features/salary/salary-store'
import {
  denormalizeFromAnnual,
  deriveSalaryBreakdown,
  normalizeBreakdownValueToAnnual,
  normalizePensionToAnnual,
  normalizeToAnnual,
} from './features/salary/salary-utils'
import { getActiveTaxConfig } from './features/tax/tax-config'
import { calculateTax } from './features/tax/tax-engine'
import { DEFAULT_DAYS_PER_WEEK } from './lib/constants'
import { formatExchangeRate } from './lib/format'
import { validateSalaryInput } from './lib/validation'

const InstallButton = lazy(() =>
  import('./components/pwa/InstallButton').then((module) => ({ default: module.InstallButton })),
)

const SalaryBreakdownCard = lazy(() =>
  import('./components/salary/SalaryBreakdownCard').then((module) => ({ default: module.SalaryBreakdownCard })),
)

const TaxSummaryCard = lazy(() =>
  import('./components/tax/TaxSummaryCard').then((module) => ({ default: module.TaxSummaryCard })),
)

const Footer = lazy(() =>
  import('./components/layout/Footer').then((module) => ({ default: module.Footer })),
)

function PendingCard({ title, lines = 3 }: { title: string; lines?: number }) {
  return (
    <div className="border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)] sm:rounded-[2rem]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <span className="h-2.5 w-16 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <div key={`${title}-${index}`} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

export function App() {
  const salary = useSalaryStore(
    useShallow((state) => ({
      amount: state.amount,
      mode: state.mode,
      currency: state.currency,
      employmentStatus: state.employmentStatus,
      hoursPerWeek: state.hoursPerWeek,
      specialOvertimeHours: state.specialOvertimeHours,
      pension: state.pension,
      pensionMode: state.pensionMode,
      setAmount: state.setAmount,
      setMode: state.setMode,
      setCurrency: state.setCurrency,
      setEmploymentStatus: state.setEmploymentStatus,
      setHoursPerWeek: state.setHoursPerWeek,
      setSpecialOvertimeHours: state.setSpecialOvertimeHours,
      setPension: state.setPension,
      setPensionMode: state.setPensionMode,
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

  const validationErrors = useMemo(
    () =>
      validateSalaryInput({
        amount: salary.amount,
        mode: salary.mode,
        currency: salary.currency,
        hoursPerWeek: salary.hoursPerWeek,
        specialOvertimeHours: salary.specialOvertimeHours,
        pension: salary.pension,
        pensionMode: salary.pensionMode,
      }),
    [
      salary.amount,
      salary.currency,
      salary.hoursPerWeek,
      salary.mode,
      salary.pension,
      salary.pensionMode,
      salary.specialOvertimeHours,
    ],
  )

  const hasValidationErrors = Object.keys(validationErrors).length > 0
  const derivedSalary = useMemo(() => {
    if (hasValidationErrors) {
      return {
        annualPension: null,
        annualSalary: null,
        breakdown: null,
      }
    }

    const annualSalary = normalizeToAnnual({
      amount: salary.amount,
      mode: salary.mode,
      hoursPerWeek: salary.hoursPerWeek,
      daysPerWeek: DEFAULT_DAYS_PER_WEEK,
      specialOvertimeHours: salary.specialOvertimeHours,
      pension: salary.pension,
      pensionMode: salary.pensionMode,
    })

    return {
      annualPension: normalizePensionToAnnual(
        {
          amount: salary.amount,
          mode: salary.mode,
          hoursPerWeek: salary.hoursPerWeek,
          daysPerWeek: DEFAULT_DAYS_PER_WEEK,
          specialOvertimeHours: salary.specialOvertimeHours,
          pension: salary.pension,
          pensionMode: salary.pensionMode,
        },
        annualSalary,
      ),
      annualSalary,
      breakdown: deriveSalaryBreakdown(annualSalary, salary.hoursPerWeek, DEFAULT_DAYS_PER_WEEK),
    }
  }, [
    hasValidationErrors,
    salary.amount,
    salary.hoursPerWeek,
    salary.mode,
    salary.pension,
    salary.pensionMode,
    salary.specialOvertimeHours,
  ])

  const { annualPension, breakdown } = derivedSalary

  const { taxResult, taxUnavailableReason } = useMemo(() => {
    if (!breakdown) {
      return {
        taxResult: null,
        taxUnavailableReason: hasValidationErrors
          ? 'Fix the salary inputs to calculate taxes.'
          : null,
      }
    }

    try {
      const grossAnnualJmd =
        salary.currency === 'JMD'
          ? breakdown.annual
          : exchangeRates.rates
            ? convertCurrency(breakdown.annual, salary.currency, 'JMD', exchangeRates.rates)
            : null
      const pensionAnnualJmd =
        annualPension === null
          ? null
          : salary.currency === 'JMD'
            ? annualPension
            : exchangeRates.rates
              ? convertCurrency(annualPension, salary.currency, 'JMD', exchangeRates.rates)
              : null

      if (grossAnnualJmd === null || pensionAnnualJmd === null) {
        return {
          taxResult: null,
          taxUnavailableReason: 'Exchange rates are required to calculate taxes for non-JMD salaries.',
        }
      }

      return {
        taxResult: calculateTax(
          grossAnnualJmd,
          salary.employmentStatus,
          getActiveTaxConfig(new Date()),
          pensionAnnualJmd,
        ),
        taxUnavailableReason: null,
      }
    } catch (error) {
      return {
        taxResult: null,
        taxUnavailableReason: error instanceof Error ? error.message : 'Unable to calculate taxes.',
      }
    }
  }, [annualPension, breakdown, exchangeRates.rates, hasValidationErrors, salary.currency, salary.employmentStatus])

  const usingCachedRates = Boolean(exchangeRates.rates) && (!isOnline || exchangeRates.source === 'cached')
  const staleRates = isRateDataStale(exchangeRates.fetchedAt)
  const exchangeStatus = exchangeRates.isLoading && !exchangeRates.rates
    ? 'Loading rates'
    : usingCachedRates
      ? staleRates
        ? 'Using stale cached rates'
        : 'Using cached rates'
      : exchangeRates.rates
        ? 'Latest Rates'
        : 'Rates unavailable'
  const exchangeTone = exchangeRates.rates
    ? usingCachedRates
      ? 'warning'
      : 'success'
    : exchangeRates.error
      ? 'danger'
      : 'neutral'
  const foreignCurrency: SupportedCurrency = salary.currency === 'JMD' ? 'USD' : salary.currency
  const exchangeComparison = useMemo(() => {
    if (!exchangeRates.rates) {
      return null
    }

    const jmdRate = exchangeRates.rates.JMD
    const foreignRate = exchangeRates.rates[foreignCurrency]

    if (!jmdRate || !foreignRate) {
      return null
    }

    const oneJmdInForeign = foreignRate / jmdRate
    const oneForeignInJmd = jmdRate / foreignRate

    return `1 JMD = ${formatExchangeRate(oneJmdInForeign)} ${foreignCurrency} ↔ 1 ${foreignCurrency} = ${formatExchangeRate(oneForeignInJmd)} JMD`
  }, [exchangeRates.rates, foreignCurrency])

  const handleBreakdownValueChange = (mode: Parameters<typeof normalizeBreakdownValueToAnnual>[1], value: number, currency: typeof salary.currency) => {
    const normalizedValue = currency === salary.currency
      ? value
      : exchangeRates.rates
        ? convertCurrency(value, currency, salary.currency, exchangeRates.rates)
        : null

    if (normalizedValue === null) {
      return
    }

    const annualValue = normalizeBreakdownValueToAnnual(
      normalizedValue,
      mode,
      salary.hoursPerWeek,
      DEFAULT_DAYS_PER_WEEK,
    )

    salary.setAmount(
      denormalizeFromAnnual(
        annualValue,
        salary.mode,
        salary.hoursPerWeek,
        DEFAULT_DAYS_PER_WEEK,
        salary.specialOvertimeHours,
      ),
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col gap-8 bg-white px-4 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <InstallButton className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4 lg:right-8 lg:top-8" />
      </Suspense>
      <Header
        isOnline={isOnline}
        exchangeTone={exchangeTone}
        exchangeStatus={exchangeStatus}
        exchangeTimestamp={getRateTimestampLabel(exchangeRates.fetchedAt)}
        exchangeComparison={exchangeComparison}
        showUpdateBanner={needRefresh[0]}
        onUpdateApp={() => void updateServiceWorker(true)}
      />

      <SalaryInputCard
        amount={salary.amount}
        mode={salary.mode}
        currency={salary.currency}
        employmentStatus={salary.employmentStatus}
        hoursPerWeek={salary.hoursPerWeek}
        specialOvertimeHours={salary.specialOvertimeHours}
        pension={salary.pension}
        pensionMode={salary.pensionMode}
        errors={validationErrors}
        onAmountChange={salary.setAmount}
        onModeChange={salary.setMode}
        onCurrencyChange={salary.setCurrency}
        onEmploymentStatusChange={salary.setEmploymentStatus}
        onHoursChange={salary.setHoursPerWeek}
        onSpecialOvertimeHoursChange={salary.setSpecialOvertimeHours}
        onPensionChange={salary.setPension}
        onPensionModeChange={salary.setPensionMode}
      />

      <div className="h-0.5 w-full bg-[linear-gradient(90deg,rgba(148,163,184,0.18),rgba(100,116,139,0.82),rgba(148,163,184,0.18))]" />

      <Disclaimer />

      <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <Suspense fallback={<PendingCard title="Salary breakdown" lines={4} />}>
            <SalaryBreakdownCard
              sourceCurrency={salary.currency}
              breakdown={breakdown}
              exchangeRates={exchangeRates.rates}
              currencyOverrides={preferences.breakdownCurrencies}
              visibleSections={preferences.visibleSalarySections}
              onToggle={preferences.toggleSectionVisibility}
              onCurrencyChange={preferences.setBreakdownCurrency}
              onValueChange={handleBreakdownValueChange}
            />
          </Suspense>
        </div>

        <div className="grid gap-6">
          <Suspense fallback={<PendingCard title="Tax summary" lines={5} />}>
            <TaxSummaryCard
              employmentStatus={salary.employmentStatus}
              hoursPerWeek={salary.hoursPerWeek}
              result={taxResult}
              unavailableReason={taxUnavailableReason}
            />
          </Suspense>
        </div>
      </main>

      <section className="flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          data-testid="reset-salary-button"
          onClick={salary.reset}
        >
          Reset salary defaults
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          data-testid="reset-preferences-button"
          onClick={preferences.resetPreferences}
        >
          Reset visibility defaults
        </button>
      </section>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}