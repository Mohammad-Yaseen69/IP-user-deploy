import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal as MuiModal } from "@mui/material"
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css"
import { PAYOUT_PURPOSES } from "../api/fixtures"
import bankIcon from "../assets/figma/fund-bank.svg"
import globeIcon from "../assets/figma/wd-globe.svg"
import mobileIcon from "../assets/figma/wd-mobile-18.svg"
import plusIcon from "../assets/figma/wd-plus.svg"
import radioOnIcon from "../assets/figma/wd-radio.svg"
import segBankIcon from "../assets/figma/wd-seg-bank.svg"
import segMobileIcon from "../assets/figma/wd-seg-mobile.svg"
import closeIcon from "../assets/figma/wd-x.svg"
import styles from "../styles/copyTrading.module.css"
import local from "./DestinationDialog.module.css"
import { ACCOUNT_STATUS } from "./icons"
import { Badge, Button } from "./primitives"

const cx = (...names) => names.filter(Boolean).join(" ")

/* Dialog surface of the withdrawal flow (WEB-11): 20px title, 12px rhythm, 40px footer buttons. */
const FlowDialog = ({ open, onClose, title, subtitle, children, footer }) => {
    const { t } = useTranslation()
    return (
        <MuiModal open={open} onClose={onClose} aria-labelledby="ct-flow-dialog-title">
            <div className={cx(abf.root, styles.modal, local.dialog)}>
                <div className={local.head}>
                    <div className={local.titleBlock}>
                        <h2 id="ct-flow-dialog-title" className={local.title}>{title}</h2>
                        {subtitle && <p className={local.subtitle}>{subtitle}</p>}
                    </div>
                    <button type="button" className={local.close} onClick={onClose} aria-label={t("Close")}><img src={closeIcon} alt="" /></button>
                </div>
                {children}
                {footer && <div className={local.foot}>{footer}</div>}
            </div>
        </MuiModal>
    )
}

const METHOD_OPTIONS = {
    mobile_wallet: { label: "Mobile Wallet", icon: segMobileIcon },
    bank_account: { label: "Bank Account", icon: segBankIcon },
    cash_pickup: { label: "Cash Pickup", icon: globeIcon },
}

/* Full-width method switch with the Figma device / bank glyphs; only methods the customer has saved are offered. */
const MethodSwitch = ({ value, onChange, methods }) => {
    const { t } = useTranslation()
    return (
        <div className={cx(styles.segmented, local.methodSwitch)} role="radiogroup" aria-label={t("Receiving method")}>
            {methods.map(key => (
                <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={value === key}
                    className={cx(styles.segment, value === key && styles.segmentActive, local.methodItem)}
                    onClick={() => onChange(key)}
                >
                    <img src={METHOD_OPTIONS[key].icon} alt="" />
                    {t(METHOD_OPTIONS[key].label)}
                </button>
            ))}
        </div>
    )
}

const accountIcon = (method) => (method === "bank_account" ? bankIcon : method === "cash_pickup" ? globeIcon : mobileIcon)

/*
 * WEB-11. The customer's own InstaPay receiving accounts (Settings → Withdrawals), by country and
 * method. With none saved, the dialog asks them to create a withdrawal channel first.
 */
const DestinationDialog = ({ open, onClose, accounts, loaded, canAdd, ownerName, initial, onAddAccount, onConfirm }) => {
    const { t } = useTranslation()
    const [countryIso3, setCountryIso3] = useState(initial?.countryIso3 || "")
    const [method, setMethod] = useState(initial?.method || "")
    const [accountId, setAccountId] = useState(initial?.id || "")
    const [purpose, setPurpose] = useState(initial?.purpose || PAYOUT_PURPOSES[0])

    const countries = [...new Map(accounts.map(account => [account.countryIso3, account])).values()]
    const country = countries.find(item => item.countryIso3 === countryIso3) || countries[0] || null
    const inCountry = accounts.filter(account => account.countryIso3 === country?.countryIso3)
    const methods = Object.keys(METHOD_OPTIONS).filter(key => inCountry.some(account => account.method === key))
    const activeMethod = methods.includes(method) ? method : methods[0]
    const matching = inCountry.filter(account => account.method === activeMethod)
    const selected = matching.find(account => account.id === accountId && account.status === "verified")

    const switchCountry = (iso3) => { setCountryIso3(iso3); setMethod(""); setAccountId("") }
    const switchMethod = (next) => { setMethod(next); setAccountId("") }

    const addButton = (
        <button type="button" className={local.addAccount} onClick={onAddAccount} disabled={!canAdd}>
            <span className={local.accountTile}><img src={plusIcon} alt="" /></span>
            <span className={local.accountText}>
                <span className={cx(local.accountTitle, local.addTitle)}>{t("Add receiving account")}</span>
                <span className={local.accountSub}>{canAdd ? t("Create a withdrawal channel in your name") : t("You have reached the limit of 3 countries.")}</span>
            </span>
        </button>
    )

    const body = () => {
        if (!loaded) return <p className={local.empty}>{t("Loading your receiving accounts…")}</p>
        if (!accounts.length) {
            return (
                <>
                    <p className={local.empty}>{t("You don't have a receiving account yet. Create a withdrawal channel to receive this payout.")}</p>
                    {addButton}
                </>
            )
        }
        return (
            <>
                {countries.length > 1 ? (
                    <select className={local.select} value={country?.countryIso3} onChange={e => switchCountry(e.target.value)} aria-label={t("Country")}>
                        {countries.map(item => <option key={item.countryIso3} value={item.countryIso3}>{item.countryName}</option>)}
                    </select>
                ) : (
                    <div className={local.field} aria-label={t("Country")}>
                        <img src={country?.flag || globeIcon} alt="" />
                        <span>{country?.countryName}</span>
                    </div>
                )}

                {methods.length > 1 && <MethodSwitch value={activeMethod} onChange={switchMethod} methods={methods} />}

                <p className={local.groupLabel}>{t("Your receiving account")}</p>
                <div className={local.accounts} role="radiogroup" aria-label={t("Your receiving account")}>
                    {matching.map(account => {
                        const status = ACCOUNT_STATUS[account.status]
                        const active = accountId === account.id
                        return (
                            <button
                                key={account.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={account.status !== "verified"}
                                className={cx(local.account, active && local.accountSelected)}
                                onClick={() => setAccountId(account.id)}
                            >
                                {active ? <img className={local.radio} src={radioOnIcon} alt="" /> : <span className={local.radioOff} aria-hidden="true" />}
                                <span className={local.accountTile}><img src={accountIcon(account.method)} alt="" /></span>
                                <span className={local.accountText}>
                                    <span className={local.accountTitle}>{account.providerLabel}{account.last4 && ` · ${t("ending {{last4}}", { last4: account.last4 })}`}</span>
                                    <span className={local.accountSub}>{ownerName} · {t("Own account")} · {account.currency}</span>
                                </span>
                                <Badge tone={status.tone}>{t(status.label)}</Badge>
                            </button>
                        )
                    })}
                </div>

                {addButton}

                <label className={local.fieldLabel} htmlFor="ct-purpose">{t("Purpose, when required")}</label>
                <select id="ct-purpose" className={local.select} value={purpose} onChange={e => setPurpose(e.target.value)}>
                    {PAYOUT_PURPOSES.map(item => <option key={item} value={item}>{t(item)}</option>)}
                </select>
            </>
        )
    }

    return (
        <FlowDialog
            open={open}
            onClose={onClose}
            title={t("Where should we send it?")}
            subtitle={t("Choose one of your InstaPay receiving accounts.")}
            footer={(
                <>
                    <Button variant="secondary" className={local.footBtn} onClick={onClose}>{t("Cancel")}</Button>
                    <Button className={local.footBtn} onClick={() => { onConfirm(selected, purpose); onClose() }} disabled={!selected || !purpose}>{t("Continue")}</Button>
                </>
            )}
        >
            {body()}
        </FlowDialog>
    )
}

export default DestinationDialog
