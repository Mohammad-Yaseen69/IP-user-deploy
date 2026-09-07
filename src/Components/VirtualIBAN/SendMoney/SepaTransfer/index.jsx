import { useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { Modal, ModalBody } from "reactstrap"
import { CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Home, List, Plus, Search, Send, User } from "react-feather"
import AddBeneficiaryModal from "../../Beneficiaries/Modals/AddBeneficiaryModal"
import DynamicChannelModal from "../../Beneficiaries/Modals/DynamicChannelModal"
import useWindowWidth from "../../../../utils/useWindowWidth"
import ContactBox from "../../../MyMasterCard/PaymentModal/ContactBox"
import { getAmountNumber } from "../../utils/amount"
import { getVirtualIbanId } from "../../utils/virtualIban"
import {
    getContinueLabel,
    getDisabledState,
    getPurposeCode,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    MIN_AMOUNT,
    MAX_AMOUNT,
    PURPOSE_OPTIONS,
    SEPA_TRANSFER_SPEEDS,
    SIDEBAR_STEPS,
    SIDEBAR_STEP_NAMES,
    STEPS,
} from "../../../../stateMachines/sepaTransfer"
import SidebarProgress from "../../VirtualIbanModal/SidebarProgress"
import AmountStep from "../../ConvertFundsModal/AmountStep"
import MT from "../../VirtualIbanModal/icons/mt.svg"
import success from "../../VirtualIbanModal/icons/success.png"
import styles from "./SepaTransfer.module.css"
import withdrawStyles from "../../WithdrawBalanceModal/withdrawBalance.module.scss"
import { UserContext } from "../../../../Context/UserContext"
import useSendOtp from "../../../../hooks/GeneralUse/useSendOtp"
import { useQueryClient } from "@tanstack/react-query"
import { useVirtualIbanPayoutDirect, useVirtualIbanPayoutFee, useSyncVirtualIbanBalance, virtualIbanQueryKeys } from "../../../../hooks/useVirtualIban"
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError"
import OTPConfirmation from "../../../UserSettingsNew/OTPConfirmation"
import sepaCountries from "./sepaCountries.json"
import { Tooltip } from "@mui/material"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { isValidDescription } from "../../utils/swiftValidation"
import BeneficiaryStep from "../Common/BeneficiaryStep"
import {
    getBeneficiaryName,
    getBeneficiaryTypeLabel,
    getBeneficiaryCountry,
    getBeneficiaryBankDetail,
    getBeneficiaryBic,
    getBeneficiaryBankName,
    getBeneficiaryIban,
    getBeneficiaryInitial,
    getBeneficiaryId,
    getBeneficiaryAccountCount,
    getBeneficiarySubtitle,
    maskIban
} from "../Common/beneficiaryHelpers"
import { formatCurrency } from "../../../../Helper/AmountFormat"
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption"

const DEFAULT_BENEFICIARY_FORM = {
    type: "individual",
    firstName: "",
    lastName: "",
    legalName: "",
    iban: "",
    bankCountry: "",
    bic: "",
    bankName: "",
    reference: "",
    saveBeneficiary: true,
}

const sidebarIcons = {
    [SIDEBAR_STEP_NAMES.PAYMENT_RAIL]: Send,
    [SIDEBAR_STEP_NAMES.AMOUNT]: () => <span className={styles.sidebarIconText}>EUR</span>,
    [SIDEBAR_STEP_NAMES.BENEFICIARY]: User,
    [SIDEBAR_STEP_NAMES.PURPOSE]: List,
    [SIDEBAR_STEP_NAMES.REVIEW]: FileText,
    [SIDEBAR_STEP_NAMES.DONE]: CheckCircle,
}

const formatMoney = (value, currencyCode = "EUR") => {
    return `${currencyCode} ${formatCurrency(value, false, undefined)}`
}
const getSourceBalance = (availableBalance, selectedIban) => availableBalance ?? selectedIban?.balance ?? 0
const getVirtualIbanNumber = (iban) => iban?.iban || iban?.ibanFull || iban?.account_number || iban?.accountNumber || iban?.virtual_iban || iban?.virtualIban || ""
const getVirtualIbanTitle = (iban, fallbackCurrency = "EUR") => iban?.name || iban?.title || iban?.label || `${fallbackCurrency} IBAN`

const buildBeneficiaryFromForm = (form) => {
    const isBusiness = form.type === "business"
    const name = isBusiness ? form.legalName : [form.firstName, form.lastName].filter(Boolean).join(" ")

    return {
        id: `new-${Date.now()}`,
        name: name || "New beneficiary",
        country: form.bankCountry,
        beneficiary_type: isBusiness ? "business" : "individual",
        iban: form.iban,
        bic: form.bic,
        bankName: form.bankName,
        reference: form.reference,
    }
}

const TextField = ({ label, value, onChange, hint, type = "text", disabled = false, error = "", placeholder = "", maxLength }) => (
    <label className={styles.field}>
        <span>{label}</span>
        <input
            type={type}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={error ? styles.fieldError : ""}
            onChange={(event) => onChange(event.target.value)}
        />
        {hint && !error && <small>{hint}</small>}
        {error && <span className={styles.fieldErrorText}>{error}</span>}
    </label>
)

const SepaAmountStep = ({ amount, setAmount, availableBalance, currencyCode, sourceIban, transferSpeed, setTransferSpeed }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(availableBalance)
    const selectedSpeed = SEPA_TRANSFER_SPEEDS.find((speed) => speed.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]

    return (
        <div className={styles.stepStack}>
            <AmountStep amount={amount} setAmount={setAmount} currencyCode={currencyCode} availableBalance={sourceBalance} label="Amount to send" min={MIN_AMOUNT} max={MAX_AMOUNT} />

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
                    {SEPA_TRANSFER_SPEEDS.map((speed) => {
                        const isComingSoon = false;

                        return (
                            <Tooltip
                                key={speed.id}
                                title={isComingSoon ? t("Coming soon") : ""}
                                arrow
                            >
                                <span style={{ display: "block" }}>
                                    <button
                                        type="button"
                                        className={`${styles.speedCard} ${selectedSpeed.id === speed.id
                                            ? styles.selectedSpeedCard
                                            : ""
                                            }`}
                                        onClick={() =>
                                            !isComingSoon && setTransferSpeed(speed.id)
                                        }
                                        disabled={isComingSoon}
                                        style={{
                                            cursor: isComingSoon
                                                ? "not-allowed"
                                                : "pointer",
                                            opacity: isComingSoon ? 0.6 : 1,
                                        }}
                                    >
                                        <div className={styles.speedCardTop}>
                                            <span className={styles.railPill}>
                                                {speed.rail}
                                            </span>

                                            <span className={styles.speedFee}>
                                                {speed.feeLabel}
                                            </span>
                                        </div>

                                        <div className={styles.speedCardBody}>
                                            <p className={styles.speedLabel}>
                                                {speed.label}
                                            </p>
                                            <p
                                                className={
                                                    styles.speedDescription
                                                }
                                            >
                                                {speed.description}
                                            </p>
                                        </div>
                                    </button>
                                </span>
                            </Tooltip>
                        );
                    })}
                </div>
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

const PurposeStep = ({ amount, currencyCode, purpose, setPurpose, description, setDescription, additionalInfo, setAdditionalInfo }) => {
    const { t } = useTranslation()
    const descError = description && !isValidDescription(description) ? t("5–120 characters; letters, digits, space, comma, dot, hyphen only") : ""

    return (
        <div className={styles.purposeStep}>
            <div className={styles.stepHeaderRow}><span>{t("Who pays the intermediary charges?")}</span><strong>{t("Sending")} {formatMoney(amount, currencyCode)}</strong></div>
            <label className={styles.field}>
                <span>{t("Purpose category")}</span>
                <div className={styles.selectWrap}>
                    <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                        {PURPOSE_OPTIONS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                    </select>
                    <ChevronDown size={18} />
                </div>
            </label>
            <TextField
                label={t("Description / Remittance Reference *")}
                value={description}
                onChange={setDescription}
                placeholder={t("e.g. Invoice payment, consultant fees, trade")}
                hint={!descError ? t("5–120 characters; letters, digits, space, comma, dot, hyphen only") : ""}
                error={descError}
                maxLength={120}
            />
            <TextField label={t("Additional information (optional)")} value={additionalInfo} onChange={setAdditionalInfo} />
            <div className={styles.infoStrip}>{t("SEPA transfers deliver the full amount and carry no correspondent fees, so there is no OUR/SHA/BEN choice to make.")}</div>
        </div>
    )
}

const ReviewStep = ({ amount, currencyCode, transferSpeed, selectedBeneficiary, purpose, additionalInfo, feeDetails, confirmedDetails, setConfirmedDetails }) => {
    const { t } = useTranslation()
    const speed = SEPA_TRANSFER_SPEEDS.find((item) => item.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]
    const feeAmount = feeDetails?.fee
    const recipientAmount = feeDetails?.recipient
    const totalAmount = feeDetails?.total
    const rows = [
        ["Recipient", getBeneficiaryName(selectedBeneficiary)],
        ["Beneficiary type", getBeneficiaryTypeLabel(selectedBeneficiary)],
        ["IBAN", maskIban(getBeneficiaryIban(selectedBeneficiary))],
        ["Bank country", getBeneficiaryCountry(selectedBeneficiary)],
        ["BIC", getBeneficiaryBic(selectedBeneficiary)],
        ["Bank", getBeneficiaryBankName(selectedBeneficiary)],
        ["Speed", `${speed.label} (${speed.description})`],
        ["Purpose", purpose],
        ["Additional info", additionalInfo || "-"],
        ["Amount", formatMoney(amount, currencyCode)],
        ["Fee", feeAmount ? formatMoney(feeAmount.value, feeAmount.currency || currencyCode) : t("Calculating...")],
        ["Recipient gets", `${formatMoney(recipientAmount?.value ?? amount, currencyCode)} ${t("in full")}`],
        ["Total to be debited", totalAmount ? formatMoney(totalAmount.value, totalAmount.currency || currencyCode) : formatMoney(amount, currencyCode)],
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
const downloadSepaReceipt = ({
    amount,
    currencyCode,
    transferSpeed,
    selectedBeneficiary,
    purpose,
    additionalInfo,
    feeDetails,
    payoutResult,
    t,
}) => {
    const doc = new jsPDF()
    const margin = 14
    const speed =
        SEPA_TRANSFER_SPEEDS.find(
            (item) => item.id === transferSpeed
        ) || SEPA_TRANSFER_SPEEDS[0]

    const feeAmount = feeDetails?.fee
    const recipientAmount = feeDetails?.recipient
    const totalAmount = feeDetails?.total

    const trackingReference =
        payoutResult?.transaction_id ||
        payoutResult?.reference_id ||
        payoutResult?.reference ||
        payoutResult?._id ||
        "-"

    const status = payoutResult?.status || "Initiated"

    const rows = [
        ["Recipient", getBeneficiaryName(selectedBeneficiary)],
        ["Beneficiary type", getBeneficiaryTypeLabel(selectedBeneficiary)],
        ["IBAN", getBeneficiaryIban(selectedBeneficiary)],
        ["Bank country", getBeneficiaryCountry(selectedBeneficiary)],
        ["BIC", getBeneficiaryBic(selectedBeneficiary)],
        ["Bank", getBeneficiaryBankName(selectedBeneficiary)],
        ["Speed", `${speed.label} - ${speed.description}`],
        ["Purpose", purpose || "-"],
        ["Additional info", additionalInfo || "-"],
        ["Amount", formatMoney(amount, currencyCode)],
        [
            "Fee",
            feeAmount
                ? formatMoney(
                    feeAmount.value,
                    feeAmount.currency || currencyCode
                )
                : "Free",
        ],
        [
            "Recipient gets",
            `${formatMoney(
                recipientAmount?.value ?? amount,
                currencyCode
            )} in full`,
        ],
        [
            "Total to be debited",
            totalAmount
                ? formatMoney(
                    totalAmount.value,
                    totalAmount.currency || currencyCode
                )
                : formatMoney(amount, currencyCode),
        ],
        [
            "Estimated arrival",
            speed.id === "instant"
                ? "Seconds"
                : "1-2 business days",
        ],
        ["Tracking reference", trackingReference],
        ["Status", status],
    ]

    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(89, 38, 240)
    doc.text("SEPA Transfer Receipt", margin, 48)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(130, 130, 138)
    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        margin,
        56
    )

    autoTable(doc, {
        startY: 64,
        head: [["Details", "Information"]],
        body: rows,
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [35, 35, 40],
        },
        headStyles: {
            fontStyle: "bold",
            fillColor: [89, 38, 240],
            textColor: [255, 255, 255],
        },
        alternateRowStyles: {
            fillColor: [246, 245, 252],
        },
        columnStyles: {
            0: {
                cellWidth: 55,
                fontStyle: "bold",
                textColor: [130, 130, 138],
            },
            1: {
                cellWidth: 125,
            },
        },
    })

    const finalY = doc.lastAutoTable.finalY + 12

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(90, 90, 95)

    doc.text(
        "The recipient receives the full amount - no correspondent-bank deductions in SEPA.",
        margin,
        finalY
    )

    doc.setFontSize(8)
    doc.setTextColor(130, 130, 138)
    doc.text(
        "This receipt is generated electronically.",
        margin,
        finalY + 8
    )

    doc.setDrawColor(225, 222, 240)
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(35, 35, 40)
    doc.text("InstaPay Swiss", margin, pageHeight - 10)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(89, 38, 240)
    doc.text("www.insta-pay.ch", pageWidth - margin, pageHeight - 10, { align: "right" })

    doc.save(
        `SEPA-Transfer-Receipt-${trackingReference}.pdf`
    )
}
const DoneStep = ({
    amount,
    currencyCode,
    selectedBeneficiary,
    transferSpeed,
    feeDetails,
    payoutResult,
    purpose,
    additionalInfo,
    onSendAgain,
    onClose,
}) => {
    const { t } = useTranslation()
    const speed = SEPA_TRANSFER_SPEEDS.find((item) => item.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]
    const feeAmount = feeDetails?.fee
    const recipientAmount = feeDetails?.recipient
    const trackingReference = payoutResult?.transaction_id || payoutResult?.reference_id || payoutResult?.reference || payoutResult?._id || "-"
    const status = payoutResult?.status || "Initiated"
    const navigate = useNavigate()

    return (
        <div className={styles.doneStep}>
            <div className={styles.doneHero}><img src={success} alt="" /><h3>{t("Payment sent")}</h3><p>{t("You sent")} {formatMoney(amount, currencyCode)} {t("to")} {getBeneficiaryName(selectedBeneficiary)}</p></div>
            <div className={styles.reviewTable}>
                <div className={styles.reviewRow}><span>{t("Tracking reference")}</span><strong>{trackingReference}</strong></div>
                <div className={styles.reviewRow}><span>{t("Status")}</span><strong>{t(status)}</strong></div>
                <div className={styles.reviewRow}><span>{t("Fee")}</span><strong>{feeAmount ? formatMoney(feeAmount.value, feeAmount.currency || currencyCode) : t("Free")}</strong></div>
                <div className={styles.reviewRow}><span>{t("Recipient gets")}</span><strong>{formatMoney(recipientAmount?.value ?? amount, currencyCode)} {t("in full")}</strong></div>
                <div className={styles.reviewRow}><span>{t("Expected arrival")}</span><strong>{speed.id === "instant" ? t("Seconds") : t("1-2 business days")}</strong></div>
            </div>
            <div className={styles.doneActions}>
                <button type="button" className={styles.backBtn} onClick={onSendAgain}><Send size={15} />{t("Send again")}</button>
                <div>
                    <button type="button" className={styles.backBtn} onClick={() => downloadSepaReceipt({ amount, currencyCode, transferSpeed, selectedBeneficiary, purpose, additionalInfo, feeDetails, payoutResult, t })}><Download size={15} />{t("Download receipt")}</button>
                    <button type="button" className={styles.nextBtn} onClick={() => navigate('/virtual-IBAN')}><Home size={15} />{t("Back to dashboard")}</button></div>
            </div>
        </div>
    )
}

const FallbackStandardStep = ({ onSwitchToStandard, onCancel }) => {
    const { t } = useTranslation()

    return (
        <div className={styles.doneStep}>
            <div className={styles.doneHero} style={{ background: "#ffffff", borderColor: "#e1e5ee", padding: "36px 24px" }}>
                <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(89, 38, 240, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                    color: "#5926f0"
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5926f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0c0a20", margin: 0 }}>
                    {t("SEPA Instant Not Supported")}
                </h3>
                <p style={{ margin: "12px auto 0 auto", color: "#6e7687", fontSize: "14px", lineHeight: "1.6", maxWidth: "460px" }}>
                    {t("SEPA Instant is not supported by the recipient's bank. Please try again using the standard SEPA method.")}
                </p>
                <div style={{
                    marginTop: "24px",
                    padding: "12px 20px",
                    background: "#f4f3ff",
                    borderRadius: "8px",
                    border: "1px solid #e9e0ff",
                    display: "inline-block",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#4a32e3"
                }}>
                    {t("Would you like to switch to SEPA Standard?")}
                </div>
            </div>

            <div className={styles.doneActions} style={{ marginTop: "8px", justifyContent: "flex-end", display: "flex", gap: "12px" }}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={onCancel}
                    style={{ minWidth: "120px" }}
                >
                    {t("No, Cancel")}
                </button>
                <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={onSwitchToStandard}
                    style={{
                        background: "linear-gradient(to right, #5926F0 0%, #4828A0 100%)",
                        padding: "10px 20px"
                    }}
                >
                    <CheckCircle size={16} />
                    {t("Yes, Switch to Standard")}
                </button>
            </div>
        </div>
    )
}

const isInstantNotSupportedError = (errorOrMsg) => {
    if (!errorOrMsg) return false
    if (typeof errorOrMsg === "string") {
        const lower = errorOrMsg.toLowerCase()
        return (
            lower.includes("instant is not supported") ||
            (lower.includes("sepa instant") && lower.includes("standard")) ||
            (lower.includes("instant") && lower.includes("standard sepa")) ||
            lower.includes("recipient's bank") ||
            lower.includes("recipient’s bank") ||
            (lower.includes("sepa") && lower.includes("instant") && lower.includes("not supported"))
        )
    }
    let decrypted = null
    try {
        if (errorOrMsg?.response?.data?.data) {
            decrypted = decryptData(errorOrMsg.response.data.data)
        }
    } catch {
        decrypted = null
    }
    const candidates = [
        typeof decrypted === "string" ? decrypted : decrypted?.message,
        decrypted?.error,
        decrypted?.code,
        errorOrMsg?.response?.data?.message,
        errorOrMsg?.response?.data?.error,
        typeof errorOrMsg?.response?.data === "string" ? errorOrMsg.response.data : null,
        errorOrMsg?.message,
    ]
    return candidates.some((candidate) => {
        if (typeof candidate !== "string") return false
        const lower = candidate.toLowerCase()
        return (
            lower.includes("instant is not supported") ||
            (lower.includes("sepa instant") && lower.includes("standard")) ||
            (lower.includes("instant") && lower.includes("standard sepa")) ||
            lower.includes("recipient's bank") ||
            lower.includes("recipient’s bank") ||
            (lower.includes("sepa") && lower.includes("instant") && lower.includes("not supported"))
        )
    })
}

const SepaTransfer = ({ isOpen = true, toggle, selectedIban, availableBalance, isPage = false, }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { beneficiaries, userDetails, setProfileLockTime, getUserBeneficiaries } = useContext(UserContext)

    const ibanId = selectedIban?._id || selectedIban?.id
    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId)
    const liveBalance = syncedBalance?.balance ?? availableBalance ?? selectedIban?.balance ?? 0
    const currencyCode = selectedIban?.currency || "EUR"
    const sourceAvailableBalance = getSourceBalance(liveBalance, selectedIban)
    const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms")
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [transferSpeed, setTransferSpeed] = useState("standard")
    const [beneficiaryList, setBeneficiaryList] = useState([])
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
    const [beneficiaryForm, setBeneficiaryForm] = useState(DEFAULT_BENEFICIARY_FORM)
    const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
    const [channelModalBeneficiary, setChannelModalBeneficiary] = useState(null)
    const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0])
    const [description, setDescription] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")
    const [confirmedDetails, setConfirmedDetails] = useState(false)
    const [authType, setAuthType] = useState(getDefaultAuthType)
    const [feeDetails, setFeeDetails] = useState(null)
    const [otpToken, setOtpToken] = useState("")
    const [payoutResult, setPayoutResult] = useState(null)
    const [showInstantFallback, setShowInstantFallback] = useState(false)

    const payoutFee = useVirtualIbanPayoutFee()
    const payoutDirect = useVirtualIbanPayoutDirect()

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token) => {
            setOtpToken(token)
            setCurrentStep(STEPS.OTP)
        },
        onError: (err) => {
            if (isInstantNotSupportedError(err)) {
                setShowInstantFallback(true)
                return
            }
            toast.error(err?.message || t("Unable to send OTP"))
        },
    })

    const sourceIban = useMemo(() => ({ title: getVirtualIbanTitle(selectedIban, currencyCode), iban: getVirtualIbanNumber(selectedIban) }), [selectedIban, currencyCode])
    const machineData = useMemo(() => ({ amount, availableBalance: sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, description, confirmedDetails }), [amount, sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, description, confirmedDetails])
    const isProcessing = payoutFee.isPending || isSendingOtp
    const disabled = getDisabledState(currentStep, machineData) || isProcessing
    const showFooter = !showInstantFallback && currentStep !== STEPS.OTP && currentStep !== STEPS.DONE

    const handleBeneficiarySaved = (savedBeneficiary, isNew) => {
        if (isNew && savedBeneficiary) {
            setChannelModalBeneficiary(savedBeneficiary);
            setIsChannelModalOpen(true);
        }
    };

    const handleChannelSaved = async (updatedBeneficiary) => {
        await getUserBeneficiaries();
        if (updatedBeneficiary) {
            const hasBank = (Array.isArray(updatedBeneficiary.account_type) && updatedBeneficiary.account_type.includes("bank")) ||
                (Array.isArray(updatedBeneficiary.bank_details) && updatedBeneficiary.bank_details.length > 0);
            const bankCountry = updatedBeneficiary?.bank_details?.[0]?.extras?.country_iso_code || updatedBeneficiary?.country_iso_code || updatedBeneficiary?.country;
            const isSepaCountry = sepaCountries.includes(bankCountry);
            if (hasBank && isSepaCountry) {
                setSelectedBeneficiary(updatedBeneficiary);
            }
        }
    };

    const resetState = () => {
        const id = getVirtualIbanId(selectedIban)
        if (id) {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(id) })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(id) })
        }
        queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
        queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.all })
        queryClient.refetchQueries({ queryKey: virtualIbanQueryKeys.all })
        setShowInstantFallback(false)
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setTransferSpeed("standard")
        setSelectedBeneficiary(beneficiaryList[0] || null)
        setBeneficiaryForm(DEFAULT_BENEFICIARY_FORM)
        setIsAddingBeneficiary(false)
        setPurpose(PURPOSE_OPTIONS[0])
        setDescription("")
        setAdditionalInfo("")
        setConfirmedDetails(false)
        setAuthType(getDefaultAuthType())
        setFeeDetails(null)
        setOtpToken("")
        setPayoutResult(null)
    }

    useEffect(() => {
        if (userDetails?.tfa) setAuthType("authenticator")
    }, [userDetails?.tfa])

    useEffect(() => {
        if (beneficiaries && beneficiaries.length > 0) {
            const europeanCountries = sepaCountries
            const europeanBeneficiaries = beneficiaries.filter((beneficiary) => {
                if (beneficiary?.account_type?.includes("bank")) {
                    const bankCountry = beneficiary?.bank_details?.[0]?.extras?.country_iso_code
                    return europeanCountries.includes(bankCountry)
                }
                return false
            })
            setBeneficiaryList(europeanBeneficiaries)
        }
    }, [beneficiaries])

    useEffect(() => {
        if (userDetails?._id) {
            getUserBeneficiaries()
        }
    }, [userDetails])

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const getSelectedMethod = () => (SEPA_TRANSFER_SPEEDS.find((speed) => speed.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]).rail

    const buildFeePayload = () => ({
        iban_id: getVirtualIbanId(selectedIban),
        method: getSelectedMethod(),
        amount: getAmountNumber(amount),
    })

    const buildPayoutPayload = () => ({
        iban_id: getVirtualIbanId(selectedIban),
        beneficiary_id: getBeneficiaryId(selectedBeneficiary),
        method: getSelectedMethod(),
        amount: getAmountNumber(amount),
        description: (description || "").trim(),
        purpose: getPurposeCode(purpose),
        additionalInformation: additionalInfo || undefined,
    })

    const previewFee = async () => {
        const res = await payoutFee.mutateAsync(buildFeePayload())
        setFeeDetails(res?.data || null)
    }

    const handleSendOtp = async (otpCodeType) => {
        const nextAuthType = otpCodeType || authType
        setAuthType(nextAuthType)
        await sendOtp(buildPayoutPayload(), nextAuthType)
    }

    const verifyOtp = async (setVerified, type, otp, setOtpError) => {
        try {
            const res = await payoutDirect.mutateAsync({
                ...buildPayoutPayload(),
                token: otpToken,
                otp,
                type: type || authType,
            })
            setPayoutResult(res?.data || res || null)
            setVerified(true)
        } catch (error) {
            if (isInstantNotSupportedError(error)) {
                setShowInstantFallback(true)
                return
            }

            handlePaymentApiError({
                error,
                navigate,
                onInstantNotSupported: () => {
                    setShowInstantFallback(true)
                },
                setError: (msg) => {
                    if (isInstantNotSupportedError(msg)) {
                        setShowInstantFallback(true)
                        return
                    }
                    setOtpError(msg)
                },
                setProfileLockTime,
            })
        }
    }

    const handleContinue = async () => {
        if (currentStep === STEPS.ADD_BENEFICIARY) {
            const nextBeneficiary = buildBeneficiaryFromForm(beneficiaryForm)
            setSelectedBeneficiary(nextBeneficiary)
            if (beneficiaryForm.saveBeneficiary) setBeneficiaryList((prev) => [nextBeneficiary, ...prev])
            setCurrentStep(STEPS.PURPOSE)
            return
        }

        if (currentStep === STEPS.PURPOSE) {
            const currentDesc = (description || "").trim()
            if (!isValidDescription(currentDesc)) {
                toast.error(t("Description must be 5–120 characters and contain only letters, numbers, spaces, commas, periods, and hyphens."))
                return
            }
            try {
                await previewFee()
                setCurrentStep(STEPS.REVIEW)
            } catch (error) {
                if (isInstantNotSupportedError(error)) {
                    setShowInstantFallback(true)
                    return
                }
                handlePaymentApiError({
                    error,
                    navigate,
                    onInstantNotSupported: () => {
                        setShowInstantFallback(true)
                    },
                    setError: (message) => {
                        if (isInstantNotSupportedError(message)) {
                            setShowInstantFallback(true)
                            return
                        }
                        toast.error(message)
                    },
                    setProfileLockTime,
                })
            }
            return
        }

        if (currentStep === STEPS.REVIEW) {
            await handleSendOtp()
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
        if (showInstantFallback) {
            return (
                <FallbackStandardStep
                    onSwitchToStandard={() => {
                        setTransferSpeed("standard")
                        setFeeDetails(null)
                        setOtpToken("")
                        setShowInstantFallback(false)
                        setCurrentStep(STEPS.AMOUNT)
                    }}
                    onCancel={() => {
                        setShowInstantFallback(false)
                        handleClose()
                    }}
                />
            )
        }

        switch (currentStep) {
            case STEPS.AMOUNT:
                return <SepaAmountStep amount={amount} setAmount={setAmount} availableBalance={sourceAvailableBalance} currencyCode={currencyCode} sourceIban={sourceIban} transferSpeed={transferSpeed} setTransferSpeed={setTransferSpeed} />
            case STEPS.BENEFICIARY:
                return (
                    <BeneficiaryStep
                        beneficiaries={beneficiaryList}
                        selectedBeneficiary={selectedBeneficiary}
                        setSelectedBeneficiary={setSelectedBeneficiary}
                        onAddBeneficiary={() => setIsAddModalOpen(true)}
                        emptyMessage={t("No beneficiaries found with European bank accounts.")}
                    />
                )
            case STEPS.ADD_BENEFICIARY:
                return <AddBeneficiaryStep amount={amount} currencyCode={currencyCode} form={beneficiaryForm} setForm={setBeneficiaryForm} />
            case STEPS.PURPOSE:
                return <PurposeStep amount={amount} currencyCode={currencyCode} purpose={purpose} setPurpose={setPurpose} description={description} setDescription={setDescription} additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} />
            case STEPS.REVIEW:
                return <ReviewStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} purpose={purpose} additionalInfo={additionalInfo} feeDetails={feeDetails} confirmedDetails={confirmedDetails} setConfirmedDetails={setConfirmedDetails} />
            case STEPS.OTP:
                return <OTPConfirmation fullHeight setter={setCurrentStep} setterValue={STEPS.DONE} hideOtp={() => { }} callback={verifyOtp} processing={payoutDirect.isPending} resendHandler={handleSendOtp} authType={authType} setAuthType={setAuthType}
                    showBackButton={true}
                    onBack={handleBack}
                />
            case STEPS.DONE:
                return <DoneStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} feeDetails={feeDetails} payoutResult={payoutResult} onSendAgain={resetState} onClose={handleClose} />
            default:
                return null
        }
    }
    const content = (
        <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row", width: "100%" }}>
            <aside className={styles.leftPanel}>
                <div>
                    <div className={styles.flowHeader}><div className={styles.flowIcon}><Send size={18} /></div><div><h2>{t("SEPA Transfer")}</h2><p>{t("European Bank Transfer - EUR only")}</p></div></div>
                    <div
                        style={{
                            marginTop: "2rem"
                        }}
                        className={withdrawStyles.progressEffect}
                    >
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
                            <button type="button" className={styles.nextBtn} disabled={disabled} onClick={handleContinue}>{isProcessing ? t("Processing...") : getContinueLabel(currentStep, t)}<ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
    return (
        <>
            {isPage ? (
                <div style={{ width: "100%" }} className={styles.pageContainer}>
                    {content}
                </div>
            ) : (
                <Modal isOpen={isOpen} style={{ minWidth: width > 1000 ? "980px" : "0%" }} toggle={handleClose}>
                    <ModalBody style={{ padding: "20px" }}>
                        {content}
                    </ModalBody>
                </Modal>
            )}

            <AddBeneficiaryModal
                open={isAddModalOpen}
                handleClose={() => setIsAddModalOpen(false)}
                onSaveSuccess={handleBeneficiarySaved}
            />

            <DynamicChannelModal
                open={isChannelModalOpen}
                handleClose={() => {
                    setIsChannelModalOpen(false);
                    setChannelModalBeneficiary(null);
                }}
                beneficiaryData={channelModalBeneficiary}
                lockChannelType="bank"
                onSaveSuccess={handleChannelSaved}
            />
        </>
    )
}

export default SepaTransfer
