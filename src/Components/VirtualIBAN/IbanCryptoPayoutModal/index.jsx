import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { Modal, ModalBody } from "reactstrap"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
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
import OtpVerification from "../../../Common/Component/OtpVerification"
import AddBeneficiaryFlowV2 from "../Beneficiaries/AddBeneficiaryFlowV2"
import SocketsService from "../../../Services/Socket"
import { getAmountNumber } from "../utils/amount"
import {
    useExecuteVirtualIbanCryptoPayout,
    useVirtualIbanCryptoPayoutFee,
    virtualIbanQueryKeys,
} from "../../../hooks/useVirtualIban"
import { useValidateCryptoAddress } from "../../../hooks/Payments/useCryptoPayout"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"
import useSendOtp from "../../../hooks/GeneralUse/useSendOtp"
import { useDebounce } from "../../../hooks/useDebounce/useDebounce"
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError"
import {
    filterProtocolsForAddress,
    getBeneficiaryCryptoChannels,
    getChannelAddress,
    getChannelAsset,
    getChannelProtocol,
    getInitialProtocol,
    getProtocolsForAddress,
    hasCryptoChannel,
} from "../../WalletsNew/SendCryptoModal/cryptoProtocols"
import {
    getContinueLabel,
    getDisabledState,
    goBack,
    goNext,
    isSidebarStepActive,
    isSidebarStepCompleted,
    MIN_AMOUNT,
    PAYOUT_ASSETS,
    SIDEBAR_STEPS,
    STEPS,
} from "../../../stateMachines/ibanCryptoPayout"
import RecipientStep from "./RecipientStep"
import ReviewStep from "./ReviewStep"
import StatusStep from "./StatusStep"

const QUOTE_LIFETIME_MS = 10 * 60 * 1000

const STALE_QUOTE = /expired|already been used|does not match|invalid quote/i

const MISSING_DETAILS = /missing.*(details|fields)|date of birth/i

const socketConfig = {
    url: import.meta.env.VITE_IP_DEV_API,
    transports: ["websocket", "polling", "flashsocket"],
}

const CoinsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.75" cy="6.75" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="11.25" cy="11.25" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="#F8F9FC" strokeWidth="1.2" />
        <path d="M3.75 15C3.75 12.1005 6.10051 9.75 9 9.75C11.8995 9.75 14.25 12.1005 14.25 15" stroke="#F8F9FC" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
)

const IdBadgeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2.25" width="12" height="13.5" rx="1.5" stroke="#F8F9FC" strokeWidth="1.2" />
        <circle cx="9" cy="8.25" r="2.25" stroke="#F8F9FC" strokeWidth="1.2" />
    </svg>
)

const SendIcon = ({ color = "#F8F9FC" }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M15.75 2.25L8.25 9.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.75 2.25L11.25 15.75L8.25 9.75L2.25 6.75L15.75 2.25Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    [STEPS.RECIPIENT]: () => <UserIcon />,
    [STEPS.REVIEW]: () => <IdBadgeIcon />,
}

const getQuoteExpiry = (token) => {
    let exp
    try {
        exp = JSON.parse(atob(String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))?.exp
    } catch {
        exp = null
    }
    return exp ? exp * 1000 : Date.now() + QUOTE_LIFETIME_MS
}

const getBeneficiaryId = (beneficiary) => beneficiary?._id || beneficiary?.id

const getBeneficiaryName = (beneficiary) => {
    const name = [beneficiary?.first_name, beneficiary?.last_name].filter(Boolean).join(" ")
    return name || beneficiary?.company_name || beneficiary?.legalName || beneficiary?.name || "-"
}

const getChannelTag = (channel) => String(channel?.extras?.tag || channel?.extras?.memo || channel?.tag || "")

const IbanCryptoPayoutModal = forwardRef(({ isOpen, toggle, selectedIban, availableBalance, isPage = false }, ref) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const isMobile = width <= 600
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { userDetails, beneficiaries, getUserBeneficiaries, setProfileLockTime } = useContext(UserContext)
    const { getKey, reset: resetIdempotency } = useIdempotency()

    const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms")

    const [showDrawer, setShowDrawer] = useState(false)
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT)
    const [amount, setAmount] = useState("")
    const [asset, setAsset] = useState(PAYOUT_ASSETS[0])
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null)
    const [selectedChannel, setSelectedChannel] = useState(null)
    const [protocol, setProtocol] = useState("")
    const [apiProtocols, setApiProtocols] = useState([])
    const [addressStatus, setAddressStatus] = useState("")
    const [recipientError, setRecipientError] = useState("")
    const [feeDetails, setFeeDetails] = useState(null)
    const [quoteExpiresAt, setQuoteExpiresAt] = useState(null)
    const [confirmedNetwork, setConfirmedNetwork] = useState(false)
    const [authType, setAuthType] = useState(getDefaultAuthType)
    const [otpToken, setOtpToken] = useState("")
    const [otpMethods, setOtpMethods] = useState(null)
    const [result, setResult] = useState(null)
    const [payoutStatus, setPayoutStatus] = useState("")
    const [isAddBeneficiaryOpen, setIsAddBeneficiaryOpen] = useState(false)
    const [savedBeneficiaryId, setSavedBeneficiaryId] = useState("")
    const confirmingRef = useRef(false)

    const feeQuote = useVirtualIbanCryptoPayoutFee()
    const executePayout = useExecuteVirtualIbanCryptoPayout()
    const validateAddress = useValidateCryptoAddress()

    const ibanId = selectedIban?._id || selectedIban?.id
    const ibanCurrency = selectedIban?.currency || "EUR"
    const sourceBalance = availableBalance ?? selectedIban?.balance ?? 0
    const active = isPage || isOpen

    const { sendOtp, isSendingOtp } = useSendOtp({
        onSuccess: (token, response) => {
            setOtpToken(token)
            setOtpMethods(response || null)
            if (currentStep !== STEPS.OTP && response?.otp_sent_on) setAuthType(response.otp_sent_on)
            setCurrentStep(STEPS.OTP)
        },
        onError: (error) => {
            toast.error(error?.message || t("Unable to send OTP"))
        },
    })

    useEffect(() => {
        if (active && userDetails?._id) getUserBeneficiaries?.()
    }, [active, userDetails?._id])

    useEffect(() => {
        if (userDetails?.tfa) setAuthType("authenticator")
    }, [userDetails?.tfa])

    const cryptoBeneficiaries = useMemo(
        () => (beneficiaries || []).filter((beneficiary) => hasCryptoChannel(beneficiary, asset)),
        [beneficiaries, asset]
    )

    const cryptoChannels = useMemo(() => {
        const channels = getBeneficiaryCryptoChannels(selectedBeneficiary)
        const matching = channels.filter((channel) => {
            const channelAsset = getChannelAsset(channel)
            return !channelAsset || channelAsset === asset
        })
        return matching.length ? matching : channels
    }, [selectedBeneficiary, asset])

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

    useEffect(() => {
        if (!selectedBeneficiary) return
        const stillListed = cryptoBeneficiaries.some(
            (beneficiary) => getBeneficiaryId(beneficiary) === getBeneficiaryId(selectedBeneficiary)
        )
        if (!stillListed) setSelectedBeneficiary(null)
    }, [cryptoBeneficiaries, selectedBeneficiary])

    useEffect(() => {
        setSelectedChannel(cryptoChannels[0] || null)
    }, [cryptoChannels])

    useEffect(() => {
        setApiProtocols([])
        setProtocol(getInitialProtocol(selectedChannel) || "")
    }, [selectedChannel])

    useEffect(() => {
        if (protocolOptions.length && !protocolOptions.includes(protocol)) setProtocol(protocolOptions[0])
    }, [protocolOptions, protocol])

    useEffect(() => {
        setFeeDetails(null)
        setQuoteExpiresAt(null)
        setConfirmedNetwork(false)
        setOtpToken("")
    }, [address, protocol, amount, asset, ibanId])

    useEffect(() => {
        if (!savedBeneficiaryId) return
        const saved = cryptoBeneficiaries.find((beneficiary) => getBeneficiaryId(beneficiary) === savedBeneficiaryId)
        if (!saved) return
        setRecipientError("")
        setSelectedBeneficiary(saved)
        setSavedBeneficiaryId("")
    }, [cryptoBeneficiaries, savedBeneficiaryId])

    const debouncedAddress = useDebounce(address, 500)
    const debouncedProtocol = useDebounce(protocol, 500)

    useEffect(() => {
        let cancelled = false

        if (!debouncedAddress || !debouncedProtocol) {
            setAddressStatus("")
            return undefined
        }

        setAddressStatus("checking")
        validateAddress
            .mutateAsync({ crypto_currency: asset, protocol: debouncedProtocol, address: debouncedAddress })
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
    }, [debouncedAddress, debouncedProtocol, asset])

    useEffect(() => {
        if (currentStep !== STEPS.DONE || !userDetails?._id) return undefined
        if (payoutStatus === "COMPLETED" || payoutStatus === "FAILED") return undefined

        const socketsService = new SocketsService(socketConfig, () => { })

        const handleStatus = (data) => {
            const reference = data?.reference_id || data?.data?.reference_id
            if (reference && result?.reference_id && reference !== result.reference_id) return

            const nextStatus = String(data?.status || data?.data?.status || "").toUpperCase()
            if (nextStatus) setPayoutStatus(nextStatus)

            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (ibanId) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(ibanId) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(ibanId) })
            }
        }

        socketsService.connect()
        socketsService.connectToServer(userDetails._id)
        socketsService.socket.on("virtual_iban:crypto_payout_status", handleStatus)

        return () => {
            socketsService.socket.off("virtual_iban:crypto_payout_status", handleStatus)
            socketsService.disconnect()
        }
    }, [currentStep, payoutStatus, result?.reference_id, ibanId, userDetails?._id])

    const quoteExpired = !!quoteExpiresAt && quoteExpiresAt <= Date.now()
    const disabled = getDisabledState(currentStep, {
        amount,
        availableBalance: sourceBalance,
        selectedBeneficiary,
        address,
        protocol,
        isAddressInvalid: addressStatus === "invalid",
        feeDetails,
        quoteExpired,
        confirmedNetwork,
    })

    const resetState = () => {
        setCurrentStep(STEPS.AMOUNT)
        setAmount("")
        setAsset(PAYOUT_ASSETS[0])
        setSelectedBeneficiary(null)
        setSelectedChannel(null)
        setProtocol("")
        setApiProtocols([])
        setAddressStatus("")
        setRecipientError("")
        setFeeDetails(null)
        setQuoteExpiresAt(null)
        setConfirmedNetwork(false)
        setAuthType(getDefaultAuthType())
        setOtpToken("")
        setOtpMethods(null)
        setResult(null)
        setPayoutStatus("")
        setIsAddBeneficiaryOpen(false)
        setSavedBeneficiaryId("")
        confirmingRef.current = false
        resetIdempotency()
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const showError = (error, fallback, setError) => {
        let message = ""
        handlePaymentApiError({
            error,
            setProfileLockTime,
            navigate,
            fallback: t(fallback),
            setError: (msg) => {
                message = msg || ""
                if (setError) setError(message)
                else if (message) toast.error(t(message))
            },
        })
        return message
    }

    const fetchQuote = useCallback(async () => {
        const res = await feeQuote.mutateAsync({
            iban_id: ibanId,
            beneficiary_id: getBeneficiaryId(selectedBeneficiary),
            amount: getAmountNumber(amount),
            crypto_currency: asset,
            protocol,
            address,
            tag: getChannelTag(selectedChannel),
        })
        const data = res?.data || res
        if (Array.isArray(data?.protocols)) setApiProtocols(data.protocols)
        setFeeDetails(data)
        setQuoteExpiresAt(getQuoteExpiry(data?.token))
        setConfirmedNetwork(false)
        resetIdempotency()
        return data
    }, [ibanId, selectedBeneficiary, amount, asset, protocol, address, selectedChannel])

    const refreshQuote = useCallback(async () => {
        try {
            await fetchQuote()
        } catch (error) {
            showError(error, "We couldn't refresh the quote. Please try again.")
        }
    }, [fetchQuote])

    const buildOtpPayload = () => ({
        iban_id: ibanId,
        token: feeDetails?.token,
        amount: feeDetails?.total?.value ?? getAmountNumber(amount),
    })

    const handleSendOtp = async (otpCodeType) => {
        const nextAuthType = otpCodeType || authType
        setAuthType(nextAuthType)
        await sendOtp(buildOtpPayload(), nextAuthType)
    }

    const confirmPayout = async (setVerified, type, otp, setOtpError) => {
        if (confirmingRef.current) return
        confirmingRef.current = true
        try {
            const res = await executePayout.mutateAsync({
                payload: {
                    token: otpToken,
                    otp,
                    type: type || authType,
                },
                idempotencyKey: getKey(),
                ibanId,
            })
            const data = res?.data || res
            setResult(data)
            setPayoutStatus(String(data?.status || "PROCESSING").toUpperCase())
            setVerified(true)
        } catch (error) {
            if (error?.response?.status === 409) {
                toast.info(t("This payout is already being processed."))
                return
            }
            resetIdempotency()
            const message = showError(error, "We couldn't send the payout. Please try again.", setOtpError)
            if (STALE_QUOTE.test(message)) {
                toast.error(t(message))
                setCurrentStep(STEPS.REVIEW)
                await refreshQuote()
            }
        } finally {
            confirmingRef.current = false
        }
    }

    const editBeneficiary = () => {
        if (!selectedBeneficiary) return
        handleClose()
        navigate(
            `/beneficiaries/edit${selectedBeneficiary?.beneficiary_type === "business" ? "/business" : ""}?user_id=${getBeneficiaryId(selectedBeneficiary)}&edit=true`
        )
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

        if (currentStep === STEPS.RECIPIENT) {
            setRecipientError("")
            try {
                await fetchQuote()
                setCurrentStep(STEPS.REVIEW)
            } catch (error) {
                showError(error, "We couldn't get a quote. Please try again.", (message) => {
                    setRecipientError(message)
                    toast.error(t(message))
                })
            }
            return
        }

        if (currentStep === STEPS.REVIEW) {
            await handleSendOtp()
            return
        }

        const { nextStep } = goNext(currentStep)
        if (nextStep) setCurrentStep(nextStep)
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

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.AMOUNT:
                return (
                    <AmountStep
                        amount={amount}
                        setAmount={setAmount}
                        currencyCode={ibanCurrency}
                        availableBalance={sourceBalance}
                        label={t("Amount to send")}
                        min={MIN_AMOUNT}
                        minQuickAmount={MIN_AMOUNT}
                    />
                )
            case STEPS.RECIPIENT:
                return (
                    <RecipientStep
                        asset={asset}
                        setAsset={setAsset}
                        beneficiaries={cryptoBeneficiaries}
                        selectedBeneficiary={selectedBeneficiary}
                        onSelectBeneficiary={(beneficiary) => {
                            setRecipientError("")
                            setSelectedBeneficiary(beneficiary)
                        }}
                        onAddBeneficiary={() => setIsAddBeneficiaryOpen(true)}
                        cryptoChannels={cryptoChannels}
                        selectedChannel={selectedChannel}
                        onSelectChannel={setSelectedChannel}
                        address={address}
                        protocol={protocol}
                        setProtocol={setProtocol}
                        protocolOptions={protocolOptions}
                        isProtocolLocked={!!savedProtocol}
                        addressStatus={addressStatus}
                        errorMessage={recipientError}
                        onEditBeneficiary={
                            selectedBeneficiary && (MISSING_DETAILS.test(recipientError) || addressStatus === "invalid")
                                ? editBeneficiary
                                : null
                        }
                    />
                )
            case STEPS.REVIEW:
                return (
                    <ReviewStep
                        feeDetails={feeDetails}
                        quoteExpiresAt={quoteExpiresAt}
                        iban={selectedIban}
                        beneficiaryName={getBeneficiaryName(selectedBeneficiary)}
                        address={address}
                        protocol={protocol}
                        asset={asset}
                        confirmedNetwork={confirmedNetwork}
                        setConfirmedNetwork={setConfirmedNetwork}
                        onRefreshQuote={refreshQuote}
                        isRefreshing={feeQuote.isPending}
                    />
                )
            case STEPS.OTP:
                return (
                    <OtpVerification
                        variant="card"
                        fullHeight
                        methods={otpMethods}
                        setter={setCurrentStep}
                        setterValue={STEPS.DONE}
                        hideOtp={() => { }}
                        callback={confirmPayout}
                        processing={executePayout.isPending}
                        resendHandler={handleSendOtp}
                        authType={authType}
                        setAuthType={setAuthType}
                        showBackButton
                        onBack={handleBack}
                    />
                )
            case STEPS.DONE:
                return <StatusStep result={result} status={payoutStatus} />
            default:
                return null
        }
    }

    const isDone = currentStep === STEPS.DONE
    const isOtp = currentStep === STEPS.OTP
    const isBusy = feeQuote.isPending || executePayout.isPending || isSendingOtp
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
                                <SendIcon color="#F2EEFF" />
                            </div>
                            {width > 700
                                ? <h2>{t("Send IBAN to")}<br />{t("external crypto")}</h2>
                                : <h2>{t("Send IBAN to external crypto")}</h2>}
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
                {isOtp ? null : isMobile ? (
                    <MobileFooter
                        label={primaryLabel}
                        handleBack={!isDone && handleBack}
                        handleAction={handleContinue}
                        disabled={footerDisabled}
                    />
                ) : (
                    <div className={styles.footer} style={isDone ? { justifyContent: "flex-end" } : undefined}>
                        {isDone ? (
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
            <AddBeneficiaryFlowV2
                open={isAddBeneficiaryOpen}
                handleClose={() => setIsAddBeneficiaryOpen(false)}
                onSaveSuccess={async (saved) => {
                    setIsAddBeneficiaryOpen(false)
                    setSavedBeneficiaryId(getBeneficiaryId(saved) || "")
                    await getUserBeneficiaries?.()
                }}
                fixedMethod="crypto_wallet"
            />
        </>
    )
})

IbanCryptoPayoutModal.displayName = "IbanCryptoPayoutModal"

export default IbanCryptoPayoutModal
