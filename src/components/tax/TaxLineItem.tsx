import type { ReactNode } from 'react'

import { formatMoney } from '../../lib/format'

type TaxLineItemProps = {
  label: string
  value: number
  emphasize?: boolean
  detail?: ReactNode
  dataTestId?: string
}

export function TaxLineItem({ label, value, emphasize = false, detail, dataTestId }: TaxLineItemProps) {
  const labelClassName = `text-sm ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-600'}`
  const valueClassName = `text-sm ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-800'}`

  if (!detail) {
    return (
      <div
        className="flex items-center justify-between gap-4 border-b border-dashed border-slate-200 py-3 last:border-b-0"
        data-testid={dataTestId}
      >
        <span className={labelClassName}>{label}</span>
        <span className={valueClassName}>{formatMoney(value, 'JMD')}</span>
      </div>
    )
  }

  return (
    <details className="group border-b border-dashed border-slate-200 py-3 last:border-b-0" data-testid={dataTestId}>
      <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-2 py-1 transition hover:bg-slate-50 focus-visible:bg-slate-50">
        <span className={`${labelClassName} flex items-center gap-2`}>
          <span>{label}</span>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm"
            data-testid={dataTestId ? `${dataTestId}-info-icon` : undefined}
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
          </span>
        </span>
        <span className={valueClassName}>{formatMoney(value, 'JMD')}</span>
      </summary>
      <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
        {detail}
      </div>
    </details>
  )
}