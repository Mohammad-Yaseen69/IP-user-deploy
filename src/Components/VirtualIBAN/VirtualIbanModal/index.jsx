import { useMemo, useState, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import axios from "axios"
import useWindowWidth from "../../../utils/useWindowWidth"
import {
    CircleCheck,
    Currency,
    Lock,
    Payment,
    Receipt,
    Wallet2,
} from "../../MyMasterCard/files"
import ConfirmationStep from "../../MyMasterCard/PaymentModal/ConfirmationStep"
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox"
import PaymentSelect from "../../MyMasterCard/PaymentModal/PaymentSelectStep"
import PaymentStep from "../../MyMasterCard/PaymentModal/PaymentStep"
import addFundsStyles from "../../MyMasterCard/styles/addFunds.module.scss"
import { UserContext } from "../../../Context/UserContext"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { CARD_TYPES } from "../../CreditInput/CreditCardTypes"
import JurisIcon from "./icons/gpsFix.svg"
import Coins from "./icons/coins.svg"
import Verification from "./icons/verification.svg"
import SealCheck from "./icons/SealCheck.svg"

import {

    buildMockFeeDetails,
    getContinueLabel,
    getDisabledState,
    getJurisdiction,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    MOCK_WALLET_STATE,
    SIDEBAR_STEPS,
    STEPS,
} from "../../../stateMachines/virtualIbanPayment"
import DoneStep from "./DoneStep"
import FeesStep from "./FeesStep"
import JurisdictionStep from "./JurisdictionStep"
import SidebarProgress from "./SidebarProgress"
import styles from "./virtualIbanModal.module.scss"
import VerificationStep from "./VerificationStep"

const SIDEBAR_ICONS = {
    [STEPS.JURISDICTION]: JurisIcon,
    [STEPS.FEES]: Coins,
    [STEPS.VERIFICATION]: Verification,
    [STEPS.PAYMENT_METHOD]: Payment,
    [STEPS.DONE]: SealCheck,
}

const ChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
        <path
            d="M8.75 11L5.25 7.5L8.75 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const ChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
        <path
            d="M5.25 11L8.75 7.5L5.25 4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const VirtualIbanModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    const { userWallets, getUserWallets, userDetails, authHeader } = useContext(UserContext)

    const [currentStep, setCurrentStep] = useState(STEPS.JURISDICTION)
    const [jurisdiction, setJurisdiction] = useState("MT")
    const [feesAccepted, setFeesAccepted] = useState(false)
    const [paymentType, setPaymentType] = useState("")
    const [walletState, setWalletState] = useState({})

    const [saveCard, setSaveCard] = useState(false)
    const [cards, setCards] = useState([])
    const [selectedSaveCard, setSelectedSaveCard] = useState({})
    const [cardDetail, setCardDetails] = useState({
        cardNumber: "",
        cardExpiry: "",
        cardCVC: "",
        cardHolderName: "",
    })
    const [cardNumberError, setCardNumberError] = useState(null)
    const [cardType, setCardType] = useState({
        type: 'placeholder',
        format: "",
        startPattern: "",
        maxCardNumberLength: 16,
        cvcLength: 3
    })

    useEffect(() => {
        getUserWallets()
    }, [])

    useEffect(() => {
        const getSavedCards = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                setCards(dec?.panList ?? [])
            } catch {
                setCards([])
            }
        }
        if (userDetails?._id) {
            getSavedCards()
        }
    }, [userDetails])

    useEffect(() => {
        const getCardTypeByValue = function getCardTypeByValue(value) {
            return CARD_TYPES.filter(function (cardType) {
                return cardType.startPattern.test(value);
            })[0];
        };
        const type = getCardTypeByValue(cardDetail.cardNumber)
        if (!type || cardDetail.cardNumber.length < type?.maxCardNumberLength) {
            setCardNumberError(t("Invalid Card Number"))
        } else {
            setCardNumberError("")
        }
        setCardType(type ?? {
            type: 'placeholder',
            format: "",
            startPattern: "",
            maxCardNumberLength: 16,
            cvcLength: 3
        })
    }, [cardDetail.cardNumber])

    const filteredWallets = useMemo(() => {
        return userWallets
            ?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active")
            ?.sort((a, b) => (b?.default === true ? 1 : -1))
            ?.map(item => ({ name: item?.currency?.code, ...item }))
    }, [userWallets])

    const jurisdictionInfo = getJurisdiction(jurisdiction)

    const feeDetails = useMemo(
        () => buildMockFeeDetails(jurisdiction, paymentType),
        [jurisdiction, paymentType]
    )

    const machineData = useMemo(
        () => ({
            jurisdiction,
            feesAccepted,
            paymentType,
            walletState,
            selectedSaveCard,
            cardDetail,
            cardNumberError,
        }),
        [jurisdiction, feesAccepted, paymentType, walletState, selectedSaveCard, cardDetail, cardNumberError]
    )

    const disabled = getDisabledState(currentStep, machineData)
    const continueLabel = getContinueLabel(currentStep, t)

    const resetState = () => {
        setCurrentStep(STEPS.JURISDICTION)
        setJurisdiction("MT")
        setFeesAccepted(false)
        setPaymentType("")
        setWalletState({})
        setSelectedSaveCard({})
        setCardDetails({
            cardNumber: "",
            cardExpiry: "",
            cardCVC: "",
            cardHolderName: "",
        })
        setCardNumberError(null)
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const handleContinue = () => {
        if (currentStep === STEPS.SUMMARY) {
            // When APIs are ready: await sendOtp() and setShowOtpModal(true) instead of advancing
            // Since we skip OTP_CONFIRMATION, we go directly to DONE
            setCurrentStep(STEPS.DONE)
            return
        }

        const { nextStep } = goNext(currentStep, machineData)
        if (nextStep) {
            if (nextStep === STEPS.SUMMARY && paymentType === "wallet" && Object.keys(walletState).length === 0) {
                setWalletState(filteredWallets?.[0] || MOCK_WALLET_STATE)
            }
            setCurrentStep(nextStep)
        } else if (currentStep === STEPS.DONE) {
            handleClose()
        }
    }

    const handleBack = () => {
        if (currentStep === STEPS.FEES) setFeesAccepted(false)
        if (currentStep === STEPS.PAYMENT_METHOD) setPaymentType("")
        if (currentStep === STEPS.PAYMENT_DETAILS) {
            setWalletState({})
            setSelectedSaveCard({})
        }
        if (currentStep === STEPS.SUMMARY && paymentType !== "paypal") setWalletState({})

        const { prevStep } = goBack(currentStep, machineData)
        if (prevStep === null) handleClose()
        else setCurrentStep(prevStep)
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.JURISDICTION:
                return (
                    <JurisdictionStep
                        jurisdiction={jurisdiction}
                        setJurisdiction={setJurisdiction}
                    />
                )
            case STEPS.FEES:
                return (
                    <FeesStep
                        jurisdiction={jurisdiction}
                        feesAccepted={feesAccepted}
                        setFeesAccepted={setFeesAccepted}
                    />
                )
            case STEPS.VERIFICATION:
                return <VerificationStep
                    jurisdiction={jurisdiction}
                    setJurisdiction={setJurisdiction}
                />
            case STEPS.PAYMENT_METHOD:
                return (
                    <PaymentSelect
                        styling={{ marginTop: "1rem" }}
                        paymentType={paymentType}
                        setPaymentType={setPaymentType}
                    />
                )
            case STEPS.PAYMENT_DETAILS:
                return (
                    <PaymentStep
                        cardDetail={cardDetail}
                        cardNumberError={cardNumberError}
                        cardType={cardType}
                        cards={cards}
                        disabledBtnS={disabled}
                        filteredWallets={filteredWallets}
                        paymentType={paymentType}
                        saveCard={saveCard}
                        setCardDetails={setCardDetails}
                        setFeeDetails={() => { }}
                        setSaveCard={setSaveCard}
                        setSelectedSaveCard={setSelectedSaveCard}
                        setStep={() => { }}
                        setWalletState={setWalletState}
                        vvcCardType="standard"
                        walletState={walletState}
                        setCards={setCards}
                        selectedSaveCard={selectedSaveCard}
                        applePay={false}
                        googlePay={false}
                        hideButtons={true}
                        marginTop="1rem"
                    />
                )
            case STEPS.SUMMARY:
                return (
                    <ConfirmationStep
                        feeDetails={feeDetails}
                        walletState={
                            paymentType === "wallet"
                                ? walletState
                                : paymentType === "paypal"
                                    ? { name: "Paypal", wallet_id: "" }
                                    : (selectedSaveCard?._id
                                        ? { name: `${selectedSaveCard.brand?.toUpperCase()} Card`, wallet_id: `•••• ${selectedSaveCard.last4}` }
                                        : { name: cardDetail.cardHolderName || "Payment Card", wallet_id: cardDetail.cardNumber ? `•••• ${cardDetail.cardNumber.slice(-4)}` : "" })
                        }
                        sendOtp={() => setCurrentStep(STEPS.DONE)}
                        setStep={() => setCurrentStep(STEPS.PAYMENT_METHOD)}
                        paymentType={paymentType}
                        cardDets={{ currency: jurisdictionInfo.currencyCode }}
                        hideButtons={true}
                    />
                )
            case STEPS.DONE:
                return (
                    <DoneStep
                        jurisdiction={jurisdiction}
                        onGoToAccount={handleClose}
                    />
                )
            default:
                return null
        }
    }

    const showFooter = currentStep !== STEPS.DONE && (width > 1000)

    const renderBody = () => (
        <div
            className={styles.modalLayout}
            style={{ flexDirection: width < 1000 ? "column" : "row" }}
        >
            {width >= 1000 && (
                <div className={addFundsStyles.left}>
                    <div>
                        <div className={styles.bankHeader}>
                            <div className={styles.bankIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M1.6875 6.75H16.3125L9 2.25L1.6875 6.75Z" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.9375 6.75V12.375" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7.3125 6.75V12.375" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.6875 6.75V12.375" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14.0625 6.75V12.375" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2.25 12.375H15.75" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1.125 14.625H16.875" stroke="#F2EEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2>{t("Open a new IBAN account")}</h2>
                        </div>
                        <div
                            className={addFundsStyles.progressEffect}
                            style={{ marginTop: "2rem" }}
                        >
                            {SIDEBAR_STEPS.map((item, index) => (
                                <SidebarProgress
                                    key={item.stepName}
                                    stepLabel={item.stepLabel}
                                    label={item.label}
                                    Icon={SIDEBAR_ICONS[item.stepName]}
                                    isActive={isSidebarStepActive(
                                        item,
                                        currentStep
                                    )}
                                    isCompleted={isSidebarStepCompleted(
                                        item,
                                        currentStep
                                    )}
                                    showBar={index < SIDEBAR_STEPS.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={addFundsStyles.contactBox}>
                        <ContactBox />
                    </div>
                </div>
            )}

            <div
                className={styles.rightPanel}
                style={{ width: width < 1000 ? "100%" : undefined }}
            >
                <div className={styles.content}>{renderStepContent()}</div>

                {showFooter && (
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleClose}
                        >
                            {t("Cancel")}
                        </button>
                        <div className={styles.footerNav}>
                            <button
                                type="button"
                                className={styles.backBtn}
                                onClick={handleBack}
                            >
                                <ChevronLeft />
                                {t("Back")}
                            </button>
                            <button
                                type="button"
                                className={styles.nextBtn}
                                disabled={disabled}
                                onClick={handleContinue}
                            >
                                {continueLabel}
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            <Modal
                isOpen={isOpen && width > 1000}
                style={{ minWidth: "900px" }}
                toggle={handleClose}
            >
                <ModalBody style={{ padding: "20px" }}>{renderBody()}</ModalBody>
            </Modal>

            {isOpen && width < 1000 && (
                <div style={{ padding: "16px" }}>{renderBody()}</div>
            )}

        </>
    )
}

export default VirtualIbanModal
