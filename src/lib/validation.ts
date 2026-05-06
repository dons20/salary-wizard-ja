import { z } from 'zod'

import {
  HOURS_PER_WEEK_MAX,
  INPUT_SALARY_MODES,
  PENSION_INPUT_MODES,
  SUPPORTED_CURRENCIES,
} from './constants'

export const salaryInputSchema = z.object({
  amount: z.number().gt(0, 'Enter a salary amount greater than 0.'),
  mode: z.enum(INPUT_SALARY_MODES),
  currency: z.enum(SUPPORTED_CURRENCIES),
  hoursPerWeek: z
    .number()
    .gt(0, 'Hours per week must be greater than 0.')
    .max(HOURS_PER_WEEK_MAX, `Hours per week cannot exceed ${HOURS_PER_WEEK_MAX}.`),
  specialOvertimeHours: z.number().min(0, 'Special overtime hours cannot be negative.'),
  pension: z.number().min(0, 'Pension cannot be negative.'),
  pensionMode: z.enum(PENSION_INPUT_MODES),
}).superRefine((input, context) => {
  const maxSpecialOvertimeHours = Math.max(0, input.hoursPerWeek - 40)

  if (input.specialOvertimeHours > maxSpecialOvertimeHours) {
    context.addIssue({
      code: "custom",
      path: ['specialOvertimeHours'],
      message: `Special overtime hours cannot exceed ${maxSpecialOvertimeHours}.`,
    })
  }

  if (input.pensionMode === 'percent' && input.pension > 100) {
    context.addIssue({
      code: "custom",
      path: ['pension'],
      message: 'Pension percentage cannot exceed 100.',
    })
  }
})

export type SalaryValidationErrors = Partial<
  Record<'amount' | 'mode' | 'currency' | 'hoursPerWeek' | 'specialOvertimeHours' | 'pension' | 'pensionMode', string>
>

export function validateSalaryInput(
  input: z.input<typeof salaryInputSchema>,
): SalaryValidationErrors {
  const result = salaryInputSchema.safeParse(input)

  if (result.success) {
    return {}
  }

  return result.error.issues.reduce<SalaryValidationErrors>((errors, issue) => {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in errors)) {
      errors[key as keyof SalaryValidationErrors] = issue.message
    }
    return errors
  }, {})
}