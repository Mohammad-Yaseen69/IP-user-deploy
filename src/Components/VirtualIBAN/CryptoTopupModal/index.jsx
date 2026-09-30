import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import { toast } from "react-toastify"
import useWindowWidth from "../../../utils/useWindowWidth"
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox"
import addFundsStyles from "../WithdrawBalanceModal/withdrawBalance.module.scss"
import {
    getContinueLabel,
    getDisabledState,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    SIDEBAR_STEPS,
    STEPS,
    getAmountNumber
} from "../../../stateMachines/ibanCryptoTopup"
import AmountStep from "./AmountStep"
import ReviewStep from "./ReviewStep"
import DoneStep from "./DoneStep"
import styles from "../ConvertFundsModal/convertFunds.module.scss"
import SidebarProgress from "../VirtualIbanModal/SidebarProgress"
import { useVirtualIbanCryptoTopupFee, useExecuteVirtualIbanCryptoTopup } from "../../../hooks/useVirtualIban"
import { getErrorMessage } from "../../../Helper/getErrorMessage"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"

const CoinsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.75" cy="6.75" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="11.25" cy="11.25" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M10.125 6.75C10.125 8.61396 8.61396 10.125 6.75 10.125" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const IdBadgeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2.25" width="12" height="13.5" rx="1.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="9" cy="8.25" r="2.25" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M5.25 14.25C5.25 12.1789 6.92893 10.5 9 10.5C11.0711 10.5 12.75 12.1789 12.75 14.25" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M7.5 3.75H10.5" stroke="#F8F9FC" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
)

const SealCheckSmall = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V6L12 2Z" stroke="#F8F9FC" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="#F8F9FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const CryptoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5L15.75 5.25V12.75L9 16.5L2.25 12.75V5.25L9 1.5Z" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 1.5V16.5" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 14 15" fill="none">
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
    [STEPS.DONE]: () => <SealCheckSmall />,
}

const base_url = window.location.origin || 'https://my.insta-pay.ch';


const CryptoTopupModal = ({ isOpen, toggle, selectedIban }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [feeDetails, setFeeDetails] = useState(null)
    const [confirmData, setConfirmData] = useState(null)
    const [checkoutUrl, setCheckoutUrl] = useState("")
    const { getKey, reset } = useIdempotency();

    const feeMutation = useVirtualIbanCryptoTopupFee()
    const confirmMutation = useExecuteVirtualIbanCryptoTopup()

    const ibanId = selectedIban?._id || selectedIban?.id

    const machineData = useMemo(
        () => ({
            amount,
            feeDetails,
            confirmData,
        }),
        [amount, feeDetails, confirmData]
    )

    const disabled = getDisabledState(currentStep, machineData)
    const continueLabel = getContinueLabel(currentStep, t)

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setFeeDetails(null)
        setConfirmData(null)
        setCheckoutUrl("")
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const handleCheckoutClose = () => {
        setCheckoutUrl("")
        handleClose()
    }

    const previewFee = async () => {
        if (!ibanId) {
            toast.error(t("Please select a virtual IBAN first"))
            return
        }
        const res = await feeMutation.mutateAsync({
            iban_id: ibanId,
            amount: getAmountNumber(amount),
        })
        if (res?.data) {
            setFeeDetails(res.data)
            setCurrentStep(STEPS.REVIEW)
        } else if (res?.message) {
            toast.error(res.message)
        }
    }
    const refreshFeeDetails = useCallback(async () => {
        if (!ibanId || !amount) return
        try {
            const res = await feeMutation.mutateAsync({
                iban_id: ibanId,
                amount: getAmountNumber(amount),
            })
            if (res?.data) {
                setFeeDetails(res.data)
            } else if (res?.message) {
                toast.error(res.message)
            }
        } catch (error) {
            console.error("Failed to refresh fee details:", error)
        }
    }, [ibanId, amount, feeMutation, t])

    const confirmTopup = async () => {
        if (!ibanId || !feeDetails?.token) {
            toast.error(t("Invalid quote details"))
            return
        }
        const res = await confirmMutation.mutateAsync({
            iban_id: ibanId,
            token: feeDetails.token,
            returnUrl: `${base_url}/add-funds/crypto-success?isIban=true`,
            idempotencyKey: getKey()
        })
        const nextCheckoutUrl = res?.data?.checkout_url || res?.data?.data?.checkout_url
        if (nextCheckoutUrl) {
            setCheckoutUrl(nextCheckoutUrl)
        } else if (res?.message) {
            toast.error(res.message)
        } else {
            toast.error(t("Unable to obtain payment checkout URL"))
        }
    }
    const handleContinue = async () => {
        if (!selectedIban) {
            toast.error(t("Please select a virtual IBAN first"))
            return
        }
        try {
            if (currentStep === STEPS.AMOUNT) {
                await previewFee()
                return
            }
            if (currentStep === STEPS.REVIEW) {
                await confirmTopup()
                return
            }
            if (currentStep === STEPS.DONE) {
                handleClose()
                return
            }
            const { nextStep } = goNext(currentStep, machineData)
            if (nextStep) {
                setCurrentStep(nextStep)
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("Unable to process crypto topup request")))
        }
    }

    const handleBack = () => {
        reset()
        const { prevStep } = goBack(currentStep, machineData)
        if (prevStep === null) handleClose()
        else setCurrentStep(prevStep)
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.AMOUNT:
                return (
                    <AmountStep
                        amount={amount}
                        setAmount={setAmount}
                        selectedIban={selectedIban}
                    />
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        amount={amount}
                        feeDetails={feeDetails}
                        selectedIban={selectedIban}
                        onRefreshFee={refreshFeeDetails}
                        isRefreshing={feeMutation.isPending}
                    />
                )
            case STEPS.DONE:
                return (
                    <DoneStep
                        confirmData={confirmData}
                        selectedIban={selectedIban}
                        onOpenCheckout={setCheckoutUrl}
                    />
                )
            default:
                return null
        }
    }

    const isDone = currentStep === STEPS.DONE
    const isProcessing = feeMutation.isPending || confirmMutation.isPending
    const footerDisabled = disabled || isProcessing || !selectedIban

    const renderBody = () => (
        <div
            className={styles.modalLayout}
            style={{ flexDirection: width < 1000 ? "column" : "row" }}
        >
            <div className={addFundsStyles.left}>
                <div style={{ width: "100%" }}>
                    <div className={styles.bankHeader}>
                        {width >= 700 ? (
                            <>
                                <div className={styles.bankIcon}>
                                    <CryptoIcon />
                                </div>
                                <h2>
                                    {t("Top up Virtual IBAN")}
                                    <br />
                                    {t("with Crypto")}
                                </h2>
                            </>
                        ) : (
                            <div className={styles.mobileHeaderRow}>
                                {!isDone && (
                                    <button
                                        type="button"
                                        className={styles.backIconButton}
                                        disabled={isProcessing}
                                        onClick={handleBack}
                                    >
                                            <ChevronLeft size={24} />
                                    </button>
                                )}
                                <h2>{t("Top up Virtual IBAN with Crypto")}</h2>
                            </div>
                        )}
                        {width <= 480 && (
                            <div className={styles.headerRightGroup}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={handleClose}
                                >
                                    {t("Cancel")}
                                </button>
                                <ContactBox isMobile={true} />
                            </div>
                        )
                        }
                    </div>
                    <div
                        className={addFundsStyles.progressEffect}
                        style={{ marginTop: "2rem" }}
                    >
                        {width < 480 ? (
                            <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                                {SIDEBAR_STEPS.map((item) => {
                                    const isActive = isSidebarStepActive(item, currentStep)
                                    const isCompleted = isSidebarStepCompleted(item, currentStep)
                                    const isDoneOrActive = isActive || isCompleted

                                    return (
                                        <div
                                            key={item.stepName}
                                            style={{
                                                flex: 1,
                                                height: "6px",
                                                borderRadius: "3px",
                                                backgroundColor: isDoneOrActive ? "#10B981" : "#EAECF0",
                                                transition: "background-color 0.2s ease",
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        ) : (
                            SIDEBAR_STEPS.map((item, index) => {
                                const IconComponent = SIDEBAR_ICONS[item.stepName]
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
                            })
                        )}
                    </div>
                </div>
                {width > 700 && (
                    <div className={addFundsStyles.contactBox}>
                        <ContactBox />
                    </div>
                )
                }
            </div>
            <div
                className={styles.rightPanel}
                style={{ width: width < 1000 ? "100%" : undefined }}
            >
                <div className={styles.content}>{renderStepContent()}</div>

                <div className={styles.footer}>
                    {width >= 480 && (
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleClose}
                        >
                            {t("Cancel")}
                        </button>
                    )}
                    <div className={styles.footerNav}>
                        {!isDone && (
                            <button
                                type="button"
                                className={styles.backBtn}
                                disabled={isProcessing}
                                onClick={handleBack}
                            >
                                <ChevronLeft />
                                {t("Back")}
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.nextBtn}
                            disabled={footerDisabled}
                            onClick={handleContinue}
                        >
                            {isProcessing ? t("Processing...") : isDone ? t("Done") : continueLabel}
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Modal
                isOpen={isOpen}
                style={{
                    minWidth: width > 1000 ? "900px" : "0px",
                }}
                toggle={handleClose}
            >
                <ModalBody style={{ padding: "20px" }}>{renderBody()}</ModalBody>
            </Modal>
            <Modal
                isOpen={Boolean(checkoutUrl)}
                toggle={handleCheckoutClose}
                style={{ width: "700px", maxWidth: "calc(100% - 2rem)" }}
            >
                <ModalHeader toggle={handleCheckoutClose}>{t("Payment Checkout")}</ModalHeader>
                <ModalBody style={{ padding: 0 }}>
                    <iframe
                        title={t("Payment Checkout")}
                        src={checkoutUrl}
                        style={{ width: "100%", height: "75vh", border: 0, display: "block" }}
                    />
                </ModalBody>
            </Modal>
        </>
    )
}

export default CryptoTopupModal
