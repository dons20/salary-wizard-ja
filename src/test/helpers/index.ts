import type { Locator, Page } from '@playwright/test'

export const exchangeRateResponse = {
  result: 'success',
  rates: {
    JMD: 156.2,
    CAD: 1.37,
    GBP: 0.79,
    EUR: 0.92,
  },
} as const

export function getDesktopBreakdown(page: Page) {
  return page.getByTestId('salary-breakdown-desktop-card')
}

export function getDesktopTaxSummary(page: Page) {
  return page.getByTestId('tax-summary-desktop-card')
}

export async function replaceInputValue(locator: Locator, value: string) {
  await locator.click()
  await locator.press('ControlOrMeta+A')
  await locator.type(value)
}

export function getVisibleByTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]:visible`).first()
}
