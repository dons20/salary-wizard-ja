import { APP_NAME } from '../../lib/constants'
import { Badge } from '../shared/Badge'
import { NetworkStatusBadge } from '../pwa/NetworkStatusBadge'

type HeaderProps = {
  isOnline: boolean
  exchangeTone: 'neutral' | 'success' | 'warning' | 'danger'
  exchangeStatus: string
  exchangeTimestamp: string
  showUpdateBanner: boolean
  onUpdateApp: () => void
}

export function Header({
  isOnline,
  exchangeTone,
  exchangeStatus,
  exchangeTimestamp,
  showUpdateBanner,
  onUpdateApp,
}: HeaderProps) {
  return (
    <header className="-mx-4 space-y-5 sm:-mx-6 lg:-mx-8">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(167,243,208,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(110,231,183,0.16),transparent_30%),linear-gradient(135deg,#0b3d2e_0%,#0f5d46_46%,#16624b_100%)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(209,250,229,0.35),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,243,208,0.28),transparent)]" />
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="rounded-full border px-4 py-1.5 text-sm font-medium text-white/92 sm:text-base">
            Jamaica's first comprehensive earnings calculator
          </p>
          <p className="max-w-2xl text-sm leading-6 text-white/86 sm:text-base">
            Calculate your earnings and taxes across multiple currencies instantly!
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">
          <NetworkStatusBadge online={isOnline} />
          <Badge tone={exchangeTone}>{exchangeStatus}</Badge>
          <span className="text-xs text-white/72" aria-live="polite">
            {exchangeTimestamp}
          </span>
        </div>
      </div>

      {showUpdateBanner ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p>A newer version is ready. Refresh once to apply the latest cached app shell.</p>
          <button
            type="button"
            className="rounded-full bg-amber-500 px-4 py-2 font-semibold text-white transition hover:bg-amber-600"
            onClick={onUpdateApp}
          >
            Update app
          </button>
        </div>
      ) : null}
    </header>
  )
}