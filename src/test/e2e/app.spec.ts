import { expect, test } from '@playwright/test'
import {
  exchangeRateResponse,
  getDesktopBreakdown,
  getDesktopTaxSummary,
  getVisibleByTestId,
  replaceInputValue,
} from '../helpers'

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

test('salary amount starts with default value', async ({ page }) => {
  await expect(page.getByTestId('salary-amount-input')).toHaveValue('10,000.00')
})

test('unsupported paths are replaced with the canonical spa url', async ({ page }) => {
  await page.goto('/api?currency=USD#tax')

  await expect(page).toHaveURL(/\/\?currency=USD#tax$/)
  await expect(page.getByTestId('salary-amount-input')).toHaveValue('10,000.00')
})

test('entering salary updates outputs', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)
  const annualInput = breakdown.getByTestId('salary-row-input-annual')
  const weeklyInput = breakdown.getByTestId('salary-row-input-weekly')

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await expect(breakdown.getByTestId('salary-currency-trigger-annual')).toContainText('JMD')
  await expect(annualInput).toHaveValue('2,400,000.00')
  await expect(weeklyInput).toHaveValue('46,153.85')
})

test('numeric salary inputs strip leading zeros and negatives', async ({ page }) => {
  const salaryAmount = page.getByTestId('salary-amount-input')
  const hoursPerWeek = page.getByTestId('salary-hours-input')

  await replaceInputValue(salaryAmount, '000200000')
  await expect(salaryAmount).toHaveValue('200,000')

  await replaceInputValue(hoursPerWeek, '-40')
  await expect(hoursPerWeek).toHaveValue('40')
})

test('changing salary mode recalculates values', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '1000')
  await page.getByTestId('salary-mode-trigger').click()
  await page.getByTestId('salary-mode-option-hourly').click()
  await expect(breakdown.getByTestId('salary-row-input-annual')).toHaveValue('2,080,000.00')
})

test('changing currency updates the display', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await page.getByTestId('salary-currency-trigger').click()
  await page.getByTestId('salary-currency-option-USD').click()
  await replaceInputValue(page.getByTestId('salary-amount-input'), '1000')
  await expect(breakdown.getByTestId('salary-currency-trigger-monthly')).toContainText('USD')
})

test('each salary breakdown row can use its own currency', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await breakdown.getByTestId('salary-currency-trigger-monthly').click()
  await breakdown.getByTestId('salary-currency-option-monthly-USD').click()
  await expect(breakdown.getByTestId('salary-currency-trigger-monthly')).toContainText('USD')
  await expect(breakdown.getByTestId('salary-currency-trigger-annual')).toContainText('JMD')
})

test('editing a breakdown row in its displayed currency updates the salary input and other rows', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)
  const salaryAmount = page.getByTestId('salary-amount-input')
  const annualInput = getVisibleByTestId(page, 'salary-row-input-annual')
  const monthlyInput = getVisibleByTestId(page, 'salary-row-input-monthly')

  await replaceInputValue(salaryAmount, '200000')
  await breakdown.getByTestId('salary-currency-trigger-monthly').click()
  await breakdown.getByTestId('salary-currency-option-monthly-USD').click()

  await replaceInputValue(monthlyInput, '2000')
  await monthlyInput.blur()

  await expect(salaryAmount).toHaveValue('312,400.00')
  await expect(annualInput).toHaveValue('3,748,800.00')
})

test('focused breakdown inputs keep two-decimal formatting', async ({ page }) => {
  const weeklyInput = getVisibleByTestId(page, 'salary-row-input-weekly')

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await weeklyInput.click()

  await expect(weeklyInput).toHaveValue('46,153.85')
})

test('editing a breakdown row to zero keeps the breakdown visible before blur', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)
  const annualInput = getVisibleByTestId(page, 'salary-row-input-annual')

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await replaceInputValue(annualInput, '0')

  await expect(annualInput).toHaveValue('0')
  await expect(breakdown.getByTestId('salary-row-monthly')).toBeVisible()
  await expect(breakdown).not.toContainText('Correct the input values to see salary conversions.')
})

test('hidden section stays out of view until a row is hidden', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await expect(breakdown.getByTestId('salary-breakdown-hidden-toggle')).toHaveCount(0)
  await breakdown.getByTestId('salary-visibility-toggle-annual').click()
  await expect(breakdown.getByTestId('salary-breakdown-hidden-toggle')).toBeVisible()
})

test('tax section updates correctly', async ({ page }) => {
  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await expect(getDesktopTaxSummary(page).getByTestId('tax-summary-card')).toContainText('Net monthly income')
})

test('tax summary reveals additional net income periods on demand', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await expect(taxSummary.getByTestId('tax-summary-card')).not.toContainText('Net weekly income')
  await expect(taxSummary.getByTestId('tax-summary-card')).not.toContainText('Monthly deductions')

  await taxSummary.getByTestId('tax-summary-view-more-toggle').click()

  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Monthly deductions')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Net biweekly income')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Net weekly income')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Net daily income')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Net hourly income')
})

test('employee mode updates the tax summary message and NIS rate', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await page.getByTestId('salary-advanced-section').click()
  await page.getByTestId('salary-employment-status-trigger').click()
  await page.getByTestId('salary-employment-status-option-employee').click()

  await expect(taxSummary.getByTestId('tax-summary-status-message')).toContainText(
    'You are now seeing your Employee tax estimates calculated in JMD',
  )
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('NIS (3%)')
})

test('salary labels and privacy note reflect the selected employment status', async ({ page }) => {
  await expect(page.locator('label', { hasText: 'Income amount' }).first()).toBeVisible()
  await expect(page.locator('span', { hasText: 'Income mode' }).first()).toBeVisible()
  await expect(page.getByText(/All data is processed on your device/i)).toBeVisible()

  await page.getByTestId('salary-advanced-section').click()
  await page.getByTestId('salary-employment-status-trigger').click()
  await page.getByTestId('salary-employment-status-option-employee').click()

  await expect(page.locator('label', { hasText: 'Salary amount' }).first()).toBeVisible()
  await expect(page.locator('span', { hasText: 'Salary mode' }).first()).toBeVisible()
})

test('advanced overtime fields adjust the annual income', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '1000')
  await page.getByTestId('salary-mode-trigger').click()
  await page.getByTestId('salary-mode-option-hourly').click()
  await replaceInputValue(page.getByTestId('salary-hours-input'), '45')

  await page.getByTestId('salary-advanced-section').click()
  await expect(page.getByTestId('salary-overtime-hours-input')).toHaveValue('5')
  const specialOvertimeInput = page.getByTestId('salary-special-overtime-hours-input')
  await replaceInputValue(specialOvertimeInput, '2')
  await specialOvertimeInput.blur()

  await expect(page.getByTestId('salary-overtime-hours-input')).toHaveValue('3')
  await expect(breakdown.getByTestId('salary-row-input-annual')).toHaveValue('2,522,000.00')
})

test('hours per week are capped and calculated overtime stays disabled', async ({ page }) => {
  const hoursInput = page.getByTestId('salary-hours-input')

  await replaceInputValue(hoursInput, '200')

  await expect(hoursInput).toHaveValue('168')

  await page.getByTestId('salary-advanced-section').click()
  await expect(page.getByTestId('salary-overtime-hours-input')).toBeDisabled()

  const specialOvertimeInput = page.getByTestId('salary-special-overtime-hours-input')
  await replaceInputValue(specialOvertimeInput, '200')
  await specialOvertimeInput.blur()

  await expect(specialOvertimeInput).toHaveValue('128')
})

test('pension is deducted before statutory income is calculated', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await page.getByTestId('salary-advanced-section').click()
  await replaceInputValue(page.getByTestId('salary-pension-input'), '10000')

  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Pension')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('$120,000.00')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Statutory income')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('$2,136,000.00')
})

test('fixed monthly pension values remain monthly regardless of salary mode', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '1000')
  await page.getByTestId('salary-mode-trigger').click()
  await page.getByTestId('salary-mode-option-hourly').click()
  await replaceInputValue(page.getByTestId('salary-hours-input'), '45')
  await page.getByTestId('salary-advanced-section').click()
  await replaceInputValue(page.getByTestId('salary-pension-input'), '10000')

  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Pension')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('$120,000.00')
})

test('percentage pension values are converted into annual deductions', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
  await page.getByTestId('salary-advanced-section').click()
  await page.getByTestId('salary-pension-mode-trigger').click()
  await page.getByTestId('salary-pension-mode-option-percent').click()
  await replaceInputValue(page.getByTestId('salary-pension-input'), '5')

  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Pension')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('$120,000.00')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('Statutory income')
  await expect(taxSummary.getByTestId('tax-summary-card')).toContainText('$2,136,000.00')
})

test('pension row stays hidden when no pension value is provided', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')

  await expect(taxSummary.getByTestId('tax-summary-card')).not.toContainText('Pension')
})

test('tax summary exposes taxable income and income tax detail breakdowns', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '1000000')
  await taxSummary.getByTestId('tax-line-item-taxable-income').click()
  await expect(taxSummary.getByTestId('tax-line-item-taxable-income')).toContainText('25%')
  await expect(taxSummary.getByTestId('tax-line-item-taxable-income')).toContainText('30%')

  await taxSummary.getByTestId('tax-line-item-income-tax').click()
  await expect(taxSummary.getByTestId('tax-line-item-income-tax')).toContainText('on')
  await expect(taxSummary.getByTestId('tax-line-item-income-tax')).toContainText('30%')
})

test('tax detail info icon is hidden when there is no taxable income', async ({ page }) => {
  const taxSummary = getDesktopTaxSummary(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '10000')

  await expect(taxSummary.getByTestId('tax-line-item-taxable-income-info-icon')).toHaveCount(0)
  await expect(taxSummary.getByTestId('tax-line-item-income-tax-info-icon')).toHaveCount(0)
})

test('manual refresh rates button is no longer shown', async ({ page }) => {
  await expect(page.getByTestId('refresh-rates-button')).toHaveCount(0)
})

test('visibility toggles persist after reload', async ({ page }) => {
  const breakdown = getDesktopBreakdown(page)

  await replaceInputValue(page.getByTestId('salary-amount-input'), '200000')
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
  await replaceInputValue(page.getByTestId('salary-amount-input'), '250000')
  await expect(breakdown.getByTestId('salary-row-input-annual')).toHaveValue('3,000,000.00')
})

test('mobile salary breakdown and tax summary cards start open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await expect(page.getByTestId('salary-breakdown-mobile-card')).toHaveAttribute('open', '')
  await expect(page.getByTestId('tax-summary-mobile-card')).toHaveAttribute('open', '')
})