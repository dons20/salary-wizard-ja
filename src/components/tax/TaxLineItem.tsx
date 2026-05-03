import { formatMoney } from '../../lib/format'

type TaxLineItemProps = {
  label: string
  value: number
  emphasize?: boolean
}

export function TaxLineItem({ label, value, emphasize = false }: TaxLineItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-200 py-3 last:border-b-0">
      <span className={`text-sm ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-sm ${emphasize ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
        {formatMoney(value, 'JMD')}
      </span>
    </div>
  )
}