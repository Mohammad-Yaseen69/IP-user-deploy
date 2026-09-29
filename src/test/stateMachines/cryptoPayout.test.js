import { describe, it, expect } from 'vitest'
import { getAmountError, getQuickAmounts, getSpendableBalance } from '../../stateMachines/cryptoPayout'

const EXCEEDS = 'Amount exceeds your available balance.'

describe('getSpendableBalance', () => {
  it('rounds the balance down to cents', () => {
    expect(getSpendableBalance(36.2799)).toBe(36.27)
  })

  it('keeps an exact cent balance despite float noise', () => {
    expect(getSpendableBalance(36.28)).toBe(36.28)
    expect(getSpendableBalance(36.279999999999)).toBe(36.28)
    expect(getSpendableBalance(0.1 + 0.2)).toBe(0.3)
  })
})

describe('getAmountError', () => {
  it('allows sending the full balance', () => {
    expect(getAmountError('36.28', 36.28, 'USDT')).toBe('')
    expect(getAmountError('36.28', 36.279999999999, 'USDT')).toBe('')
  })

  it('rejects an amount above the spendable balance', () => {
    expect(getAmountError('36.28', 36.2799, 'USDT')).toBe(EXCEEDS)
    expect(getAmountError('36.29', 36.28, 'USDT')).toBe(EXCEEDS)
  })
})

describe('getQuickAmounts', () => {
  it('never offers more than the balance', () => {
    const quick = getQuickAmounts(36.2799, [25, 50, 75, 100])
    expect(quick.find(q => q.percent === 100).value).toBe(36.27)
    quick.forEach(({ value }) => expect(value).toBeLessThanOrEqual(36.2799))
  })

  it('makes 100% pass validation', () => {
    const balance = 36.2799
    const full = getQuickAmounts(balance, [100])[0].value
    expect(getAmountError(String(full), balance, 'USDT')).toBe('')
  })
})
