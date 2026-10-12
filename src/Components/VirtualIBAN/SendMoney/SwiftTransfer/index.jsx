import axios from "axios"
import { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { Modal, ModalBody } from "reactstrap"
import {
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    FileText,
    Globe,
    Home,
    List,
    Plus,
    RefreshCw,
    Search,
    Send,
    User,
} from "react-feather"
import AddBeneficiaryModal from "../../Beneficiaries/Modals/AddBeneficiaryModal"
import DynamicChannelModal from "../../Beneficiaries/Modals/DynamicChannelModal"
import AddBeneficiaryFlowV2 from "../../Beneficiaries/AddBeneficiaryFlowV2"
import { USE_NEW_BENEFICIARY_FLOW } from "../../Beneficiaries/AddBeneficiaryFlowV2/constants"
import useWindowWidth from "../../../../utils/useWindowWidth"
import ContactBox from "../../../MyMasterCard/PaymentModal/ContactBox"
import { getAmountNumber } from "../../utils/amount"
import { getVirtualIbanId } from "../../utils/virtualIban"
import {
    CHARGE_BEARER_OPTIONS,
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
    SIDEBAR_STEPS,
    SIDEBAR_STEP_NAMES,
    STEPS,
    getSidebarStepName,
} from "../../../../stateMachines/swiftTransfer"
import SidebarProgress from "../../VirtualIbanModal/SidebarProgress"
import AmountStep from "../../ConvertFundsModal/AmountStep"
import MT from "../../VirtualIbanModal/icons/mt.svg"
import success from "../../VirtualIbanModal/icons/success.png"
import styles from "./SwiftTransfer.module.css"
import withdrawStyles from "../../WithdrawBalanceModal/withdrawBalance.module.scss"
import { UserContext } from "../../../../Context/UserContext"
import useSendOtp from "../../../../hooks/GeneralUse/useSendOtp"
import { useQueryClient } from "@tanstack/react-query"
import { useVirtualIbanSwiftPayoutFee, useVirtualIbanSwiftPayoutDirect, useSyncVirtualIbanBalance, virtualIbanQueryKeys } from "../../../../hooks/useVirtualIban"
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError"
import OTPConfirmation from "../../../../Common/Component/OtpVerification"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import AddBeneficiary from "../../../AddBeneficiary"
import { validateSwiftBeneficiary, isValidDescription, isValidBic } from "../../utils/swiftValidation"
import BeneficiaryStep from "../Common/BeneficiaryStep"
import AddressTooLongBanner from "../Common/AddressTooLongBanner"
import {
    getBeneficiaryName,
    getBeneficiaryTypeLabel,
    getBeneficiaryCountry,
    getBeneficiaryBankDetail,
    getBeneficiaryBic,
    getBeneficiaryBankName,
    getBeneficiaryInitial,
    getBeneficiaryId,
    getBeneficiaryAccountCount,
    getBeneficiarySubtitle,
    getRawSwiftCode,
    hasBeneficiarySwiftCode,
    isBeneficiaryAddressTooLong,
    maskIban
} from "../Common/beneficiaryHelpers"
import MobileStepProgress from "../../VirtualIbanModal/MobileStepProgress"
import MobileFooter from '../../../../Common/Component/MobileFooter';
import StepsDrawer from "../../../../Common/Component/StepsDrawer"

const DEFAULT_BENEFICIARY_FORM = {
    type: "individual",
    firstName: "",
    lastName: "",
    legalName: "",
    swift_code: "",
    bankName: "",
    bankAddress: "",
    bankCity: "",
    bankPostal: "",
    bankCountry: "",
    beneficiaryAddress: "",
    beneficiaryCity: "",
    beneficiaryPostal: "",
    beneficiaryCountry: "",
    intermediaryBic: "",
    accountNumber: "",
    saveBeneficiary: true,
}

const sidebarIcons = {
    [SIDEBAR_STEP_NAMES.PAYMENT_RAIL]: Globe,
    [SIDEBAR_STEP_NAMES.AMOUNT]: () => <span className={styles.sidebarIconText}>EUR</span>,
    [SIDEBAR_STEP_NAMES.BENEFICIARY]: User,
    [SIDEBAR_STEP_NAMES.PURPOSE]: List,
    [SIDEBAR_STEP_NAMES.REVIEW]: FileText,
    [SIDEBAR_STEP_NAMES.DONE]: CheckCircle,
}

const formatMoney = (value, currencyCode = "EUR") =>
    `${currencyCode} ${getAmountNumber(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const formatUSD = (value) =>
    `USD ${getAmountNumber(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`


const getSourceBalance = (availableBalance, selectedIban) => availableBalance ?? selectedIban?.balance ?? 0
const getVirtualIbanNumber = (iban) =>
    iban?.iban || iban?.ibanFull || iban?.account_number || iban?.accountNumber || iban?.virtual_iban || iban?.virtualIban || ""
const getVirtualIbanTitle = (iban, fallbackCurrency = "EUR") =>
    iban?.name || iban?.title || iban?.label || `${fallbackCurrency} IBAN`

const buildBeneficiaryFromForm = (form) => {
    const isBusiness = form.type === "business"
    const name = isBusiness
        ? form.legalName
        : [form.firstName, form.lastName].filter(Boolean).join(" ")
    return {
        id: `new-${Date.now()}`,
        name: name || "New beneficiary",
        country: form.beneficiaryCountry,
        beneficiary_type: isBusiness ? "business" : "individual",
        swift_code: form.swift_code,
        bic: form.swift_code,
        bankName: form.bankName,
        bankAddress: form.bankAddress,
        bankCity: form.bankCity,
        bankPostal: form.bankPostal,
        bankCountry: form.bankCountry,
        beneficiaryAddress: form.beneficiaryAddress,
        beneficiaryCity: form.beneficiaryCity,
        beneficiaryPostal: form.beneficiaryPostal,
        accountNumber: form.accountNumber,
        intermediaryBic: form.intermediaryBic,
    }
}

const TextField = ({ label, value, onChange, hint, type = "text", disabled = false, error = "", optional = false, placeholder = "", maxLength }) => (
    <label className={styles.field}>
        <span>
            {label}
            {optional && <span className={styles.optionalTag}>Optional</span>}
        </span>
        <input
            type={type}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={error ? styles.fieldError : ""}
            onChange={(e) => onChange(e.target.value)}
        />
        {hint && !error && <small>{hint}</small>}
        {error && <span className={styles.fieldErrorText}>{error}</span>}
    </label>
)

const SwiftAmountStep = ({ amount, setAmount, availableBalance, currencyCode, sourceIban }) => {
    const { t } = useTranslation()
    const sourceBalance = getAmountNumber(availableBalance)
    const MIN_USD_AMOUNT = 11
    const EUR_USD_RATE = 1.17

    const MIN_AMOUNT_EUR = MIN_USD_AMOUNT / EUR_USD_RATE
    return (
        <div className={styles.stepStack}>
            <AmountStep
                amount={amount}
                setAmount={setAmount}
                currencyCode={currencyCode}
                availableBalance={sourceBalance}
                label="Amount to send (EUR)"
                min={MIN_AMOUNT_EUR}
                max={MAX_AMOUNT}
                minQuickAmount={10}

            />

            <div>
                <div className={styles.sectionLabel}>{t("From")}</div>
                <div className={styles.sourceCard}>
                    <div className={styles.sourceLeft}>
                        <div className={styles.flagBox}>
                            <img src={MT} alt="" />
                        </div>
                        <div>
                            <h4>{sourceIban?.title || `${currencyCode} IBAN`}</h4>
                            <p>{maskIban(sourceIban?.iban)}</p>
                        </div>
                    </div>
                    <div className={styles.sourceBalance}>
                        <h4>{formatMoney(sourceBalance, currencyCode)}</h4>
                        <p>{t("Available")}</p>
                    </div>
                </div>
            </div>

            <div className={styles.fxBanner}>
                <Globe size={16} />
                <span>
                    {t("Your EUR balance will be converted to")} <strong>USD</strong>{" "}
                    {t("at a live rate locked when you reach the Review step. The exact USD amount will be shown before you confirm.")}
                </span>
            </div>

            <div className={styles.infoStrip}>
                {t("SWIFT transfers are debited in EUR. The recipient always receives exactly the previewed USD amount — rate is guaranteed for 60 minutes.")}
            </div>
        </div>
    )
}

const MissingSwiftCodeBanner = ({ beneficiary, authHeader, onSwiftCodeSaved }) => {
    const { t } = useTranslation()
    const rawBic = getRawSwiftCode(beneficiary)
    const [bic, setBic] = useState(rawBic || "")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setBic(getRawSwiftCode(beneficiary) || "")
    }, [beneficiary])

    const bicClean = bic.trim().toUpperCase()
    const bicValid = isValidBic(bicClean)
    const bicError = bicClean.length > 0 && !bicValid ? t("Valid 8 or 11 character BIC / SWIFT code is required") : ""

    const handleSave = async () => {
        if (!bicValid) return
        setSaving(true)
        try {
            const { encryptData } = await import("../../../../Helper/EssentilaMethods/Encryption")
            const bankDetails = Array.isArray(beneficiary?.bank_details) && beneficiary.bank_details.length > 0
                ? {...beneficiary.bank_details[0], swift_code: bicClean, bic: bicClean }
                : [{ swift_code: bicClean, bic: bicClean }]

            const payload = { bank_details: bankDetails, channel_type: "bank", removeOld: true }
            const encrypted = encryptData(payload)

            await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/v2/${beneficiary._id}/channel`,
                { data: encrypted },
                { headers: authHeader }
            )

            onSwiftCodeSaved({
                ...beneficiary,
                swift_code: bicClean,
                bic: bicClean,
                bank_details: bankDetails,
            })
            toast.success(t("BIC / SWIFT code saved successfully."))
        } catch (err) {
            toast.error(t("Failed to save BIC. Please try again."))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.missingBicBanner}>
            <div className={styles.missingBicHeader}>
                <span className={styles.missingBicIcon}>⚠</span>
                <div>
                    <strong>{t("Valid 8 or 11 character BIC / SWIFT code is required")}</strong>
                    <p>{t("{{name}} has an invalid or missing BIC / SWIFT code. Enter a valid 8 or 11 character code below to continue.", { name: getBeneficiaryName(beneficiary) })}</p>
                </div>
            </div>
            <div className={styles.missingBicRow}>
                <TextField
                    label={t("BIC / SWIFT Code *")}
                    value={bic}
                    onChange={(v) => setBic(v.toUpperCase())}
                    placeholder="e.g. AAAABBCC"
                    error={bicError}
                    hint={bicValid ? t("Valid BIC format ✓") : ""}
                />
                <button
                    type="button"
                    className={styles.nextBtn}
                    style={{ alignSelf: "flex-end", marginBottom: bicError ? "22px" : "0" }}
                    disabled={!bicValid || saving}
                    onClick={handleSave}
                >
                    {saving ? t("Saving...") : t("Save BIC")}
                </button>
            </div>
        </div>
    )
}

const AddBeneficiaryStep = ({ amount, currencyCode, form, setForm }) => {
    const { t } = useTranslation()
    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    const bicValue = String(form.swift_code || "").trim().toUpperCase()
    const bicValid = bicValue.length === 8 || bicValue.length === 11
    const bicError = bicValue.length > 0 && !bicValid ? t("BIC must be 8 or 11 characters") : ""

    return (
        <div className={styles.addBeneficiaryStep}>
            <div className={styles.stepHeaderRow}>
                <span>{t("Who are you paying?")}</span>
                <strong>
                    {t("Sending")} {formatMoney(amount, currencyCode)}
                </strong>
            </div>

            <div className={styles.segmentedControl}>
                {[
                    { id: "individual", label: "Individual" },
                    { id: "business", label: "Business" },
                ].map((item) => (
                    <button
                        type="button"
                        key={item.id}
                        className={form.type === item.id ? styles.selectedSegment : ""}
                        onClick={() => update("type", item.id)}
                    >
                        {t(item.label)}
                    </button>
                ))}
            </div>

            {form.type === "business" ? (
                <TextField label={t("Legal name *")} value={form.legalName} onChange={(v) => update("legalName", v)} />
            ) : (
                <div className={styles.formGrid}>
                    <TextField label={t("First name *")} value={form.firstName} onChange={(v) => update("firstName", v)} />
                    <TextField label={t("Last name *")} value={form.lastName} onChange={(v) => update("lastName", v)} />
                </div>
            )}

            <hr className={styles.divider} />

            <div className={styles.sectionLabel} style={{ margin: 0 }}>{t("Bank details")}</div>

            <TextField
                label={t("BIC / SWIFT Code *")}
                value={form.swift_code}
                onChange={(v) => update("swift_code", v.toUpperCase())}
                hint={bicValid ? t("Valid BIC format") : ""}
                error={bicError}
                placeholder="e.g. AAAABBCC or AAAABBCCDDD"
            />
            <TextField label={t("Bank name *")} value={form.bankName} onChange={(v) => update("bankName", v)} />

            <div className={styles.addressGrid}>
                <TextField label={t("Bank street address *")} value={form.bankAddress} onChange={(v) => update("bankAddress", v)} />
                <TextField label={t("Bank city *")} value={form.bankCity} onChange={(v) => update("bankCity", v)} />
                <TextField label={t("Bank postal code *")} value={form.bankPostal} onChange={(v) => update("bankPostal", v)} />
                <TextField label={t("Bank country")} value={form.bankCountry} onChange={(v) => update("bankCountry", v)} optional />
            </div>

            <TextField
                label={t("Intermediary BIC")}
                value={form.intermediaryBic}
                onChange={(v) => update("intermediaryBic", v.toUpperCase())}
                hint={t("Only needed if your bank requires a correspondent bank")}
                optional
                placeholder="AAAABBCC"
            />

            <hr className={styles.divider} />

            <div className={styles.sectionLabel} style={{ margin: 0 }}>{t("Beneficiary address")}</div>

            <TextField label={t("Account / IBAN number")} value={form.accountNumber} onChange={(v) => update("accountNumber", v)} optional />

            <div className={styles.addressGrid}>
                <TextField label={t("Street address *")} value={form.beneficiaryAddress} onChange={(v) => update("beneficiaryAddress", v)} />
                <TextField label={t("City *")} value={form.beneficiaryCity} onChange={(v) => update("beneficiaryCity", v)} />
                <TextField label={t("Postal code *")} value={form.beneficiaryPostal} onChange={(v) => update("beneficiaryPostal", v)} />
                <TextField label={t("Country")} value={form.beneficiaryCountry} onChange={(v) => update("beneficiaryCountry", v)} optional />
            </div>

            <button
                type="button"
                className={styles.toggleRow}
                onClick={() => update("saveBeneficiary", !form.saveBeneficiary)}
            >
                <span className={`${styles.toggle} ${form.saveBeneficiary ? styles.toggleOn : ""}`}>
                    <span />
                </span>
                {t("Save this beneficiary for next time")}
            </button>
        </div>
    )
}

const PurposeStep = ({ amount, currencyCode, purpose, setPurpose, description, setDescription, additionalInfo, setAdditionalInfo }) => {
    const { t } = useTranslation()
    const descError = description && !isValidDescription(description) ? t("5–34 characters; letters, digits, space, comma, dot, hyphen only") : ""

    return (
        <div className={styles.purposeStep}>
            <div className={styles.stepHeaderRow}>
                <span>{t("Purpose of payment")}</span>
                <strong>
                    {t("Sending")} {formatMoney(amount, currencyCode)}
                </strong>
            </div>

            <label className={styles.field}>
                <span>{t("Purpose category")}</span>
                <div className={styles.selectWrap}>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                        {PURPOSE_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                                {t(item)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={18} />
                </div>
            </label>

            <TextField
                label={t("Description / Remittance Reference *")}
                value={description}
                onChange={(v) => setDescription(v)}
                placeholder={t("e.g. Invoice payment, consultant fees, trade")}
                hint={!descError ? t("5–34 characters; letters, digits, space, comma, dot, hyphen only") : ""}
                error={descError}
                maxLength={34}
            />

            <TextField
                label={t("Additional information (optional)")}
                value={additionalInfo}
                onChange={setAdditionalInfo}
                optional
            />

            <div className={styles.infoStrip}>
                {t("SWIFT transfers are debited in EUR and delivered in USD. The full previewed amount is guaranteed for the rate-locked window.")}
            </div>
        </div>
    )
}

const ReviewStep = ({
    amount,
    currencyCode,
    selectedBeneficiary,
    purpose,
    additionalInfo,
    feeDetails,
    quoteExpiresAt,
    confirmedDetails,
    setConfirmedDetails,
    confirmedParentCompany,
    setConfirmedParentCompany,
    onRefreshQuote,
    isRefreshingQuote,
}) => {
    const { t } = useTranslation()

    const QUOTE_DURATION = 300
    const [secondsLeft, setSecondsLeft] = useState(QUOTE_DURATION)

    const timerRef = useRef(null)

    useEffect(() => {
        setSecondsLeft(QUOTE_DURATION)
    }, [feeDetails])

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [feeDetails])

    const isExpired = secondsLeft === 0
    const isWarning = !isExpired && secondsLeft <= 60

    const feeAmount = feeDetails?.fee
    const recipientAmount = feeDetails?.recipient
    const totalAmount = feeDetails?.total
    const exchangeRate = feeDetails?.exchanged_rate

    const rows = [
        ["Recipient", getBeneficiaryName(selectedBeneficiary)],
        ["Beneficiary type", getBeneficiaryTypeLabel(selectedBeneficiary)],
        ["BIC / SWIFT", getBeneficiaryBic(selectedBeneficiary)],
        ["Bank", getBeneficiaryBankName(selectedBeneficiary)],
        ["Country", getBeneficiaryCountry(selectedBeneficiary)],
        ["Purpose", purpose],
        ["Additional info", additionalInfo || "-"],
        ["You send (EUR)", formatMoney(amount, currencyCode)],
        ["Fee", feeAmount ? formatMoney(feeAmount.value, feeAmount.currency || currencyCode) : t("Calculating...")],
        ["Net after fee", feeDetails?.amount ? formatMoney(feeDetails.amount.value, currencyCode) : "-"],
        [
            "Exchange rate",
            exchangeRate
                ? `1 ${exchangeRate.from} = ${exchangeRate.value.toFixed(6)} ${exchangeRate.to}`
                : t("Calculating..."),
        ],
        ["Recipient gets", recipientAmount ? formatUSD(recipientAmount.value) : t("Calculating...")],
        ["Total debited", totalAmount ? formatMoney(totalAmount.value, totalAmount.currency || currencyCode) : formatMoney(amount, currencyCode)],
        ["Estimated arrival", "1–5 business days"],
    ]

    return (
        <div className={styles.reviewStep}>
            {recipientAmount && (
                <div className={styles.fxHighlight}>
                    <div className={styles.fxHighlightLeft}>
                        <p>{t("Recipient receives (guaranteed)")}</p>
                        <h2>{formatUSD(recipientAmount.value)}</h2>
                    </div>
                    <span className={styles.fxArrow}>→</span>
                    <div className={styles.fxHighlightRight}>
                        <p>{t("You send")}</p>
                        <strong>{formatMoney(amount, currencyCode)}</strong>
                        {exchangeRate && (
                            <>
                                <br />
                                <p style={{ marginTop: "4px" }}>{t("Rate")}&nbsp;</p>
                                <strong>
                                    1 EUR = {exchangeRate.value.toFixed(4)} USD
                                </strong>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div
                className={`${styles.quoteTimerBox} ${isWarning ? styles.timerWarning : ""} ${isExpired ? styles.timerExpired : ""}`}
            >
                <div className={styles.timerContent}>
                    {isRefreshingQuote ? (
                        <>
                            <RefreshCw size={16} />
                            <span>{t("Refreshing quote...")}</span>
                        </>
                    ) : isExpired ? (
                        <>
                            <Clock size={16} />
                            <span>{t("Quote has expired. Please refresh to get a new rate.")}</span>
                        </>
                    ) : (
                        <>
                            <Clock size={16} />
                            <span>
                                {t("Rate locked for")}{" "}
                                <strong className={styles.timerSeconds}>
                                    {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                                </strong>
                            </span>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className={styles.refreshBtn}
                    onClick={onRefreshQuote}
                    disabled={isRefreshingQuote}
                >
                    <RefreshCw size={12} />
                    {t("New quote")}
                </button>
            </div>

            <div className={styles.sectionLabel}>{t("Review your payment")}</div>
            <div className={styles.reviewTable}>
                {rows.map(([label, value]) => (
                    <div className={styles.reviewRow} key={label}>
                        <span>{t(label)}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <label className={styles.confirmRow} style={{ cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={confirmedDetails}
                        onChange={(e) => setConfirmedDetails(e.target.checked)}
                    />
                    <span>
                        {t("The recipient details are correct. I understand this SWIFT transfer, once initiated, may be irreversible. The USD amount shown is guaranteed for the quoted window.")}
                    </span>
                </label>

                <label className={styles.confirmRow} style={{ cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={confirmedParentCompany}
                        onChange={(e) => setConfirmedParentCompany(e.target.checked)}
                    />
                    <span>
                        {t("Please note that your SWIFT transfer will be processed under Kemit Kingdom - K2 - SA, InstaPay’s parent company, and not under your personal name.")}
                    </span>
                </label>
            </div>
        </div>
    )
}

const downloadSwiftReceipt = ({
    amount,
    currencyCode,
    selectedBeneficiary,
    purpose,
    additionalInfo,
    feeDetails,
    payoutResult,
    t,
}) => {
    const doc = new jsPDF()

    const feeAmount = feeDetails?.fee
    const recipientAmount = feeDetails?.recipient
    const totalAmount = feeDetails?.total
    const exchangeRate = feeDetails?.exchanged_rate

    const trackingReference =
        payoutResult?.transaction_id ||
        payoutResult?.transaction_ref ||
        payoutResult?.reference_id ||
        payoutResult?.reference ||
        payoutResult?._id ||
        "-"

    const status = payoutResult?.status || "INITIATED"

    const rows = [
        ["Recipient", getBeneficiaryName(selectedBeneficiary)],
        ["Beneficiary type", getBeneficiaryTypeLabel(selectedBeneficiary)],
        ["BIC / SWIFT", getBeneficiaryBic(selectedBeneficiary)],
        ["Bank", getBeneficiaryBankName(selectedBeneficiary)],
        ["Country", getBeneficiaryCountry(selectedBeneficiary)],
        ["Purpose", purpose || "-"],
        ["Additional info", additionalInfo || "-"],
        ["You sent (EUR)", formatMoney(amount, currencyCode)],
        ["Fee", feeAmount ? formatMoney(feeAmount.value, feeAmount.currency || currencyCode) : "N/A"],
        ["Net after fee", feeDetails?.amount ? formatMoney(feeDetails.amount.value, currencyCode) : "-"],
        [
            "Exchange rate",
            exchangeRate ? `1 ${exchangeRate.from} = ${exchangeRate.value.toFixed(6)} ${exchangeRate.to}` : "-",
        ],
        ["Recipient received", recipientAmount ? formatUSD(recipientAmount.value) : "-"],
        ["Total debited", totalAmount ? formatMoney(totalAmount.value, totalAmount.currency || currencyCode) : "-"],
        ["Estimated arrival", "1–5 business days"],
        ["Tracking reference", trackingReference],
        ["Status", status],
    ]

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("SWIFT Transfer Receipt", 14, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    autoTable(doc, {
        startY: 36,
        head: [["Details", "Information"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fontStyle: "bold" },
        columnStyles: {
            0: { cellWidth: 55, fontStyle: "bold" },
            1: { cellWidth: 125 },
        },
    })

    const finalY = doc.lastAutoTable.finalY + 12
    doc.setFontSize(9)
    doc.text(
        "The recipient receives the exact previewed USD amount — rate was locked at the time of quote.",
        14,
        finalY
    )
    doc.setFontSize(8)
    doc.text("This receipt is generated electronically.", 14, finalY + 8)

    doc.save(`SWIFT-Transfer-Receipt-${trackingReference}.pdf`)
}

const DoneStep = ({
    amount,
    currencyCode,
    selectedBeneficiary,
    feeDetails,
    payoutResult,
    purpose,
    additionalInfo,
    onSendAgain,
}) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const width = useWindowWidth()
    const isMobile = width <= 600;

    const recipientAmount = feeDetails?.recipient
    const feeAmount = feeDetails?.fee
    const trackingReference =
        payoutResult?.transaction_id ||
        payoutResult?.transaction_ref ||
        payoutResult?.reference_id ||
        payoutResult?.reference ||
        payoutResult?._id ||
        "-"
    const status = payoutResult?.status || "INITIATED"

    return (
        <div className={styles.doneStep}>
            <div className={styles.doneHero}>
                <img src={success} alt="" />
                {isMobile &&
                    <div className={styles.doneIcon}>
                        <Check size={32} />
                    </div>
                }
                <h3>{t(isMobile ? "Payment on its way 🎉" : "Payment submitted")}</h3>
                <p>
                    {t("You sent")} {formatMoney(amount, currencyCode)} {t("to")}{" "}
                    {getBeneficiaryName(selectedBeneficiary)}
                </p>
            </div>

            <div className={styles.reviewTable}>
                <div className={styles.reviewRow}>
                    <span>{t("Tracking reference")}</span>
                    <strong>{trackingReference}</strong>
                </div>
                <div className={styles.reviewRow}>
                    <span>{t("Status")}</span>
                    <strong>{t(status)}</strong>
                </div>
                <div className={styles.reviewRow}>
                    <span>{t("Fee")}</span>
                    <strong>
                        {feeAmount ? formatMoney(feeAmount.value, feeAmount.currency || currencyCode) : "-"}
                    </strong>
                </div>
                <div className={styles.reviewRow}>
                    <span>{t("Recipient gets")}</span>
                    <strong>{recipientAmount ? formatUSD(recipientAmount.value) : "-"}</strong>
                </div>
                <div className={styles.reviewRow}>
                    <span>{t("Estimated arrival")}</span>
                    <strong>{t("1–5 business days")}</strong>
                </div>
            </div>

            <div className={styles.doneActions}>
                <button type="button" className={styles.backBtn} onClick={onSendAgain}>
                    <Send size={15} />
                    {t("Send again")}
                </button>
                <div className={styles.doneActionsRight}>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() =>
                            downloadSwiftReceipt({
                                amount,
                                currencyCode,
                                selectedBeneficiary,
                                purpose,
                                additionalInfo,
                                feeDetails,
                                payoutResult,
                                t,
                            })
                        }
                    >
                        {!isMobile && <Download size={15} />}
                        {t(isMobile ? "Download" : "Download receipt")}
                    </button>
                    <button type="button" className={styles.nextBtn} onClick={() => navigate("/virtual-IBAN")}>
                        {!isMobile && <Home size={15} />}
                        {t(isMobile ? "Dashboard" : "Back to dashboard")}
                    </button>
                </div>
            </div>
        </div>
    )
}

const SwiftTransfer = forwardRef(({ isOpen = true, toggle, selectedIban, availableBalance, isPage = false }, ref) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { userDetails, setProfileLockTime, getUserBeneficiaries, beneficiaries, authHeader } = useContext(UserContext)

    const ibanId = selectedIban?._id || selectedIban?.id
    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId)
    const liveBalance = syncedBalance?.balance ?? availableBalance ?? selectedIban?.balance ?? 0
    const currencyCode = selectedIban?.currency || "EUR"
    const sourceAvailableBalance = getSourceBalance(liveBalance, selectedIban)
    const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : userDetails?.email_verification ? "email" : userDetails?.whatsapp_verification ? "whatsapp" : "sms")

    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
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
    const [confirmedParentCompany, setConfirmedParentCompany] = useState(false)
    const [authType, setAuthType] = useState(getDefaultAuthType)
    const [otpChannel, setOtpChannel] = useState(getDefaultAuthType)
    const [otpMethods, setOtpMethods] = useState(null)
    const [feeDetails, setFeeDetails] = useState(null)
    const [quoteToken, setQuoteToken] = useState("")
    const [quoteExpiresAt, setQuoteExpiresAt] = useState(null)
    const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)
    const [otpToken, setOtpToken] = useState("")
    const [payoutResult, setPayoutResult] = useState(null)
    const isMobile = width <= 600;
    const [showDrawer, setShowDrawer] = useState(false);

    const payoutFee = useVirtualIbanSwiftPayoutFee()
    const payoutDirect = useVirtualIbanSwiftPayoutDirect()

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token, dec) => {
            setOtpToken(token)
            setOtpMethods(dec)
            if (currentStep !== STEPS.OTP && dec?.otp_sent_on) {
                setAuthType(dec.otp_sent_on)
                setOtpChannel(dec.otp_sent_on)
            }
            setCurrentStep(STEPS.OTP)
        },
        onError: (err) => {
            toast.error(err?.message || t("Unable to send OTP"))
        },
    })

    const sourceIban = useMemo(
        () => ({ title: getVirtualIbanTitle(selectedIban, currencyCode), iban: getVirtualIbanNumber(selectedIban) }),
        [selectedIban, currencyCode]
    )

    const machineData = useMemo(
        () => ({
            amount,
            availableBalance: sourceAvailableBalance,
            selectedBeneficiary,
            beneficiaryForm,
            isAddingBeneficiary,
            purpose,
            description,
            confirmedDetails,
            confirmedParentCompany,
        }),
        [amount, sourceAvailableBalance, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, description, confirmedDetails, confirmedParentCompany]
    )

    const swiftBeneficiaries = useMemo(
        () => (beneficiaries || []).filter((b) => Array.isArray(b?.account_type) && b.account_type.includes("bank")),
        [beneficiaries]
    )

    const isProcessing = payoutFee.isPending || isSendingOtp || isRefreshingQuote
    const isQuoteExpired = quoteExpiresAt ? new Date(quoteExpiresAt).getTime() <= Date.now() : false

    const isAddressBlocked = currentStep === STEPS.BENEFICIARY && isBeneficiaryAddressTooLong(selectedBeneficiary)

    const disabled =
        getDisabledState(currentStep, machineData) ||
        isProcessing ||
        isAddressBlocked ||
        (currentStep === STEPS.REVIEW && isQuoteExpired)

    const showFooter = currentStep !== STEPS.OTP && currentStep !== STEPS.DONE

    useEffect(() => {
        if (userDetails?.tfa) setAuthType("authenticator")
        else if (userDetails?.email_verification) setAuthType("email")
        else if (userDetails?.whatsapp_verification) setAuthType("whatsapp")
    }, [userDetails?.tfa, userDetails?.email_verification, userDetails?.whatsapp_verification])

    useEffect(() => {
        if (userDetails?._id) getUserBeneficiaries()
    }, [userDetails])

    const [savedBeneficiaryId, setSavedBeneficiaryId] = useState("")

    /* The new flow saves the recipient and the bank details together, so there is no
       second modal to chain into - the saved record is picked up once the refreshed
       list carries its channel. */
    const handleBeneficiarySaved = async (savedBeneficiary, isNew) => {
        if (!USE_NEW_BENEFICIARY_FLOW) {
            if (isNew && savedBeneficiary) {
                setChannelModalBeneficiary(savedBeneficiary);
                setIsChannelModalOpen(true);
            }
            return;
        }

        setIsAddModalOpen(false);
        setIsChannelModalOpen(false);
        setChannelModalBeneficiary(null);
        setSavedBeneficiaryId(savedBeneficiary?._id || savedBeneficiary?.id || "");
        await getUserBeneficiaries();
    };

    useEffect(() => {
        if (!savedBeneficiaryId) return

        const saved = swiftBeneficiaries.find((item) => (item?._id || item?.id) === savedBeneficiaryId)
        if (!saved) return

        setSelectedBeneficiary(saved)
        setSavedBeneficiaryId("")
    }, [swiftBeneficiaries, savedBeneficiaryId])

    const handleChannelSaved = async (updatedBeneficiary) => {
        await getUserBeneficiaries();
        if (updatedBeneficiary) {
            const hasBank = (Array.isArray(updatedBeneficiary.account_type) && updatedBeneficiary.account_type.includes("bank")) ||
                (Array.isArray(updatedBeneficiary.bank_details) && updatedBeneficiary.bank_details.length > 0);
            if (hasBank) {
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
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setSelectedBeneficiary(null)
        setBeneficiaryForm(DEFAULT_BENEFICIARY_FORM)
        setIsAddingBeneficiary(false)
        setPurpose(PURPOSE_OPTIONS[0])
        setDescription("")
        setAdditionalInfo("")
        setConfirmedDetails(false)
        setConfirmedParentCompany(false)
        setAuthType(getDefaultAuthType())
        setOtpChannel(getDefaultAuthType())
        setOtpMethods(null)
        setFeeDetails(null)
        setQuoteToken("")
        setQuoteExpiresAt(null)
        setIsRefreshingQuote(false)
        setOtpToken("")
        setPayoutResult(null)
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const buildFeePayload = () => ({
        iban_id: getVirtualIbanId(selectedIban),
        amount: getAmountNumber(amount),
    })

    const buildPayoutPayload = () => ({
        iban_id: getVirtualIbanId(selectedIban),
        beneficiary_id: getBeneficiaryId(selectedBeneficiary),
        token: quoteToken,
        description: (description || "").trim(),
        purpose: getPurposeCode(purpose),
        additionalInformation: additionalInfo || undefined,
    })

    const previewFee = async () => {
        const res = await payoutFee.mutateAsync(buildFeePayload())
        const data = res?.data || null
        setFeeDetails(data)
        setQuoteToken(data?.token || "")
        setQuoteExpiresAt(data?.quote_expires_at || null)
        return data
    }

    const handleRefreshQuote = async () => {
        setIsRefreshingQuote(true)
        setConfirmedDetails(false)
        setConfirmedParentCompany(false)
        try {
            await previewFee()
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setError: (message) => toast.error(message),
                setProfileLockTime,
            })
        } finally {
            setIsRefreshingQuote(false)
        }
    }

    const handleSendOtp = async (otpCodeType) => {
        const nextChannel = otpCodeType || otpChannel
        setOtpChannel(nextChannel)
        setAuthType(nextChannel)

        await sendOtp(buildPayoutPayload(), nextChannel)

    }

    const verifyOtp = async (setVerified, type, otp, setOtpError) => {
        try {
            const res = await payoutDirect.mutateAsync({
                ...buildPayoutPayload(),
                token: otpToken,
                otp,
                type: type || authType,
            })
            const data = res?.data || res || null
            setPayoutResult(data)
            setVerified(true)
        } catch (error) {
            const status = error?.response?.status || error?.status
            if (status === 409) {
                const dupData = error?.response?.data?.data || {}
                setPayoutResult(dupData)
                setVerified(true)
                toast.info(t("This transfer was already submitted. Showing the original transaction."))
                return
            }
            handlePaymentApiError({
                error,
                navigate,
                setError: setOtpError,
                setProfileLockTime,
            })
        }
    }

    const handleContinue = async () => {
        if (isAddressBlocked) return

        if (currentStep === STEPS.ADD_BENEFICIARY) {
            const nextBeneficiary = buildBeneficiaryFromForm(beneficiaryForm)
            setSelectedBeneficiary(nextBeneficiary)
            setCurrentStep(STEPS.PURPOSE)
            return
        }

        if (currentStep === STEPS.BENEFICIARY) {
            const { isValid, errors } = validateSwiftBeneficiary(selectedBeneficiary)
            if (!isValid) {
                toast.error(errors[0] || t("Selected beneficiary is missing required SWIFT bank details"))
                return
            }
        }

        if (currentStep === STEPS.PURPOSE) {
            const currentDesc = (description || "").trim()
            if (!isValidDescription(currentDesc)) {
                toast.error(t("Description must be 5–34 characters and contain only letters, numbers, spaces, commas, periods, and hyphens."))
                return
            }
            try {
                await previewFee()
                setCurrentStep(STEPS.REVIEW)
            } catch (error) {
                handlePaymentApiError({
                    error,
                    navigate,
                    setError: (message) => toast.error(message),
                    setProfileLockTime,
                })
            }
            return
        }

        if (currentStep === STEPS.REVIEW) {
            if (isQuoteExpired) {
                toast.warning(t("Your quote has expired. Please refresh the rate before confirming."))
                return
            }
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

    useImperativeHandle(ref, () => ({
        back: handleBack,
    }), [handleBack])

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.AMOUNT:
                return (
                    <SwiftAmountStep
                        amount={amount}
                        setAmount={setAmount}
                        availableBalance={sourceAvailableBalance}
                        currencyCode={currencyCode}
                        sourceIban={sourceIban}
                    />
                )
            case STEPS.BENEFICIARY:
                return (
                    <BeneficiaryStep
                        beneficiaries={swiftBeneficiaries}
                        selectedBeneficiary={selectedBeneficiary}
                        setSelectedBeneficiary={setSelectedBeneficiary}
                        onAddBeneficiary={() => setIsAddModalOpen(true)}
                        emptyMessage={t("No beneficiaries found with SWIFT bank details.")}
                    >
                        {selectedBeneficiary && !hasBeneficiarySwiftCode(selectedBeneficiary) && (
                            <MissingSwiftCodeBanner
                                beneficiary={selectedBeneficiary}
                                authHeader={authHeader}
                                onSwiftCodeSaved={async (updatedBeneficiary) => {
                                    setSelectedBeneficiary(updatedBeneficiary)
                                    await getUserBeneficiaries()
                                }}
                            />
                        )}
                        {isAddressBlocked && (
                            <AddressTooLongBanner
                                beneficiary={selectedBeneficiary}
                                onAddressSaved={async (updatedBeneficiary) => {
                                    setSelectedBeneficiary(updatedBeneficiary)
                                    await getUserBeneficiaries()
                                }}
                            />
                        )}
                    </BeneficiaryStep>
                )
            case STEPS.ADD_BENEFICIARY:
                return (
                    <AddBeneficiaryStep
                        amount={amount}
                        currencyCode={currencyCode}
                        form={beneficiaryForm}
                        setForm={setBeneficiaryForm}
                    />
                )
            case STEPS.PURPOSE:
                return (
                    <PurposeStep
                        amount={amount}
                        currencyCode={currencyCode}
                        purpose={purpose}
                        setPurpose={setPurpose}
                        description={description}
                        setDescription={setDescription}
                        additionalInfo={additionalInfo}
                        setAdditionalInfo={setAdditionalInfo}
                    />
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        amount={amount}
                        currencyCode={currencyCode}
                        selectedBeneficiary={selectedBeneficiary}
                        purpose={purpose}
                        additionalInfo={additionalInfo}
                        feeDetails={feeDetails}
                        quoteExpiresAt={quoteExpiresAt}
                        confirmedDetails={confirmedDetails}
                        setConfirmedDetails={setConfirmedDetails}
                        confirmedParentCompany={confirmedParentCompany}
                        setConfirmedParentCompany={setConfirmedParentCompany}
                        onRefreshQuote={handleRefreshQuote}
                        isRefreshingQuote={isRefreshingQuote}
                    />
                )
            case STEPS.OTP:
                return (
                    <OTPConfirmation
                        variant="card"
                        fullHeight
                        setter={setCurrentStep}
                        setterValue={STEPS.DONE}
                        hideOtp={() => { }}
                        callback={verifyOtp}
                        processing={payoutDirect.isPending}
                        resendHandler={handleSendOtp}
                        authType={authType}
                        setAuthType={setAuthType}
                        methods={otpMethods}
                    />
                )
            case STEPS.DONE:
                return (
                    <DoneStep
                        amount={amount}
                        currencyCode={currencyCode}
                        selectedBeneficiary={selectedBeneficiary}
                        feeDetails={feeDetails}
                        payoutResult={payoutResult}
                        purpose={purpose}
                        additionalInfo={additionalInfo}
                        onSendAgain={resetState}
                        onClose={handleClose}
                    />
                )
            default:
                return null
        }
    }

    const content = (
        <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
            <aside className={styles.leftPanel}>
                <div>
                    <div className={styles.flowHeader}>
                        <div className={styles.flowIcon}>
                            <Globe size={18} />
                        </div>
                        <div>
                            <h2>{t("SWIFT Transfer")}</h2>
                            <p>{t("International Wire — EUR → USD")}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: "2rem" }} className={withdrawStyles.progressEffect}>
                        {SIDEBAR_STEPS.map((item, index) => {
                            const IconComponent = sidebarIcons[item.stepName]
                            return (
                                <SidebarProgress
                                    key={item.stepName}
                                    stepLabel={item.stepLabel}
                                    label={item.label}
                                    Icon={IconComponent}
                                    isActive={isSidebarStepActive(item, currentStep)}
                                    isCompleted={isSidebarStepCompleted(item, currentStep)}
                                    showBar={index < SIDEBAR_STEPS.length - 1}
                                />
                            )
                        })}
                    </div>
                </div>

                {width > 700 && (
                    <div className={styles.contactBox}>
                        <ContactBox />
                    </div>
                )}
            </aside>

            <section className={styles.rightPanel}>
                <div className={styles.content}>{renderStepContent()}</div>

                {(showFooter && !isMobile) && (
                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                            {t("Cancel")}
                        </button>
                        <div className={styles.footerNav}>
                            <button type="button" className={styles.backBtn} onClick={handleBack}>
                                <ChevronLeft size={14} />
                                {t("Back")}
                            </button>
                            <button
                                type="button"
                                className={styles.nextBtn}
                                disabled={disabled}
                                onClick={handleContinue}
                            >
                                {isProcessing ? t("Processing...") : getContinueLabel(currentStep, t)}
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
            {(isMobile && showFooter) &&
                <MobileFooter
                    label={isProcessing ? t("Processing...") : getContinueLabel(currentStep, t)}
                    handleBack={handleBack}
                    handleAction={handleContinue}
                    disabled={disabled}
                />
            }
        </div>
    )

    return (
        <>
            {isPage ? (
                <div className={styles.pageContainer}>
                    {isMobile && <MobileStepProgress
                        currentStep={currentStep}
                        isSidebarStepActive={isSidebarStepActive}
                        isSidebarStepCompleted={isSidebarStepCompleted}
                        SIDEBAR_STEPS={SIDEBAR_STEPS}
                        getSidebarStepName={getSidebarStepName}
                        handleClick={() => setShowDrawer(true)}
                    />}
                    {content}
                </div>
            ) : (
                <Modal
                    isOpen={isOpen}
                    style={{ minWidth: width > 1000 ? "980px" : "0%" }}
                    toggle={handleClose}
                >
                    <ModalBody style={{ padding: "20px" }}>{content}</ModalBody>
                </Modal>
            )}

            {USE_NEW_BENEFICIARY_FLOW ? (
                <AddBeneficiaryFlowV2
                    open={isAddModalOpen || isChannelModalOpen}
                    fixedMethod="swift"
                    existingBeneficiary={isChannelModalOpen ? channelModalBeneficiary : null}
                    handleClose={() => {
                        setIsAddModalOpen(false);
                        setIsChannelModalOpen(false);
                        setChannelModalBeneficiary(null);
                    }}
                    onSaveSuccess={handleBeneficiarySaved}
                />
            ) : (
                <>
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
            )}

            <StepsDrawer
                open={showDrawer}
                currentStep={currentStep}
                isSidebarStepActive={isSidebarStepActive}
                isSidebarStepCompleted={isSidebarStepCompleted}
                SIDEBAR_STEPS={SIDEBAR_STEPS}
                toggleDrawer={(val) => setShowDrawer(val)}
            />
        </>
    )
})

SwiftTransfer.displayName = 'SwiftTransfer';

export default SwiftTransfer
SwiftTransfer.displayName = 'SwiftTransfer';