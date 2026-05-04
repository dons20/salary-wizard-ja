import { useEffect, useRef, useState } from 'react'

type NumberFieldProps = {
  id: string
  label: string
  hideLabel?: boolean
  dataTestId?: string
  emptyWhenZero?: boolean
  value: number
  onChange: (value: number) => void
  leadingAdornment?: string
  formatInputValue?: (value: string) => string
  formatDisplayValue?: (value: number) => string
  maxFractionDigits?: number
  min?: number
  max?: number
  step?: number
  error?: string
  hint?: string
  readOnly?: boolean
  labelClassName?: string
  inputClassName?: string
}

function formatDraftValue(value: number): string {
  return Number.isFinite(value) ? String(value) : '0'
}

function sanitizeNumericDraft(rawValue: string, maxFractionDigits?: number): string {
  const cleaned = rawValue.replace(/[^\d.]/g, '')

  if (cleaned === '') {
    return ''
  }

  const dotIndex = cleaned.indexOf('.')
  const normalizedValue =
    dotIndex === -1
      ? cleaned
      : `${cleaned.slice(0, dotIndex)}.${cleaned.slice(dotIndex + 1).replace(/\./g, '')}`

  const [integerPartRaw, decimalPartRaw = ''] = normalizedValue.split('.')
  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, '')
  const normalizedInteger = integerPart === '' ? '0' : integerPart
  const decimalPart =
    maxFractionDigits === undefined ? decimalPartRaw : decimalPartRaw.slice(0, maxFractionDigits)

  if (!normalizedValue.includes('.')) {
    return normalizedInteger
  }

  return `${normalizedInteger}.${decimalPart}`
}

function clampValue(value: number, min?: number, max?: number): number {
  const lowerBound = min ?? Number.NEGATIVE_INFINITY
  const upperBound = max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(value, lowerBound), upperBound)
}

function countMeaningfulCharacters(value: string): number {
  return value.replace(/[^\d.]/g, '').length
}

function getCaretPositionFromMeaningfulCount(value: string, meaningfulCount: number): number {
  if (meaningfulCount <= 0) {
    return 0
  }

  let seenCount = 0

  for (const [index, character] of Array.from(value).entries()) {
    if (/^[\d.]$/.test(character)) {
      seenCount += 1
    }

    if (seenCount >= meaningfulCount) {
      return index + 1
    }
  }

  return value.length
}

export function NumberField({
  id,
  label,
  hideLabel = false,
  dataTestId,
  emptyWhenZero = false,
  value,
  onChange,
  leadingAdornment,
  formatInputValue,
  formatDisplayValue,
  maxFractionDigits,
  min,
  max,
  step = 1,
  error,
  hint,
  readOnly = false,
  labelClassName,
  inputClassName,
}: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draftValue, setDraftValue] = useState(() => formatDraftValue(value))
  const [isFocused, setIsFocused] = useState(false)
  const [pendingSelectionStart, setPendingSelectionStart] = useState<number | null>(null)

  useEffect(() => {
    if (!isFocused || readOnly) {
      setDraftValue(formatDraftValue(value))
    }
  }, [value, isFocused, readOnly])

  useEffect(() => {
    if (pendingSelectionStart === null || !inputRef.current) {
      return
    }

    inputRef.current.setSelectionRange(pendingSelectionStart, pendingSelectionStart)
    setPendingSelectionStart(null)
  }, [draftValue, pendingSelectionStart])

  const displayValue = isFocused
    ? formatInputValue
      ? formatInputValue(draftValue)
      : draftValue
    : emptyWhenZero && value === 0
      ? ''
      : formatDisplayValue
        ? formatDisplayValue(value)
        : draftValue

  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${labelClassName ?? ''}`.trim()} htmlFor={id}>
      <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
      <div className="relative w-full">
        {leadingAdornment ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base font-semibold text-slate-500"
          >
            {leadingAdornment}
          </span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          className={`w-full rounded-2xl border border-slate-200 bg-white py-3 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 ${leadingAdornment ? 'pl-11 pr-4' : 'px-4'} ${readOnly ? 'cursor-default bg-slate-50 text-slate-600' : ''} ${inputClassName ?? ''}`.trim()}
          type="text"
          inputMode="decimal"
          readOnly={readOnly}
          value={displayValue}
          onFocus={() => {
            if (readOnly) {
              return
            }

            setDraftValue(emptyWhenZero && value === 0 ? '' : formatDraftValue(value))
            setIsFocused(true)
          }}
          onChange={(event) => {
            if (readOnly) {
              return
            }

            const selectionStart = event.currentTarget.selectionStart ?? event.currentTarget.value.length
            const meaningfulCount = countMeaningfulCharacters(
              event.currentTarget.value.slice(0, selectionStart),
            )
            const sanitizedValue = sanitizeNumericDraft(event.currentTarget.value, maxFractionDigits)
            setDraftValue(sanitizedValue)

            if (formatInputValue) {
              const nextDisplayValue = formatInputValue(sanitizedValue)
              setPendingSelectionStart(
                getCaretPositionFromMeaningfulCount(nextDisplayValue, meaningfulCount),
              )
            }

            const nextValue = sanitizedValue === '' ? 0 : clampValue(Number(sanitizedValue), min, max)
            onChange(nextValue)
          }}
          onBlur={() => {
            if (readOnly) {
              return
            }

            const normalizedValue = clampValue(draftValue === '' ? 0 : Number(draftValue), min, max)
            onChange(normalizedValue)
            setDraftValue(formatDraftValue(normalizedValue))
            setIsFocused(false)
          }}
          onKeyDown={(event) => {
            if (['-', '+', 'e', 'E'].includes(event.key)) {
              event.preventDefault()
            }
          }}
          pattern="[0-9]*[.]?[0-9]*"
          data-step={step}
          data-testid={dataTestId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
      </div>
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