import { useEffect } from 'react'

import { App } from './App'
import { useExchangeRateStore } from './features/currency/exchange-rate-store'
import { usePreferencesStore } from './features/preferences/preferences-store'

export function Bootstrap() {
	const loadPreferences = usePreferencesStore((state) => state.loadPreferences)
	const loadCachedRates = useExchangeRateStore((state) => state.loadCachedRates)
	const fetchRates = useExchangeRateStore((state) => state.fetchRates)

	useEffect(() => {
		loadPreferences()
		loadCachedRates()

		if (navigator.onLine) {
			void fetchRates()
		}

		const handleOnline = () => {
			void fetchRates()
		}

		window.addEventListener('online', handleOnline)
		return () => window.removeEventListener('online', handleOnline)
	}, [fetchRates, loadCachedRates, loadPreferences])

	return <App />
}