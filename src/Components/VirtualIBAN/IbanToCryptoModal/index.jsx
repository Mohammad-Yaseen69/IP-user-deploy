import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { Modal, ModalBody } from "reactstrap"
import { toast } from "react-toastify"
import useWindowWidth from "../../../utils/useWindowWidth"
import { UserContext } from "../../../Context/UserContext"
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox"
import addFundsStyles from "../WithdrawBalanceModal/withdrawBalance.module.scss"
import styles from "../ConvertFundsModal/convertFunds.module.scss"
import AmountStep from "../ConvertFundsModal/AmountStep"
import SidebarProgress from "../VirtualIbanModal/SidebarProgress"
import MobileStepProgress from "../VirtualIbanModal/MobileStepProgress"
import MobileFooter from "../../../Common/Component/MobileFooter"
import StepsDrawer from "../../../Common/Component/StepsDrawer"
import { getAmountNumber } from "../utils/amount"
import { isWalletBlocked } from "../CryptoWallet/instapay/wallets"
import {
    useExecuteVirtualIbanCryptoTransfer,
    useVirtualIbanCryptoTransferFee,
} from "../../../hooks/useVirtualIban"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError"
import {
    getContinueLabel,
    getDisabledState,
    goBack,
    isSidebarStepActive,
    isSidebarStepCompleted,
    SIDEBAR_STEPS,
    STEPS,
} from "../../../stateMachines/ibanToCrypto"
import DestinationNote from "./DestinationNote"
import ReviewStep from "./ReviewStep"
import ProcessingStep from "./ProcessingStep"

/* The conversion credits the user's USDT wallet; there is no wallet to choose. */
const TARGET_CURRENCY = "USDT"
const QUOTE_LIFETIME_MS = 10 * 60 * 1000

/* Quote errors the user fixes by taking a fresh quote rather than by changing anything. */
const STALE_QUOTE = /expired|already been used|does not match|invalid quote/i

const CoinsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.75" cy="6.75" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="11.25" cy="11.25" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const DiamondIcon = ({ color = "#F8F9FC" }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.125L15.1875 9L9 16.875L2.8125 9L9 1.125Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M15.1875 9L9 11.8125L2.8125 9" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
)

const IdBadgeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2.25" width="12" height="13.5" rx="1.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="9" cy="8.25" r="2.25" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const ChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
        <path d="M8.75 11L5.25 7.5L8.75 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const ChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
        <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const SIDEBAR_ICONS = {
    [STEPS.AMOUNT]: () => <CoinsIcon />,
    [STEPS.REVIEW]: () => <IdBadgeIcon />,
}

/* When the quote token itself says it expires; the 10 minute rule if it can't be read. */
const getQuoteExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
        if (payload?.exp) return payload.exp * 1000
    } catch {
        /* fall through */
    }
    return Date.now() + QUOTE_LIFETIME_MS
}

/*
 * Convert virtual IBAN (EUR) balance into the user's InstaPay USDT wallet.
 * A dialog on desktop; with `isPage` it renders straight into the page (the mobile
 * screen), and exposes back() through the ref for that page's header.
 */
const IbanToCryptoModal = forwardRef(({ isOpen, toggle, selectedIban, availableBalance, isPage = false }, ref) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const isMobile = width <= 600
    const navigate = useNavigate()
    const { userWallets, getUserWallets, setProfileLockTime } = useContext(UserContext)
    const { getKey, reset: resetIdempotency } = useIdempotency()

    const [showDrawer, setShowDrawer] = useState(false)
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [feeDetails, setFeeDetails] = useState(null)
    const [quoteExpiresAt, setQuoteExpiresAt] = useState(null)
    const [result, setResult] = useState(null)
    const confirmingRef = useRef(false)

    const feeQuote = useVirtualIbanCryptoTransferFee()
    const executeTransfer = useExecuteVirtualIbanCryptoTransfer()

    const ibanId = selectedIban?._id || selectedIban?.id
    const ibanCurrency = selectedIban?.currency || "EUR"
    const sourceBalance = availableBalance ?? selectedIban?.balance ?? 0
    const active = isPage || isOpen

    useEffect(() => {
        if (active) getUserWallets()
    }, [active])

    /* The active USDT wallet, the default one first if there are several. */
    const wallet = useMemo(() => (
        (userWallets || [])
            .filter(item => (
                item?.wallet_type === "crypto" &&
                String(item?.currency?.code || "").toUpperCase() === TARGET_CURRENCY &&
                !isWalletBlocked(item)
            ))
            .sort((a, b) => Number(!!b?.default) - Number(!!a?.default))[0] ?? null
    ), [userWallets])

    const quoteExpired = !!quoteExpiresAt && quoteExpiresAt <= Date.now()
    const disabled = getDisabledState(currentStep, { amount, wallet, availableBalance: sourceBalance, feeDetails, quoteExpired })

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setFeeDetails(null)
        setQuoteExpiresAt(null)
        setResult(null)
        confirmingRef.current = false
        resetIdempotency()
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const showError = (error, fallback) => {
        const message = handlePaymentApiError({ error, setProfileLockTime, navigate, fallback: t(fallback) })
        if (message) toast.error(t(message))
        return message || ""
    }

    const fetchQuote = useCallback(async () => {
        const res = await feeQuote.mutateAsync({
            iban_id: ibanId,
            wallet_id: wallet?._id,
            amount: getAmountNumber(amount),
        })
        const data = res?.data
        setFeeDetails(data)
        setQuoteExpiresAt(getQuoteExpiry(data?.token))
        /* A new quote is a new request, so it gets a new idempotency key. */
        resetIdempotency()
        return data
    }, [ibanId, wallet, amount])

    const refreshQuote = useCallback(async () => {
        try {
            await fetchQuote()
        } catch (error) {
            showError(error, "We couldn't refresh the quote. Please try again.")
        }
    }, [fetchQuote])

    const confirm = async () => {
        /* A quote is single use: never let a double tap send it twice. */
        if (confirmingRef.current) return
        confirmingRef.current = true
        try {
            const res = await executeTransfer.mutateAsync({
                iban_id: ibanId,
                wallet_id: wallet?._id,
                amount: feeDetails?.total?.value,
                token: feeDetails?.token,
                idempotencyKey: getKey(),
            })
            setResult(res?.data)
            setCurrentStep(STEPS.DONE)
        } catch (error) {
            if (error?.response?.status === 409) {
                toast.info(t("This conversion is already being processed."))
                return
            }
            const message = showError(error, "We couldn't start the conversion. Please try again.")
            /* The quote is spent or stale; take a fresh one so the user can simply retry. */
            if (STALE_QUOTE.test(message) || error?.response?.status === 502) {
                await refreshQuote()
            }
        } finally {
            confirmingRef.current = false
        }
    }

    const handleContinue = async () => {
        if (!selectedIban) {
            toast.error(t("Please select a virtual IBAN first"))
            return
        }

        if (currentStep === STEPS.DONE) {
            handleClose()
            return
        }

        if (currentStep === STEPS.REVIEW) {
            await confirm()
            return
        }

        try {
            await fetchQuote()
            setCurrentStep(STEPS.REVIEW)
        } catch (error) {
            showError(error, "We couldn't get a quote. Please try again.")
        }
    }

    const handleBack = () => {
        if (currentStep === STEPS.DONE) {
            handleClose()
            return
        }
        const { prevStep } = goBack(currentStep)
        if (prevStep === null) handleClose()
        else setCurrentStep(prevStep)
    }

    useImperativeHandle(ref, () => ({ back: handleBack }))

    /* ---------------------------------- render ---------------------------------- */

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.AMOUNT:
                return (
                    <>
                        <AmountStep
                            amount={amount}
                            setAmount={setAmount}
                            currencyCode={ibanCurrency}
                            availableBalance={sourceBalance}
                            label={t("Amount to convert")}
                        />
                        <DestinationNote wallet={wallet} onCreate={() => {
                            handleClose()
                            navigate("/crypto-wallets")
                        }} />
                    </>
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        feeDetails={feeDetails}
                        quoteExpiresAt={quoteExpiresAt}
                        wallet={wallet}
                        iban={selectedIban}
                        onRefreshQuote={refreshQuote}
                        isRefreshing={feeQuote.isPending}
                    />
                )
            case STEPS.DONE:
                return <ProcessingStep result={result} />
            default:
                return null
        }
    }

    const isDone = currentStep === STEPS.DONE
    const isBusy = feeQuote.isPending || executeTransfer.isPending
    const footerDisabled = (!isDone && disabled) || isBusy || !selectedIban
    const primaryLabel = isBusy
        ? t("Processing...")
        : isDone
            ? t("Close")
            : getContinueLabel(currentStep, t)

    const content = (
        <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
            {!isMobile &&
                <div className={addFundsStyles.left}>
                    <div style={{ width: "100%" }}>
                        <div className={styles.bankHeader}>
                            <div className={styles.bankIcon}>
                                <DiamondIcon color="#F2EEFF" />
                            </div>
                            {width > 700
                                ? <h2>{t("Convert IBAN to")}<br />{t("crypto wallet")}</h2>
                                : <h2>{t("Convert IBAN to crypto wallet")}</h2>}
                        </div>
                        <div className={addFundsStyles.progressEffect} style={{ marginTop: "2rem" }}>
                            {SIDEBAR_STEPS.map((item, index) => (
                                <SidebarProgress
                                    key={item.stepName}
                                    stepLabel={item.stepLabel}
                                    label={item.label}
                                    Icon={SIDEBAR_ICONS[item.stepName]}
                                    isActive={isSidebarStepActive(item, currentStep)}
                                    isCompleted={isSidebarStepCompleted(item, currentStep)}
                                    showBar={index < SIDEBAR_STEPS.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                    {width > 700 &&
                        <div className={addFundsStyles.contactBox}>
                            <ContactBox />
                        </div>}
                </div>
            }

            <div className={styles.rightPanel} style={{ width: width < 1000 ? "100%" : undefined }}>
                <div className={styles.content}>{renderStepContent()}</div>
                {isMobile ? (
                    <MobileFooter
                        label={primaryLabel}
                        handleBack={!isDone && handleBack}
                        handleAction={handleContinue}
                        disabled={footerDisabled}
                    />
                ) : (
                    <div className={styles.footer} style={isDone ? { justifyContent: "flex-end" } : undefined}>
                        {isDone ? (
                            /* Nothing left to do here: the credit arrives with a notification. */
                            <button type="button" className={styles.nextBtn} onClick={handleClose}>
                                {t("Close")}
                            </button>
                        ) : (
                            <>
                                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                                    {t("Cancel")}
                                </button>
                                <div className={styles.footerNav}>
                                    <button type="button" className={styles.backBtn} disabled={isBusy} onClick={handleBack}>
                                        <ChevronLeft />
                                        {t("Back")}
                                    </button>
                                    <button type="button" className={styles.nextBtn} disabled={footerDisabled} onClick={handleContinue}>
                                        {primaryLabel}
                                        <ChevronRight />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            {isPage ? (
                <div>
                    {isMobile &&
                        <MobileStepProgress
                            handleClick={() => setShowDrawer(true)}
                            currentStep={currentStep}
                            isSidebarStepActive={isSidebarStepActive}
                            isSidebarStepCompleted={isSidebarStepCompleted}
                            SIDEBAR_STEPS={SIDEBAR_STEPS}
                        />}
                    {content}
                </div>
            ) : (
                <Modal
                    isOpen={isOpen}
                    style={{ minWidth: width > 1000 ? "900px" : "0px" }}
                    toggle={handleClose}
                >
                    <ModalBody style={{ padding: "20px" }}>{content}</ModalBody>
                </Modal>
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

IbanToCryptoModal.displayName = "IbanToCryptoModal"

export default IbanToCryptoModal
