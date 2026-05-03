import { expect, test, type Page } from '@playwright/test'

const exchangeRateResponse = {
  result: 'success',
  rates: {
    JMD: 156.2,
    CAD: 1.37,
    GBP: 0.79,
    EUR: 0.92,
  },
}

function getDesktopBreakdown(page: Page) {
  return page.getByTestId('salary-breakdown-desktop-card')
}

function getDesktopTaxSummary(page: Page) {
  return page.getByTestId('tax-summary-desktop-card')
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/exchange-rates*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rates: {
          USD: 1,
          ...exchangeRateResponse.rates,
        },
        fetchedAt: '2026-05-03T12:00:00.000Z',
      }),
    })
  })

  await page.goto('/')
  await page.evaluate(() => {
    localStorage.removeItem('salary-wizard.salary')
    localStorage.removeItem('salary-wizard.preferences')
    localStorage.removeItem('salary-wizard.exchange-rates')
    sessionStorage.clear()
  })
  await page.reload()
})

test('salary amount starts empty', async ({ page }) => {
  await expect(page.getByTestId('salary-amount-input')).toHaveValue('')
})

test('entering salary updates outputs', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)
  const annualInput = breakdown.getByTestId('salary-row-input-annual')
  const weeklyInput = breakdown.getByTestId('salary-row-input-weekly')

  await page.getByTestId('salary-amount-input').fill('200000')
  await expect(breakdown.getByTestId('salary-currency-trigger-annual')).toContainText('JMD')
  await expect(annualInput).toHaveValue('2,400,000.00')
  await expect(weeklyInput).toHaveValue('46,153.85')
})

test('numeric salary inputs strip leading zeros and negatives', async ({ page }) => {
  const salaryAmount = page.getByTestId('salary-amount-input')
  const hoursPerWeek = page.getByTestId('salary-hours-input')

  await salaryAmount.fill('000200000')
  await expect(salaryAmount).toHaveValue('200,000')

  await hoursPerWeek.fill('-40')
  await expect(hoursPerWeek).toHaveValue('40')
})

test('changing salary mode recalculates values', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-amount-input').fill('1000')
  await page.getByTestId('salary-mode-trigger').click()
  await page.getByTestId('salary-mode-option-hourly').click()
  await expect(breakdown.getByTestId('salary-row-input-annual')).toHaveValue('2,080,000.00')
})

test('changing currency updates the display', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-currency-trigger').click()
  await page.getByTestId('salary-currency-option-USD').click()
  await page.getByTestId('salary-amount-input').fill('1000')
  await expect(breakdown.getByTestId('salary-currency-trigger-monthly')).toContainText('USD')
})

test('each salary breakdown row can use its own currency', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-amount-input').fill('200000')
  await breakdown.getByTestId('salary-currency-trigger-monthly').click()
  await breakdown.getByTestId('salary-currency-option-monthly-USD').click()
  await expect(breakdown.getByTestId('salary-currency-trigger-monthly')).toContainText('USD')
  await expect(breakdown.getByTestId('salary-currency-trigger-annual')).toContainText('JMD')
})

test('editing a breakdown row in its displayed currency updates the salary input and other rows', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)
  const salaryAmount = page.getByTestId('salary-amount-input')
  const annualInput = breakdown.getByTestId('salary-row-input-annual')
  const monthlyInput = breakdown.getByTestId('salary-row-input-monthly')

  await salaryAmount.fill('200000')
  await breakdown.getByTestId('salary-currency-trigger-monthly').click()
  await breakdown.getByTestId('salary-currency-option-monthly-USD').click()

  await monthlyInput.fill('2000')
  await monthlyInput.blur()

  await expect(salaryAmount).toHaveValue('312,400.00')
  await expect(annualInput).toHaveValue('3,748,800.00')
})

test('hidden section stays out of view until a row is hidden', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-amount-input').fill('200000')
  await expect(breakdown.getByTestId('salary-breakdown-hidden-toggle')).toHaveCount(0)
  await breakdown.getByTestId('salary-visibility-toggle-annual').click()
  await expect(breakdown.getByTestId('salary-breakdown-hidden-toggle')).toBeVisible()
})

test('tax section updates correctly', async ({ page }) => {
  await page.getByTestId('salary-amount-input').fill('200000')
  await expect(getDesktopTaxSummary(page).getByTestId('tax-summary-card')).toContainText('Net monthly income')
})

test('visibility toggles persist after reload', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-amount-input').fill('200000')
  await breakdown.getByTestId('salary-visibility-toggle-annual').click()
  await page.reload()
  await expect(getDesktopBreakdown(page).getByTestId('salary-row-annual')).toHaveCount(0)
  await expect(getDesktopBreakdown(page).getByTestId('salary-breakdown-hidden-toggle')).toBeVisible()
})

test('app works offline with cached data after initial load', async ({ page, context }) => {
  const breakdown = getDesktopBreakdown(page)

  await expect(page.getByTestId('exchange-status-badge')).toContainText(/Latest Rates|Live rates/)
  await page.reload()
  await context.setOffline(true)
  await expect(page.getByTestId('network-status-badge')).toContainText('Offline')
  await expect(page.getByTestId('exchange-status-badge')).toContainText(/Using cached rates|Using stale cached rates/)
  await page.getByTestId('salary-amount-input').fill('250000')
  await expect(breakdown.getByTestId('salary-row-input-annual')).toHaveValue('3,000,000.00')
})