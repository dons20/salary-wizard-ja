import { describe, expect, it } from 'vitest'

import { getCanonicalSpaUrl } from '../../lib/url'

describe('url helpers', () => {
  it('leaves the root url unchanged', () => {
    expect(getCanonicalSpaUrl('/', '', '')).toBeNull()
  })

  it('normalizes unsupported paths back to the app root', () => {
    expect(getCanonicalSpaUrl('/api', '', '')).toBe('/')
    expect(getCanonicalSpaUrl('/anything/else', '?currency=USD', '#tax')).toBe('/?currency=USD#tax')
  })

  it('normalizes index.html back to the canonical root url', () => {
    expect(getCanonicalSpaUrl('/index.html', '', '')).toBe('/')
  })

  it('respects a non-root base path', () => {
    expect(getCanonicalSpaUrl('/salary-calculator/extra', '?mode=monthly', '', '/salary-calculator/'))
      .toBe('/salary-calculator/?mode=monthly')
    expect(getCanonicalSpaUrl('/salary-calculator', '', '', '/salary-calculator/')).toBeNull()
  })
})