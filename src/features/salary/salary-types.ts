import type {
  BREAKDOWN_SALARY_MODES,
  EMPLOYMENT_STATUSES,
  DEFAULT_VISIBLE_SECTIONS,
  INPUT_SALARY_MODES,
} from '../../lib/constants'

export type InputSalaryMode = (typeof INPUT_SALARY_MODES)[number]
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number]

export type SalaryMode = (typeof BREAKDOWN_SALARY_MODES)[number]

export type SalaryInput = {
  amount: number
  mode: InputSalaryMode
  hoursPerWeek: number
  daysPerWeek: number
  specialOvertimeHours: number
  pension: number
}

export type SalaryBreakdown = Record<SalaryMode, number>

export type VisibleSalarySections = typeof DEFAULT_VISIBLE_SECTIONS