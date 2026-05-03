import type { PropsWithChildren, ReactNode } from 'react'

type CardProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function Card({ title, description, actions, children }: CardProps) {
  return (
    <section className="border h-full border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_54px_-40px_rgba(15,93,70,0.45)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}