import { describe, it, expect } from 'vitest'
import {
    isOnafriq,
    onafriqChannel,
    onafriqConfirmError,
    onafriqQuoteError,
    onafriqServiceId,
    onafriqServiceName,
    PAYER_SERVICE_LABELS
} from '../../Components/PaymentsNewer/InternationalFlow/onafriq'

describe('isOnafriq', () => {
    it('matches the vendor regardless of case', () => {
        expect(isOnafriq('onafriq')).toBe(true)
        expect(isOnafriq('Onafriq')).toBe(true)
    })

    it('rejects the other vendors and empty values', () => {
        expect(isOnafriq('thunes')).toBe(false)
        expect(isOnafriq('neema')).toBe(false)
        expect(isOnafriq(undefined)).toBe(false)
        expect(isOnafriq('')).toBe(false)
    })
})

describe('onafriqChannel', () => {
    it('prefers the flow channel value', () => {
        expect(onafriqChannel({ value: 'cash', name: 'Bank Account' })).toBe('cash')
    })

    it('falls back to the service name, never the id', () => {
        expect(onafriqChannel({ id: 1, method: 'Cash Pickup - Onafriq' })).toBe('cash')
        expect(onafriqChannel({ id: 1, method: 'Mobile Wallet - Onafriq' })).toBe('mobile')
        expect(onafriqChannel({ id: 2, name: 'Bank Account' })).toBe('bank')
    })

    it('returns empty for an unknown channel', () => {
        expect(onafriqChannel({})).toBe('')
    })
})

describe('quote identifiers', () => {
    it('maps each channel to its Onafriq service id', () => {
        expect(onafriqServiceId({ value: 'mobile' })).toBe(1)
        expect(onafriqServiceId({ value: 'bank' })).toBe(2)
        expect(onafriqServiceId({ value: 'cash' })).toBe(1)
    })

    it('uses the same name for service_name and channel_name', () => {
        expect(onafriqServiceName({ value: 'mobile' })).toBe('international_mobile_wallet')
        expect(onafriqServiceName({ value: 'bank' })).toBe('international_bank_transfer')
        expect(onafriqServiceName({ value: 'cash' })).toBe('international_cash_pickup')
    })

    it('keeps cash pickup distinct from mobile wallet despite the shared id', () => {
        const cash = { id: 1, method: 'Cash Pickup - Onafriq' }
        const mobile = { id: 1, method: 'Mobile Wallet - Onafriq' }
        expect(onafriqServiceId(cash)).toBe(onafriqServiceId(mobile))
        expect(onafriqServiceName(cash)).not.toBe(onafriqServiceName(mobile))
    })

    it('exposes the case-sensitive payers labels', () => {
        expect(PAYER_SERVICE_LABELS.mobile).toBe('Mobile Wallet')
        expect(PAYER_SERVICE_LABELS.bank).toBe('Bank Account')
        expect(PAYER_SERVICE_LABELS.cash).toBe('Cash Pickup')
    })
})

describe('onafriqQuoteError', () => {
    it('maps min and max violations to the tokens StepOne renders', () => {
        expect(onafriqQuoteError('Amount is less than the minimum value: 105')).toBe('min payer')
        expect(onafriqQuoteError('Amount is greater than the maximum value: 500000')).toBe('max payer')
    })

    it('flags an unreachable vendor', () => {
        expect(onafriqQuoteError('Unable to reach Onafriq for an exchange rate')).toBe('vendor unreachable')
    })

    it('ignores anything it does not recognise', () => {
        expect(onafriqQuoteError('something else')).toBe(false)
        expect(onafriqQuoteError(undefined)).toBe(false)
        expect(onafriqQuoteError({ code: 1 })).toBe(false)
    })
})

describe('onafriqConfirmError', () => {
    it('turns technical failures into an action', () => {
        expect(onafriqConfirmError('jwt expired')).toMatch(/new quote/i)
        expect(onafriqConfirmError('insufficient_funds')).toMatch(/top up/i)
        expect(onafriqConfirmError('Limit check failed')).toMatch(/lower amount|lower/i)
    })

    it('passes backend messages through unchanged', () => {
        const recipient = 'The recipient account is not active. Please check the recipient details.'
        const verify = 'Unable to verify the recipient account right now. Please try again later.'
        const vendor = 'Invalid vendor for this transaction'
        expect(onafriqConfirmError(recipient)).toBe(recipient)
        expect(onafriqConfirmError(verify)).toBe(verify)
        expect(onafriqConfirmError(vendor)).toBe(vendor)
    })

    it('returns false when there is no message', () => {
        expect(onafriqConfirmError(undefined)).toBe(false)
        expect(onafriqConfirmError('')).toBe(false)
    })
})
