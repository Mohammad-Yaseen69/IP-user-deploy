import { useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { Modal, ModalBody } from "reactstrap"
import { CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Home, List, Plus, Search, Send, User } from "react-feather"
import AddBeneficiary from "../../../AddBeneficiary"
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
import { useVirtualIbanPayoutDirect, useVirtualIbanPayoutFee } from "../../../../hooks/useVirtualIban"
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError"
import OTPConfirmation from "../../../UserSettingsNew/OTPConfirmation"
import sepaCountries from "./sepaCountries.json"
import { Tooltip } from "@mui/material"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

const formatMoney = (value, currencyCode = "EUR") => `${currencyCode} ${getAmountNumber(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const getSourceBalance = (availableBalance, selectedIban) => availableBalance ?? selectedIban?.balance ?? 0
const getVirtualIbanNumber = (iban) => iban?.iban || iban?.ibanFull || iban?.account_number || iban?.accountNumber || iban?.virtual_iban || iban?.virtualIban || ""
const getVirtualIbanTitle = (iban, fallbackCurrency = "EUR") => iban?.name || iban?.title || iban?.label || `${fallbackCurrency} IBAN`

const getBeneficiaryId = (beneficiary) => beneficiary?._id || beneficiary?.id || ""
const getBeneficiaryBankDetail = (beneficiary) => beneficiary?.bank_details?.[0] || {}
const getBeneficiaryName = (beneficiary) => {
    const first = beneficiary?.first_name
    const last = beneficiary?.last_name
    if (first || last) return [first, last].filter(Boolean).join(" ")
    return beneficiary?.company_name || beneficiary?.legalName || beneficiary?.name || "Beneficiary"
}
const getBeneficiaryTypeLabel = (beneficiary) => {
    const type = beneficiary?.beneficiary_type || beneficiary?.type
    return type ? `${String(type).charAt(0).toUpperCase()}${String(type).slice(1)}` : "-"
}
const getBeneficiaryCountry = (beneficiary) => beneficiary?.country_name || beneficiary?.country || "-"
const getBeneficiaryIban = (beneficiary) => getBeneficiaryBankDetail(beneficiary)?.iban || beneficiary?.iban || "-"
const getBeneficiaryBic = (beneficiary) => getBeneficiaryBankDetail(beneficiary)?.swift_code || beneficiary?.bic || "-"
const getBeneficiaryBankName = (beneficiary) => getBeneficiaryBankDetail(beneficiary)?.name || beneficiary?.bankName || "-"
const getBeneficiaryAccountCount = (beneficiary) => beneficiary?.beneficiary_type
const getBeneficiarySubtitle = (beneficiary) => [getBeneficiaryCountry(beneficiary), getBeneficiaryTypeLabel(beneficiary)].filter((value) => value && value !== "-").join(" - ")
const getBeneficiaryInitial = (beneficiary) => (getBeneficiaryName(beneficiary).charAt(0) || "B").toUpperCase()

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
        country: form.bankCountry,
        beneficiary_type: isBusiness ? "business" : "individual",
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
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(availableBalance)
    const selectedSpeed = SEPA_TRANSFER_SPEEDS.find((speed) => speed.id === transferSpeed) || SEPA_TRANSFER_SPEEDS[0]

    return (
        <div className={styles.stepStack}>
            <AmountStep amount={amount} setAmount={setAmount} currencyCode={currencyCode} availableBalance={sourceBalance} label="Amount to send" />

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

                                            {speed.default && (
                                                <span className={styles.defaultPill}>
                                                    {t("Default")}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h4>{t(speed.label)}</h4>
                                            <p>{t(speed.description)}</p>

                                            <strong
                                                className={
                                                    speed.feeAmount === 0
                                                        ? styles.freeFeeText
                                                        : styles.feeText
                                                }
                                            >
                                                {t(speed.feeLabel)}
                                            </strong>
                                        </div>
                                    </button>
                                </span>
                            </Tooltip>
                        );
                    })}
                </div>

                <div className={styles.infoStrip}>
                    {t("The recipient receives")}{" "}
                    <strong>
                        {formatMoney(numericAmount, currencyCode)}
                    </strong>{" "}
                    {t("in full - no correspondent-bank deductions in SEPA.")}
                </div>
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
                {filteredBeneficiaries?.length === 0 && <div style={{ padding: "10px", color: "var(--secondary-color)", textAlign: "center" }}>{t("No beneficiaries found with euroean bank accounts.")}</div>}
                {filteredBeneficiaries.map((beneficiary) => {
                    const beneficiaryId = getBeneficiaryId(beneficiary)
                    const selected = getBeneficiaryId(selectedBeneficiary) === beneficiaryId
                    return (
                        <button type="button" key={beneficiaryId} className={`${styles.beneficiaryCard} ${selected ? styles.selectedBeneficiary : ""}`} onClick={() => setSelectedBeneficiary(beneficiary)}>
                            <span className={`${styles.avatar} ${styles[beneficiary.accent || "gold"]}`}>{getBeneficiaryInitial(beneficiary)}</span>
                            <span className={styles.beneficiaryCopy}><strong>{getBeneficiaryName(beneficiary)}</strong><small>{getBeneficiarySubtitle(beneficiary)}</small></span>
                            <span className={`${styles.accountBadge} ${selected ? styles.activeBadge : ""}`}>{getBeneficiaryAccountCount(beneficiary)}</span>
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

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("SEPA Transfer Receipt", 14, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        28
    )

    autoTable(doc, {
        startY: 36,
        head: [["Details", "Information"]],
        body: rows,
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
        headStyles: {
            fontStyle: "bold",
        },
        columnStyles: {
            0: {
                cellWidth: 55,
                fontStyle: "bold",
            },
            1: {
                cellWidth: 125,
            },
        },
    })

    const finalY = doc.lastAutoTable.finalY + 12

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    doc.text(
        "The recipient receives the full amount - no correspondent-bank deductions in SEPA.",
        14,
        finalY
    )

    doc.setFontSize(8)
    doc.text(
        "This receipt is generated electronically.",
        14,
        finalY + 8
    )

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
                <div><button type="button" className={styles.backBtn} onClick={() => downloadSepaReceipt({ amount, currencyCode, transferSpeed, selectedBeneficiary, purpose, additionalInfo, feeDetails, payoutResult, t })}><Download size={15} />{t("Download receipt")}</button><button type="button" className={styles.nextBtn} onClick={() => navigate('/virtual-IBAN')}><Home size={15} />{t("Back to dashboard")}</button></div>
            </div>
        </div>
    )
}

const SepaTransfer = ({ isOpen = true, toggle, selectedIban, availableBalance, isPage = false, }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const navigate = useNavigate()
    const { beneficiaries, userDetails, setProfileLockTime, getUserBeneficiaries } = useContext(UserContext)
    const currencyCode = selectedIban?.currency || "EUR"
    const sourceAvailableBalance = getSourceBalance(availableBalance, selectedIban)
    const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms")
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [transferSpeed, setTransferSpeed] = useState("standard")
    const [beneficiaryList, setBeneficiaryList] = useState([])
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
    const [beneficiaryForm, setBeneficiaryForm] = useState(DEFAULT_BENEFICIARY_FORM)
    const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false)
    const [showBeneficiaryAddModal, setShowBeneficiaryAddModal] = useState(false)
    const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0])
    const [additionalInfo, setAdditionalInfo] = useState("")
    const [confirmedDetails, setConfirmedDetails] = useState(false)
    const [authType, setAuthType] = useState(getDefaultAuthType)
    const [feeDetails, setFeeDetails] = useState(null)
    const [otpToken, setOtpToken] = useState("")
    const [payoutResult, setPayoutResult] = useState(null)

    const payoutFee = useVirtualIbanPayoutFee()
    const payoutDirect = useVirtualIbanPayoutDirect()

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token) => {
            setOtpToken(token)
            setCurrentStep(STEPS.OTP)
        },
        onError: (err) => {
            toast.error(err?.message || t("Unable to send OTP"))
        },
    })

    const sourceIban = useMemo(() => ({ title: getVirtualIbanTitle(selectedIban, currencyCode), iban: getVirtualIbanNumber(selectedIban) }), [selectedIban, currencyCode])
    const machineData = useMemo(() => ({ amount, availableBalance: sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, confirmedDetails }), [amount, sourceAvailableBalance, transferSpeed, selectedBeneficiary, beneficiaryForm, isAddingBeneficiary, purpose, confirmedDetails])
    const isProcessing = payoutFee.isPending || isSendingOtp
    const disabled = getDisabledState(currentStep, machineData) || isProcessing
    const showFooter = currentStep !== STEPS.OTP && currentStep !== STEPS.DONE

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setTransferSpeed("standard")
        setSelectedBeneficiary(beneficiaryList[0] || null)
        setBeneficiaryForm(DEFAULT_BENEFICIARY_FORM)
        setIsAddingBeneficiary(false)
        setPurpose(PURPOSE_OPTIONS[0])
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
    console.log(beneficiaries, "beneficiaryList")

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
        description: purpose,
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
        try {
            await sendOtp(buildPayoutPayload(), nextAuthType)
        } catch {
            // toast already shown by useSendOtp's onError
        }
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
            handlePaymentApiError({
                error,
                navigate,
                setError: setOtpError,
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
            try {
                await previewFee()
                setCurrentStep(STEPS.REVIEW)
            } catch (error) {
                handlePaymentApiError({ error, navigate, setError: (message) => toast.error(message), setProfileLockTime })
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
        switch (currentStep) {
            case STEPS.AMOUNT:
                return <SepaAmountStep amount={amount} setAmount={setAmount} availableBalance={sourceAvailableBalance} currencyCode={currencyCode} sourceIban={sourceIban} transferSpeed={transferSpeed} setTransferSpeed={setTransferSpeed} />
            case STEPS.BENEFICIARY:
                return <BeneficiaryStep beneficiaries={beneficiaryList} selectedBeneficiary={selectedBeneficiary} setSelectedBeneficiary={setSelectedBeneficiary} onAddBeneficiary={() => { setShowBeneficiaryAddModal(true) }} />
            case STEPS.ADD_BENEFICIARY:
                return <AddBeneficiaryStep amount={amount} currencyCode={currencyCode} form={beneficiaryForm} setForm={setBeneficiaryForm} />
            case STEPS.PURPOSE:
                return <PurposeStep amount={amount} currencyCode={currencyCode} purpose={purpose} setPurpose={setPurpose} additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} />
            case STEPS.REVIEW:
                return <ReviewStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} purpose={purpose} additionalInfo={additionalInfo} feeDetails={feeDetails} confirmedDetails={confirmedDetails} setConfirmedDetails={setConfirmedDetails} />
            case STEPS.OTP:
                return <OTPConfirmation fullHeight setter={setCurrentStep} setterValue={STEPS.DONE} hideOtp={() => { }} callback={verifyOtp} processing={payoutDirect.isPending} resendHandler={handleSendOtp} authType={authType} setAuthType={setAuthType} />
            case STEPS.DONE:
                return <DoneStep amount={amount} currencyCode={currencyCode} transferSpeed={transferSpeed} selectedBeneficiary={selectedBeneficiary} feeDetails={feeDetails} payoutResult={payoutResult} onSendAgain={resetState} onClose={handleClose} />
            default:
                return null
        }
    }
    const content = (
        <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
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
                <div className={styles.pageContainer}>
                    {content}
                </div>
            ) : (
                <Modal isOpen={isOpen} style={{ minWidth: width > 1000 ? "980px" : "0%" }} toggle={handleClose}>
                    <ModalBody style={{ padding: "20px" }}>
                        {content}
                    </ModalBody>
                </Modal>
            )}




            <Modal style={{ minWidth: width > 1000 ? "900px" : "0%" }} toggle={() => setShowBeneficiaryAddModal(false)} isOpen={showBeneficiaryAddModal}>
                <ModalBody style={{ padding: "0px" }}>
                    <AddBeneficiary
                        inInternationalModal={true}
                        toggleHandler={async (addedBen) => {
                            await getUserBeneficiaries()
                            if (addedBen) setSelectedBeneficiary(addedBen)
                            setShowBeneficiaryAddModal(false)
                        }}
                    />
                </ModalBody>
            </Modal>
        </>
    )
}

export default SepaTransfer
