import { useEffect, useState } from 'react'

type InstallButtonProps = {
  className?: string
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallButton({ className = '' }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Install app"
      data-testid="install-app-button"
      className={`inline-flex items-center justify-center gap-1 rounded-full border border-slate-300/90 bg-white/92 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-[0_12px_30px_-20px_rgba(15,93,70,0.45)] backdrop-blur-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 lg:gap-1.5 lg:px-2.5 ${className}`.trim()}
      onClick={async () => {
        await deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setDeferredPrompt(null)
      }}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10 3v8" strokeLinecap="round" />
        <path d="m6.5 8.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 14.5h12" strokeLinecap="round" />
      </svg>
      <span className="hidden lg:inline text-[10px]">Install app</span>
    </button>
  )
}