import { useEffect, useState } from 'react'

type NumberFieldProps = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  error?: string
  hint?: string
}

function formatDraftValue(value: number): string {
  return Number.isFinite(value) ? String(value) : '0'
}

function sanitizeNumericDraft(rawValue: string): string {
  const cleaned = rawValue.replace(/[^\d.]/g, '')

  if (cleaned === '') {
    return ''
  }

  const [integerPartRaw, ...decimalParts] = cleaned.split('.')
  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, '')
  const normalizedInteger = integerPart === '' ? '0' : integerPart

  if (decimalParts.length === 0) {
    return normalizedInteger
  }

  return `${normalizedInteger}.${decimalParts.join('')}`
}

function clampValue(value: number, min?: number, max?: number): number {
  const lowerBound = min ?? Number.NEGATIVE_INFINITY
  const upperBound = max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(value, lowerBound), upperBound)
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  hint,
}: NumberFieldProps) {
  const [draftValue, setDraftValue] = useState(() => formatDraftValue(value))

  useEffect(() => {
    setDraftValue(formatDraftValue(value))
  }, [value])

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <input
        id={id}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
        type="text"
        inputMode="decimal"
        value={draftValue}
        onChange={(event) => {
          const sanitizedValue = sanitizeNumericDraft(event.currentTarget.value)
          setDraftValue(sanitizedValue)

          const nextValue = sanitizedValue === '' ? 0 : clampValue(Number(sanitizedValue), min, max)
          onChange(nextValue)
        }}
        onBlur={() => {
          const normalizedValue = clampValue(draftValue === '' ? 0 : Number(draftValue), min, max)
          onChange(normalizedValue)
          setDraftValue(formatDraftValue(normalizedValue))
        }}
        onKeyDown={(event) => {
          if (['-', '+', 'e', 'E'].includes(event.key)) {
            event.preventDefault()
          }
        }}
        pattern="[0-9]*[.]?[0-9]*"
        data-step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <span className="text-xs text-slate-500" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-medium text-rose-700" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}