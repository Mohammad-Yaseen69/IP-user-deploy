import { describe, it, expect } from 'vitest'
import {
  buildBeneficiaryPayload,
  buildChannelPayload,
  buildTransactionBeneficiaryDetails,
} from '../../Components/VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/buildPayloads'
import { getBeneficiaryDisplayName } from '../../Components/PaymentsNewer/InternationalFlow/beneficiaryHelpers'

const countries = [{ _id: 'country-are', country_iso_code: 'ARE', country_name: 'United Arab Emirates' }]

const detailsFor = (form, saveForFuture) => buildTransactionBeneficiaryDetails({
  form,
  beneficiaryPayload: buildBeneficiaryPayload({ form, countries }),
  channelPayload: buildChannelPayload({ form, transactionType: form.recipient_type === 'business' ? 'C2B' : 'C2C' }),
  saveForFuture,
})

const bankForm = (recipientType, beneficiary) => ({
  recipient_type: recipientType,
  country: 'ARE',
  method: 'bank_account',
  vendor: 'thunes',
  service_id: 2,
  beneficiary: { country_iso_code: 'ARE', ...beneficiary },
  channel: { bankName: 'NATIONAL BANK OF FUJAIRAH', iban: 'AE912937420371099073059' },
})

describe('buildTransactionBeneficiaryDetails', () => {
  it('flattens a new individual bank recipient into the saved-beneficiary shape', () => {
    const details = detailsFor(bankForm('individual', { firstname: 'Khalid', lastname: 'Chouhan' }), false)

    expect(details.saveForFuture).toBe(false)
    expect(details).toMatchObject({
      beneficiary_type: 'individual',
      first_name: 'Khalid',
      last_name: 'Chouhan',
      country_iso_code: 'ARE',
      country_name: 'United Arab Emirates',
    })
    expect(details.extras).toEqual({
      country_iso_code: 'ARE',
      firstname: 'Khalid',
      lastname: 'Chouhan',
      vendor: 'thunes',
      channel_type: 'bank',
      country: 'country-are',
    })
    expect(details.bank_details).toHaveLength(1)
    expect(details.bank_details[0]).toMatchObject({
      iban: 'AE912937420371099073059',
      account_number: 'AE912937420371099073059',
      name: 'NATIONAL BANK OF FUJAIRAH',
      extras: { method: 'bank_account', service_id: 2, transaction_type: 'C2C', country_iso_code: 'ARE' },
    })
    expect(details).not.toHaveProperty('channel')
    expect(details).not.toHaveProperty('country')
    expect(details).not.toHaveProperty('beneficiary_id')
  })

  it('keeps the company name and the toggle for a business recipient', () => {
    const details = detailsFor(bankForm('business', { legalName: 'noor trading', city: 'Al Fujairah City' }), true)

    expect(details.saveForFuture).toBe(true)
    expect(details.company_name).toBe('noor trading')
    expect(details.extras).toMatchObject({ legalName: 'noor trading', city: 'Al Fujairah City' })
    expect(details.extras).not.toHaveProperty('company_name')
    expect(details.extras).not.toHaveProperty('beneficiaryCity')
    expect(details.beneficiary_type).toBe('business')
    expect(details.bank_details).toHaveLength(1)
  })

  it('puts a mobile wallet under mobile_wallet', () => {
    const details = detailsFor({
      recipient_type: 'individual',
      country: 'ARE',
      method: 'mobile_wallet',
      vendor: 'thunes',
      service_id: 1,
      beneficiary: { firstname: 'Khalid' },
      channel: { mobile_wallet_provider: '42', mobile_wallet_name: 'Wallet', msisdn: '+971500000000' },
    }, false)

    expect(details.extras.channel_type).toBe('mobile')
    expect(details.mobile_wallet).toEqual([expect.objectContaining({ money_provider: '42', wallet_account_number: '+971500000000' })])
    expect(details).not.toHaveProperty('bank_details')
  })

  it.each([
    ['cash_pickup', 'cash', 'cash_pickup'],
    ['card_payment', 'card', 'card'],
  ])('puts %s under %s/%s', (method, channelType, key) => {
    const details = detailsFor({
      recipient_type: 'individual',
      country: 'ARE',
      method,
      vendor: 'thunes',
      beneficiary: { firstname: 'Khalid' },
      channel: {},
    }, false)

    expect(details.extras.channel_type).toBe(channelType)
    expect(details[key]).toHaveLength(1)
  })
})

describe('getBeneficiaryDisplayName', () => {
  it('never renders undefined', () => {
    expect(getBeneficiaryDisplayName({ first_name: 'Khalid', last_name: 'Chouhan' })).toBe('Khalid Chouhan')
    expect(getBeneficiaryDisplayName({ first_name: 'Khalid' })).toBe('Khalid')
    expect(getBeneficiaryDisplayName({ beneficiary_type: 'business', company_name: 'noor trading', last_name: 'X' })).toBe('noor trading')
    expect(getBeneficiaryDisplayName({})).toBe('')
    expect(getBeneficiaryDisplayName(undefined, "Recipient's")).toBe("Recipient's")
  })
})
