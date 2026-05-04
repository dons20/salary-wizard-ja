const BOOT_SPLASH_STORAGE_KEY = 'salary-calculator-boot-splash-seen'
const FIRST_VISIT_SPLASH_DURATION_MS = 2500

function hasSeenBootSplash() {
	try {
		return window.sessionStorage.getItem(BOOT_SPLASH_STORAGE_KEY) === 'true'
	} catch {
		return false
	}
}

function markBootSplashSeen() {
	try {
		window.sessionStorage.setItem(BOOT_SPLASH_STORAGE_KEY, 'true')
	} catch {
		// Ignore storage access failures and allow the splash to appear again.
	}
}

function removeBootSplash(bootSplash: HTMLElement) {
	bootSplash.classList.add('is-hidden')
	bootSplash.addEventListener('transitionend', () => bootSplash.remove(), { once: true })
	window.setTimeout(() => bootSplash.remove(), 300)
}

export function scheduleBootSplashRemoval() {
	const bootSplash = document.getElementById('app-boot-splash')

	if (!bootSplash) {
		return
	}

	if (document.documentElement.dataset.skipBootSplash === 'true') {
		bootSplash.remove()
		return
	}

	const hasSeenSplash = hasSeenBootSplash()
	const delay = hasSeenSplash ? 0 : FIRST_VISIT_SPLASH_DURATION_MS

	if (!hasSeenSplash) {
		markBootSplashSeen()
	}

	window.setTimeout(() => removeBootSplash(bootSplash), delay)
}