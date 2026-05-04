import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { scheduleBootSplashRemoval } from './lib/boot-splash'
import { replaceUnsupportedSpaUrl } from './lib/url'
import { Bootstrap } from './providers'
import './index.css'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
	void navigator.serviceWorker.getRegistrations().then((registrations) => {
		registrations.forEach((registration) => {
			void registration.unregister()
		})
	})
}

replaceUnsupportedSpaUrl(import.meta.env.BASE_URL)

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Bootstrap />
	</StrictMode>,
)

scheduleBootSplashRemoval()
