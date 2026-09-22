import { useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { Modal, ModalBody } from "reactstrap"
import { UserContext } from "../../../Context/UserContext"
import { useDebounce } from "../../../hooks/useDebounce/useDebounce"
import useSendOtp from "../../../hooks/GeneralUse/useSendOtp"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"
import { useCryptoPayout, useCryptoPayoutFee, useValidateCryptoAddress } from "../../../hooks/Payments/useCryptoPayout"
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError"
import useWindowWidth from "../../../utils/useWindowWidth"
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox"
import OTPConfirmation from "../../UserSettingsNew/OTPConfirmation"
import SidebarProgress from "../../VirtualIBAN/VirtualIbanModal/SidebarProgress"
import convertStyles from "../../VirtualIBAN/ConvertFundsModal/convertFunds.module.scss"
import withdrawStyles from "../../VirtualIBAN/WithdrawBalanceModal/withdrawBalance.module.scss"
import {
    getAmountError,
    getAmountNumber,
    getContinueLabel,
    getDisabledState,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    SIDEBAR_STEPS,
    STEPS,
} from "../../../stateMachines/cryptoPayout"
import AmountStep from "./AmountStep"
import BeneficiaryStep from "./BeneficiaryStep"
import ReviewStep from "./ReviewStep"
import DoneStep from "./DoneStep"
import AddBeneficiaryFlowV2 from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2"
import {
    filterProtocolsForAddress,
    getBeneficiaryCryptoChannels,
    getChannelAddress,
    getChannelAsset,
    getChannelProtocol,
    getInitialProtocol,
    getProtocolsForAddress,
    hasCryptoChannel,
} from "./cryptoProtocols"

const QUOTE_TTL_MS = 2 * 60 * 1000

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M15.75 2.25L8.25 9.75" stroke="#F8F9FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.75 2.25L11.25 15.75L8.25 9.75L2.25 6.75L15.75 2.25Z" stroke="#F8F9FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

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

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M3.75 15C3.75 12.1005 6.10051 9.75 9 9.75C11.8995 9.75 14.25 12.1005 14.25 15" stroke="#F8F9FC" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
)

const SealCheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V6L12 2Z" stroke="#F8F9FC" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="#F8F9FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    [STEPS.BENEFICIARY]: () => <UserIcon />,
    [STEPS.REVIEW]: () => <IdBadgeIcon />,
    [STEPS.DONE]: () => <SealCheckIcon />,
}

const getBeneficiaryName = (beneficiary) => {
    const name = [beneficiary?.first_name, beneficiary?.last_name].filter(Boolean).join(" ")
    return name || beneficiary?.company_name || beneficiary?.legalName || beneficiary?.name || "-"
}

const getBeneficiaryId = (beneficiary) => beneficiary?._id || beneficiary?.id

const QUOTE_ERROR_HINTS = [
    "quote expired",
    "quote has already been used",
    "quote is invalid",
    "token_expired",
    "invalid_token",
    "waited too long",
]

const isQuoteError = (message) => {
    const text = String(message || "").toLowerCase()
    return QUOTE_ERROR_HINTS.some((hint) => text.includes(hint))
}

const isMissingBeneficiaryDetailsError = (message) =>
    String(message || "").toLowerCase().includes("missing details required for crypto payouts")

const SendCryptoModal = ({ isOpen, toggle, wallet }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const navigate = useNavigate()
    const { userDetails, beneficiaries, getUserBeneficiaries, setProfileLockTime } = useContext(UserContext)

    const walletId = wallet?._id
    const cryptoCurrency = String(wallet?.currency?.code || "").toUpperCase()
    const availableBalance = wallet?.balance?.available ?? 0

    const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms")

    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
    const [selectedChannel, setSelectedChannel] = useState(null)
    const [protocol, setProtocol] = useState("")
    const [apiProtocols, setApiProtocols] = useState([])
    const [amount, setAmount] = useState("")
    const [feeDetails, setFeeDetails] = useState(null)
    const [quoteExpiresAt, setQuoteExpiresAt] = useState(null)
    const [isQuoteExpired, setIsQuoteExpired] = useState(false)
    const [confirmedNetwork, setConfirmedNetwork] = useState(false)
    const [addressStatus, setAddressStatus] = useState("")
    const [beneficiaryError, setBeneficiaryError] = useState("")
    const [authType, setAuthType] = useState(getDefaultAuthType)
    const [otpToken, setOtpToken] = useState("")
    const [payoutResult, setPayoutResult] = useState(null)
    const [isAddBeneficiaryOpen, setIsAddBeneficiaryOpen] = useState(false)
    const [savedBeneficiaryId, setSavedBeneficiaryId] = useState("")

    const feeMutation = useCryptoPayoutFee()
    const payoutMutation = useCryptoPayout()
    const validateAddress = useValidateCryptoAddress()
    const { getKey, reset: resetIdempotencyKey } = useIdempotency()

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token) => {
            setOtpToken(token)
            resetIdempotencyKey()
            setCurrentStep(STEPS.OTP)
        },
        onError: (error) => {
            toast.error(error?.message || t("Unable to send OTP"))
        },
    })

    const cryptoBeneficiaries = useMemo(
        () => (beneficiaries || []).filter((beneficiary) => hasCryptoChannel(beneficiary, cryptoCurrency)),
        [beneficiaries, cryptoCurrency]
    )

    const cryptoChannels = useMemo(() => {
        const channels = getBeneficiaryCryptoChannels(selectedBeneficiary)
        const matching = channels.filter((channel) => {
            const asset = getChannelAsset(channel)
            return !asset || asset === cryptoCurrency
        })
        return matching.length ? matching : channels
    }, [selectedBeneficiary, cryptoCurrency])

    const address = getChannelAddress(selectedChannel)

    const savedProtocol = useMemo(() => getChannelProtocol(selectedChannel), [selectedChannel])

    const protocolOptions = useMemo(() => {
        if (!address) return []
        if (savedProtocol) return [savedProtocol]
        if (apiProtocols.length) return filterProtocolsForAddress(apiProtocols, address)
        const fromAddress = getProtocolsForAddress(address)
        if (fromAddress.length) return fromAddress
        const initial = getInitialProtocol(selectedChannel)
        return initial ? [initial] : []
    }, [address, apiProtocols, selectedChannel, savedProtocol])

    const amountError = getAmountError(amount, availableBalance, cryptoCurrency)

    const machineData = useMemo(
        () => ({
            selectedBeneficiary,
            address,
            protocol,
            amount,
            availableBalance,
            cryptoCurrency,
            feeDetails,
            confirmedNetwork,
            isQuoteExpired,
            isAddressInvalid: addressStatus === "invalid",
        }),
        [selectedBeneficiary, address, protocol, amount, availableBalance, cryptoCurrency, feeDetails, confirmedNetwork, isQuoteExpired, addressStatus]
    )

    const isProcessing = feeMutation.isPending || isSendingOtp
    const disabled = getDisabledState(currentStep, machineData) || isProcessing
    const showFooter = currentStep !== STEPS.OTP && currentStep !== STEPS.DONE

    useEffect(() => {
        if (isOpen && userDetails?._id) getUserBeneficiaries?.()
    }, [isOpen, userDetails?._id])

    useEffect(() => {
        if (userDetails?.tfa) setAuthType("authenticator")
    }, [userDetails?.tfa])

    useEffect(() => {
        setSelectedChannel(cryptoChannels[0] || null)
    }, [cryptoChannels])

    useEffect(() => {
        setApiProtocols([])
        setProtocol(getInitialProtocol(selectedChannel) || getProtocolsForAddress(getChannelAddress(selectedChannel))[0] || "")
    }, [selectedChannel])

    useEffect(() => {
        if (protocolOptions.length && !protocolOptions.includes(protocol)) {
            setProtocol(protocolOptions[0])
        }
    }, [protocolOptions, protocol])

    useEffect(() => {
        setFeeDetails(null)
        setQuoteExpiresAt(null)
        setIsQuoteExpired(false)
        setConfirmedNetwork(false)
        setOtpToken("")
    }, [address, protocol, amount, walletId])

    const debouncedAddress = useDebounce(address, 500)
    const debouncedProtocol = useDebounce(protocol, 500)

    useEffect(() => {
        let cancelled = false

        if (!debouncedAddress || !debouncedProtocol || !cryptoCurrency) {
            setAddressStatus("")
            return undefined
        }

        setAddressStatus("checking")
        validateAddress
            .mutateAsync({
                crypto_currency: cryptoCurrency,
                protocol: debouncedProtocol,
                address: debouncedAddress,
            })
            .then((res) => {
                if (cancelled) return
                const valid = res?.data?.valid ?? res?.valid
                setAddressStatus(valid ? "valid" : "invalid")
            })
            .catch(() => {
                if (!cancelled) setAddressStatus("")
            })

        return () => {
            cancelled = true
        }
    }, [debouncedAddress, debouncedProtocol, cryptoCurrency])

    useEffect(() => {
        if (!savedBeneficiaryId) return

        const saved = cryptoBeneficiaries.find((beneficiary) => getBeneficiaryId(beneficiary) === savedBeneficiaryId)
        if (!saved) return

        setBeneficiaryError("")
        setSelectedBeneficiary(saved)
        setSavedBeneficiaryId("")
    }, [cryptoBeneficiaries, savedBeneficiaryId])

    useEffect(() => {
        if (!quoteExpiresAt) return undefined

        const remaining = quoteExpiresAt - Date.now()
        if (remaining <= 0) {
            setIsQuoteExpired(true)
            return undefined
        }

        const timer = setTimeout(() => setIsQuoteExpired(true), remaining)
        return () => clearTimeout(timer)
    }, [quoteExpiresAt])

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setSelectedBeneficiary(null)
        setSelectedChannel(null)
        setProtocol("")
        setApiProtocols([])
        setAmount("")
        setFeeDetails(null)
        setQuoteExpiresAt(null)
        setIsQuoteExpired(false)
        setConfirmedNetwork(false)
        setAddressStatus("")
        setBeneficiaryError("")
        setAuthType(getDefaultAuthType())
        setOtpToken("")
        setPayoutResult(null)
        setIsAddBeneficiaryOpen(false)
        setSavedBeneficiaryId("")
        resetIdempotencyKey()
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const handleBeneficiarySaved = async (savedBeneficiary) => {
        setIsAddBeneficiaryOpen(false)
        setSavedBeneficiaryId(getBeneficiaryId(savedBeneficiary) || "")
        await getUserBeneficiaries?.()
    }

    const buildFeePayload = () => ({
        wallet_id: walletId,
        beneficiary_id: getBeneficiaryId(selectedBeneficiary),
        amount: getAmountNumber(amount),
        crypto_currency: cryptoCurrency,
        protocol,
        address,
    })

    const buildPayoutPayload = () => ({
        wallet_id: walletId,
        token: feeDetails?.token,
        address,
        amount: getAmountNumber(amount),
    })

    const requestQuote = async () => {
        setBeneficiaryError("")

        const res = await feeMutation.mutateAsync(buildFeePayload())
        const data = res?.data || res

        if (Array.isArray(data?.protocols)) setApiProtocols(data.protocols)

        setFeeDetails(data || null)
        setQuoteExpiresAt(Date.now() + QUOTE_TTL_MS)
        setIsQuoteExpired(false)
        setConfirmedNetwork(false)

        return data
    }

    const handleQuoteError = (error, { onDetails } = {}) => {
        handlePaymentApiError({
            error,
            navigate,
            setProfileLockTime,
            setError: (message) => {
                if (isQuoteError(message)) {
                    setIsQuoteExpired(true)
                    return
                }
                if (onDetails) onDetails(message)
                else toast.error(message)
            },
        })
    }

    const handleGetQuote = async () => {
        try {
            await requestQuote()
            setCurrentStep(STEPS.REVIEW)
        } catch (error) {
            handleQuoteError(error, {
                onDetails: (message) => {
                    setBeneficiaryError(message)
                    toast.error(message)
                },
            })
        }
    }

    const handleRefreshQuote = async () => {
        try {
            await requestQuote()
        } catch (error) {
            handleQuoteError(error)
        }
    }

    const handleSendOtp = async (otpCodeType) => {
        const nextAuthType = otpCodeType || authType
        setAuthType(nextAuthType)
        await sendOtp(buildPayoutPayload(), nextAuthType)
    }

    const confirmPayout = async (setVerified, type, otp, setOtpError) => {
        try {
            const res = await payoutMutation.mutateAsync({
                token: otpToken,
                otp,
                type: type || authType,
                idempotencyKey: getKey(),
            })

            setPayoutResult(res?.data || res || null)
            setVerified(true)
        } catch (error) {
            resetIdempotencyKey()
            handlePaymentApiError({
                error,
                navigate,
                setProfileLockTime,
                setError: (message) => {
                    if (isQuoteError(message)) {
                        setIsQuoteExpired(true)
                        setCurrentStep(STEPS.REVIEW)
                        toast.error(message)
                        return
                    }
                    setOtpError(message)
                },
            })
        }
    }

    const handleContinue = async () => {
        if (currentStep === STEPS.BENEFICIARY) {
            await handleGetQuote()
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
                        amountError={amountError}
                        availableBalance={availableBalance}
                        cryptoCurrency={cryptoCurrency}
                    />
                )
            case STEPS.BENEFICIARY:
                return (
                    <BeneficiaryStep
                        beneficiaries={cryptoBeneficiaries}
                        selectedBeneficiary={selectedBeneficiary}
                        onSelectBeneficiary={(beneficiary) => {
                            setBeneficiaryError("")
                            setSelectedBeneficiary(beneficiary)
                        }}
                        cryptoChannels={cryptoChannels}
                        selectedChannel={selectedChannel}
                        onSelectChannel={setSelectedChannel}
                        protocolOptions={protocolOptions}
                        protocol={protocol}
                        setProtocol={setProtocol}
                        isProtocolLocked={!!savedProtocol}
                        addressStatus={addressStatus}
                        cryptoCurrency={cryptoCurrency}
                        errorMessage={beneficiaryError}
                        onEditBeneficiary={
                            (isMissingBeneficiaryDetailsError(beneficiaryError) || addressStatus === "invalid") && selectedBeneficiary
                                ? () => {
                                    handleClose()
                                    navigate(
                                        `/beneficiaries/edit${selectedBeneficiary?.beneficiary_type === "business" ? "/business" : ""}?user_id=${getBeneficiaryId(selectedBeneficiary)}&edit=true`
                                    )
                                }
                                : null
                        }
                        onAddBeneficiary={() => setIsAddBeneficiaryOpen(true)}
                    />
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        feeDetails={feeDetails}
                        address={address}
                        protocol={protocol}
                        cryptoCurrency={cryptoCurrency}
                        beneficiaryName={getBeneficiaryName(selectedBeneficiary)}
                        confirmedNetwork={confirmedNetwork}
                        setConfirmedNetwork={setConfirmedNetwork}
                        quoteExpiresAt={quoteExpiresAt}
                        isQuoteExpired={isQuoteExpired || !feeDetails?.token}
                        onRefreshQuote={handleRefreshQuote}
                        isRefreshing={feeMutation.isPending}
                    />
                )
            case STEPS.OTP:
                return (
                    <OTPConfirmation
                        fullHeight
                        setter={setCurrentStep}
                        setterValue={STEPS.DONE}
                        hideOtp={() => { }}
                        callback={confirmPayout}
                        processing={payoutMutation.isPending}
                        resendHandler={handleSendOtp}
                        authType={authType}
                        setAuthType={setAuthType}
                        showBackButton
                        onBack={handleBack}
                    />
                )
            case STEPS.DONE:
                return (
                    <DoneStep
                        payoutResult={payoutResult}
                        cryptoCurrency={cryptoCurrency}
                        protocol={protocol}
                        address={address}
                        beneficiaryName={getBeneficiaryName(selectedBeneficiary)}
                        onSendAgain={resetState}
                        onClose={handleClose}
                    />
                )
            default:
                return null
        }
    }

    return (
        <Modal isOpen={isOpen} style={{ minWidth: width > 1000 ? "940px" : "0%" }} toggle={handleClose}>
            <ModalBody style={{ padding: "20px" }}>
                <div className={convertStyles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
                    <aside style={{ flex: 1 }}>
                        <div>
                            <div className={convertStyles.bankHeader}>
                                <div className={convertStyles.bankIcon}>
                                    <SendIcon />
                                </div>
                                <h2>
                                    {t("Send Crypto")} {cryptoCurrency ? `(${cryptoCurrency})` : ""}
                                </h2>
                            </div>

                            <div className={withdrawStyles.progressEffect} style={{ marginTop: "2rem" }}>
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

                        {width > 700 && (
                            <div style={{ marginTop: "2rem" }}>
                                <ContactBox />
                            </div>
                        )}
                    </aside>

                    <section className={convertStyles.rightPanel} style={{ width: width < 1000 ? "100%" : undefined }}>
                        <div className={convertStyles.content}>{renderStepContent()}</div>

                        {showFooter && (
                            <div className={convertStyles.footer}>
                                <button type="button" className={convertStyles.cancelBtn} onClick={handleClose}>
                                    {t("Cancel")}
                                </button>
                                <div className={convertStyles.footerNav}>
                                    <button type="button" className={convertStyles.backBtn} onClick={handleBack}>
                                        <ChevronLeft />
                                        {t("Back")}
                                    </button>
                                    <button
                                        type="button"
                                        className={convertStyles.nextBtn}
                                        disabled={disabled}
                                        onClick={handleContinue}
                                    >
                                        {isProcessing ? t("Processing...") : getContinueLabel(currentStep, t)}
                                        <ChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </ModalBody>

            <AddBeneficiaryFlowV2
                open={isAddBeneficiaryOpen}
                handleClose={() => setIsAddBeneficiaryOpen(false)}
                onSaveSuccess={handleBeneficiarySaved}
            />
        </Modal>
    )
}

export default SendCryptoModal
