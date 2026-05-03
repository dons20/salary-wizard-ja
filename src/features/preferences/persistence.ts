export function readPersistentJson<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const value = localStorage.getItem(key)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function writePersistentJson<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

export function removePersistentValue(key: string): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(key)
}