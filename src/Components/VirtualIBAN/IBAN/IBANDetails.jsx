import { useMemo, useState } from 'react'
import { MoreHorizontal, Copy, Check, AlertCircle } from 'react-feather'
import styles from '../styles/IBANDetails.module.css'
import { useVirtualIbanDetails } from '../hooks/useVirtualIban'
import { normalizeVirtualIban } from '../utils/virtualIban'
import { useTranslation } from 'react-i18next'

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
        if (!text) return
        navigator.clipboard.writeText(text).then(() => {
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        })
    }
    return { copiedKey, copy }
}

const DetailRow = ({ label, value, copyKey, copiedKey, onCopy, mono }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.detailRow}>
            <span className={styles.label}>{label}</span>
            <div className={styles.valueGroup}>
                <span className={`${styles.value} ${mono ? styles.mono : ""}`}>{value || "-"}</span>
                {onCopy && value && (
                    <button
                        className={styles.inlineCopyBtn}
                        onClick={() => onCopy(value, copyKey)}
                        title={t("Copy")}
                    >
                        {copiedKey === copyKey
                            ? <Check size={13} className={styles.copiedIcon} />
                            : <Copy size={13} />}
                    </button>
                )}
            </div>
        </div>
    )
}

const IBANDetails = ({ ibanId, fallbackIban }) => {
    const [depositing, setDepositing] = useState("eu")
    const [intlCurrency, setIntlCurrency] = useState("usd")
    const { t } = useTranslation()
    const { data, isFetching } = useVirtualIbanDetails(ibanId)
    const { copiedKey, copy } = useCopy()
    const iban = useMemo(
        () => normalizeVirtualIban(data || fallbackIban) || {},
        [data, fallbackIban]
    )
    const bankAddress = iban?.bankAddress || iban?.bank?.formattedAddress || ""
    const allText = [
        `${t("Account holder name")}: ${iban?.account_holder_name || ""}`,
        `${t("IBAN")}: ${iban?.iban || ""}`,
        `${t("BIC / Bank Code")}: ${iban?.bank?.bic || ""}`,
        `${t("Bank name")}: ${iban?.bank?.name || ""}`,
        `${t("Bank address")}: ${bankAddress}`,
    ].filter((line) => !line.endsWith(": ")).join("\n")

    return (
        <div className={styles.ibanWrapper}>
            <div className={styles.box1}>
                <div className={styles.boxheader}>
                    <span>{t("Depositing from")}</span>
                    <button className={styles.moreBtn} title={t("More options")}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>

                <div className={styles.BoxItems}>
                    <div
                        className={`${styles.boxItem} ${depositing === "eu" ? styles.active : ""}`}
                        onClick={() => setDepositing("eu")}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === "eu" && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>{t("Countries in European Union")}</span>
                    </div>

                    <div
                        className={`${styles.boxItem} ${depositing === "international" ? styles.active : ""}`}
                        onClick={() => setDepositing("international")}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === "international" && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>{t("Countries out of EU")}</span>
                    </div>
                </div>
            </div>
            <div className={styles.cont1}>
                {depositing === "international" && (
                    <div className={styles.currencyTabs}>
                        <button
                            className={`${styles.currencyTab} ${intlCurrency === "usd" ? styles.active : ""}`}
                            onClick={() => setIntlCurrency("usd")}
                        >
                            <input type="radio" checked={intlCurrency === "usd"} readOnly />
                            <span className={styles.currencyIcon}>$</span> {t("Depositing in USD")}
                        </button>
                        <button
                            className={`${styles.currencyTab} ${intlCurrency === "eur" ? styles.active : ""}`}
                            onClick={() => setIntlCurrency("eur")}
                        >
                            <input type="radio" checked={intlCurrency === "eur"} readOnly />

                            <span className={styles.currencyIcon}>€</span> {t("Depositing in EUR")}
                        </button>
                    </div>
                )}
                <div className={styles.box2} style={depositing === "international" ? { marginTop: "10px" } : {}}>


                    <div className={styles.detailsContainer}>
                        {isFetching && <span className={styles.label}>{t("Refreshing details...")}</span>}
                        <p>{t("Add money to this account to top up your vIBAN.")}</p>
                        {depositing === "eu" ? (
                            <>
                                <DetailRow label={t("Account holder name")} value={iban?.account_holder_name} copyKey="holder" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("IBAN")} value={iban?.iban} copyKey="iban" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("BIC / Bank Code")} value={iban?.bank?.bic} copyKey="bic" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Bank name")} value={iban?.bank?.name} copyKey="bank" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Bank address")} value={bankAddress} copyKey="bank-address" copiedKey={copiedKey} onCopy={copy} />
                            </>
                        ) : (
                            <>
                                <DetailRow label={t("Beneficiary name")} value={INTL_DATA[intlCurrency]?.beneficiaryName} copyKey="intl-holder" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Beneficiary address")} value={INTL_DATA[intlCurrency]?.beneficiaryAddress} copyKey="intl-address" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Account number")} value={INTL_DATA[intlCurrency]?.accountNumber} copyKey="intl-account" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Bank Code")} value={INTL_DATA[intlCurrency]?.bankCode} copyKey="intl-bankcode" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Bank name")} value={INTL_DATA[intlCurrency]?.bankName} copyKey="intl-bank" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Bank address")} value={INTL_DATA[intlCurrency]?.bankAddress} copyKey="intl-bank-address" copiedKey={copiedKey} onCopy={copy} />
                                <DetailRow label={t("Payment reference")} value={INTL_DATA[intlCurrency]?.paymentReference} copyKey="intl-reference" copiedKey={copiedKey} onCopy={copy} />
                            </>
                        )}
                    </div>
                    <button className={styles.copyButton} onClick={() => copy(allText, "all-details")}>
                        {copiedKey === "all-details"
                            ? <><Check size={15} /><span>{t("Copied!")}</span></>
                            : <><Copy size={15} /><span>{t("Copy all details")}</span></>}
                    </button>
                    {depositing === "international" && (
                        <div className={styles.warningNotice}>
                            <AlertCircle size={20} className={styles.warningIcon} fill='#5926F0' />
                            <p className={styles.warningText}>
                                {t("Please ensure correct reference number is quoted in payment instruction else we will not be able to automatically credit funds to your account, which may cause additional delays.")}
                            </p>
                        </div>
                    )}


                </div>
            </div>
        </div>
    )
}

export default IBANDetails
