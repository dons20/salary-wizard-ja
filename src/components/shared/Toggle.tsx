type ToggleProps = {
  id: string
  label: string
  checked: boolean
  onChange: () => void
  dataTestId?: string
}

export function Toggle({ id, label, checked, onChange, dataTestId }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="h-4 w-4 accent-emerald-700"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        data-testid={dataTestId}
      />
    </label>
  )
}