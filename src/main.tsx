import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Bootstrap } from './providers'
import './index.css'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
	void navigator.serviceWorker.getRegistrations().then((registrations) => {
		registrations.forEach((registration) => {
			void registration.unregister()
		})
	})
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Bootstrap />
	</StrictMode>,
)
