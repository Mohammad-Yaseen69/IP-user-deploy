import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import { CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Home, List, Plus, Search, Send, User } from "react-feather"
import useWindowWidth from "../../../../utils/useWindowWidth"
import ContactBox from "../../../MyMasterCard/PaymentModal/ContactBox"
import {
    formatAmountValue,
    getAmountInputSize,
    getAmountNumber,
    getCurrencySymbol,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
    isSameAmount,
} from "../../utils/amount"
import {
    getContinueLabel,
    getDisabledState,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    PURPOSE_OPTIONS,
    SEPA_TRANSFER_SPEEDS,
    SIDEBAR_STEPS,
    SIDEBAR_STEP_NAMES,
    STEPS,
} from "../../../../stateMachines/sepaTransfer"
import SidebarProgress from "../../VirtualIbanModal/SidebarProgress"
import OTPConfirmation from "../../WithdrawBalanceModal/OTPConfirmation"
import MT from "../../VirtualIbanModal/icons/mt.svg"
import success from "../../VirtualIbanModal/icons/success.png"
import styles from "./SepaTransfer.module.css"

const DEFAULT_BENEFICIARIES = [
    { id: "arnold-mbuku", name: "Arnold Mbuku", country: "Senegal", type: "Individual", initial: "A", accountCount: 2, accent: "gold", iban: "SN08 2100 0001 1234 5678 9012", bic: "SNBKSNDA", bankName: "Dakar National Bank" },
    { id: "system-pay-spain", name: "System Pay Services Solutions Spain", country: "Spain", type: "Business", initial: "S", accountCount: 1, accent: "dark", iban: "ES91 2100 0418 4502 0005 1332", bic: "CAIXESBB", bankName: "CaixaBank - Madrid, ES" },
    { id: "axel-moulin", name: "Axel Moulin", country: "France", type: "Individual", initial: "A", accountCount: 2, accent: "gold", iban: "FR14 2004 1010 0505 0001 3M02 606", bic: "PSSTFRPP", bankName: "La Banque Postale - Paris, FR" },
]

const DEFAULT_BENEFICIARY_FORM = {
    type: "individual",
    firstName: "",
    lastName: "",
    legalName: "Contoso Europe GmbH",
    iban: "DE89 3704 0044 0532 0130 00",
    bankCountry: "Germany",
    bic: "DEUTDEFF",
    bankName: "Deutsche Bank - Frankfurt, DE",
    reference: "Invoice 2026-0341",
    saveBeneficiary: true,
}

const TRACKING_REFERENCE = "INSTAPAY-SEPA-2026-0341"

const sidebarIcons = {
    [SIDEBAR_STEP_NAMES.PAYMENT_RAIL]: Send,
    [SIDEBAR_STEP_NAMES.AMOUNT]: () => <span className={styles.sidebarIconText}>EUR</span>,
    [SIDEBAR_STEP_NAMES.BENEFICIARY]: User,
    [SIDEBAR_STEP_NAMES.PURPOSE]: List,
    [SIDEBAR_STEP_NAMES.REVIEW]: FileText,
    [SIDEBAR_STEP_NAMES.DONE]: CheckCircle,
}

const formatMoney = (value, currencyCode = "EUR") => `${currencyCode} ${getAmountNumber(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const getSourceBalance = (availableBalance, selectedIban) => availableBalance ?? selectedIban?.balance ?? "53180.07"
const getVirtualIbanNumber = (iban) => iban?.iban || iban?.ibanFull || iban?.account_number || iban?.accountNumber || iban?.virtual_iban || iban?.virtualIban || "MT89 3704 0044 0532 0130 00"
const getVirtualIbanTitle = (iban, fallbackCurrency = "EUR") => iban?.name || iban?.title || iban?.label || `${fallbackCurrency} IBAN`
const getBeneficiaryName = (beneficiary) => beneficiary?.name || beneficiary?.legalName || [beneficiary?.firstName, beneficiary?.lastName].filter(Boolean).join(" ") || "Beneficiary"
const getBeneficiarySubtitle = (beneficiary) => [beneficiary?.country, beneficiary?.type].filter(Boolean).join(" - ")
const getBeneficiaryInitial = (beneficiary) => (beneficiary?.initial || getBeneficiaryName(beneficiary).charAt(0) || "B").toUpperCase()

const maskIban = (iban) => {
    const value = String(iban || "").trim()
    if (!value) return "-"
    return value.length <= 14 ? value : `${value.slice(0, 7)} ... ${value.slice(-7)}`
}

const buildBeneficiaryFromForm = (form) => {
    const isBusiness = form.type === "business"
    const name = isBusiness ? form.legalName : [form.firstName, form.lastName].filter(Boolean).join(" ")

    return {
        id: `new-${Date.now()}`,
        name: name || "New beneficiary",
        country: form.bankCountry || "Germany",
        type: isBusiness ? "Business" : "Individual",
        initial: (name || "N").charAt(0).toUpperCase(),
        accountCount: 1,
        accent: isBusiness ? "dark" : "gold",
        iban: form.iban,
        bic: form.bic,
        bankName: form.bankName,
        reference: form.reference,
    }
}

const TextField = ({ label, value, onChange, hint, type = "text", disabled = false }) => (
    <label className={styles.field}>
        <span>{label}</span>
        <input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
        {hint && <small>{hint}</small>}
    </label>
)

const SepaAmountStep = ({ amount, setAmount, availableBalance, currencyCode, sourceIban, transferSpeed, setTransferSpeed }) => {
    const { t } = useTranslation()
    const symbol = getCurrencySymbol(currencyCode)
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(availableBalance)
    const quickAmounts = [100, 500, 2500, sourceBalance].filter((value, index, arr) => value > 0 && arr.indexOf(value) === index)
    const selectedSpeed = SEPA_TRANSFER_SPEEDS.find((speed) => speed.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]

    return (
        <div className={styles.stepStack}>
            <div>
                <div className={styles.sectionLabel}>{t("Amount to send")}</div>
                <div className={styles.amountPanel}>
                    <div className={styles.amountDisplay}>
                        <span className={styles.currencySymbol}>{symbol}</span>
                        <input
                            className={styles.amountInput}
                            type="text"
                            value={amount}
                            onChange={(event) => handleAmountInputChange(event, setAmount)}
                            onKeyUp={(event) => handleAmountInputKeyUp(event, setAmount)}
                            onBlur={(event) => handleAmountInputBlur(event, setAmount)}
                            size={getAmountInputSize(amount)}
                            placeholder="0.00"
                            maxLength={12}
                            autoFocus
                        />
                    </div>
                    <div className={styles.availableText}>{t("Available")} - {formatMoney(sourceBalance, currencyCode)}</div>
                    {numericAmount > sourceBalance && <div className={styles.balanceError}>{t("Amount cannot exceed available balance")}</div>}
                    <div className={styles.quickAmounts}>
                        {quickAmounts.map((value) => (
                            <button type="button" key={value} className={`${styles.quickBtn} ${isSameAmount(numericAmount, value) ? styles.activeQuickBtn : ""}`} onClick={() => setAmount(formatAmountValue(value))}>
                                {isSameAmount(value, sourceBalance) ? t("Max") : `${symbol}${formatAmountValue(value)}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className={styles.sectionLabel}>{t("From")}</div>
                <div className={styles.sourceCard}>
                    <div className={styles.sourceLeft}>
                        <div className={styles.flagBox}><img src={MT} alt="" /></div>
                        <div><h4>{sourceIban?.title || `${currencyCode} IBAN`}</h4><p>{maskIban(sourceIban?.iban)}</p></div>
                    </div>
                    <div className={styles.sourceBalance}><h4>{formatMoney(sourceBalance, currencyCode)}</h4><p>{t("Available")}</p></div>
                </div>
            </div>

            <div>
                <div className={styles.sectionLabel}>{t("Delivery speed")}</div>
                <div className={styles.speedGrid}>
                    {SEPA_TRANSFER_SPEEDS.map((speed) => (
                        <button type="button" key={speed.id} className={`${styles.speedCard} ${selectedSpeed.id === speed.id ? styles.selectedSpeedCard : ""}`} onClick={() => setTransferSpeed(speed.id)}>
                            <div className={styles.speedCardTop}>
                                <span className={styles.railPill}>{speed.rail}</span>
                                {speed.default && <span className={styles.defaultPill}>{t("Default")}</span>}
                            </div>
                            <div><h4>{t(speed.label)}</h4><p>{t(speed.description)}</p><strong className={speed.feeAmount === 0 ? styles.freeFeeText : styles.feeText}>{t(speed.feeLabel)}</strong></div>
                        </button>
                    ))}
                </div>
                <div className={styles.infoStrip}>{t("The recipient receives")} <strong>{formatMoney(numericAmount, currencyCode)}</strong> {t("in full - no correspondent-bank deductions in SEPA.")}</div>
            </div>
        </div>
    )
}

const BeneficiaryStep = ({ beneficiaries, selectedBeneficiary, setSelectedBeneficiary, onAddBeneficiary }) => {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")
    const filteredBeneficiaries = beneficiaries.filter((beneficiary) => `${getBeneficiaryName(beneficiary)} ${getBeneficiarySubtitle(beneficiary)}`.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className={styles.beneficiaryStep}>
            <div className={styles.beneficiaryHeader}>
                <h3>{t("Beneficiaries")}</h3>
                <button type="button" className={styles.primarySmallBtn} onClick={onAddBeneficiary}><Plus size={16} />{t("Add beneficiary")}</button>
            </div>
            <label className={styles.searchBox}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search beneficiaries")} /></label>
            <div className={styles.beneficiaryList}>
                {filteredBeneficiaries.map((beneficiary) => {
                    const selected = selectedBeneficiary?.id === beneficiary.id
                    return (
                        <button type="button" key={beneficiary.id} className={`${styles.beneficiaryCard} ${selected ? styles.selectedBeneficiary : ""}`} onClick={() => setSelectedBeneficiary(beneficiary)}>
                            <span className={`${styles.avatar} ${styles[beneficiary.accent || "gold"]}`}>{getBeneficiaryInitial(beneficiary)}</span>
                            <span className={styles.beneficiaryCopy}><strong>{getBeneficiaryName(beneficiary)}</strong><small>{getBeneficiarySubtitle(beneficiary)}</small></span>
                            <span className={`${styles.accountBadge} ${selected ? styles.activeBadge : ""}`}>{beneficiary.accountCount || 1}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const AddBeneficiaryStep = ({ amount, currencyCode, form, setForm }) => {
    const { t } = useTranslation()
    const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
    const nameMatches = String(form.iban || "").trim().length > 10

    return (
        <div className={styles.addBeneficiaryStep}>
            <div className={styles.stepHeaderRow}><span>{t("Who are you paying?")}</span><strong>{t("Sending")} {formatMoney(amount, currencyCode)}</strong></div>
            <div className={styles.segmentedControl}>
                {[{ id: "individual", label: "Individual" }, { id: "business", label: "Business" }].map((item) => (
                    <button type="button" key={item.id} className={form.type === item.id ? styles.selectedSegment : ""} onClick={() => updateForm("type", item.id)}>{t(item.label)}</button>
                ))}
            </div>
            {form.type === "business" ? <TextField label={t("Legal name *")} value={form.legalName} onChange={(value) => updateForm("legalName", value)} /> : (
                <div className={styles.formGrid}>
                    <TextField label={t("First name *")} value={form.firstName} onChange={(value) => updateForm("firstName", value)} />
                    <TextField label={t("Last name *")} value={form.lastName} onChange={(value) => updateForm("lastName", value)} />
                </div>
            )}
            <TextField label={t("IBAN *")} value={form.iban} onChange={(value) => updateForm("iban", value)} hint={nameMatches ? t(`${form.bankCountry || "Germany"} - Euro area IBAN`) : ""} />
            {nameMatches && <div className={styles.verificationCard}><CheckCircle size={16} /><div><strong>{t("Name matches the account")}</strong><p>{t("Verification of Payee confirmed with the recipient's bank.")}</p></div></div>}
            <TextField label={t("BIC / SWIFT (optional - derived from IBAN)")} value={form.bic} onChange={(value) => updateForm("bic", value)} hint={form.bankName} />
            <TextField label={t("Reference (visible to recipient) - required")} value={form.reference} onChange={(value) => updateForm("reference", value)} />
            <button type="button" className={styles.toggleRow} onClick={() => updateForm("saveBeneficiary", !form.saveBeneficiary)}><span className={`${styles.toggle} ${form.saveBeneficiary ? styles.toggleOn : ""}`}><span /></span>{t("Save this beneficiary for next time")}</button>
        </div>
    )
}

const PurposeStep = ({ amount, currencyCode, purpose, setPurpose, additionalInfo, setAdditionalInfo }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.purposeStep}>
            <div className={styles.stepHeaderRow}><span>{t("Who pays the intermediary charges?")}</span><strong>{t("Sending")} {formatMoney(amount, currencyCode)}</strong></div>
            <label className={styles.field}>
                <span>{t("Purpose of payment")}</span>
                <div className={styles.selectWrap}><select value={purpose} onChange={(event) => setPurpose(event.target.value)}>{PURPOSE_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select><ChevronDown size={18} /></div>
            </label>
            <TextField label={t("Additional information (optional)")} value={additionalInfo} onChange={setAdditionalInfo} />
            <div className={styles.infoStrip}>{t("SEPA transfers deliver the full amount and carry no correspondent fees, so there is no OUR/SHA/BEN choice to make.")}</div>
        </div>
    )
}

const ReviewStep = ({ amount, currencyCode, transferSpeed, selectedBeneficiary, purpose, additionalInfo, confirmedDetails, setConfirmedDetails }) => {
    const { t } = useTranslation()
    const speed = SEPA_TRANSFER_SPEEDS.find((item) => item.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]
    const rows = [
        ["Recipient", getBeneficiaryName(selectedBeneficiary)],
        ["Beneficiary type", selectedBeneficiary?.type || "-"],
        ["IBAN", selectedBeneficiary?.iban || "-"],
        ["Bank country", selectedBeneficiary?.country || "-"],
        ["BIC", selectedBeneficiary?.bic || "-"],
        ["Bank", selectedBeneficiary?.bankName || "-"],
        ["Verification of Payee", "Name matches"],
        ["Speed", `${speed.label} (${speed.description})`],
        ["Purpose", purpose],
        ["Reference", selectedBeneficiary?.reference || DEFAULT_BENEFICIARY_FORM.reference],
        ["Additional info", additionalInfo || "-"],
        ["Amount", formatMoney(amount, currencyCode)],
        ["Recipient gets", `${formatMoney(amount, currencyCode)} in full`],
        ["Estimated arrival", speed.id === "instant" ? "Seconds" : "1-2 business days"],
    ]

    return (
        <div className={styles.reviewStep}>
            <div className={styles.sectionLabel}>{t("Review your payment")}</div>
            <div className={styles.reviewTable}>
                {rows.map(([label, value]) => <div className={styles.reviewRow} key={label}><span>{t(label)}</span><strong>{t(value)}</strong></div>)}
            </div>
            <label className={styles.confirmRow}>
                <input type="checkbox" checked={confirmedDetails} onChange={(event) => setConfirmedDetails(event.target.checked)} />
                <span>{t("The recipient details are correct. I understand cross-border transfers may be irreversible once collected.")}</span>
            </label>
        </div>
    )
}

const DoneStep = ({ amount, currencyCode, selectedBeneficiary, transferSpeed, onSendAgain, onClose }) => {
    const { t } = useTranslation()
    const speed = SEPA_TRANSFER_SPEEDS.find((item) => item.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]

    return (
        <div className={styles.doneStep}>
            <div className={styles.doneHero}><img src={success} alt="" /><h3>{t("Payment sent")}</h3><p>{t("You sent")} {formatMoney(amount, currencyCode)} {t("to")} {getBeneficiaryName(selectedBeneficiary)}</p></div>
            <div className={styles.reviewTable}>
                <div className={styles.reviewRow}><span>{t("Tracking reference")}</span><strong>{TRACKING_REFERENCE}</strong></div>
                <div className={styles.reviewRow}><span>{t("Status")}</span><strong>{t("Initiated")}</strong></div>
                <div className={styles.reviewRow}><span>{t("Verification of Payee")}</span><strong>{t("Name matches")}</strong></div>
                <div className={styles.reviewRow}><span>{t("Fee")}</span><strong>{speed.feeAmount === 0 ? t("Free") : formatMoney(speed.feeAmount, currencyCode)}</strong></div>
                <div className={styles.reviewRow}><span>{t("Recipient gets")}</span><strong>{formatMoney(amount, currencyCode)} {t("in full")}</strong></div>
                <div className={styles.reviewRow}><span>{t("Expected arrival")}</span><strong>{speed.id === "instant" ? t("Seconds") : t("1-2 business days")}</strong></div>
            </div>
            <div className={styles.doneActions}>
                <button type="button" className={styles.backBtn} onClick={onSendAgain}><Send size={15} />{t("Send again")}</button>
                <div><button type="button" className={styles.backBtn}><Download size={15} />{t("Download receipt")}</button><button type="button" className={styles.nextBtn} onClick={onClose}><Home size={15} />{t("Back to dashboard")}</button></div>
            </div>
        </div>
    )
}

const SepaTransfer = ({ isOpen = true, toggle, selectedIban, availableBalance, beneficiaries = DEFAULT_BENEFICIARIES }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const currencyCode = selectedIban?.currency || "EUR"
    const sourceAvailableBalance = getSourceBalance(availableBalance, selectedIban)
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("2,500.00")
    const [transferSpeed, setTransferSpeed] = useState("standard")
    const [beneficiaryList, setBeneficiaryList] = useState(beneficiaries)
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(beneficiaries[0] || null)
    const [beneficiaryForm, setBeneficiaryForm] = useState(DEFAULT_BENEFICIARY_FORM)
    const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false)
    const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0])
    const [additionalInfo, setAdditionalInfo] = useState("PO 88213")
    const [confirmedDetails, setConfirmedDetails] = useState(true)
    const [authType, setAuthType] = useState("authenticator")

    const sourceIban = useMemo(() => ({ title: getVirtualIbanTitle(selectedIban, currencyCode), iban: getVirtualIbanNumber(selectedIban) }), [selectedIban, currencyCode])
    const machineData = useMemo(() => ({ amount, availableBalance: sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, confirmedDetails }), [amount, sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, confirmedDetails])
    const disabled = getDisabledState(currentStep, machineData)
    const showFooter = currentStep !== STEPS.OTP && currentStep !== STEPS.DONE

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("2,500.00")
        setTransferSpeed("standard")
        setSelectedBeneficiary(beneficiaryList[0] || null)
        setBeneficiaryForm(DEFAULT_BENEFICIARY_FORM)
        setIsAddingBeneficiary(false)
        setPurpose(PURPOSE_OPTIONS[0])
        setAdditionalInfo("PO 88213")
        setConfirmedDetails(true)
        setAuthType("authenticator")
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const handleContinue = () => {
        if (currentStep === STEPS.ADD_BENEFICIARY) {
            const nextBeneficiary = buildBeneficiaryFromForm(beneficiaryForm)
            setSelectedBeneficiary(nextBeneficiary)
            if (beneficiaryForm.saveBeneficiary) setBeneficiaryList((prev) => [nextBeneficiary, ...prev])
            setCurrentStep(STEPS.PURPOSE)
            return
        }

        const { nextStep } = goNext(currentStep, machineData)
        if (nextStep) setCurrentStep(nextStep)
    }

    const handleBack = () => {
        const { prevStep } = goBack(currentStep, machineData)
        if (currentStep === STEPS.ADD_BENEFICIARY) setIsAddingBeneficiary(false)
        if (prevStep === null) handleClose()
        else setCurrentStep(prevStep)
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.AMOUNT:
                return <SepaAmountStep amount={amount} setAmount={setAmount} availableBalance={sourceAvailableBalance} currencyCode={currencyCode} sourceIban={sourceIban} transferSpeed={transferSpeed} setTransferSpeed={setTransferSpeed} />
            case STEPS.BENEFICIARY:
                return <BeneficiaryStep beneficiaries={beneficiaryList} selectedBeneficiary={selectedBeneficiary} setSelectedBeneficiary={setSelectedBeneficiary} onAddBeneficiary={() => { setIsAddingBeneficiary(true); setCurrentStep(STEPS.ADD_BENEFICIARY) }} />
            case STEPS.ADD_BENEFICIARY:
                return <AddBeneficiaryStep amount={amount} currencyCode={currencyCode} form={beneficiaryForm} setForm={setBeneficiaryForm} />
            case STEPS.PURPOSE:
                return <PurposeStep amount={amount} currencyCode={currencyCode} purpose={purpose} setPurpose={setPurpose} additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} />
            case STEPS.REVIEW:
                return <ReviewStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} purpose={purpose} additionalInfo={additionalInfo} confirmedDetails={confirmedDetails} setConfirmedDetails={setConfirmedDetails} />
            case STEPS.OTP:
                return <OTPConfirmation setter={setCurrentStep} setterValue={STEPS.DONE} hideOtp={() => { }} callback={async (setter) => setter(true)} resendHandler={() => { }} authType={authType} setAuthType={setAuthType} onCancel={handleClose} />
            case STEPS.DONE:
                return <DoneStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} onSendAgain={resetState} onClose={handleClose} />
            default:
                return null
        }
    }

    return (
        <Modal isOpen={isOpen} style={{ minWidth: width > 1000 ? "980px" : "0%" }} toggle={handleClose}>
            <ModalBody style={{ padding: "20px" }}>
                <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
                    <aside className={styles.leftPanel}>
                        <div>
                            <div className={styles.flowHeader}><div className={styles.flowIcon}><Send size={18} /></div><div><h2>{t("SEPA Transfer")}</h2><p>{t("European Bank Transfer - EUR only")}</p></div></div>
                            <div className={styles.progressEffect}>
                                {SIDEBAR_STEPS.map((item, index) => {
                                    const IconComponent = sidebarIcons[item.stepName]
                                    return <SidebarProgress key={item.stepName} stepLabel={item.stepLabel} label={item.label} Icon={IconComponent} isActive={isSidebarStepActive(item, currentStep)} isCompleted={isSidebarStepCompleted(item, currentStep)} showBar={index < SIDEBAR_STEPS.length - 1} />
                                })}
                            </div>
                        </div>
                        {width > 700 && <div className={styles.contactBox}><ContactBox /></div>}
                    </aside>
                    <section className={styles.rightPanel}>
                        <div className={styles.content}>{renderStepContent()}</div>
                        {showFooter && (
                            <div className={styles.footer}>
                                <button type="button" className={styles.cancelBtn} onClick={handleClose}>{t("Cancel")}</button>
                                <div className={styles.footerNav}>
                                    <button type="button" className={styles.backBtn} onClick={handleBack}><ChevronLeft size={14} />{t("Back")}</button>
                                    <button type="button" className={styles.nextBtn} disabled={disabled} onClick={handleContinue}>{getContinueLabel(currentStep, t)}<ChevronRight size={14} /></button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default SepaTransfer