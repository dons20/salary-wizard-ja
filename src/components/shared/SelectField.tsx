import { useEffect, useRef, useState } from 'react'

type Option<T extends string> = {
  value: T
  label: string
}

type SelectFieldProps<T extends string> = {
  id: string
  label: string
  value: T
  onChange: (value: T) => void
  options: Array<Option<T>>
  error?: string
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: SelectFieldProps<T>) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (nextValue: T) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span id={`${id}-label`}>{label}</span>
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          id={id}
          className="flex w-full cursor-pointer list-none select-none items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)] outline-none transition hover:border-slate-300 focus-visible:border-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-100"
          aria-invalid={Boolean(error)}
          aria-labelledby={`${id}-label ${id}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-expanded={isOpen}
          data-testid={`${id}-trigger`}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span>{selectedOption?.label ?? value}</span>
          <span className="pointer-events-none text-slate-500" aria-hidden="true">
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        {isOpen ? (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/8">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                data-testid={`${id}-option-${option.value}`}
                className={`flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${option.value === value ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs font-medium text-rose-700" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  )
}