import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../../Helper/AmountFormat'

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(100, true)).toBe('100.00')
    expect(formatCurrency(1000, true)).toBe('1,000.00')
  })

  it('should format negative numbers correctly', () => {
    expect(formatCurrency(-100, true)).toBe('-100.00')
    expect(formatCurrency(-1000, true)).toBe('-1,000.00')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0, true)).toBe('0.00')
  })

  it('should handle decimal numbers', () => {
    expect(formatCurrency(123.45)).toBe('123.45')
    expect(formatCurrency(123.456)).toBe('123.45')
  })

  it('should handle large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('1,000,000')
    expect(formatCurrency(1234567.89, true)).toBe('1,234,567.89')
  })

  it('should format very small numbers', () => {
    expect(formatCurrency(0.0003232, true)).toBe('0.0003')
    expect(formatCurrency('0.0032')).toBe('0.003')
  })

  it('should handle edge cases', () => {
    expect(formatCurrency(null)).toBe('')
    expect(formatCurrency(undefined)).toBe('')
    expect(formatCurrency('')).toBe('')
  })
})
