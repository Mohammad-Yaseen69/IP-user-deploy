import axios from "axios";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, Info } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context/UserContext";
import { formatCurrency } from "../../../Helper/AmountFormat";
import { createShambeToken } from "../../../Helper/CreateToken";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { getDecimalPointIndex } from "../../../Helper/getDecimalIndex";
import useTopupLimitCheck from "../../../hooks/Payments/useTopupLimitCheck";
import errors from "../../AddFunds/TrustPaymentErrors.json";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import PlaidBankTransfer from "../../AddFunds/WalletFundsFlow/PlaidBankTransfer";
import InstaPayLoader from "../../Loader";
import NotFoundModal from "../../NotFound/NotFoundModal";
import ShippingDetails from "../../ReceiptInvoices/InvoicePaymentQr/ShippingDetails";
import SendActionCard from "../Common/SendActionCard";
import w2w from "../files/w2w.png";
import wallet_ic from "../files/wallet.svg";
import GeneralNoticeModal from "../GeneralNoticeModal";
import { apiErrorMessage } from "../InternationalFlow";
import CreditCard from "../InternationalFlow/CreditCard";
import ErrorModal from "../InternationalFlow/ErrorModal";
import FeesComponent from "../InternationalFlow/FeesComponent";
import MobileWalletServices from "../InternationalFlow/MobileWalletServices";
import OtpConfirmation from "../../../Common/Component/OtpVerification";
import Receipt from "../InternationalFlow/Receipt";
import StepFour from "../InternationalFlow/StepFour";
import { currencies } from "../InternationalFlow/StepOne";
import StepThree from "../InternationalFlow/StepThree";
import styles from "../InternationalFlow/styles/index.module.css";
import WalletsComponent from "../InternationalFlow/WalletsComponent";
import { LimitsErrorMessage } from "../OTPConfirmation";
import Recursive from "../RecursivePayment";
import SchedulePayment from "../SchedulePayment";
import PaymentType from "./PaymentType";
import RecentTransactions from "./RecentTransactions";
import StepFive from "./StepFive";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";



const initialState = {
    loading: false,
    step: 1,
    formatted_amount: 1.00,
    amount: 1.00,
    new_amoount: 0.00,
    recipient_amount: 0,
    currency: {},
    currency_wallet: {},
    beneficiary: {},
    beneficiary_wallet: {},
    reason: "",
    comment: "",
    files: [],
    payment_type: {},
    payment_duration: {
        name: "Instant Payment",
        value: "instant",
    },
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    codeType: "sms",
    exchange_rate: {},
    exchange_rate_error: "",
    error: "",
    showOtpModal: false,
    otpError: "",
    transaction_details: null,
    wallet: {},
    show_payment_type: false,
    otp_token: "",
    showCard: false,
    mobile_wallet_merchant: "",
    mobile_wallet_channels: [],
    mobile_wallet_services: [],
    mobile_wallet_channel: {},
    mobile_wallet_service: {},
    timezone: "",
    first_time: true,
    limitReached: false,
    ratesError: false,
    reCallApi: "",
    fromNavigation: false,
    isFromInvoice: false,
    showShippingAddress: false,
    shippingDetails: {
        houseNo: "",
        street: "",
        city: "",
        state: "",
        country: {
            iso: null,
            name: null
        },
        zipCode: "",
    },
    showRecentMobile: false,
    isBulkPayment: false,
    bulkPaymentRecipients: []
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        case "CLEAR_STEP_TWO_DATA":
            return {
                ...state,
                beneficiary: {},
                beneficiary_wallet: {},
                amount: 1.00,
                recipient_amount: 0.00,
                exchange_rate: {},
                exchange_rate_error: "",
                currency: {},
                currency_wallet: {},
            };
        case "RESET":
            return initialState
        default:
            return state;
    }
}

const WalletToWalletFlow = ({ sendPaymentType, setStep, setSendPaymentType, showRecent, setShowRecent }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader, setProfileLockTime, userWallets } = useContext(UserContext)
    const [data, dispatch] = useReducer(reducer, initialState)
    const { limitStatus, clearStatus } = useTopupLimitCheck(data?.currency?.currency?.code, +String(data?.amount)?.replaceAll(",", ""), data?.payment_type?.value)
    const { getKey, reset } = useIdempotency()
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };
    const [leftSideContent, setLeftSideContent] = useState([
        "Choose the beneficiary!",
        "Enter the amount",
        "Add Payment Purpose and Reference",
        "Select Payment Type",
        "Review transfer"
    ])

    const resetStates = () => {
        dispatch({ type: "RESET" })
    }
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)


    const payment_type = queryParams.get("payment_type")
    const currency = queryParams.get("currency")
    const amount = queryParams.get("amount")
    const invoiceId = queryParams.get("invoiceId")
    const planId = queryParams.get('planId')
    const subscriptionId = queryParams.get('subscriptionId')
    const isShipping = queryParams.get("isShipping")
    const phone = queryParams.get("phone")
    useEffect(() => {
        if (!userDetails) return

        dataHandler("codeType", userDetails.tfa ? "authenticator" : userDetails.email_verification ? "email" : userDetails.whatsapp_verification ? "whatsapp" : "sms")
        dataHandler("timezone", userDetails.timezone)
    }, [userDetails])


    useEffect(() => {
        if (data.wallet?._id) {
            if (data?.wallet?._id === data?.currency?._id) return;
            // dataHandler("currency", data.wallet)
        } else {
            if (userWallets?.length > 0) {
                const def = userWallets?.[0]?.wallet_type === "insta" && !userWallets?.[0]?.blocked && !userWallets?.[0]?.admin_blocked && userWallets?.[0]?.status?.toLowerCase() === "active"
                    ?
                    userWallets?.[0]
                    :
                    userWallets?.find(item => item?.default)
                const wallet = { ...def, ...currencies.find(item => item.currency_code === def?.currency?.code) }
                dataHandler("currency", wallet)
                dataHandler("currency_wallet", wallet)
            }
        }
    }, [data.wallet, userWallets])

    const isShippingValid = useMemo(() => {
        if (!data.showShippingAddress) return true
        const s = data.shippingDetails || {}
        return Boolean(
            s?.houseNo && s?.street && s?.city && s?.state && s?.country?.iso && s?.zipCode
        )
    }, [data.showShippingAddress, data.shippingDetails, data])

    const disabledButton = useMemo(() => {
        switch (data.step) {
            case 1:
                if (data.isBulkPayment) {
                    return !data.bulkPaymentRecipients?.length
                }
                return !data.beneficiary_wallet?._id
            case 2:
                return !data?.amount || !data.currency?._id || !data.exchange_rate?.exchange_rate || data.exchange_rate_error
            case 3:
                return !data.reason
            case 4:
                return !data.payment_type?.name || data.limitReached || (data.payment_type?.value === "wallet" ? !data.wallet?._id || !isShippingValid : false) || data?.payment_duration?.value === "subscription" ? !data.payment_duration?.recStartDate || (!data.payment_duration?.cycles && !data.payment_duration?.unlimited) : (data?.payment_duration?.value === "schedule" ? !data.payment_duration?.scheduleDate || !data.payment_duration?.scheduleTime : false) || !isShippingValid
            case 5:
                if (data.payment_type?.value === "card") {
                    const [contentMonth, contentYear] = data.expiry.split("/").map(Number);
                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth() + 1;
                    const currentYear = currentDate.getFullYear() % 100;

                    const isValidExpiry = contentYear > currentYear ||
                        (contentYear === currentYear && contentMonth > currentMonth);
                    return !data.selectedSavedCard?._id && (!data.cardNumber || !data.expiry || !isValidExpiry || !data.cvc || data.cvc?.length < 3 || !data.cardHolderName)
                }
                return false
            default:
                return false;
        }
    }, [data])

    const getMobileWalletChannels = async () => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("c", dec?.data?.services ?? [])
        } catch {
            // dataHandler("error", "Something went wrong while getting mobile wallet channels.")
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const getMobileWalletServices = async (service_name = data.payment_type?.sub_name) => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("mobile_wallet_services", dec?.data?.payers ?? [])
        }
        finally {
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        if (userDetails?.country_iso_code) {
            getMobileWalletChannels()
                .then(() => getMobileWalletServices("wallet"))
        }
    }, [userDetails])

    useEffect(() => {
        if (data.payment_type?.sub_name) {
            getMobileWalletServices()
        }
    }, [data.payment_type])

    const generatePayload = (codeType) => {
        let payload = {};
        if (data.payment_duration?.value === "instant") {
            payload = {
                data: {
                    "receiver_wallet_id": data.beneficiary_wallet?.wallet_id,
                    "sender_wallet_id": data.payment_type?.value !== "wallet" ? data.currency?._id : data?.wallet?._id,
                    "purpose": data.reason,
                    "amount": data.payment_type?.value !== "wallet" ? +String(data.amount)?.replaceAll(",", "") : +data?.new_amoount > 0 ? +data?.new_amoount : +String(data.amount)?.replaceAll(",", ""),
                    "type": data.payment_duration?.value,
                    "payment_type": payment_type ?? "wallet_to_wallet",
                    'description': data.comment,
                    "token": data.exchange_rate?.token || "",
                    // preserved_amount=${Number(String(data.recipient_amount)?.replaceAll(",",""))}
                    "preserved_amount": Number(String(data.recipient_amount)?.replaceAll(",", "")),
                },
                type: codeType || data.codeType
            }
        }
        if (data.payment_duration?.value === "subscription") {
            const date = new Date(data.payment_duration?.recStartDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replaceAll("/", "-")
            payload = {
                data: {
                    "receiver_wallet_id": data.beneficiary_wallet?.wallet_id,
                    "sender_wallet_id": data.payment_type?.value !== "wallet" ? data.currency?._id : data?.wallet?._id,
                    "purpose": data.reason,
                    "amount": data.payment_type?.value !== "wallet" ? +String(data.amount)?.replaceAll(",", "") : +data?.new_amoount > 0 ? +data?.new_amoount : +String(data.amount)?.replaceAll(",", ""),
                    'description': data.comment,
                    "cycles": data.payment_duration?.unlimited ? "unlimited" : data.payment_duration?.cycles,
                    "date": date,
                    "timezone": data?.timezone,
                    "token": data.exchange_rate?.token || "",
                    "preserved_amount": Number(String(data.recipient_amount)?.replaceAll(",", ""))
                },
                type: codeType || data.codeType
            }
        }
        if (data.payment_duration?.value === "schedule") {
            const date = new Date(data.payment_duration?.scheduleDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replaceAll("/", "-")
            payload = {
                data: {
                    "receiver_wallet_id": data.beneficiary_wallet?.wallet_id,
                    "sender_wallet_id": data.payment_type?.value !== "wallet" ? data.currency?._id : data?.wallet?._id,
                    "purpose": data.reason,
                    "amount": data.payment_type?.value !== "wallet" ? +String(data.amount)?.replaceAll(",", "") : +data?.new_amoount > 0 ? +data?.new_amoount : +String(data.amount)?.replaceAll(",", ""),
                    'description': data.comment,
                    "time": data.payment_duration?.scheduleTime,
                    "date": date,
                    "timezone": data?.timezone,
                    "token": data.exchange_rate?.token || "",
                    "preserved_amount": Number(String(data.recipient_amount)?.replaceAll(",", ""))
                },
                type: codeType || data.codeType
            }
        }


        if (invoiceId) {
            payload.data.invoice_id = invoiceId
            payload.data.shippingDetails = {
                ...data.shippingDetails,
                country: data.shippingDetails.country.name
            }
            payload.data.purpose = "OTHERS"
        }

        if (planId) {
            payload.data.plan_id = planId
        }

        if (subscriptionId && planId) {
            payload.data.subscription_id = subscriptionId
            payload.data.isSubscription = true
            payload.data.plan_id = planId
        }

        return payload
    }

    const sendOtp = async (codeType = "") => {
        reset()
        dataHandler("loading", true)
        try {
            const resolvedCodeType = codeType || data.codeType
            const payload = generatePayload(resolvedCodeType)
            const encrypted = encryptData(payload)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            // console.log(dec?.otp_sent_on, "dec?.otp_sent_on ")
            if (dec?.otp_sent_on || dec?.available_methods) {
                dataHandler("otpMethods", dec)
                if (!data.showOtpModal) {
                    dataHandler("codeType", dec?.otp_sent_on || "sms")
                }
            }
            dataHandler("showOtpModal", true)
            dataHandler("otp_token", dec?.token)
        } catch (error) {
            console.log(error)
            const decrypted = decryptData(error.response?.data?.data)
            dataHandler("error", decrypted?.message ?? "Something went wrong while sending the OTP!")
        } finally {
            dataHandler("loading", false)
        }
    }


    const verifyOtp = async (otp) => {
        dataHandler("loading", true)
        try {
            const payload = new FormData()
            Array.from(data.files).forEach((image) => {
                payload.append("files", image);
            });
            payload.append("type", data.codeType)
            payload.append("otp", otp)
            payload.append("token", data.otp_token)

            console.log(data.new_amoount)
            const url = data.payment_type?.value === "mobile_wallet" ? "/api/collection/wallet-to-wallet" : `/api/wallet/${data.payment_duration?.value === "instant" ? "insta-wallet-to-wallet" : data.payment_duration?.value === "subscription" ? "subscribe-payment-w2w" : "schedule-payment-w2w"}`
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}${url}`,
                payload,
                {
                    headers: { ...authHeader, "Idempotency-Key": getKey() }
                }
            )

            const dec = decryptData(res.data.data)
            dataHandler("transaction_details", dec?.data ?? dec?.subscribtionDetails)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            const error2 = apiErrorMessage(decrypted?.message)

            if (error2) {
                dataHandler("otpError", error2)
            }
            else if (error) {
                dataHandler("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            } else {
                dataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            }
        } finally {
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
                    payment_type: data.payment_type?.value ?? "card",
                    rates_token: data.exchange_rate?.token,
                    w2w_data: {
                        type: "instant",
                        body: {
                            otp: otp,
                            token: data.otp_token
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
                        type: "instant",
                        body: {
                            otp: otp,
                            token: data.otp_token
                        },
                    }
                }
            }
            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiat-w2w${data.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
                { data: enc },
                { headers: { ...authHeader, "Idempotency-Key": getKey() } }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("cardTransactionDetails", dec)
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            if (decrypted?.message === "invalid_card_details") {
                setShowCardModal(true)
            }
            else {
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                const error2 = apiErrorMessage(decrypted?.message)

                console.log(error, error2)
                if (error2) {
                    dataHandler("otpError", t(error2))
                }
                else if (error) {
                    dataHandler("otpError", error)
                } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    navigate("/login")
                } else {
                    dataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
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
                token: data.otp_token,
                otp: otp,
                type: data.codeType,
            }
            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-w2w-payment`,
                { data: enc },
                {
                    headers: {
                        ...authHeader,
                        "Idempotency-Key": getKey()
                    },
                }

            )
            const dec = decryptData(res.data.data)
            window.location.href = dec?.url
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            const error2 = apiErrorMessage(decrypted?.message)
            if (error2) {
                dataHandler("otpError", error2)
            }
            else if (error) {
                dataHandler("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            } else {
                dataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
            }
        }
        finally {
            dataHandler("loading", false)
        }
    }

    // const getTopupFees = async () => {
    //     dataHandler("loading", true)
    //     try {
    //         const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-tbc-fee/${data.currency_wallet?._id}/${data.amount?.toString()?.split(".")?.[0]?.replaceAll(",", "")}`, {
    //             headers: authHeader
    //         })
    //         const dec = decryptData(res.data.data)
    //         return +String(data.amount)?.replaceAll(",", "") - Number(dec?.feeDetails)
    //     } catch (error) {
    //         const dec = decryptData(error?.response?.data?.data)
    //         dataHandler("error", typeof dec === "string" ? dec : dec?.message ?? "We cannot process your request at the moment, please tryagainlater.!")
    //     } finally {
    //         dataHandler("loading", false)
    //     }
    // }

    const getPlainExchangeRate = async (from, to, amount) => {
        dataHandler("loading", true)
        try {
            const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`
            const res = await axios.get(url, { headers: authHeader });
            const dec = decryptData(res?.data?.data);
            dataHandler("new_amoount", dec?.exchangeRate?.exchanged_amount)
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            dataHandler("error", "We cannot process your request at the moment, please try again later..")
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            if (error) {
                dataHandler("oerror", error)
            }
            return 0;
        }
        finally {
            dataHandler("loading", false)
        }
    }

    console.log(data?.bulkPaymentRecipients, "recipients")
    const getExchangeRate = async (amount, setLimitType, payment_method = "instant", from, setLoading) => {
        setLoading(true)
        dataHandler("exchange_rate_error", "")
        dataHandler("exchange_rate", {})
        dataHandler("limitReached", false)
        dataHandler("ratesError", false)
        dataHandler("loading", true)
        console.log(data)

        try {
            const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${from}&to=${data.beneficiary_wallet?.currency?.code}&amount=${amount}&type=${payment_type ?? "wallet_to_wallet"}&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${data.payment_type?.value ?? "wallet"}&receiver_wallet_id=${data.beneficiary_wallet?._id}&sender_wallet_id=${data.wallet?._id ?? data.currency?._id}&payment_method=${payment_method}${data.recipient_amount ? `&preserved_amount=${Number(String(data.recipient_amount)?.replaceAll(",", ""))}` : ""}`

            const res = await axios.get(url, { headers: authHeader })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted?.data?.sending?.value)
            const exchange_rate_details = {
                exchange_rate: decrypted?.data?.exchanged_rate?.value,
                receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                topup_fee: { amount: decrypted?.data?.topup_fee?.value, currency: decrypted?.data?.topup_fee?.currency },
                service_fee: { amount: decrypted?.data?.service_fee?.value, currency: decrypted?.data?.service_fee?.currency },
                total: decrypted?.data?.total?.value,
                limits_used: {
                    daily_receiving_limit_used: decrypted?.data?.limits?.daily_receiving_limit - decrypted?.data?.limits_used?.daily_receiving_limit_used,
                    daily_sending_limit_used: decrypted?.data?.limits?.daily_sending_limit - decrypted?.data?.limits_used?.daily_sending_limit_used,
                    monthly_receiving_limit_used: decrypted?.data?.limits?.monthly_receiving_limit - decrypted?.data?.limits_used?.monthly_receiving_limit_used,
                    monthly_sending_limit_used: decrypted?.data?.limits?.monthly_sending_limit - decrypted?.data?.limits_used?.monthly_sending_limit_used,
                    yearly_receiving_limit_used: decrypted?.data?.limits?.yearly_receiving_limit - decrypted?.data?.limits_used?.yearly_receiving_limit_used,
                    yearly_sending_limit_used: decrypted?.data?.limits?.yearly_sending_limit - decrypted?.data?.limits_used?.yearly_sending_limit_used,
                },
                limits: {
                    daily_receiving_limit: { limits_used: decrypted?.data?.limits_used?.daily_receiving_limit_used, total_limits: decrypted?.data?.limits?.daily_receiving_limit },
                    daily_sending_limit: { limits_used: decrypted?.data?.limits_used?.daily_sending_limit_used, total_limits: decrypted?.data?.limits?.daily_sending_limit },
                    monthly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.monthly_receiving_limit_used, total_limits: decrypted?.data?.limits?.monthly_receiving_limit },
                    monthly_sending_limit: { limits_used: decrypted?.data?.limits_used?.monthly_sending_limit_used, total_limits: decrypted?.data?.limits?.monthly_sending_limit },
                    yearly_receiving_limit: { limits_used: decrypted?.data?.limits_used?.yearly_receiving_limit_used, total_limits: decrypted?.data?.limits?.yearly_receiving_limit },
                    yearly_sending_limit: { limits_used: decrypted?.data?.limits_used?.yearly_sending_limit_used, total_limits: decrypted?.data?.limits?.yearly_sending_limit },
                },
                min_amount: decrypted?.data?.min_amount,
                max_amount: decrypted?.data?.max_amount,
                token: decrypted?.data?.token || ""
            }



            console.log(exchange_rate_details, decrypted, "exchange_rate_dets")

            if (decrypted?.data?.paypal) exchange_rate_details.paypal = decrypted?.data?.paypal;
            if (data.payment_type?.value === "bank_transfer") {
                exchange_rate_details.plaid_currency = decrypted?.data?.converted_currency
                exchange_rate_details.plaid_amount = decrypted?.data?.converted_amount
                exchange_rate_details.plaid_fx = decrypted?.data?.converted_rate
            }

            dataHandler("exchange_rate", exchange_rate_details)
            if (+amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("daily")
            }
            else if (+amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("monthly")
            }
            else if (+amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("yearly")
            }
            else {
                if (amount <= exchange_rate_details?.fee?.amount) {
                    dataHandler("exchange_rate_error", "Invalid Amount Fee")
                } else {
                    dataHandler("exchange_rate_error", "")
                }
            }
            return exchange_rate_details
        }
        catch (err) {
            const dec = decryptData(err?.response.data.data)
            console.log(dec)
            dataHandler("ratesError", true)
            if (typeof dec?.message == "object") {
                if (dec?.message?.[0]?.code === "1003007") {
                    dataHandler("exchange_rate_error", "payer_unavailable")
                } else {
                    dataHandler("exchange_rate_error", "sww")
                }
            }
            else {
                const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                if (error) {
                    dataHandler("exchange_rate_error", error)

                    if (data.step === 4) {
                        dataHandler("error", error)
                        dataHandler("limitReached", true)
                    }
                }
                else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                    dataHandler("exchange_rate_error", "insufficient balance payer")
                }
                else if (dec?.message?.toLowerCase()?.includes("exceeds max") || dec?.message?.toLowerCase()?.includes("above the max")) {
                    dataHandler("exchange_rate_error", "max payer")
                    dataHandler("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                }
                else if (dec?.message?.toLowerCase()?.includes("below the min") || dec?.message?.toLowerCase()?.includes("below the max")) {
                    dataHandler("exchange_rate_error", "min payer")
                    dataHandler("exchange_rate_error_value", Number(dec?.value ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                }
                else {
                    dataHandler("exchange_rate_error", "sww")
                }
            }
        }
        finally {
            setLoading(false)
            dataHandler("loading", false)
        }
    }

    const addDecimals = (value) => {
        const splitted = value.toString().split(".")

        if (splitted.length >= 2) {
            if (splitted[1].length >= 2) {
                return value
            }
            else if (splitted[1].length === 1) {
                return `${value}0`
            }
            else {
                return `${value}00`
            }
        }
        else {
            return `${value}.00`
        }
    }
    const getExchangeRateConversion = async (amount, setLimitType, payment_method = "instant", from, setLoading, fromOrTo = "from") => {
        if (amount) {
            setLoading(true)

            try {
                const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/w2w-rates?from=${from}&to=${data.beneficiary_wallet?.currency?.code || currency}&amount=${amount}&type=wallet_to_wallet&level_id=${userDetails?.level?._id}&payment_type=wallet&&sender_wallet_id=${data.wallet?._id ?? data.currency?._id}&payment_method=${payment_method}&fromOrTo=${fromOrTo}&receiver_wallet_id=${data.beneficiary_wallet?._id}`


                const res = await axios.get(url, { headers: authHeader })
                const decrypted = decryptData(res.data.data)
                const exchange_rate_details = {
                    exchange_rate: decrypted?.data?.exchanged_rate?.value,
                    receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                    fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                    sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
                    total: decrypted?.data?.total?.value,
                }

                dataHandler("exchange_rate", exchange_rate_details)

                if (fromOrTo === "from") {
                    console.log(+exchange_rate_details?.receiver?.amount)
                    formatCurrency(
                        +exchange_rate_details?.receiver?.amount,
                        false,
                        (e) => {
                            console.log(e)
                            dataHandler("recipient_amount", addDecimals(e));
                        }
                    );


                } else {
                    dataHandler("amount", exchange_rate_details?.sending?.amount)
                }
                return exchange_rate_details
            }
            catch (err) {
                const dec = decryptData(err?.response.data.data || err.response.data)

                if (fromOrTo === "from") {
                    dataHandler("recipient_amount", 0)
                } else {
                    dataHandler("amount", 0)
                }

                if (typeof dec?.message == "object") {
                    if (dec?.message?.[0]?.code === "1003007") {
                        dataHandler("exchange_rate_error", "payer_unavailable")
                    } else {
                        dataHandler("exchange_rate_error", "sww")
                    }
                } else {
                    const error = LimitsErrorMessage(dec?.code ?? dec?.message)
                    if (error) {
                        dataHandler("exchange_rate_error", error)
                    }
                    else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
                        dataHandler("exchange_rate_error", "insufficient balance payer")
                    }
                    else if (dec?.message?.toLowerCase()?.includes("exceeds max")) {
                        dataHandler("exchange_rate_error", "max payer")
                    }
                    else if (dec?.message?.toLowerCase()?.includes("below the min") || dec?.message?.toLowerCase()?.includes("below the max")) {
                        dataHandler("exchange_rate_error", "min payer")
                    }
                    else {
                        dataHandler("exchange_rate_error", "sww")
                    }
                }
            }
            finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        let timeout;
        if (data?.isBulkPayment) {
            const exchange_rate_details = {
                fee: { amount: 100, currency: "PKR" },
                sending: { amount: 1000, currency: "PKR" },
                topup_fee: { amount: 0, currency: "PKR" },
                service_fee: { amount: 100, currency: "PKR" },
                receiver: { currency: 1000, amount: "PKR" },
                total: 1100,
            }
            dataHandler("exchange_rate", exchange_rate_details)
        }
        if (data.payment_type?.value && data.currency?._id && (data.recipient_amount || data.recipient_amount === null) && data.beneficiary_wallet?.wallet_id) {
            const getAmount = async () => {
                let amount;
                if (data.payment_type?.value === "wallet" && data?.wallet?.currency /*&& data?.wallet?.currency?.code !== data?.currency_wallet?.currency?.code*/) {
                    amount = await getPlainExchangeRate(data?.currency_wallet?.currency?.code, data?.wallet?.currency?.code, +String(data.amount)?.replaceAll(",", ""))
                } else {
                    amount = String(data.amount)?.replaceAll(",", "")
                }
                return +amount
            }
            timeout = setTimeout(() => {
                getAmount()
                    .then(res => {
                        getExchangeRate(res, () => { }, "instant", data?.payment_type?.value !== "wallet" ? data?.currency?.currency?.code : data?.wallet?.currency?.code, e => dataHandler("loading", e))
                    })
            }, 100)
        }
        return () => clearTimeout(timeout)
    }, [data.payment_type?.value, data.wallet?._id, data.payment_type, data.currency?._id, data.amount, data.recipient_amount, userWallets, data.beneficiary_wallet?.wallet_id])


    const verifyWallet = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-active-wallet`, { data: encryptData({ walletId: data?.beneficiary_wallet?.wallet_id }) }, {
                headers: authHeader
            });
            dataHandler("step", 2)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            if (dec.status === false) {
                dataHandler("error", "The wallet that you have selected is disabled please select another wallet.")
            }
        }
    }
    const handleClick = () => {
        switch (data.step) {
            case 1:
                if (data.isBulkPayment) {
                    dataHandler("step", 3)
                } else {
                    verifyWallet()
                }
                break;
            case 2:
                dataHandler("step", 3)
                break;
            case 3:
                dataHandler("step", 4)
                break;
            case 4:
                if (invoiceId && isShipping && !data.showShippingAddress) {
                    dataHandler("showShippingAddress", true)
                }
                else if (data.payment_type?.value === "mobile_wallet") {
                    dataHandler("showShippingAddress", false)
                    dataHandler("step", 5)
                }
                else if (data.payment_type?.value === "wallet") {
                    if (!invoiceId) {
                        dataHandler("show_payment_type", true)
                        if (data.show_payment_type) {
                            dataHandler("step", 5)
                        }
                    } else {
                        dataHandler("showShippingAddress", false)
                        dataHandler("step", 5)
                    }
                }
                else if (data.payment_type?.value === "paypal") {
                    dataHandler("showShippingAddress", false)
                    dataHandler("step", 5)
                }
                else {
                    dataHandler("showCard", true)
                    dataHandler("showShippingAddress", false)
                    dataHandler("step", 5)
                }
                break;

            case 5:
                dataHandler("step", 6)
                break;
            case 6:
                // if (data.payment_type?.value === "mobile") {
                //     handleMobileWalletPayment()
                // }
                if (data.payment_type?.value === "card") {
                    if (data.showCard) {
                        dataHandler("showCard", false)
                    } else {
                        // getTopupFees()
                        //     .then((res) => {
                        // getExchangeRate(data.amount, () => { })
                        //     .then(() => {
                        //         setTimeout(() => {
                        // createQuotation(res)
                        sendOtp()
                        //     }, 100)
                        // })
                        // })
                    }
                }
                else {
                    // getPlainExchangeRate(data.currency_wallet?.currency?.code, data.wallet?.currency?.code, data.amount)
                    //     .then(res => {
                    //         getExchangeRate(res, () => { })
                    //             .then(() => {
                    //                 setTimeout(() => {
                    sendOtp()
                    // createQuotation(res)
                    //             }, 100)
                    //         })
                    // })
                }
                break;

            default:
                break;
        }
    }

    const handleCloseSubscription = () =>
        dataHandler("payment_duration", {
            ...data.payment_duration,
            name: "Instant Payment",
            value: "instant",
        });



    useEffect(() => {
        if (amount && currency) {
            setLeftSideContent(leftSideContent.map((c, i) => i === 0 ? "Fetching beneficiary details" : c))
            if (userWallets?.length > 0) {
                const wallet = userWallets?.[0]?.wallet_type === "insta" && !userWallets?.[0]?.blocked && !userWallets?.[0]?.admin_blocked && userWallets?.[0]?.status?.toLowerCase() === "active"
                    ?
                    userWallets?.[0]
                    :
                    userWallets?.find(item => item?.default)
                getPlainExchangeRate(currency, wallet?.currency?.code, amount)
                    .then(res => {
                        dataHandler("amount", Number(res)?.toFixed(getDecimalPointIndex(res) <= 2 ? 2 : getDecimalPointIndex(res)))
                        dataHandler("recipient_amount", amount)
                    })
            }
        }
    }, [amount, currency, userWallets])

    const transaction_status = queryParams.get("transaction_status")
    const error_in_funds = queryParams.get("error_in_funds")
    const code = queryParams.get("code")

    useEffect(() => {
        const error_message = () => {
            return errors.find(item => item?.code === code)?.message
        }
        if (transaction_status === "error" && sendPaymentType === "wallet") {
            dataHandler("error", error_message() ?? error_in_funds?.toLowerCase() === "true" ? "We encountered an issue processing your selected payment method. Please try again later." : "We encountered an issue processing your wallet to wallet transfer, but your funds have been securely added to your wallet. Kindly check your transaction record, and when ready, you may retry the transfer at your convenience.")
        }
        if (transaction_status === "aborted" && sendPaymentType === "wallet") {
            dataHandler("error", error_message() ?? "It appears that the add funds request was canceled. Please try again later when you're ready.")
        }
    }, [transaction_status])


    const handleBack = () => {
        reset()
        if (data.step === 4 && invoiceId && !data.showShippingAddress) {
            navigate(`/invoice/${userDetails.username}/${invoiceId}`)
        }
        if (data.step === 4 && data.showShippingAddress) {
            dataHandler("showShippingAddress", false)
        }
        if (data.step === 4 && data.payment_type?.value) {
            dataHandler("payment_type", {})
            dataHandler("payment_duration", {
                name: "Instant Payment",
                value: "instant",
            })
            dataHandler("show_payment_type", false)
        }
        else if (data.step === 2 && Object.keys(data.beneficiary).length > 0 && Object.keys(data.beneficiary_wallet)) {
            dataHandler("beneficiary", {})
            dataHandler("beneficiary_wallet", {})
            dispatch({ type: "CLEAR_STEP_TWO_DATA" })
            // dataHandler("amount", 1)
            dataHandler("step", data.step - 1)
        }
        else if (data.step === 4 && data.payment_type?.value === "card") {
            dataHandler("payment_type", {})
            dataHandler("step", data.step - 1)
            dataHandler("showCard", false)
        }
        else if (data.step === 5) {
            dataHandler("showCard", false)
            if (isShipping) {
                dataHandler("showShippingAddress", true)
            }
            dataHandler("step", data.step - 1)
        }
        else if (data.step === 3 && data.isBulkPayment) {
            dataHandler("step", 1)
        }
        else if (data.step === 3 && payment_type === "payment_address") {
            navigate(`/pay/${userDetails.username}?amount=${amount}`)
        }
        else {
            const url = new URL(window.location.href);
            url.searchParams.delete('wallet_id');
            window.history.pushState(null, null, url);
            dataHandler("step", data.step - 1)
        }
    }


    console.log(limitStatus)
    return (
        <>
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => {
                        dataHandler("showOtpModal", false)
                        setShowCardModal(false)
                    }}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    title="Wallet To Wallet Failed"
                    reEnter={_ => dataHandler("showCard", true)}
                />
            }
            {
                data.error
                &&
                <ErrorModal
                    isOpen={data.error}
                    toggle={() => {
                        dataHandler("error", "")
                        dataHandler("ratesError", false)
                    }}
                    heading={data.ratesError ? "Transaction could not be proceed!" : "Transaction Failed!"}
                    message={data.error}
                />
            }
            {
                data.cardTransactionDetails?.intlToken || data.cardTransactionDetails?.w2w_data
                    ?
                    <TrustpaymentPage
                        amount={+String(data.amount)?.replaceAll(",", "")}
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
                    <div style={{
                        display: "flex",
                        width: sendPaymentType === "wallet" ? "100%" : "fit-content",
                        transition: "500ms",
                        position: "relative",
                        order: sendPaymentType === "wallet" ? 1 : 9
                    }}>
                        <SendActionCard
                            // bg={w2}
                            bg={w2w}
                            title={t("Wallet to Wallet Transfer")}
                            icon={wallet_ic}
                            desc={t("Instantly transfer money to other InstaPay users with our secure wallet-to-wallet \nservice. Send and receive funds hassle-free within seconds.")}
                            setter={(val) => {
                                setSendPaymentType(val)
                                resetStates()
                            }}
                            setterValue="wallet"
                            setStep={setStep}
                            showDesc={sendPaymentType === "wallet"}
                            active={sendPaymentType === "wallet"}
                            sendPaymentType={sendPaymentType}
                        />
                        {
                            sendPaymentType === "wallet" &&
                            (
                                data?.transaction_details || transaction_status
                                    ?
                                    data.loading
                                        ?
                                        <div style={{ height: "300px", width: "300px", margin: "1rem auto" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <Receipt
                                            data={data}
                                        />
                                    :
                                    <div
                                        className={styles.body}
                                        style={{
                                            width: sendPaymentType === "international" ? "100%" : "0px",
                                            transition: "500ms",
                                            "--min-width": data.step === 4 && data.payment_type?.value === "wallet" && !data.show_payment_type && !data.showShippingAddress ? "65vw" : "55vw"
                                        }}
                                    >
                                        <div className={styles.left}>
                                            <div className={styles.l_top}>
                                                <h1>{t("Send Money")}</h1>
                                                <h2>{data.step === 5 && data.showCard && data.payment_type?.value === "card" ? t("Select Or Add Payment Card") : data.payment_type?.value === "bank_transfer" ? t("Europe Bank Transfer") : t(leftSideContent?.[data.step - 1])}</h2>
                                            </div>
                                            {data.step === 1 && !payment_type && data.currency?._id && <RecentTransactions dataHandler={dataHandler} type={"wallet_to_wallet"} dataCurrency={data} />}
                                            {
                                                (data.step === 4 && !data.limitReached)
                                                &&
                                                (
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
                                                                    plaidValues
                                                                    data={data}
                                                                    isInvoice={invoiceId ? true : false}
                                                                    receiverFee={(invoiceId) && data.exchange_rate?.service_fee?.amount ? true : false}
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
                                                                                        }}>
                                                                                        1.00 {data?.exchange_rate?.paypal?.fee?.currency} =
                                                                                        {(data?.exchange_rate?.paypal?.paypal_rate?.value >= 0.01 ?
                                                                                            Number(data?.exchange_rate?.paypal?.paypal_rate?.value).toFixed(2) :
                                                                                            Number(data?.exchange_rate?.paypal?.paypal_rate?.value))}{t("USD")}</strong>
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
                                                                                    }}>
                                                                                        {Number(data?.exchange_rate?.paypal?.paypal_converted?.value) >= 0.01 ? Number(data?.exchange_rate?.paypal?.paypal_converted?.value).toFixed(2) : Number(data?.exchange_rate?.paypal?.paypal_converted?.value)}{t("USD")}</strong>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                        :
                                                                        ""
                                                                }
                                                            </>
                                                            :
                                                            ""
                                                )
                                            }
                                        </div>
                                        <div className={styles.right} style={{ "--color-white": "#fafafa" }}>
                                            {
                                                data.showShippingAddress &&
                                                <ShippingDetails
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                            }
                                            {
                                                data.step === 1
                                                &&
                                                <StepOne
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                            }
                                            {
                                                data.step === 2
                                                &&
                                                <StepTwo
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    getExchangeRate={getExchangeRateConversion}
                                                />
                                            }
                                            {
                                                data.step === 3
                                                &&
                                                <StepThree
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                            }
                                            {
                                                data.step === 4 && !data.showShippingAddress
                                                &&
                                                (
                                                    data.show_payment_type
                                                        ?
                                                        data.payment_duration?.value === "subscription"
                                                            ?
                                                            <Recursive
                                                                showBottom={false}
                                                                recCycle={data.payment_duration?.cycles}
                                                                recStartDate={data.payment_duration?.recStartDate}
                                                                setRecCycle={(e) => dataHandler("payment_duration", { ...data.payment_duration, cycles: e })}
                                                                setRecStartDate={(e) => dataHandler("payment_duration", { ...data.payment_duration, recStartDate: e })}
                                                                setSubStep={() => { }}
                                                                setUnlimited={(e) => dataHandler("payment_duration", { ...data.payment_duration, unlimited: e })}
                                                                unlimited={data.payment_duration?.unlimited}
                                                                decrementHandler={() => dataHandler("payment_duration", { ...data.payment_duration, cycles: (data.payment_duration?.cycles ?? 1) - 1 })}
                                                                incrementHandler={() => dataHandler("payment_duration", { ...data.payment_duration, cycles: (data.payment_duration?.cycles ?? 1) + 1 })}
                                                                timezone={data.timezone}
                                                                setTimezone={e => dataHandler("timezone", e)}
                                                                onClose={handleCloseSubscription}
                                                            />
                                                            :
                                                            data.payment_duration?.value === "schedule"
                                                                ?
                                                                <SchedulePayment
                                                                    showBottom={false}
                                                                    scheduleDate={data.payment_duration?.scheduleDate}
                                                                    scheduleTime={data.payment_duration?.scheduleTime}
                                                                    setScheduleDate={(e) => dataHandler("payment_duration", { ...data.payment_duration, scheduleDate: e })}
                                                                    setScheduleTime={(e) => dataHandler("payment_duration", { ...data.payment_duration, scheduleTime: e })}
                                                                    setSubStep={() => { }}
                                                                    timezone={data.timezone}
                                                                    setTimezone={e => dataHandler("timezone", e)}
                                                                    onClose={handleCloseSubscription}
                                                                />
                                                                :
                                                                <PaymentType
                                                                    data={data}
                                                                    dataHandler={dataHandler}
                                                                />
                                                        :
                                                        <StepFour
                                                            data={data}
                                                            dataHandler={dataHandler}
                                                            loading={data.loading}
                                                        />
                                                )
                                            }
                                            {
                                                data.step === 5
                                                &&
                                                (
                                                    data?.payment_type?.value === "bank_transfer" ?
                                                        <PlaidBankTransfer
                                                            data={data}
                                                            dataHandler={dataHandler}
                                                            endpoint="/api/plaid/initiate-w2w-payment"
                                                            type="wallet_to_wallet"
                                                            initiatePayload={() => {
                                                                const payload = generatePayload()
                                                                return payload.data
                                                            }}
                                                        /> :
                                                        <>
                                                            {
                                                                !data.showCard
                                                                    ?
                                                                    <StepFive
                                                                        data={data}
                                                                    />
                                                                    :
                                                                    <CreditCard
                                                                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                        tokenUrl={(t) => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                    />
                                                            }

                                                        </>
                                                )
                                            }
                                            {data.step === 6
                                                &&
                                                (
                                                    <div>
                                                        <div className={styles.noticeDiv}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                                                    <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" strokeWidth="4" strokeLinecap="round" />
                                                                </svg>
                                                                <span className={styles.noticeHead}>{t("Notice!")}</span>
                                                            </div>

                                                            <div>
                                                                <p>{t("By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.")}</p>
                                                                <p style={{ marginTop: "8px" }}>{t("I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.")}</p>
                                                            </div>
                                                        </div>


                                                        {
                                                            data.showOtpModal
                                                            &&
                                                            <OtpConfirmation
                                                                variant="modal"
                                                                callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                                isLoading={data.loading}
                                                                isOpen={data.showOtpModal}
                                                                toggle={() => {
                                                                    reset()
                                                                    dataHandler("showOtpModal", false)
                                                                }}
                                                                resendHandler={sendOtp}
                                                                methods={data.otpMethods}
                                                                error={data.otpError}
                                                                resetIdempotency={reset}
                                                            />
                                                        }

                                                    </div>
                                                )
                                            }
                                            {((data.payment_type?.value !== "bank" && data?.payment_type?.value !== "bank_transfer") || data.step < 5) &&
                                                <div className={styles.bottom}>
                                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                        <HelpCircle size={16} />
                                                        {t("Trouble Sending Money")}
                                                    </Link>
                                                    <div style={{ gap: data.step === 5 && "0.5rem" }} className={styles?.buttons}>
                                                        {
                                                            (data.step > 1)
                                                            &&
                                                            <button className={styles.transparent} disabled={data.loading} onClick={handleBack}>{t("Back")}</button>
                                                        }
                                                        <button disabled={disabledButton || data.loading} onClick={handleClick}>
                                                            {

                                                                data.step === 5
                                                                    ?
                                                                    t("Confirm")
                                                                    :
                                                                    data.step === 6
                                                                        ?
                                                                        t("Confirm and Proceed")
                                                                        :
                                                                        t("Next")
                                                            }
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        {
                                            data.step === 4 && data.payment_type?.value === "wallet" && !data.show_payment_type && !data.showShippingAddress
                                                ?
                                                <WalletsComponent
                                                    loading={data.loading}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                                : ""
                                        }
                                        {
                                            data.step === 4 && data.payment_type?.sub_name && !data.show_payment_type
                                                ?
                                                <MobileWalletServices
                                                    loading={data.loading}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                                : ""
                                        }
                                    </div>
                            )
                        }
                    </div>
                    :

                    <div className={styles.mobile}>
                        {(showRecent && data.step === 1) ? <RecentTransactions setShowRecent={setShowRecent} type={"wallet_to_wallet"} dataHandler={dataHandler} />
                            :
                            <>
                                <div className={styles.m_top}>
                                    <h1>{t("SEND MONEY")}</h1>
                                    <h2>{data.payment_type?.value === "card" ? t("Select Or Add Payment Card") : data.payment_type?.value === "bank_transfer" ? t("Europe Bank Transfer") : t(leftSideContent?.[data.step - 1])}</h2>
                                </div>

                                <div className={styles.flow}>
                                    {
                                        data?.transaction_details || transaction_status
                                            ?
                                            data.loading
                                                ?
                                                <div style={{ height: "300px", width: "300px", margin: "1rem auto" }}>
                                                    <InstaPayLoader />
                                                </div>
                                                :
                                                <Receipt
                                                    data={data}
                                                />
                                            :
                                            <>
                                                <div className={styles.flow_com} style={{ minHeight: "50vh" }}>
                                                    {
                                                        data.step === 4 && !data.show_payment_type && (data.payment_type?.value === "wallet" || data.payment_type?.sub_name) && !data.showShippingAddress
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
                                                                    data.showShippingAddress &&
                                                                    <ShippingDetails
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                    />
                                                                }
                                                                {
                                                                    data.step === 1
                                                                    &&
                                                                    <StepOne
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                        initialPhone={phone}
                                                                    />
                                                                }
                                                                {
                                                                    data.step === 2
                                                                    &&
                                                                    <StepTwo
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                        getExchangeRate={getExchangeRateConversion}
                                                                    />
                                                                }
                                                                {
                                                                    data.step === 3
                                                                    &&
                                                                    <StepThree
                                                                        data={data}
                                                                        dataHandler={dataHandler}
                                                                    />
                                                                }
                                                                {
                                                                    data.step === 4 && !data.showShippingAddress
                                                                    &&
                                                                    (
                                                                        data.show_payment_type
                                                                            ?
                                                                            data.payment_duration?.value === "subscription"
                                                                                ?
                                                                                <Recursive
                                                                                    showBottom={false}
                                                                                    recCycle={data.payment_duration?.cycles}
                                                                                    recStartDate={data.payment_duration?.recStartDate}
                                                                                    setRecCycle={(e) => dataHandler("payment_duration", { ...data.payment_duration, cycles: e })}
                                                                                    setRecStartDate={(e) => dataHandler("payment_duration", { ...data.payment_duration, recStartDate: e })}
                                                                                    setSubStep={() => { }}
                                                                                    setUnlimited={(e) => dataHandler("payment_duration", { ...data.payment_duration, unlimited: e })}
                                                                                    unlimited={data.payment_duration?.unlimited}
                                                                                    decrementHandler={() => dataHandler("payment_duration", { ...data.payment_duration, cycles: (data.payment_duration?.cycles ?? 1) - 1 })}
                                                                                    incrementHandler={() => dataHandler("payment_duration", { ...data.payment_duration, cycles: (data.payment_duration?.cycles ?? 1) + 1 })}
                                                                                    timezone={data.timezone}
                                                                                    setTimezone={e => dataHandler("timezone", e)}
                                                                                />
                                                                                :
                                                                                data.payment_duration?.value === "schedule"
                                                                                    ?
                                                                                    <SchedulePayment
                                                                                        showBottom={false}
                                                                                        scheduleDate={data.payment_duration?.scheduleDate}
                                                                                        scheduleTime={data.payment_duration?.scheduleTime}
                                                                                        setScheduleDate={(e) => dataHandler("payment_duration", { ...data.payment_duration, scheduleDate: e })}
                                                                                        setScheduleTime={(e) => dataHandler("payment_duration", { ...data.payment_duration, scheduleTime: e })}
                                                                                        setSubStep={() => { }}
                                                                                        timezone={data.timezone}
                                                                                        setTimezone={e => dataHandler("timezone", e)}
                                                                                    />
                                                                                    :
                                                                                    <PaymentType
                                                                                        data={data}
                                                                                        dataHandler={dataHandler}
                                                                                    />
                                                                            :
                                                                            <StepFour
                                                                                data={data}
                                                                                dataHandler={dataHandler}
                                                                            />
                                                                    )
                                                                }
                                                                {
                                                                    data.step === 5
                                                                    &&
                                                                    (
                                                                        data?.payment_type?.value === "bank_transfer" ?
                                                                            <PlaidBankTransfer
                                                                                data={data}
                                                                                dataHandler={dataHandler}
                                                                                endpoint="/api/plaid/initiate-w2w-payment"
                                                                                type="wallet_to_wallet"
                                                                                initiatePayload={() => {
                                                                                    const payload = generatePayload()
                                                                                    return payload.data
                                                                                }}
                                                                            />
                                                                            :
                                                                            <>
                                                                                {
                                                                                    !data.showCard
                                                                                        ?
                                                                                        <StepFive
                                                                                            data={data}
                                                                                        />
                                                                                        :
                                                                                        <CreditCard
                                                                                            url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                                            tokenUrl={(t) => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                                            data={data}
                                                                                            dataHandler={dataHandler}
                                                                                        />
                                                                                }
                                                                            </>
                                                                    )
                                                                }

                                                                {data.step === 6
                                                                    &&
                                                                    (
                                                                        <div>
                                                                            <div className={styles.noticeDiv}>
                                                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                                                                                        <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" strokeWidth="4" strokeLinecap="round" />
                                                                                    </svg>
                                                                                    <span className={styles.noticeHead}>{t("Notice!")}</span>
                                                                                </div>

                                                                                <div>
                                                                                    <p>{t("By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.")}</p>
                                                                                    <p style={{ marginTop: "8px" }}>{t("I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.")}</p>
                                                                                </div>
                                                                            </div>


                                                                            {
                                                                                data.showOtpModal
                                                                                &&
                                                                                <OtpConfirmation
                                                                                    variant="modal"
                                                                                    callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                                    data={data}
                                                                                    dataHandler={dataHandler}
                                                                                    isLoading={data.loading}
                                                                                    isOpen={data.showOtpModal}
                                                                                    toggle={() => {
                                                                                        reset()
                                                                                        dataHandler("showOtpModal", false)
                                                                                    }}
                                                                                    resendHandler={sendOtp}
                                                                                    methods={data.otpMethods}
                                                                                    error={data.otpError}
                                                                                    resetIdempotency={reset}
                                                                                />
                                                                            }

                                                                        </div>
                                                                    )
                                                                }
                                                            </>
                                                    }
                                                </div>
                                                {((data.payment_type?.value !== "bank" && data?.payment_type?.value !== "bank_transfer") || data.step < 5) &&
                                                    <div className={styles.bottom}>
                                                        <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                            <HelpCircle size={16} />
                                                            {t("Trouble Sending Money")}
                                                        </Link>
                                                        <div className={styles.buttons}>
                                                            {
                                                                data.step > 1
                                                                &&
                                                                <button
                                                                    disabled={data.loading}
                                                                    onClick={handleBack}
                                                                >
                                                                    <ChevronLeft />
                                                                </button>
                                                            }
                                                            <button className={styles.full} disabled={disabledButton || data.loading} onClick={handleClick}>
                                                                {
                                                                    data.step === 5
                                                                        ?
                                                                        t("Confirm")
                                                                        :
                                                                        data.step === 6
                                                                            ?
                                                                            t("Confirm and Proceed")
                                                                            :
                                                                            t("Next")
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                            </>
                                    }
                                </div>
                            </>
                        }
                    </div>
            }
        </>
    );
}

export default WalletToWalletFlow
