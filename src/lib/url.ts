function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`
}

function trimTrailingSlash(path: string) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

export function getCanonicalSpaUrl(
  pathname: string,
  search: string,
  hash: string,
  basePath = '/',
) {
  const normalizedBasePath = ensureTrailingSlash(basePath)
  const bareBasePath = trimTrailingSlash(normalizedBasePath)

  if (pathname === normalizedBasePath || pathname === bareBasePath) {
    return null
  }

  if (pathname === `${normalizedBasePath}index.html`) {
    return `${normalizedBasePath}${search}${hash}`
  }

  return `${normalizedBasePath}${search}${hash}`
}

export function replaceUnsupportedSpaUrl(basePath = '/') {
  const canonicalUrl = getCanonicalSpaUrl(
    window.location.pathname,
    window.location.search,
    window.location.hash,
    basePath,
  )

  if (!canonicalUrl) {
    return
  }

  window.history.replaceState(window.history.state, '', canonicalUrl)
}