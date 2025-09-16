import React, { useContext, useMemo } from 'react'
import { Field, TextArea, TextInput, Select, Toggle } from '../UI/FormElements'
import { useTranslation } from 'react-i18next'
import { currencies } from '../../PaymentsNewer/InternationalFlow/StepOne'
import { formatCurrency } from '../../../Helper/AmountFormat'
import { UserContext } from '../../../Context/UserContext'

const Form = ({ data, inputFieldChange, dataHandler }) => {
    const { t } = useTranslation()
    const { userWallets } = useContext(UserContext)


    const walletOptions = useMemo(() => {
        return (userWallets || []).filter(w2 => w2?.wallet_type === "insta").map(w => ({
            value: w?._id,
            label: `${w?.currency?.code ?? ''} Wallet`
        }))
    }, [userWallets])


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label={t('Title')} required>
                <div style={{ width: '100%' }}>
                    <TextInput value={data.title} onChange={inputFieldChange('title')} placeholder={t('Enter title')} maxLength={100} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{(data?.title?.length ?? 0)}/100</span>
                    </div>
                </div>
            </Field>
            <Field label={t('Description')} required>
                <div style={{ width: '100%' }}>
                    <TextArea value={data.description} onChange={inputFieldChange('description')} placeholder={t('Enter description')} rows={5} maxLength={500} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{(data?.description?.length ?? 0)}/500</span>
                    </div>
                </div>
            </Field>
            <Field label={t('Amount')} required>
                <TextInput
                    value={data.amount}
                    onChange={(e) => {
                        const format = formatCurrency(e.target.value, false)
                        dataHandler("amount", format)
                    }}
                    onBlur={(e) => {
                        const format = formatCurrency(e.target.value, true)
                        dataHandler("amount", format)
                    }}
                    placeholder={t('0.00')}
                />
            </Field>
            <Field label={t('Receiving Wallet')} required>
                <Select value={data.wallet} onChange={inputFieldChange('wallet')} options={walletOptions} placeholder={t('Select wallet')} />
            </Field>

            <Field toggle={true} label={t('Allow multiple payments for this invoice')}>
                <Toggle checked={data.allowMultiple} onChange={() => dataHandler('allowMultiple', !data.allowMultiple)} />
            </Field>

            <Field toggle={true} label={t('Allow shipping address')}>
                <Toggle checked={data.allowShipping} onChange={() => dataHandler('allowShipping', !data.allowShipping)} />
            </Field>
        </div>
    )
}

export default Form
