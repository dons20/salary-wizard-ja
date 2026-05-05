import { useEffect, useId, useRef, useState } from 'react'

const HINT_OFFSET = 8
const VIEWPORT_PADDING = 12
const MOBILE_HINT_WIDTH = 200
const DESKTOP_HINT_WIDTH = 256

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
  disabled?: boolean
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

function clampDraftValue(draftValue: string, min?: number, max?: number): string {
  if (draftValue === '' || draftValue.endsWith('.')) {
    return draftValue
  }

  const numericValue = Number(draftValue)

  if (!Number.isFinite(numericValue)) {
    return draftValue
  }

  const clampedValue = clampValue(numericValue, min, max)

  return clampedValue === numericValue ? draftValue : formatDraftValue(clampedValue)
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

function getHintWidthBounds() {
  const maxWidth = Math.max(160, window.innerWidth - VIEWPORT_PADDING * 2)
  const preferredWidth = window.innerWidth < 640 ? MOBILE_HINT_WIDTH : DESKTOP_HINT_WIDTH

  return {
    width: Math.min(preferredWidth, maxWidth),
    maxWidth,
  }
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
  disabled = false,
  labelClassName,
  inputClassName,
}: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintButtonRef = useRef<HTMLButtonElement>(null)
  const hintContainerRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const [draftValue, setDraftValue] = useState(() => formatDraftValue(value))
  const [isFocused, setIsFocused] = useState(false)
  const [isHintOpen, setIsHintOpen] = useState(false)
  const [pendingSelectionStart, setPendingSelectionStart] = useState<number | null>(null)
  const [hintStyle, setHintStyle] = useState<{ top: number; left: number; width: number; maxWidth: number } | null>(null)
  const hintId = useId()
  const isLocked = readOnly || disabled
  const isEditing = isFocused && !isLocked

  useEffect(() => {
    if (pendingSelectionStart === null || !inputRef.current) {
      return
    }

    inputRef.current.setSelectionRange(pendingSelectionStart, pendingSelectionStart)
    setPendingSelectionStart(null)
  }, [draftValue, pendingSelectionStart])

  useEffect(() => {
    if (!isHintOpen) {
      return
    }

    function updateHintPosition() {
      if (!hintButtonRef.current || !hintRef.current || !hintContainerRef.current) {
        return
      }

      const containerRect = hintContainerRef.current.getBoundingClientRect()
      const buttonRect = hintButtonRef.current.getBoundingClientRect()
      const tooltipRect = hintRef.current.getBoundingClientRect()
      const { width, maxWidth } = getHintWidthBounds()
      const preferredLeft = 0
      const minLeft = VIEWPORT_PADDING - containerRect.left
      const maxLeft = window.innerWidth - VIEWPORT_PADDING - containerRect.left - width
      const left = Math.min(
        Math.max(minLeft, preferredLeft),
        maxLeft,
      )
      const buttonTop = buttonRect.top - containerRect.top
      const preferredTop = buttonTop - tooltipRect.height - HINT_OFFSET
      const fallbackTop = buttonTop + buttonRect.height + HINT_OFFSET
      const top = buttonRect.top - tooltipRect.height - HINT_OFFSET >= VIEWPORT_PADDING
        ? preferredTop
        : fallbackTop

      setHintStyle({
        top,
        left,
        width,
        maxWidth,
      })
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!hintContainerRef.current?.contains(event.target as Node)) {
        setIsHintOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsHintOpen(false)
      }
    }

    updateHintPosition()
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updateHintPosition)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updateHintPosition)
    }
  }, [isHintOpen])

  useEffect(() => {
    if (!hint || disabled) {
      setIsHintOpen(false)
      setHintStyle(null)
    }
  }, [disabled, hint])

  const displayValue = isEditing
    ? formatInputValue
      ? formatInputValue(draftValue)
      : draftValue
    : emptyWhenZero && value === 0
      ? ''
      : formatDisplayValue
        ? formatDisplayValue(value)
        : draftValue

  return (
    <div className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${labelClassName ?? ''}`.trim()}>
      <div className="flex items-center gap-2">
        <label className={hideLabel ? 'sr-only' : undefined} htmlFor={id}>
          {label}
        </label>
        {hint ? (
          <div className="relative" ref={hintContainerRef}>
            <button
              ref={hintButtonRef}
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-500 transition hover:border-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              aria-label={`Show hint for ${label}`}
              aria-expanded={isHintOpen}
              aria-describedby={isHintOpen ? hintId : undefined}
              onClick={() => {
                setIsHintOpen((currentValue) => !currentValue)
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
            {isHintOpen ? (
              <div
                className="absolute z-10 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium leading-5 text-slate-600 shadow-lg"
                id={hintId}
                role="tooltip"
                ref={hintRef}
                style={
                  hintStyle
                    ? {
                        top: hintStyle.top,
                        left: hintStyle.left,
                        width: hintStyle.width,
                        maxWidth: hintStyle.maxWidth,
                      }
                    : { visibility: 'hidden', ...getHintWidthBounds() }
                }
              >
                {hint}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
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
          className={`w-full rounded-2xl border border-slate-200 bg-white py-3 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 ${leadingAdornment ? 'pl-11 pr-4' : 'px-4'} ${readOnly ? 'cursor-default bg-slate-50 text-slate-600' : ''} ${disabled ? 'cursor-not-allowed select-none border-slate-200 bg-slate-100 text-slate-500 focus:border-slate-200 focus:ring-0' : ''} ${inputClassName ?? ''}`.trim()}
          type="text"
          inputMode="decimal"
          readOnly={readOnly}
          disabled={disabled}
          value={displayValue}
          onFocus={() => {
            if (isLocked) {
              return
            }

            setDraftValue(emptyWhenZero && value === 0 ? '' : formatDraftValue(value))
            setIsFocused(true)
          }}
          onChange={(event) => {
            if (isLocked) {
              return
            }

            const selectionStart = event.currentTarget.selectionStart ?? event.currentTarget.value.length
            const meaningfulCount = countMeaningfulCharacters(
              event.currentTarget.value.slice(0, selectionStart),
            )
            const sanitizedValue = sanitizeNumericDraft(event.currentTarget.value, maxFractionDigits)
            const clampedDraftValue = clampDraftValue(sanitizedValue, min, max)
            setDraftValue(clampedDraftValue)

            if (formatInputValue) {
              const nextDisplayValue = formatInputValue(clampedDraftValue)
              setPendingSelectionStart(
                getCaretPositionFromMeaningfulCount(nextDisplayValue, meaningfulCount),
              )
            }

            const nextValue = clampedDraftValue === '' ? 0 : clampValue(Number(clampedDraftValue), min, max)
            onChange(nextValue)
          }}
          onBlur={() => {
            if (isLocked) {
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
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error ? (
        <span className="text-xs font-medium text-rose-700" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  )
}