import type { PropsWithChildren } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
}

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone
  dataTestId?: string
}>

export function Badge({ tone = 'neutral', dataTestId, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses[tone]}`}
      data-testid={dataTestId}
    >
      {children}
    </span>
  )
}