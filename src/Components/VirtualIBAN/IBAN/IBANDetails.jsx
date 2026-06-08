import { useState } from 'react'
import { MoreHorizontal, Copy, Check, AlertCircle } from 'react-feather'
import styles from '../styles/IBANDetails.module.css'

const EU_DATA = {
    accountHolderName: 'KEMIT KINGDOM - K2 - SA',
    IBAN: 'MT24SYPL39480776971982696571227',
    Bank_name: "SYSTEM PAY SERVICES (MALTA) LIMITED",
    accNumebr: "Plaza De San Nicolas 4, Bilbao, 48005, ES",
    Bank_code: "SYPLMTM2"

}

const INTL_DATA = {
    usd: {
        beneficiaryName: 'SYSTEM PAY SERVICES MALTA LTD',
        beneficiaryAddress: 'Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT',
        accountNumber: 'ES9601828510912010000487',
        bankCode: 'BBVAESMMXXX',
        bankName: 'Banco Bilbao Vizcaya Argentaria, S.A.',
        bankAddress: 'Plaza De San Nicolas 4, Bilbao, 48005, ES',
        paymentReference: 'REF PY9F4G3'
    },
    eur: {
        beneficiaryName: 'System Pay Services (Malta) Limited',
        beneficiaryAddress: 'Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT',
        accountNumber: 'ES8201828510940200010371',
        bankCode: 'BBVAESMMXXX',
        bankName: 'Banco Bilbao Vizcaya Argentaria, S.A.',
        bankAddress: 'De San Nicolas 4, Bilboa, 48005, ES',
        paymentReference: 'REF 6JL69V3',
    },
}

function useCopy() {
    const [copiedKey, setCopiedKey] = useState(null)
    const copy = (text, key) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        })
    }
    return { copiedKey, copy }
}

const DetailRow = ({ label, value, copyKey, copiedKey, onCopy, mono }) => (
    <div className={styles.detailRow}>
        <span className={styles.label}>{label}</span>
        <div className={styles.valueGroup}>
            <span className={`${styles.value} ${mono ? styles.mono : ''}`}>{value}</span>
            {onCopy && (
                <button
                    className={styles.inlineCopyBtn}
                    onClick={() => onCopy(value, copyKey)}
                    title="Copy"
                >
                    {copiedKey === copyKey
                        ? <Check size={13} className={styles.copiedIcon} />
                        : <Copy size={13} />}
                </button>
            )}
        </div>
    </div>
)

const EUPanel = () => {
    const { copiedKey, copy } = useCopy()
    const allText = `Account holder name: ${EU_DATA.accountHolderName}\nIBAN: ${EU_DATA.iban}\nBIC / Bank Code: ${EU_DATA.bicBankCode}`

    return (
        <div className={styles.box2}>
            <div className={styles.detailsContainer}>
                <p>Add money to this account to top up your vIBAN.</p>
                <DetailRow
                    label="Account holder name"
                    value={EU_DATA.accountHolderName}
                    copyKey="holder"
                    copiedKey={copiedKey}
                    onCopy={copy}
                />

                <DetailRow
                    label="IBAN"
                    value={EU_DATA.IBAN}
                    copyKey="bic"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    mono
                />
                <DetailRow
                    label="Bank name"
                    value={EU_DATA.Bank_name}
                    copyKey="bic"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    mono
                />
                <DetailRow
                    label="Bank address"
                    value={EU_DATA.Bank_name}
                    copyKey="bic"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    mono
                />
                <DetailRow
                    label="Payment reference"
                    value={EU_DATA.Bank_name}
                    copyKey="bic"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    mono
                />
                <DetailRow
                    label="BIC / Bank Code"
                    value={EU_DATA.Bank_code}
                    copyKey="bic"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    mono
                />
            </div>
            <button className={styles.copyButton} onClick={() => copy(allText, 'all-eu')}>
                {copiedKey === 'all-eu'
                    ? <><Check size={15} /><span>Copied!</span></>
                    : <><Copy size={15} /><span>Copy all details</span></>}
            </button>
        </div>
    )
}

const InternationalPanel = () => {
    const [currency, setCurrency] = useState('usd')
    const { copiedKey, copy } = useCopy()
    const data = INTL_DATA[currency]

    const allText = `Beneficiary name: ${data.beneficiaryName}\nBeneficiary address: ${data.beneficiaryAddress}\nAccount number: ${data.accountNumber}\nBank Code: ${data.bankCode}\nBank name: ${data.bankName}\nBank address: ${data.bankAddress}\nPayment reference: ${data.paymentReference}`

    return (
        <div className={styles.tabsCont}>
            <div className={styles.currencyTabs}>
                <div
                    className={`${styles.currencyTab} ${currency === 'usd' ? styles.currencyTabActive : ''}`}
                    onClick={() => setCurrency('usd')}
                >
                    <div className={styles.currencyRadioOuter}>
                        {currency === 'usd' && <div className={styles.currencyRadioInner} />}
                    </div>
                    <div className={styles.currencyIconWrapper} style={{ background: '#2563EB' }}>
                        <span className={styles.currencySymbol}>$</span>
                    </div>
                    <span>Depositing in USD</span>
                </div>
                <div
                    className={`${styles.currencyTab} ${currency === 'eur' ? styles.currencyTabActive : ''}`}
                    onClick={() => setCurrency('eur')}
                >
                    <div className={styles.currencyRadioOuter}>
                        {currency === 'eur' && <div className={styles.currencyRadioInner} />}
                    </div>
                    <div className={styles.currencyIconWrapper} style={{ background: '#4F46E5' }}>
                        <span className={styles.currencySymbol}>€</span>
                    </div>
                    <span>Depositing in EUR</span>
                </div>
            </div>
            <div className={styles.box2}>


                <div className={styles.detailsContainer}>
                    <p>Add money to this account to top up your vIBAN.</p>
                    <DetailRow label="Beneficiary name" value={data.beneficiaryName} />
                    <DetailRow label="Beneficiary address" value={data.beneficiaryAddress} />
                    <DetailRow label="Account number" value={data.accountNumber} />
                    <DetailRow label="Bank Code" value={data.bankCode} />
                    <DetailRow label="Bank name" value={data.bankName} />
                    <DetailRow label="Bank address" value={data.bankAddress} />
                    <DetailRow label="Payment reference" value={data.paymentReference} /></div>
                <button className={styles.copyButton} onClick={() => copy(allText, 'all-eu')}>
                    {copiedKey === 'all-eu'
                        ? <><Check size={15} /><span>Copied!</span></>
                        : <><Copy size={15} /><span>Copy all details</span></>}
                </button>
                <div className={styles.warningNotice}>
                    <AlertCircle size={15} className={styles.warningIcon} />
                    <p className={styles.warningText}>
                        Please ensure correct reference number is quoted in payment instruction else we will not be able to automatically credit funds to your account, which may cause additional delays.
                    </p>
                </div>

                <button className={styles.copyButton} onClick={() => copy(allText, 'all-intl')}>
                    {copiedKey === 'all-intl'
                        ? <><Check size={15} /><span>Copied!</span></>
                        : <><span></span></>}
                </button>
            </div>
        </div>
    )
}

const IBANDetails = () => {
    const [depositing, setDepositing] = useState('eu')

    return (
        <div className={styles.ibanWrapper}>
            <div className={styles.box1}>
                <div className={styles.boxheader}>
                    <span>Depositing from</span>
                    <button className={styles.moreBtn}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>

                <div className={styles.BoxItems}>
                    <div
                        className={`${styles.boxItem} ${depositing === 'eu' ? styles.active : ''}`}
                        onClick={() => setDepositing('eu')}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === 'eu' && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>Countries in European Union</span>
                    </div>

                    <div
                        className={`${styles.boxItem} ${depositing === 'international' ? styles.active : ''}`}
                        onClick={() => setDepositing('international')}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === 'international' && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>Countries out of EU</span>
                    </div>
                </div>
            </div>

            {depositing === 'eu' ? <EUPanel /> : <InternationalPanel />}
        </div>
    )
}

export default IBANDetails