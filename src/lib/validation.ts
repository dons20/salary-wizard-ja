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
})

export type SalaryValidationErrors = Partial<
  Record<'amount' | 'mode' | 'currency' | 'hoursPerWeek', string>
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