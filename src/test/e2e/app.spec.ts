import { expect, test } from '@playwright/test'

const exchangeRateResponse = {
  result: 'success',
  rates: {
    JMD: 156.2,
    CAD: 1.37,
    GBP: 0.79,
    EUR: 0.92,
  },
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
})

test('entering salary updates outputs', async ({ page }) => {
  const annualRow = page.getByTestId('salary-row-annual').last()
  const weeklyRow = page.getByTestId('salary-row-weekly').last()

  await page.getByLabel('Salary amount').fill('200000')
  await expect(annualRow).toContainText('JMD')
  await expect(annualRow).toContainText('2,400,000.00')
  await expect(weeklyRow).toContainText('46,153.85')
})

test('numeric salary inputs strip leading zeros and negatives', async ({ page }) => {
  const salaryAmount = page.getByLabel('Salary amount')
  const hoursPerWeek = page.getByLabel('Hours per week')

  await salaryAmount.fill('000200000')
  await expect(salaryAmount).toHaveValue('200000')

  await hoursPerWeek.fill('-40')
  await expect(hoursPerWeek).toHaveValue('40')
})

test('changing salary mode recalculates values', async ({ page }) => {
  const annualRow = page.getByTestId('salary-row-annual').last()

  await page.getByLabel('Salary amount').fill('1000')
  await page.getByTestId('salary-mode-trigger').click()
  await page.getByTestId('salary-mode-option-hourly').click()
  await expect(annualRow).toContainText('2,080,000.00')
})

test('changing currency updates the display', async ({ page }) => {
  const monthlyRow = page.getByTestId('salary-row-monthly').last()

  await page.getByTestId('salary-currency-trigger').click()
  await page.getByTestId('salary-currency-option-USD').click()
  await page.getByLabel('Salary amount').fill('1000')
  await expect(monthlyRow).toContainText('USD')
})

test('each salary breakdown row can use its own currency', async ({ page }) => {
  const monthlyRow = page.getByTestId('salary-row-monthly').last()
  const annualRow = page.getByTestId('salary-row-annual').last()

  await page.getByLabel('Salary amount').fill('200000')
  await page.getByTestId('salary-currency-trigger-monthly').click()
  await page.getByRole('button', { name: 'USD' }).click()
  await expect(monthlyRow).toContainText('USD')
  await expect(annualRow).toContainText('JMD')
})

test('hidden section stays out of view until a row is hidden', async ({ page }) => {
  await expect(page.getByText(/^Hidden/)).toHaveCount(0)
  await page.getByLabel('Hide annual').click()
  await expect(page.getByText(/Hidden \(1\)/)).toBeVisible()
})

test('tax section updates correctly', async ({ page }) => {
  await page.getByLabel('Salary amount').fill('200000')
  await expect(page.getByTestId('tax-summary-card')).toContainText('Net monthly income')
})

test('visibility toggles persist after reload', async ({ page }) => {
  await page.getByLabel('Hide annual').click()
  await page.reload()
  await expect(page.getByTestId('salary-row-annual').last()).toHaveCount(0)
  await expect(page.getByText(/Hidden \(1\)/)).toBeVisible()
})

test('app works offline with cached data after initial load', async ({ page, context }) => {
  const annualRow = page.getByTestId('salary-row-annual').last()

  await expect(page.getByText('Live rates')).toBeVisible()
  await page.reload()
  await context.setOffline(true)
  await expect(page.getByText('Offline')).toBeVisible()
  await expect(page.getByText(/Using cached rates|Using stale cached rates/)).toBeVisible()
  await page.getByLabel('Salary amount').fill('250000')
  await expect(annualRow).toContainText('3,000,000.00')
})