import { useMemo, useState, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import axios from "axios"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
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
import addFundsStyles from "../WithdrawBalanceModal/withdrawBalance.module.scss"
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
    getSidebarSteps,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    JURISDICTIONS,
    MOCK_WALLET_STATE,
    STEPS,
} from "../../../stateMachines/virtualIbanPayment"
import DoneStep from "./DoneStep"
import FeesStep from "./FeesStep"
import JurisdictionStep from "./JurisdictionStep"
import PendingStep from "./PendingStep"
import SidebarProgress from "./SidebarProgress"
import styles from "./virtualIbanModal.module.scss"
import VerificationStep from "./VerificationStep"
import useSendOtp from "../../../hooks/GeneralUse/useSendOtp"

import { getVirtualIbanCountry, normalizeVirtualIban } from "../utils/virtualIban"
import SocketsService from "../../../Services/Socket"
import usePlainFx from "../../../hooks/Payments/usePlainFx"
import InstaPayLoader from "../../Loader"
import { useCreateVirtualIban, useVirtualIbans, virtualIbanQueryKeys } from "../../../hooks/useVirtualIban"
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError"
import { useNavigate } from "react-router"
import OTPConfirmation from "../../../Common/Component/OtpVerification"
import {
    getActivationFeeConfig,
    getActiveInstaWallets,
    getWalletAvailableBalance,
    getWalletCurrencyCode,
    normalizeWalletState,
    parseAmount,
} from "../utils/virtualIbanPreflight"

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

const VirtualIbanModal = ({
    isOpen,
    toggle,
    onCreated,
    resumeProcessingData,
    resumeProcessingLoading = false,
    activationFeeConfig,
    skipPaymentStep = false,
    preselectedWallet,
}) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const queryClient = useQueryClient()

    const { userWallets, getUserWallets, userDetails, authHeader, setProfileLockTime } = useContext(UserContext)

    const [currentStep, setCurrentStep] = useState(STEPS.JURISDICTION)
    const [jurisdiction, setJurisdiction] = useState("")
    const [feesAccepted, setFeesAccepted] = useState(false)
    const [paymentType, setPaymentType] = useState("")
    const [walletState, setWalletState] = useState({})
    const [showOtp, setShowOtp] = useState(false)
    const [otpToken, setOtpToken] = useState("")
    const [codeType, setCodeType] = useState("sms")
    const [createdIban, setCreatedIban] = useState(null)
    const [pendingTransactionId, setPendingTransactionId] = useState("")
    const [pendingTransactionRef, setPendingTransactionRef] = useState("")
    const [isResumedPending, setIsResumedPending] = useState(false)
    const navigate = useNavigate()
    const [walletFeeFxMap, setWalletFeeFxMap] = useState({})
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

    const createVirtualIban = useCreateVirtualIban()
    const { data: existingIbans = [], isLoading: existingIbansLoading } = useVirtualIbans()
    const activationFee = useMemo(() => getActivationFeeConfig(activationFeeConfig), [activationFeeConfig])

    const {
        getExchangeRate: getPlainExchangeRate,
        isPending: isActivationFxPending,
    } = usePlainFx()

    const [activationFeeFx, setActivationFeeFx] = useState({
        amount: activationFee.amount,
        currency: activationFee.currency,
        exchangeRate: 1,
        error: "",
    })

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token) => {
            setOtpToken(token)
            setShowOtp(true)
        },
        onError: (err) => {
            console.log(err, "error")
            toast.error(err?.message || t("Unable to send OTP"))
        },
    })

    const isKycApproved = useMemo(() => {
        if (userDetails?.account_type === "individual") {
            return userDetails?.user?.kyc_status === "approved"
        }

        return userDetails?.company?.kyb_status === "approved"
    }, [userDetails])
    const isBusinessAccount = userDetails?.account_type !== "individual"

    const socketConfig = useMemo(() => ({
        url: import.meta.env.VITE_IP_DEV_API,
        transports: ["websocket", "polling", "flashsocket"],
    }), [])

    useEffect(() => {
        if (resumeProcessingData === true) {
            setCreatedIban(null)
            setJurisdiction("MT")
            setPendingTransactionId("")
            setPendingTransactionRef("")
            setIsResumedPending(true)
            setCurrentStep(STEPS.PENDING)
        }
    }, [resumeProcessingData])

    useEffect(() => {
        if (currentStep !== STEPS.PENDING || !userDetails?._id) return

        const socketsService = new SocketsService(socketConfig, () => { })

        const handleVirtualIbanCreated = (data) => {
            if (
                !isResumedPending &&
                pendingTransactionId &&
                data?.transaction_id &&
                data.transaction_id !== pendingTransactionId
            ) {
                return
            }

            const iban = normalizeVirtualIban(data?.iban)

            setCreatedIban(iban)
            setJurisdiction(data?.jurisdiction || data?.country || getVirtualIbanCountry(iban) || jurisdiction || "MT")
            setPendingTransactionId(data?.transaction_id || pendingTransactionId)
            setPendingTransactionRef(data?.transaction_ref || pendingTransactionRef)
            queryClient.setQueryData(virtualIbanQueryKeys.processingStatus(), false)
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (iban?._id) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(iban._id) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(iban._id) })
            }
            toast.success(t("Your virtual IBAN is ready"))
            setCurrentStep(STEPS.DONE)
        }

        socketsService.connect()
        socketsService.connectToServer(userDetails._id)
        socketsService.socket.on("virtual_iban:created", handleVirtualIbanCreated)

        return () => {
            socketsService.socket.off("virtual_iban:created", handleVirtualIbanCreated)
            socketsService.disconnect()
        }
    }, [
        currentStep,
        isResumedPending,
        jurisdiction,
        pendingTransactionId,
        pendingTransactionRef,
        queryClient,
        socketConfig,
        t,
        userDetails?._id,
    ])

    useEffect(() => {
        if (userDetails?.tfa) {
            setCodeType("authenticator")
        }
    }, [userDetails])

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
        return getActiveInstaWallets(userWallets)
            ?.map(item => normalizeWalletState(item))
    }, [userWallets])

    const preselectedWalletState = useMemo(() => normalizeWalletState(preselectedWallet), [preselectedWallet])

    const jurisdictionAvailability = useMemo(() => {
        const existingCountries = new Set(
            (Array.isArray(existingIbans) ? existingIbans : [])
                .map(getVirtualIbanCountry)
                .filter(Boolean)
        )

        return Object.values(JURISDICTIONS).reduce((acc, option) => {
            if (option.id === "GB") {
                acc[option.id] = { disabledReason: "Coming Soon" }
                return acc
            }

            if (existingCountries.has(option.id)) {
                acc[option.id] = { disabledReason: `${option.title} already exists` }
                return acc
            }

            acc[option.id] = { disabledReason: "" }
            return acc
        }, {})
    }, [existingIbans])

    useEffect(() => {
        if (jurisdiction && jurisdictionAvailability?.[jurisdiction]?.disabledReason) {
            setJurisdiction("")
        }
    }, [jurisdiction, jurisdictionAvailability])

    const jurisdictionInfo = getJurisdiction(jurisdiction)
    const selectedWalletCurrency = getWalletCurrencyCode(walletState)
    const shouldSkipPaymentStep = skipPaymentStep

    useEffect(() => {
        if (!shouldSkipPaymentStep) return

        setPaymentType("wallet")
        setWalletState(preselectedWalletState)
    }, [preselectedWalletState, shouldSkipPaymentStep])

    useEffect(() => {
        if (isKycApproved && currentStep === STEPS.VERIFICATION) {
            setCurrentStep(shouldSkipPaymentStep ? STEPS.SUMMARY : STEPS.PAYMENT_METHOD)
        }
    }, [currentStep, isKycApproved, shouldSkipPaymentStep])

    useEffect(() => {
        if (shouldSkipPaymentStep || paymentType !== "wallet" || !selectedWalletCurrency) {
            setActivationFeeFx({
                amount: activationFee.amount,
                currency: activationFee.currency,
                exchangeRate: 1,
                error: "",
            })
            return
        }

        let isActive = true

        const convertActivationFee = async () => {
            if (selectedWalletCurrency === activationFee.currency) {
                setActivationFeeFx({
                    amount: activationFee.amount,
                    currency: activationFee.currency,
                    exchangeRate: 1,
                    error: "",
                })
                return
            }

            setActivationFeeFx((prev) => ({
                ...prev,
                amount: 0,
                currency: selectedWalletCurrency,
                exchangeRate: null,
                error: "",
            }))

            try {
                const convertedAmount = parseAmount(
                    await getPlainExchangeRate(
                        activationFee.currency,
                        selectedWalletCurrency,
                        activationFee.amount
                    )
                )

                if (!convertedAmount) {
                    throw new Error("Invalid FX amount")
                }

                if (isActive) {
                    setActivationFeeFx({
                        amount: convertedAmount,
                        currency: selectedWalletCurrency,
                        exchangeRate: convertedAmount / activationFee.amount,
                        error: "",
                    })
                }
            } catch {
                if (isActive) {
                    setActivationFeeFx({
                        amount: 0,
                        currency: selectedWalletCurrency,
                        exchangeRate: null,
                        error: t("Unable to fetch the exchange rate for this wallet"),
                    })
                }
            }
        }

        convertActivationFee()

        return () => {
            isActive = false
        }
    }, [activationFee.amount, activationFee.currency, getPlainExchangeRate, paymentType, selectedWalletCurrency, shouldSkipPaymentStep, t])

    const feeDetails = useMemo(
        () => buildMockFeeDetails(jurisdiction, paymentType, {
            amount: shouldSkipPaymentStep ? activationFee.amount : activationFeeFx.amount ?? activationFee.amount,
            currency: shouldSkipPaymentStep ? activationFee.currency : activationFeeFx.currency || activationFee.currency,
            baseAmount: activationFee.amount,
            baseCurrency: activationFee.currency,
            exchangeRate: activationFeeFx.exchangeRate,
        }),
        [activationFee.amount, activationFee.currency, activationFeeFx, jurisdiction, paymentType, shouldSkipPaymentStep]
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
            kycApproved: isKycApproved,
            skipPaymentStep: shouldSkipPaymentStep,
        }),
        [jurisdiction, feesAccepted, paymentType, walletState, selectedSaveCard, cardDetail, cardNumberError, isKycApproved, shouldSkipPaymentStep]
    )
    useEffect(() => {
        if (shouldSkipPaymentStep || paymentType !== "wallet") return
        if (!filteredWallets?.length) return

        let isActive = true

        const uniqueCurrencies = Array.from(
            new Set(filteredWallets.map((w) => getWalletCurrencyCode(w)).filter(Boolean))
        )

        const computeAll = async () => {
            const entries = await Promise.all(
                uniqueCurrencies.map(async (currencyCode) => {
                    if (currencyCode === activationFee.currency) {
                        return [currencyCode, activationFee.amount]
                    }
                    try {
                        const converted = parseAmount(
                            await getPlainExchangeRate(activationFee.currency, currencyCode, activationFee.amount)
                        )
                        return [currencyCode, converted || null]
                    } catch {
                        return [currencyCode, null]
                    }
                })
            )

            if (isActive) {
                setWalletFeeFxMap(Object.fromEntries(entries))
            }
        }

        computeAll()

        return () => {
            isActive = false
        }
    }, [activationFee.amount, activationFee.currency, filteredWallets, getPlainExchangeRate, paymentType, shouldSkipPaymentStep])
    const sidebarSteps = useMemo(
        () => getSidebarSteps(machineData),
        [machineData]
    )

    const isCreating = isSendingOtp || createVirtualIban.isPending
    const isActivationFxBlocked =
        !shouldSkipPaymentStep &&
        paymentType === "wallet" &&
        !!selectedWalletCurrency &&
        selectedWalletCurrency !== activationFee.currency &&
        (
            isActivationFxPending ||
            activationFeeFx.currency !== selectedWalletCurrency ||
            !!activationFeeFx.error ||
            !activationFeeFx.amount
        )
    const isActivationBalanceInsufficient =
        !shouldSkipPaymentStep &&
        paymentType === "wallet" &&
        !!(walletState?.wallet_id || walletState?._id) &&
        !!activationFeeFx.amount &&
        getWalletAvailableBalance(walletState) < parseAmount(activationFeeFx.amount)
    const disabled =
        getDisabledState(currentStep, machineData) ||
        isCreating ||
        isActivationFxBlocked ||
        isActivationBalanceInsufficient ||
        (shouldSkipPaymentStep && currentStep === STEPS.SUMMARY && !(walletState?.wallet_id || walletState?._id))
    const continueLabel = shouldSkipPaymentStep && currentStep === STEPS.SUMMARY ? t("Continue") : getContinueLabel(currentStep, t)

    const resetState = () => {
        setCurrentStep(STEPS.JURISDICTION)
        setJurisdiction("")
        setFeesAccepted(false)
        setPaymentType("")
        setWalletState({})
        setShowOtp(false)
        setOtpToken("")
        setCodeType("sms")
        setCreatedIban(null)
        setPendingTransactionId("")
        setPendingTransactionRef("")
        setIsResumedPending(false)
        setActivationFeeFx({
            amount: activationFee.amount,
            currency: activationFee.currency,
            exchangeRate: 1,
            error: "",
        })
        setSelectedSaveCard({})
        setCardDetails({
            cardNumber: "",
            cardExpiry: "",
            cardCVC: "",
            cardHolderName: "",
        })
        setCardNumberError(null)
    }

    const refreshCreatedIban = () => {
        queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
        if (createdIban?._id) {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(createdIban._id) })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(createdIban._id) })
        }
        onCreated?.(createdIban)
    }

    const handleClose = () => {
        if (currentStep === STEPS.PENDING) {
            return
        }

        if (currentStep === STEPS.DONE && createdIban) {
            queryClient.setQueryData(virtualIbanQueryKeys.processingStatus(), false)
            refreshCreatedIban()
        }
        resetState()
        toggle?.()
    }

    const handleCreatedClose = () => {
        handleClose()
    }

    const getCreatePayload = (wallet = walletState) => ({
        wallet_id: wallet?.wallet_id || wallet?._id,
        currencyCode: jurisdictionInfo.currencyCode,
        name: userDetails?.full_name || userDetails?.name || userDetails?.username || "Virtual IBAN",
        activation_fee: {
            amount: parseAmount(feeDetails?.totalFee),
            currency: feeDetails?.currency,
            base_amount: activationFee.amount,
            base_currency: activationFee.currency,
            exchange_rate: activationFeeFx.exchangeRate,
        },
    })
    const handleSendOtp = async (otpCodeType = codeType) => {
        const selectedWallet = (walletState?.wallet_id || walletState?._id)
            ? walletState
            : preselectedWalletState

        if (!(selectedWallet?.wallet_id || selectedWallet?._id)) {
            toast.error(t("Please select an InstaPay wallet to pay the activation fee"))
            return
        }

        if (shouldSkipPaymentStep && !(walletState?.wallet_id || walletState?._id)) {
            setWalletState(selectedWallet)
        }

        if (!shouldSkipPaymentStep && isActivationFxBlocked) {
            toast.error(activationFeeFx.error || t("Please wait while we convert the activation fee"))
            return
        }

        if (!shouldSkipPaymentStep && isActivationBalanceInsufficient) {
            toast.error(t("Insufficient wallet balance for the activation fee"))
            return
        }

        try {
            setCodeType(otpCodeType || codeType)
            await sendOtp(getCreatePayload(selectedWallet), otpCodeType || codeType)
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setError: (e) => toast.error(e),
                setProfileLockTime: setProfileLockTime
            })
        }
    }
    const verifyOtp = async (setter, type = "", otp, setOtpError) => {
        try {
            const res = await createVirtualIban.mutateAsync({
                token: otpToken,
                otp,
                type: type || codeType,
            })
            const transactionId = res?.transaction_id || res?.data?.transaction_id || res?.data?.transaction?.id
            const transactionRef = res?.transaction_ref || res?.data?.transaction_ref || res?.data?.transaction?.reference_id
            setPendingTransactionId(transactionId || "")
            setPendingTransactionRef(transactionRef || "")
            setCreatedIban(null)
            setter?.(true)
            setShowOtp(false)
            setCurrentStep(STEPS.PENDING)
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setError: (e) => {
                    setOtpError?.(e)
                    toast.error(e)
                },
                setProfileLockTime: setProfileLockTime
            })
        }
    }

    const handleContinue = async () => {
        if (currentStep === STEPS.JURISDICTION && jurisdictionAvailability?.[jurisdiction]?.disabledReason) {
            toast.error(t(jurisdictionAvailability[jurisdiction].disabledReason))
            setJurisdiction("")
            return
        }

        if (currentStep === STEPS.JURISDICTION && isBusinessAccount && !isKycApproved) {
            resetState()
            toggle?.()
            navigate("/settings?tab=verification")
            return
        }

        if (currentStep === STEPS.SUMMARY) {
            await handleSendOtp()
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
        if (currentStep === STEPS.SUMMARY && paymentType !== "paypal" && !shouldSkipPaymentStep) setWalletState({})

        const { prevStep } = goBack(currentStep, machineData)
        if (prevStep === null) handleClose()
        else setCurrentStep(prevStep)
    }

    const renderStepContent = () => {
        if (resumeProcessingLoading || existingIbansLoading) {
            return (
                <div className={styles.loaderWrap}>
                    <InstaPayLoader fallback transparent fullHeight />
                </div>
            )
        }

        switch (currentStep) {
            case STEPS.JURISDICTION:
                return (
                    <JurisdictionStep
                        jurisdiction={jurisdiction}
                        setJurisdiction={setJurisdiction}
                        availability={jurisdictionAvailability}
                    />
                )
            case STEPS.FEES:
                return (
                    <FeesStep
                        jurisdiction={jurisdiction}
                        feesAccepted={feesAccepted}
                        monthlyFeeCurr={"USD"}
                        setFeesAccepted={setFeesAccepted}
                        activationFeeAmount={activationFee.amount}
                        activationFeeCurrency={activationFee.currency}
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
                        isInIban
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
                        amount={activationFee.amount}
                        setFeeDetails={() => { }}
                        setSaveCard={setSaveCard}
                        setSelectedSaveCard={setSelectedSaveCard}
                        setStep={() => { }}
                        setWalletState={setWalletState}
                        walletState={walletState}
                        setCards={setCards}
                        selectedSaveCard={selectedSaveCard}
                        applePay={false}
                        googlePay={false}
                        hideButtons={true}
                        getWalletIsSufficient={(wallet) => {
                            const walletCurrency = getWalletCurrencyCode(wallet)
                            const feeAmount = walletCurrency === activationFee.currency
                                ? activationFee.amount
                                : walletFeeFxMap[walletCurrency]

                            if (feeAmount == null) return false

                            return getWalletAvailableBalance(wallet) >= parseAmount(feeAmount)
                        }}
                        marginTop="1rem"
                    />
                )
            case STEPS.SUMMARY:
                return (
                    <ConfirmationStep
                        feeDetails={feeDetails}
                        walletState={
                            paymentType === "wallet"
                                ? ((walletState?.wallet_id || walletState?._id) ? walletState : preselectedWalletState)
                                : paymentType === "paypal"
                                    ? { name: "Paypal", wallet_id: "" }
                                    : (selectedSaveCard?._id
                                        ? { name: `${selectedSaveCard.brand?.toUpperCase()} Card`, wallet_id: `•••• ${selectedSaveCard.last4}` }
                                        : { name: cardDetail.cardHolderName || "Payment Card", wallet_id: cardDetail.cardNumber ? `•••• ${cardDetail.cardNumber.slice(-4)}` : "" })
                        }
                        sendOtp={handleSendOtp}
                        setStep={() => setCurrentStep(shouldSkipPaymentStep ? STEPS.FEES : STEPS.PAYMENT_METHOD)}
                        paymentType={paymentType}
                        cardDets={{ currency: activationFee.currency }}
                        feeLabel="IBAN activation fee"
                        hideButtons={true}
                    />
                )
            case STEPS.PENDING:
                return (
                    <PendingStep
                        transactionRef={pendingTransactionRef}
                    />
                )
            case STEPS.DONE:
                return (
                    <DoneStep
                        jurisdiction={jurisdiction}
                        iban={createdIban}
                        onGoToAccount={handleCreatedClose}
                    />
                )
            default:
                return null
        }
    }

    const showFooter = ![STEPS.PENDING, STEPS.DONE].includes(currentStep)

    const renderBody = () => (
        <div
            className={styles.modalLayout}
            style={{ flexDirection: width < 1000 ? "column" : "row" }}
        >
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
                        {sidebarSteps.map((item, index) => (
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
                                    currentStep,
                                    machineData
                                )}
                                showBar={index < sidebarSteps.length - 1}
                            />
                        ))}
                    </div>
                </div>
                {
                    width > 700 && <div className={addFundsStyles.contactBox}>
                        <ContactBox />
                    </div>
                }
            </div>

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
                                {isActivationFxPending && isActivationFxBlocked
                                    ? t("Converting...")
                                    : isCreating
                                        ? t("Processing...")
                                        : continueLabel}
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
                isOpen={isOpen}
                style={{
                    minWidth: width > 1000 ? "900px" : "0px",
                }} toggle={handleClose}
                backdrop={currentStep === STEPS.PENDING ? "static" : true}
                keyboard={currentStep !== STEPS.PENDING}
            >
                <ModalBody style={{ padding: "20px" }}>{renderBody()}</ModalBody>
            </Modal>

            <Modal isOpen={showOtp} toggle={() => setShowOtp(false)} centered>
                <ModalBody>
                    <OTPConfirmation
                        variant="card"
                        setter={() => { }}
                        setterValue={true}
                        hideOtp={() => setShowOtp(false)}
                        callback={verifyOtp}
                        processing={createVirtualIban.isPending}
                        resendHandler={handleSendOtp}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                </ModalBody>
            </Modal>

        </>
    )
}

export default VirtualIbanModal
