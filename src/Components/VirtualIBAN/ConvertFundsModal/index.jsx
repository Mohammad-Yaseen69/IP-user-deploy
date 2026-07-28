import { useMemo, useState, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import { toast } from "react-toastify"
import useWindowWidth from "../../../utils/useWindowWidth"
import { UserContext } from "../../../Context/UserContext"
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
} from "../../../stateMachines/convertFunds"
import AmountStep from "./AmountStep"
import ReviewStep from "./ReviewStep"
import DoneStep from "./DoneStep"
import styles from "./convertFunds.module.scss"
import SidebarProgress from "../VirtualIbanModal/SidebarProgress"
import PaymentStep from "../../MyMasterCard/PaymentModal/PaymentStep"
import { getAmountNumber } from "../utils/amount"
import { useExecuteVirtualIbanTransfer, useVirtualIbanTransferFee } from "../../../hooks/useVirtualIban"
import { getErrorMessage } from "../../../Helper/getErrorMessage"

const CoinsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.75" cy="6.75" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="11.25" cy="11.25" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M10.125 6.75C10.125 8.61396 8.61396 10.125 6.75 10.125" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const WalletIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2.25" y="4.5" width="13.5" height="11.25" rx="1.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M2.25 7.5H15.75" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="13.5" cy="10.5" r="1" fill="#F8F9FC" />
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

const ConvertIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M12.75 2.25L15.75 5.25L12.75 8.25" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.25 5.25H15.75" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.25 15.75L2.25 12.75L5.25 9.75" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.75 12.75H2.25" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    [STEPS.WALLET]: () => <WalletIcon />,
    [STEPS.REVIEW]: () => <IdBadgeIcon />,
    [STEPS.DONE]: () => <SealCheckSmall />,
}




const ConvertFundsModal = ({ isOpen, toggle, selectedIban, availableBalance }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    const { userWallets, getUserWallets } = useContext(UserContext)

    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [wallet, setWallet] = useState({})
    const [feeDetails, setFeeDetails] = useState(null)
    const feePreview = useVirtualIbanTransferFee()
    const executeTransfer = useExecuteVirtualIbanTransfer()
    const sourceAvailableBalance = availableBalance ?? selectedIban?.balance ?? 0

    useEffect(() => {
        getUserWallets()
    }, [])

    const filteredWallets = useMemo(() => {
        return userWallets
            ?.filter(item =>
                item?.wallet_type === "insta" &&
                !item?.blocked &&
                !item?.admin_blocked &&
                item?.status === "active"
            )
            ?.map(item => ({
                name: item?.currency?.code,
                ...item,
            }))
            ?.sort((a, b) => {
                if (a.isSufficient && !b.isSufficient) return -1;
                if (!a.isSufficient && b.isSufficient) return 1;
                if (b?.default === true) return 1;
                if (a?.default === true) return -1;
                return b?.balance?.available - a?.balance?.available;
            });
    }, [userWallets]);

    const machineData = useMemo(
        () => ({
            amount,
            wallet,
            availableBalance: sourceAvailableBalance,
        }),
        [amount, wallet, sourceAvailableBalance]
    )

    const disabled = getDisabledState(currentStep, machineData)
    const continueLabel = getContinueLabel(currentStep, t)

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setWallet({})
        setFeeDetails(null)
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const previewFee = async () => {
        const ibanId = selectedIban?._id || selectedIban?.id
        const res = await feePreview.mutateAsync({
            iban_id: ibanId,
            wallet_id: wallet?.wallet_id,
            amount: getAmountNumber(amount),
        })
        setFeeDetails(res?.data)
    }

    const confirmTransfer = async () => {
        const ibanId = selectedIban?._id || selectedIban?.id
        await executeTransfer.mutateAsync({
            iban_id: ibanId,
            wallet_id: wallet?.wallet_id,
            token: feeDetails?.token,
        })
        setCurrentStep(STEPS.DONE)
    }

    const handleContinue = async () => {
        if (!selectedIban) {
            toast.error(t("Please select a virtual IBAN first"))
            return
        }

        try {
            if (currentStep === STEPS.WALLET) {
                await previewFee()
                setCurrentStep(STEPS.REVIEW)
                return
            }

            if (currentStep === STEPS.REVIEW) {
                await confirmTransfer()
                return
            }

            if (currentStep === STEPS.DONE) {
                resetState()
                return
            }

            const { nextStep } = goNext(currentStep, machineData)
            if (nextStep) {
                setCurrentStep(nextStep)
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("Unable to process convert funds request")))
        }
    }

    const handleBack = () => {
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
                        currencyCode={selectedIban?.currency || "EUR"}
                        availableBalance={sourceAvailableBalance}
                    />
                )
            case STEPS.WALLET:
                return (
                    <div>
                        <span style={{ fontSize: "24px", color: 'black', fontWeight: 600, marginBottom: "20px" }}>{t("Choose The Wallet")}</span>
                        <div style={{ maxHeight: width < 1000 ? '70vh' : "450px", overflow: "auto" }}>
                            <PaymentStep
                                filteredWallets={filteredWallets}
                                paymentType={"wallet"}
                                setWalletState={setWallet}
                                walletState={wallet}
                                cardToWallet={true}
                            />
                        </div >
                    </div>
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        amount={amount}
                        wallet={wallet}
                        feeDetails={feeDetails}
                        iban={selectedIban}
                    />
                )
            case STEPS.DONE:
                return <DoneStep />
            default:
                return null
        }
    }

    const isDone = currentStep === STEPS.DONE
    const isProcessing = feePreview.isPending || executeTransfer.isPending
    const footerDisabled = disabled || isProcessing || !selectedIban

    const renderBody = () => (
        <div
            className={styles.modalLayout}
            style={{ flexDirection: width < 1000 ? "column" : "row" }}
        >
            {/* {width >= 1000 && ( */}
            <div className={addFundsStyles.left}>
                <div
                    style={
                        {
                            width: "100%",

                        }
                    }>
                    <div className={styles.bankHeader}>
                        <div className={styles.bankIcon}>
                            <ConvertIcon />
                        </div>
                        {
                            width > 700 ? <h2>{t("Move funds to")}
                                <br />
                                {t("InstaPay wallet")}
                            </h2> :
                                <h2>{t("Move funds to InstaPay wallet")}
                                </h2>
                        }
                    </div>
                    <div
                        className={addFundsStyles.progressEffect}
                        style={{ marginTop: "2rem" }}
                    >
                        {SIDEBAR_STEPS.map((item, index) => {
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
                        })}
                    </div>
                </div>
                {width > 700 &&
                    <div className={addFundsStyles.contactBox}>
                        <ContactBox />
                    </div>}
            </div>
            {/* )} */}

            <div
                className={styles.rightPanel}
                style={{ width: width < 1000 ? "100%" : undefined }}
            >
                <div className={styles.content}>{renderStepContent()}</div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleClose}
                    >
                        {t("Cancel")}
                    </button>
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
                            {isProcessing ? t("Processing...") : isDone ? t("Convert more") : continueLabel}
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
            </Modal >
            {/* 
            {isOpen && width < 1000 && (
                <div style={{ padding: "16px" }}>{renderBody()}</div>
            )
            } */}
        </>
    )
}

export default ConvertFundsModal
