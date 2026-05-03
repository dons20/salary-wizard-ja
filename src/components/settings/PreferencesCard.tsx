import { BREAKDOWN_SALARY_MODES } from '../../lib/constants'
import type { VisibleSalarySections } from '../../features/salary/salary-types'
import { Card } from '../shared/Card'
import { Toggle } from '../shared/Toggle'

type PreferencesCardProps = {
  visibleSections: VisibleSalarySections
  onToggle: (section: keyof VisibleSalarySections) => void
  onResetSalary: () => void
  onResetPreferences: () => void
  onRefreshRates: () => void
  fetchedAt: string | null
  isLoadingRates: boolean
}

export function PreferencesCard({
  visibleSections,
  onToggle,
  onResetSalary,
  onResetPreferences,
  onRefreshRates,
  fetchedAt,
  isLoadingRates,
}: PreferencesCardProps) {
  return (
    <Card title="Preferences" description="Persisted locally on this device.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {BREAKDOWN_SALARY_MODES.map((mode) => (
          <Toggle
            key={mode}
            id={`preference-${mode}`}
            label={`Show ${mode}`}
            checked={visibleSections[mode]}
            onChange={() => onToggle(mode)}
            dataTestId={`preference-toggle-${mode}`}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          data-testid="refresh-rates-button"
          onClick={onRefreshRates}
        >
          {isLoadingRates ? 'Refreshing rates...' : 'Refresh exchange rates'}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          data-testid="reset-salary-button"
          onClick={onResetSalary}
        >
          Reset salary defaults
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          data-testid="reset-preferences-button"
          onClick={onResetPreferences}
        >
          Reset visibility defaults
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {fetchedAt ? `Most recent rates: ${fetchedAt}` : 'No cached exchange rates yet.'}
      </p>
    </Card>
  )
}