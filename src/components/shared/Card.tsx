import type { PropsWithChildren, ReactNode } from 'react'

type CardProps = PropsWithChildren<{
  title: string
  description?: string
  descriptionTone?: 'default' | 'highlight'
  actions?: ReactNode
}>

export function Card({ title, description, descriptionTone = 'default', actions, children }: CardProps) {
  const descriptionClassName = descriptionTone === 'highlight'
    ? 'mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900'
    : 'mt-3 py-3 text-sm text-slate-600'

  return (
    <section className="border h-full border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)] sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description && <p className={descriptionClassName}>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}