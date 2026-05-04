import { z } from 'zod'

import { INPUT_SALARY_MODES, SUPPORTED_CURRENCIES } from './constants'

export const salaryInputSchema = z.object({
  amount: z.number().gt(0, 'Enter a salary amount greater than 0.'),
  mode: z.enum(INPUT_SALARY_MODES),
  currency: z.enum(SUPPORTED_CURRENCIES),
  hoursPerWeek: z
    .number()
    .gt(0, 'Hours per week must be greater than 0.')
    .max(168, 'Hours per week cannot exceed 168.'),
  specialOvertimeHours: z.number().min(0, 'Special overtime hours cannot be negative.'),
  pension: z.number().min(0, 'Pension cannot be negative.'),
}).superRefine((input, context) => {
  const maxSpecialOvertimeHours = Math.max(0, input.hoursPerWeek - 40)

  if (input.specialOvertimeHours > maxSpecialOvertimeHours) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['specialOvertimeHours'],
      message: `Special overtime hours cannot exceed ${maxSpecialOvertimeHours}.`,
    })
  }
})

export type SalaryValidationErrors = Partial<
  Record<'amount' | 'mode' | 'currency' | 'hoursPerWeek' | 'specialOvertimeHours' | 'pension', string>
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