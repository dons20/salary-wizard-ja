export const SUPPORTED_CURRENCIES = ['JMD', 'USD', 'CAD', 'GBP', 'EUR'] as const

export const INPUT_SALARY_MODES = [
  'hourly',
  'daily',
  'biweekly',
  'monthly',
  'annual',
] as const

export const EMPLOYMENT_STATUSES = ['self-employed', 'employee'] as const

export const BREAKDOWN_SALARY_MODES = [
  'hourly',
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'annual',
] as const

export const WEEKS_PER_YEAR = 52
export const MONTHS_PER_YEAR = 12
export const BIWEEKLY_PERIODS_PER_YEAR = 26
export const REGULAR_HOURS_PER_WEEK = 40
export const REGULAR_OVERTIME_RATE = 1.5
export const SPECIAL_OVERTIME_RATE = 2

export const DEFAULT_HOURS_PER_WEEK = 40
export const DEFAULT_DAYS_PER_WEEK = 5
export const DEFAULT_AMOUNT = 10000
export const DEFAULT_SALARY_MODE = 'monthly'
export const DEFAULT_CURRENCY = 'JMD'
export const DEFAULT_EMPLOYMENT_STATUS = 'self-employed'
export const DEFAULT_SPECIAL_OVERTIME_HOURS = 0
export const DEFAULT_PENSION = 0

export const DEFAULT_VISIBLE_SECTIONS = {
  hourly: true,
  daily: true,
  weekly: true,
  biweekly: true,
  monthly: true,
  annual: true,
} as const

export const EXCHANGE_RATE_STORAGE_KEY = 'salary-wizard.exchange-rates'
export const EXCHANGE_RATE_MAX_AGE_MS = 1000 * 60 * 60 * 24

export const APP_NAME = 'Salary Wizard Jamaica'
export const EXCHANGE_RATE_API_URL =
  import.meta.env.VITE_EXCHANGE_RATE_API_URL ?? '/api/exchange-rates'