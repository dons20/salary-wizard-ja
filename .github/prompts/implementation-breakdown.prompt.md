---
name: implementation-breakdown
description: A breakdown of the implementation details for this project
---

You are building a production-quality MVP for a Jamaican Salary and Tax Calculator web app.

Project Goal

Create a lightweight, attractive, fast, mobile-first Progressive Web App for Jamaican users that:

- converts salary between hourly, daily, biweekly, monthly, and annual
- supports JMD, USD, CAD, GBP, and EUR
- calculates Jamaican self-employed taxes
- preserves user preferences locally
- works offline after install

Primary UX goals:

- concise and polished
- useful immediately
- responsive
- installable
- offline-capable
- easy to maintain and extend

Tech Stack Requirements

Use:

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- Zod
- vite-plugin-pwa
- localStorage for persistence
- Vitest for unit tests
- Playwright for E2E tests

Do not use heavy UI libraries unless absolutely necessary.

Implementation Requirements

1. PWA

The app must:

- be installable
- include a manifest
- register a service worker
- cache app shell/assets for offline use
- work offline after install
- still allow salary and tax calculations offline
- use cached exchange rates offline if available
- show when cached exchange rates are being used

2. Supported Salary Modes

Support input and output for:

- hourly
- daily
- biweekly
- monthly
- annual

The user must be able to enter:

- salary amount
- salary mode
- currency
- hours worked per week
- days worked per week

Use defaults:

- hoursPerWeek = 40
- daysPerWeek = 5
- currency = JMD
- choose a sensible default salary mode such as monthly

3. Salary Conversion Logic

Normalize all values through annual salary.

Constants:

- weeksPerYear = 52
- monthsPerYear = 12
- biweeklyPeriodsPerYear = 26

Annual formulas:

- hourly -> annual:
  annual = hourly * hoursPerWeek * 52

- daily -> annual:
  annual = daily * daysPerWeek * 52

- biweekly -> annual:
  annual = biweekly * 26

- monthly -> annual:
  annual = monthly * 12

- annual -> annual:
  annual = annual

Derived formulas from annual:

- monthly = annual / 12
- biweekly = annual / 26
- daily = annual / (daysPerWeek * 52)
- hourly = annual / (hoursPerWeek * 52)

All salary forms should be shown by default.

Each salary output row/section should be hideable by the user, and the visibility preference must persist in localStorage.

4. Supported Currencies

Support:

- JMD
- USD
- CAD
- GBP
- EUR

Behavior:

- user can enter salary in any supported currency
- salary breakdown displays in the selected currency
- tax calculation must always be computed in JMD
- if user enters non-JMD salary, convert to JMD using exchange rates
- cache exchange rates locally
- if offline, use cached exchange rates
- clearly display the exchange rate timestamp and whether rates are cached/stale

5. Tax Calculation Rules

Implement Jamaican self-employed tax calculations using a config-driven approach.

Important:
Do not hardcode these values directly into UI components.
Centralize tax rules in config and select active rules by date.

Tax-free threshold:

- JMD 1,902,360 until 2027-03-31
- JMD 2,003,496 effective 2027-04-01

Statutory deductions, all tax-deductible:

- NIS = 6% up to JMD 5,000,000 annual earnings cap
- NHT = 2% of earnings
- Education Tax = 2.25% of earnings

Income tax bands:

- 25% on first JMD 6,000,000 of taxable income
- 30% on taxable income above JMD 6,000,000

Calculation order:

1. Gross annual income in JMD
2. NIS = min(grossAnnual, 5000000) * 0.06
3. NHT = grossAnnual * 0.02
4. Education Tax = grossAnnual * 0.0225
5. Chargeable income = grossAnnual - NIS - NHT - educationTax
6. Taxable income = max(0, chargeableIncome - taxFreeThreshold)
7. Income tax:
   - 25% on first 6,000,000 of taxable income
   - 30% on the remainder
8. Total deductions = NIS + NHT + Education Tax + Income Tax
9. Net annual income = grossAnnual - total deductions

Treat the tax bands as applying to taxable income after deductions and threshold.

This MVP is for self-employed users only.

Tax outputs must include at minimum:

- gross annual income
- NIS
- NHT
- Education tax
- total deductible contributions
- tax-free threshold
- chargeable income
- taxable income
- income tax
- total deductions
- net annual income
- net monthly income
- net biweekly income

Include a visible disclaimer:
- estimate only
- tax rules may change
- verify with TAJ or a tax professional

6. Validation Rules

Validate:

- salary amount > 0
- hoursPerWeek > 0 and <= 168
- daysPerWeek > 0 and <= 7
- currency must be one of the supported currencies
- salary mode must be one of the supported modes

Show clear inline validation errors.

7. State Management

Use Zustand stores.

Create at minimum:

A. Salary Store
State:
- amount
- mode
- currency
- hoursPerWeek
- daysPerWeek

Actions:
- setAmount
- setMode
- setCurrency
- setHoursPerWeek
- setDaysPerWeek
- reset

B. Preferences Store
State:
- visible salary sections
- optional theme if implemented

Actions:
- toggleSectionVisibility
- resetPreferences
- loadPreferences
- savePreferences

C. Exchange Rate Store
State:
- rates
- fetchedAt
- isLoading
- error

Actions:
- fetchRates
- loadCachedRates
- refreshRates

Behavior:
- fetch rates on startup when online
- fallback to cached rates when offline or fetch fails

8. Persistence

Persist via localStorage:

- amount
- mode
- currency
- hoursPerWeek
- daysPerWeek
- visible salary sections
- exchange rates
- exchange rate timestamp
- theme only if implemented

9. Architecture

Use a modular structure similar to:

src/
  app/
    App.tsx
    main.tsx
    providers.tsx
  components/
    layout/
      Header.tsx
      Footer.tsx
    shared/
      Card.tsx
      NumberField.tsx
      SelectField.tsx
      Toggle.tsx
      Badge.tsx
    salary/
      SalaryInputCard.tsx
      SalaryBreakdownCard.tsx
      SalaryRow.tsx
    tax/
      TaxSummaryCard.tsx
      TaxLineItem.tsx
    settings/
      PreferencesCard.tsx
    pwa/
      InstallButton.tsx
      NetworkStatusBadge.tsx
  features/
    salary/
      salary-types.ts
      salary-utils.ts
      salary-store.ts
    tax/
      tax-types.ts
      tax-config.ts
      tax-engine.ts
    currency/
      currency-types.ts
      exchange-rate-service.ts
      exchange-rate-store.ts
      currency-utils.ts
    preferences/
      preferences-store.ts
      persistence.ts
  lib/
    format.ts
    math.ts
    validation.ts
    constants.ts
    dates.ts
  test/
    unit/
    e2e/

You may adjust structure slightly if needed, but keep domain logic clean and modular.

10. Tax Config Design

Create a config type like:

export type TaxConfig = {
  effectiveFrom: string;
  taxFreeThreshold: number;
  nis: {
    rate: number;
    annualCap: number;
  };
  nht: {
    rate: number;
  };
  educationTax: {
    rate: number;
  };
  incomeTaxBands: Array<{
    upTo: number | null;
    rate: number;
  }>;
};

Create at least these config entries:

[
  {
    effectiveFrom: "2024-04-01",
    taxFreeThreshold: 1902360,
    nis: { rate: 0.06, annualCap: 5000000 },
    nht: { rate: 0.02 },
    educationTax: { rate: 0.0225 },
    incomeTaxBands: [
      { upTo: 6000000, rate: 0.25 },
      { upTo: null, rate: 0.3 }
    ]
  },
  {
    effectiveFrom: "2027-04-01",
    taxFreeThreshold: 2003496,
    nis: { rate: 0.06, annualCap: 5000000 },
    nht: { rate: 0.02 },
    educationTax: { rate: 0.0225 },
    incomeTaxBands: [
      { upTo: 6000000, rate: 0.25 },
      { upTo: null, rate: 0.3 }
    ]
  }
]

Implement a helper that selects the active config by current date.

11. Utility Functions

Implement:

Salary:
- normalizeToAnnual(input)
- deriveSalaryBreakdown(annual, hoursPerWeek, daysPerWeek)

Tax:
- getActiveTaxConfig(date)
- calculateIncomeTax(taxableIncome, bands)
- calculateSelfEmployedTax(grossAnnualJmd, config)

Currency:
- convertCurrency(amount, from, to, rates)
- getSupportedCurrencies()
- getRateTimestampLabel(fetchedAt)

Formatting:
- formatMoney(amount, currency)
- formatNumber(amount)
- formatDateTime(date)

Expected tax result shape:

type TaxResult = {
  grossAnnual: number;
  nis: number;
  nht: number;
  educationTax: number;
  totalDeductibleContributions: number;
  taxFreeThreshold: number;
  chargeableIncome: number;
  taxableIncome: number;
  incomeTax: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netBiweekly: number;
};

12. UI / UX Requirements

Design direction:

- mobile-first
- polished but minimal
- card-based layout
- readable financial figures
- strong spacing
- concise labels
- responsive on mobile/tablet/desktop
- accessible and keyboard-friendly

Main screen structure:

1. Header
   - app name
   - install button if applicable
   - online/offline status
   - exchange rate status

2. Salary Input Card
   - amount
   - mode selector
   - currency selector
   - hours/week
   - days/week

3. Salary Breakdown Card
   - hourly
   - daily
   - biweekly
   - monthly
   - annual
   - visibility toggles

4. Tax Summary Card
   - line-item breakdown
   - net values

5. Preferences Card
   - show/hide sections
   - reset defaults
   - refresh exchange rates

6. Footer
   - disclaimer

Use proper money formatting everywhere.

13. PWA Requirements

Configure vite-plugin-pwa with:

- manifest
- icons
- theme color
- background color
- display = standalone

Service worker should:

- precache app shell/assets
- support offline app startup after install
- preserve usefulness offline
- allow cached exchange-rate fallback

Also implement install prompt handling and basic update handling if practical.

14. Testing Requirements

Write unit tests with Vitest for:

Salary:
- hourly to annual
- daily to annual
- monthly to annual
- annual to hourly/daily/biweekly/monthly

Tax:
- below threshold income
- threshold applied correctly
- NIS cap applied correctly
- income tax within first band
- income tax above first band
- 2027 threshold config selected correctly

Currency:
- conversion between currencies
- USD/JMD path
- cached-rate fallback behavior where applicable

Write Playwright E2E tests for:

- entering salary updates outputs
- changing salary mode recalculates values
- changing currency updates display
- tax section updates correctly
- visibility toggles persist after reload
- app works offline with cached data after initial load

15. Acceptance Criteria

The work is complete when:

- app is built with Vite + React + TypeScript
- app is installable as a PWA
- app works offline after install
- user can enter salary in any supported mode
- app displays hourly, daily, biweekly, monthly, and annual equivalents
- user can hide/show salary sections
- section visibility persists across reloads
- app supports JMD, USD, CAD, GBP, and EUR
- tax calculations use JMD and the defined Jamaican self-employed rules
- threshold switches to JMD 2,003,496 on 2027-04-01
- NIS cap at JMD 5,000,000 is enforced
- exchange rates are cached locally
- UI clearly indicates when cached rates are used
- unit tests cover core salary/tax/currency logic
- E2E tests cover major flows
- app is responsive and usable on mobile

16. Initial Constants

Use constants similar to:

export const SUPPORTED_CURRENCIES = ["JMD", "USD", "CAD", "GBP", "EUR"] as const;

export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;
export const BIWEEKLY_PERIODS_PER_YEAR = 26;

export const DEFAULT_HOURS_PER_WEEK = 40;
export const DEFAULT_DAYS_PER_WEEK = 5;

export const DEFAULT_VISIBLE_SECTIONS = {
  hourly: true,
  daily: true,
  biweekly: true,
  monthly: true,
  annual: true
};

17. Delivery Instructions

Please complete the implementation in phases:

Phase 1:
- bootstrap app
- set up Tailwind, Zustand, PWA, Vitest, Playwright
- create base layout

Phase 2:
- implement salary logic
- implement tax config and tax engine
- implement formatting and validation helpers
- add unit tests

Phase 3:
- implement stores and persistence
- implement exchange-rate integration and caching

Phase 4:
- build UI components
- connect UI to stores and domain logic
- ensure responsive design

Phase 5:
- complete PWA/offline functionality
- add install flow and cached-rate messaging

Phase 6:
- finish tests
- refine accessibility and polish

18. Important Constraints

- Keep code modular and maintainable
- Prefer simple and deterministic calculations
- Avoid spreading business logic across components
- Keep tax logic config-driven
- Ensure offline usefulness after first successful load/install
- Keep bundle size reasonable
- Prioritize MVP scope over extra features

19. Nice-to-Haves Only If Time Allows

Do not prioritize these above the MVP:

- dark mode
- tax year selector
- secondary display of tax outputs in selected currency
- export/share summary
- reverse calculator for target take-home pay

20. Output Expectation

Start by scaffolding the project and implementing the domain logic and tests first.
Then build the UI and connect the stores.
Ensure the final result is a working, installable, offline-capable MVP.

If implementation assumptions need adjustment, isolate them in configuration and utility functions rather than embedding them in UI components.