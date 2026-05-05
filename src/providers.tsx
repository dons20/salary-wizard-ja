import { useEffect } from 'react'

import { App } from './App'
import { useExchangeRateStore } from './features/currency/exchange-rate-store'
import { usePreferencesStore } from './features/preferences/preferences-store'

function scheduleDeferredRefresh(callback: () => void) {
	if (typeof globalThis.requestIdleCallback === 'function') {
		const idleCallbackId = globalThis.requestIdleCallback(callback, { timeout: 1200 })
		return () => globalThis.cancelIdleCallback(idleCallbackId)
	}

	const timeoutId = globalThis.setTimeout(callback, 150)
	return () => globalThis.clearTimeout(timeoutId)
}

export function Bootstrap() {
	const loadPreferences = usePreferencesStore((state) => state.loadPreferences)
	const loadCachedRates = useExchangeRateStore((state) => state.loadCachedRates)
	const fetchRates = useExchangeRateStore((state) => state.fetchRates)

	useEffect(() => {
		loadPreferences()
		loadCachedRates()

		const runRefresh = () => {
			if (!navigator.onLine) {
				return
			}

			void fetchRates()
		}

		const cancelDeferredRefresh = scheduleDeferredRefresh(runRefresh)

		const handleOnline = () => {
			runRefresh()
		}

		window.addEventListener('online', handleOnline)
		return () => {
			cancelDeferredRefresh()
			window.removeEventListener('online', handleOnline)
		}
	}, [fetchRates, loadCachedRates, loadPreferences])

	return <App />
}