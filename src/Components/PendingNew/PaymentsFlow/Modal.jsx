import { Modal, ModalBody } from 'reactstrap'
import styles from "./Modal.module.css"
import StepFour from '../../PaymentsNewer/InternationalFlow/StepFour'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, HelpCircle, Info, X } from 'react-feather'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WalletsComponent from '../../PaymentsNewer/InternationalFlow/WalletsComponent'
import CreditCard from '../../PaymentsNewer/InternationalFlow/CreditCard'
import OtpConfirmation from '../../../Common/Component/OtpVerification'
import Receipt from '../../PaymentsNewer/InternationalFlow/Receipt'
import StepFive from '../../PaymentsNewer/WalletToWalletFlow/StepFive'
import InstaPayLoader from '../../Loader'
import FeesComponent from '../../PaymentsNewer/InternationalFlow/FeesComponent'
import { UserContext } from '../../../Context/UserContext'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { LimitsErrorMessage } from '../../../utils/Functions/paymentLimits'
import recent from "../../PaymentsNewer/Mobile/files/recent.svg"
import int_styles from "../../PaymentsNewer/Mobile/styles/International.module.css"

import paym_styles from "../../PaymentsNewer/InternationalFlow/styles/index.module.css"
import MobileWalletServices from '../../PaymentsNewer/InternationalFlow/MobileWalletServices'
import { createShambeToken } from '../../../Helper/CreateToken'
import NotFoundModal from '../../NotFound/NotFoundModal'
import TrustpaymentPage from '../../AddFunds/WalletFund/CreditTransaction'
import { apiErrorMessage } from '../../PaymentsNewer/InternationalFlow'
import useTopupLimitCheck from '../../../hooks/Payments/useTopupLimitCheck'
import GeneralNoticeModal from '../../PaymentsNewer/GeneralNoticeModal'
import PlaidBankTransfer from '../../AddFunds/WalletFundsFlow/PlaidBankTransfer'
import { useQueryClient } from '@tanstack/react-query'
import { useIdempotency } from '../../../hooks/Payments/useIdempotency'

const headings = ["Select Payment Type", "Review Payment"]

const PaymentsFlowModal = ({ isOpen, toggle, data, dataHandler, item }) => {
    const { t } = useTranslation()
    const { limitStatus, clearStatus } = useTopupLimitCheck(item?.currency?.code, +String(data?.amount)?.replaceAll(",", ""), data?.payment_type?.value)
    const { userDetails, authHeader, setProfileLockTime, verifyToken } = useContext(UserContext)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { getKey, reset } = useIdempotency()

    const disabledButton = useMemo(() => {
        switch (data.step) {
            case 1:
                if (data.payment_type?.value === "wallet") {
                    return !data.wallet?._id
                } else {
                    return !data.payment_type?.value
                }
            case 2:
                if (data.payment_type?.value === "card") {
                    const [contentMonth, contentYear] = data.expiry.split("/").map(Number);
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth() + 1;
                    const currentYear = currentDate.getFullYear() % 100;

                    const isValidExpiry = contentYear > currentYear ||
                        (contentYear === currentYear && contentMonth > currentMonth);
                    return !data.selectedSavedCard?._id && (!data.cardNumber || !data.expiry || !isValidExpiry || !data.cvc || data.cvc?.length < 3 || !data.cardHolderName)
                }
                else {
                    return !data.exchange_rate?.exchange_rate
                };
            default:
                return false;
        }
    }, [data])

    const handleBackClick = () => {
        reset()
        switch (data.step) {
            case 1:
                if (data.payment_type?.value === "wallet" && data.wallet?._id) {
                    dataHandler("wallet", {})
                    dataHandler("payment_type", {})
                }
                else if (data.payment_type?.value === "mobile_wallet") {
                    dataHandler("wallet", {})
                    dataHandler("payment_type", {})
                }
                else {
                    toggle()
                }
                break;
            case 2:
                if (data.payment_type?.value === "card" && data.show_receipt) {
                    dataHandler("show_receipt", false)
                    dataHandler("show_cards", true)

                } else {
                    dataHandler("show_receipt", false)
                    dataHandler("show_cards", false)
                    dataHandler("step", data.step - 1)
                }
                break;
            default:
                break;
        }
    }

    const sendOtp = async (codeType = "") => {
        dataHandler("loading", true)
        try {
            const payload = {
                data: {
                    request_id: item.reference_id,
                    account_id: userDetails._id,
                    sender_wallet_id: data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id,
                    purpose: "xyz",
                    payment_type: "payment_request",
                    "token": data.payment_type?.value === "paypal" || data?.payment_type?.value === 'mobile_wallet' ? data.exchange_rate?.token : ""
                },
                type: codeType || data.codeType
            }
            const encrypted = encryptData(payload)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            // console.log(dec)
            dataHandler("otpMethods", dec)
            if (!codeType) dataHandler("codeType", dec?.otp_sent_on || "sms")
            dataHandler("show_otp", true)
            dataHandler("payment_token", dec?.token)
        } catch (error) {
            const err = decryptData(error?.response?.data?.data)
            toast.error(err.message ?? "We cannot process your request at the moment, please try again later.")
        }
        finally {
            dataHandler("loading", false)
        }
    }
    const [showCardModal, setShowCardModal] = useState(false)
    const initiateCardPayment = async (otp) => {
        dataHandler("loading", true)
        try {
            let payload;
            if (data.selectedSavedCard?._id) {
                payload = {
                    wallet_id: data.currency?._id,
                    type: data.codeType,
                    amount: data.exchange_rate?.total * 100,
                    payment_type: "card",
                    rates_token: data.exchange_rate?.token,
                    w2w_data: {
                        type: "payment_request",
                        body: {
                            otp: otp,
                            token: data.payment_token
                        }
                    }
                }

                data.selectedSavedCard?._id ? payload.panData = { pan: data.selectedSavedCard?._id } : payload.panData = { is_card_save: data.saveCard }
            } else {
                payload = {
                    se_shambey: createShambeToken(data),
                    wallet_id: data?.currency?._id,
                    amount: data.exchange_rate?.total * 100,
                    payment_type: "card",
                    type: data.codeType,
                    is_card_save: false,
                    rates_token: data.exchange_rate?.token,
                    w2w_data: {
                        type: "payment_request",
                        body: {
                            otp: otp,
                            token: data.payment_token
                        },
                    }
                }
            }
            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiat-w2w${data.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
                { data: enc },
                { headers: { ...authHeader, "idempotency-key": getKey() } }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("cardTransactionDetails", dec)
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            if (decrypted?.message === "invalid_card_details") {
                setShowCardModal(true)
            }
            else {
                console.log(decrypted)
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                const error2 = apiErrorMessage(decrypted?.message)

                if (error2) {
                    dataHandler("otp_error", t(error2))
                }
                else if (error) {
                    dataHandler("otp_error", error)
                } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    navigate("/login")
                } else {
                    dataHandler("otp_error", decrypted?.message ?? "You have entered wrong OTP.")
                }
            }
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const initiatePaypalPayment = async (otp) => {
        dataHandler("loading", true)
        try {
            const payload = {
                token: data.payment_token,
                otp: otp,
                type: data.codeType,
            }
            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-w2w-payment`,
                { data: enc },
                { headers: { ...authHeader, "idempotency-key": getKey() } }
            )
            const dec = decryptData(res.data.data)
            window.location.href = dec?.url
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            dataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            if (error) {
                dataHandler("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const acceptRequest = async (otp) => {
        dataHandler("loading", true)
        try {
            const formdata = new FormData()
            formdata.append("token", data.payment_token)
            formdata.append("otp", otp)
            formdata.append("type", data.codeType)

            const url = data.payment_type?.value === "mobile_wallet" ? "/api/collection/wallet-to-wallet" : "/api/wallet/accept-payment-request"

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}${url}`, formdata, {
                headers: { ...authHeader, "idempotency-key": getKey() }
            })

            const dec = decryptData(res.data.data)
            dataHandler("transaction_details", dec)
            dataHandler("verified", true)
            await queryClient.invalidateQueries({ queryKey: ['receivedPaymentRequests', userDetails?._id] })
            await queryClient.invalidateQueries({ queryKey: ['sentPaymentRequests', userDetails?._id] })

        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            const error2 = apiErrorMessage(decrypted?.message)

            if (error) {
                dataHandler("otp_error", error)
            } else if (error2) {
                dataHandler("otp_error", error2)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            } else {
                dataHandler("otp_error", decrypted?.message ?? "You have entered wrong OTP.")
            }
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const handleClick = () => {
        switch (data.step) {
            case 1:
                if (data.payment_type?.value === "wallet") {
                    dataHandler("step", data.step + 1)
                    dataHandler("show_receipt", true)
                }
                if (data.payment_type?.value === "mobile_wallet") {
                    dataHandler("step", data.step + 1)
                    dataHandler("show_receipt", true)
                }
                if (data.payment_type?.value === "paypal") {
                    dataHandler("step", data.step + 1)
                    dataHandler("show_receipt", true)
                }
                if (data.payment_type?.value === "card") {
                    dataHandler("show_cards", true)
                    dataHandler("step", data.step + 1)
                }
                if (data?.payment_type?.value === "bank_transfer") {
                    dataHandler("show_receipt", true)
                    dataHandler("step", data.step + 1)
                }
                break;
            case 2:
                if (data.show_cards) {
                    dataHandler("show_cards", false)
                    dataHandler("show_receipt", true)
                } else {
                    sendOtp()
                }
                break;
            default:
                break;
        }
    }

    return (
        <>
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => {
                        setShowCardModal(false)
                        dataHandler("show_otp", false)
                    }}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    title="Accept Payment Request Failed"
                    reEnter={_ => {
                        dataHandler("show_cards", true)
                        dataHandler("step", 2)
                    }}
                />
            }
            {
                data.cardTransactionDetails?.intlToken || data.cardTransactionDetails?.w2w_data
                    ?
                    <TrustpaymentPage
                        amount={""}
                        card_cvc={data.cvc}
                        card_expiry={data.expiry}
                        card_number={data.cardNumber}
                        currency={data.currency_wallet?.currency?.code}
                        transaction={data.cardTransactionDetails}
                        paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                        tokenUrl={(t) => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                    />
                    :
                    <></>
            }
            {
                !limitStatus.status &&
                <GeneralNoticeModal
                    isOpen={!limitStatus.status}
                    toggle={() => {
                        dataHandler("payment_type", {})
                        clearStatus()
                    }}
                    message={limitStatus.message}
                />
            }
            {
                window.innerWidth > 1000
                    ?
                    <Modal isOpen={isOpen} style={{ width: "96vw", maxWidth: "1200px" }} contentClassName={styles.content}>
                        <ModalBody style={{ position: "relative" }} className={styles.body}>
                            <button style={{
                                all: "unset",
                                cursor: "pointer",
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                zIndex: 9999,
                            }} onClick={toggle}>
                                <X color="black" />
                            </button>
                            {
                                data.verified
                                    ?
                                    <Receipt
                                        data={data}
                                        backHandler={() => {
                                            verifyToken(true)
                                            toggle()
                                        }}
                                        showBack={true}
                                        isFullWidth={true}
                                    />
                                    :
                                    <>
                                        <div className={styles.left}>
                                            <h1>{t("Payment Request")}</h1>
                                            <h2>{t(headings[data.step - 1])}</h2>

                                            {
                                                ((data.step === 1 && data.wallet?._id) || (data.step === 2 && data.payment_type?.value === "card" ? true : false))
                                                    &&
                                                    data.loading
                                                    ?
                                                    <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                                                        <InstaPayLoader />
                                                    </div>
                                                    :
                                                    (data.payment_type?.value === "wallet" ? data.wallet?._id : true)
                                                        ?
                                                        <>
                                                            <FeesComponent
                                                                data={data}
                                                                plaidValues
                                                            />
                                                            {
                                                                data.payment_type?.value === "paypal" && !data?.exchange_rate?.paypal?.paypal_currency_supported
                                                                    ?
                                                                    <>
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                alignItems: "flex-start",
                                                                                gap: ".7rem",
                                                                                padding: "12px",
                                                                                borderRadius: "6px",
                                                                                background: "rgba(255, 218, 68, 0.24)",
                                                                                marginTop: "1rem"
                                                                            }}
                                                                        >
                                                                            <Info
                                                                                color="#BE9A08"
                                                                                size={20}
                                                                            />
                                                                            <span style={{
                                                                                color: '#BE9A08',
                                                                                fontFamily: 'Manrope',
                                                                                fontSize: ".7rem",
                                                                                fontStyle: 'normal',
                                                                                fontWeight: 700,
                                                                                lineHeight: 1.3,
                                                                                letterSpacing: '-0.28px'
                                                                            }}>
                                                                                <strong>{data?.exchange_rate?.paypal?.fee?.currency}</strong> {t("is not supported by Paypal,")} <strong>{t("USD")}</strong> {t("will be used as the default currency.")}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: ".9rem",
                                                                            padding: ".8rem",
                                                                            background: "#fff",
                                                                            borderRadius: "6px",
                                                                            boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
                                                                        }}>
                                                                            <div style={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "1rem",
                                                                                justifyContent: "space-between"
                                                                            }}>
                                                                                <span style={{
                                                                                    color: '#8A8A8A',
                                                                                    fontFamily: 'Manrope',
                                                                                    fontSize: ".7rem",
                                                                                    fontStyle: 'normal',
                                                                                    fontWeight: 600,
                                                                                    lineHeight: 1.5,
                                                                                    letterSpacing: '-0.14px'
                                                                                }}>{t("Exchange Rate")}</span>
                                                                                <strong
                                                                                    style={{
                                                                                        color: '#000',
                                                                                        fontFamily: 'Manrope',
                                                                                        fontSize: ".7rem",
                                                                                        fontStyle: 'normal',
                                                                                        lineHeight: 1.5,
                                                                                        letterSpacing: '-0.14px'
                                                                                    }}>1.00 {data?.exchange_rate?.paypal?.fee?.currency} = {Number(data?.exchange_rate?.paypal?.paypal_rate?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{t("USD")}</strong>
                                                                            </div>
                                                                            <div style={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "1rem",
                                                                                justifyContent: "space-between"
                                                                            }}>
                                                                                <span style={{
                                                                                    color: '#8A8A8A',
                                                                                    fontFamily: 'Manrope',
                                                                                    fontSize: ".7rem",
                                                                                    fontStyle: 'normal',
                                                                                    fontWeight: 600,
                                                                                    lineHeight: 1.5,
                                                                                    letterSpacing: '-0.14px'
                                                                                }}>{t("Amount in USD")}</span>
                                                                                <strong style={{
                                                                                    color: '#000',
                                                                                    fontFamily: 'Manrope',
                                                                                    fontSize: "1.2rem",
                                                                                    fontStyle: 'normal',
                                                                                    fontWeight: 700,
                                                                                    lineHeight: 1.7,
                                                                                    letterSpacing: '-0.8px'
                                                                                }}>{Number(data?.exchange_rate?.paypal?.paypal_converted?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{t("USD")}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                    :
                                                                    ""
                                                            }
                                                        </>
                                                        :
                                                        ""
                                            }
                                        </div>
                                        <div className={styles.right}>
                                            {
                                                data.step === 1
                                                &&
                                                <StepFour
                                                    customStyles={{
                                                        maxHeight: "540px",
                                                    }}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    loading={data.loading}
                                                />
                                            }
                                            {
                                                data.step === 2 && data.show_cards
                                                    ?
                                                    <CreditCard
                                                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                        tokenUrl={(t) => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    ""
                                            }
                                            {
                                                data.step === 2 && data.show_receipt
                                                    ?
                                                    (
                                                        data?.payment_type?.value === "bank_transfer" ?
                                                            <PlaidBankTransfer
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                                endpoint="/api/plaid/initiate-w2w-payment"
                                                                type="wallet_to_wallet"
                                                                initiatePayload={() => {
                                                                    return {
                                                                        request_id: item.reference_id,
                                                                        account_id: userDetails._id,
                                                                        sender_wallet_id: data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id,
                                                                        purpose: "xyz",
                                                                        payment_type: "payment_request",
                                                                        "token": data.exchange_rate?.token || ""
                                                                    }
                                                                }}
                                                                handleBackClick={() => {
                                                                    dataHandler("step", 1)
                                                                    dataHandler("show_cards", false)
                                                                }}
                                                            />
                                                            :
                                                            <StepFive
                                                                showMid={false}
                                                                sending_currency={item?.currency?.code}
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                            />
                                                    )
                                                    :
                                                    ""
                                            }
                                            {
                                                data.show_otp
                                                &&
                                                <OtpConfirmation
                                                    variant="modal"
                                                    callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : acceptRequest}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    isLoading={data.loading}
                                                    isOpen={data.show_otp}
                                                    toggle={() => {
                                                        reset()
                                                        dataHandler("show_otp", false)
                                                    }}
                                                    resendHandler={sendOtp}
                                                    methods={data.otpMethods}
                                                    error={data.otp_error}
                                                    resetIdempotency={reset}

                                                />
                                            }
                                            {((data.payment_type?.value !== "bank" && data?.payment_type?.value !== "bank_transfer") || data.step < 2) &&
                                                <div className={styles.bottom}>
                                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                        <HelpCircle size={16} />
                                                        {t("Trouble Sending Money")}
                                                    </Link>
                                                    <div className={styles?.buttons}>
                                                        <button className={styles.transparent} disabled={data.loading} onClick={handleBackClick}>{t("Back")}</button>
                                                        <button disabled={disabledButton || data.loading || data.exchange_rate_error} onClick={handleClick}>
                                                            {
                                                                // userDetails?.user?.kyc_status === "approved"
                                                                //     ?
                                                                //     (
                                                                data.step === 2 && data.show_receipt && data.payment_type?.value !== "bank_transfer"
                                                                    ?
                                                                    t("Confirm")
                                                                    :
                                                                    t("Next")
                                                                // )
                                                                // :
                                                                // t("Identify verification required")
                                                            }
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </>
                            }
                            {
                                data.payment_type?.value === "wallet" && data.step === 1
                                    ?
                                    <WalletsComponent
                                        data={data}
                                        dataHandler={dataHandler}
                                    />
                                    :
                                    ""
                            }
                            {
                                data.step === 1 && data.payment_type?.sub_name
                                    ?
                                    <MobileWalletServices
                                        loading={data.loading}
                                        data={data}
                                        dataHandler={dataHandler}
                                    />
                                    : ""
                            }
                        </ModalBody>
                    </Modal>
                    :
                    <div className={styles.payment_flow_mobile}>
                        <div className={int_styles.container}>
                            {/* <div className={int_styles.top}>
                                <button className={int_styles.back_btn} onClick={toggle}>
                                    <ChevronLeft />
                                </button>
                                <h5>{t("")}</h5>
                                <div>
                                    <img src={recent} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                                </div>
                            </div> */}
                            <button style={{
                                all: "unset",
                                cursor: "pointer",
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                zIndex: 9999,
                            }} onClick={toggle}>
                                <X color="black" />
                            </button>

                            <div className={paym_styles.mobile} style={{ marginTop: 0 }}>
                                <div className={paym_styles.m_top}>
                                    <h1>{t("Payment Request")}</h1>
                                    <h2>{t(headings[data.step - 1])}</h2>
                                </div>
                            </div>
                            <div className={paym_styles.flow}>

                                <div className={paym_styles.flow_com} style={{ minHeight: "50vh" }}>
                                    {
                                        data.step === 1 && (data.payment_type?.value === "wallet" || data.payment_type?.sub_name)
                                            ?
                                            (
                                                data.payment_type?.value === "wallet"
                                                    ?
                                                    <WalletsComponent
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    data.payment_type?.sub_name
                                                        ?
                                                        <MobileWalletServices
                                                            loading={data.loading}
                                                            data={data}
                                                            dataHandler={dataHandler}
                                                        />
                                                        : ""
                                            )
                                            :
                                            <>
                                                {
                                                    data.step === 1
                                                    &&
                                                    <StepFour
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                        loading={data.loading}
                                                    />
                                                }
                                                {
                                                    data.step === 2 && data.show_cards
                                                        ?
                                                        <CreditCard
                                                            url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                            tokenUrl={(t) => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                            data={data}
                                                            dataHandler={dataHandler}
                                                        />
                                                        :
                                                        ""
                                                }
                                                {
                                                    data.step === 2 && data.show_receipt
                                                        ?
                                                        (
                                                            data?.payment_type?.value === "bank_transfer" ?
                                                                <PlaidBankTransfer
                                                                    data={data}
                                                                    dataHandler={dataHandler}
                                                                    endpoint="/api/plaid/initiate-w2w-payment"
                                                                    type="wallet_to_wallet"
                                                                    initiatePayload={() => {
                                                                        return {
                                                                            request_id: item.reference_id,
                                                                            account_id: userDetails._id,
                                                                            sender_wallet_id: data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id,
                                                                            purpose: "xyz",
                                                                            payment_type: "payment_request",
                                                                            "token": data.exchange_rate?.token || ""
                                                                        }
                                                                    }}
                                                                />
                                                                :
                                                                <StepFive
                                                                    showMid={false}
                                                                    sending_currency={item?.currency?.code}
                                                                    data={data}
                                                                    dataHandler={dataHandler}
                                                                />
                                                        )
                                                        :
                                                        ""
                                                }
                                                {
                                                    data.show_otp
                                                    &&
                                                    <OtpConfirmation
                                                        variant="modal"
                                                        callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : acceptRequest}
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                        isLoading={data.loading}
                                                        isOpen={data.show_otp}
                                                        toggle={() => {
                                                            dataHandler("show_otp", false)
                                                        }}
                                                        resendHandler={sendOtp}
                                                        methods={data.otpMethods}
                                                        error={data.otp_error}
                                                        resetIdempotency={reset}
                                                    />
                                                }
                                            </>
                                    }
                                </div>
                                {((data.payment_type?.value !== "bank" && data?.payment_type?.value !== "bank_transfer") || data.step < 2) &&
                                    <div className={paym_styles.bottom} style={{ flexDirection: "column-reverse", margin: "2rem 0", gap: "1.5rem" }}>
                                        <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                            <HelpCircle size={16} />
                                            {t("Trouble Sending Money")}
                                        </Link>
                                        <div className={paym_styles?.buttons}>
                                            <button disabled={data.loading} onClick={handleBackClick}>
                                                <ChevronLeft />
                                            </button>
                                            <button disabled={disabledButton || data.loading || data.exchange_rate_error} className={paym_styles.full} onClick={handleClick}>
                                                {
                                                    // userDetails?.user?.kyc_status === "approved"
                                                    //     ?
                                                    //     (
                                                    data.step === 2 && data.show_receipt && data.payment_type?.value !== "bank_transfer"
                                                        ?
                                                        t("Confirm")
                                                        :
                                                        t("Next")
                                                    // )
                                                    // :
                                                    // t("Identify verification required")
                                                }
                                            </button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
            }
        </>
    );
}

export default PaymentsFlowModal