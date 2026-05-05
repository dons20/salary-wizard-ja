import { describe, expect, it } from 'vitest'

import { validateSalaryInput } from '../../lib/validation'

const validInput = {
  amount: 1000,
  mode: 'hourly' as const,
  currency: 'JMD' as const,
  hoursPerWeek: 40,
  specialOvertimeHours: 0,
  pension: 0,
  pensionMode: 'amount' as const,
}

describe('validation', () => {
  it('rejects hours per week above the hours available in a week', () => {
    expect(
      validateSalaryInput({
        ...validInput,
        hoursPerWeek: 169,
      }).hoursPerWeek,
    ).toBe('Hours per week cannot exceed 168.')
  })

  it('rejects special overtime hours above the available overtime hours', () => {
    expect(
      validateSalaryInput({
        ...validInput,
        hoursPerWeek: 45,
        specialOvertimeHours: 6,
      }).specialOvertimeHours,
    ).toBe('Special overtime hours cannot exceed 5.')
  })
})