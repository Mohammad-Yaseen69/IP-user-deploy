import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import ErrorModal from "../InternationalFlow/ErrorModal";
import SendActionCard from "../Common/SendActionCard";
import wallet_ic from "../files/wallet.svg"
import w2w from "../files/w2w.png"
import qr_code from "../files/qr_code.png"
import qr from "../files/qr.svg"
import InstaPayLoader from "../../Loader";
import Receipt from "../InternationalFlow/Receipt";
import styles from "../InternationalFlow/styles/index.module.css"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, Info } from "react-feather";
import { useTranslation } from "react-i18next";
import StepOne from "../WalletToWalletFlow/StepOne";
import { UserContext } from "../../../Context/UserContext";
import StepTwo from "../WalletToWalletFlow/StepTwo";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { LimitsErrorMessage } from "../OTPConfirmation";
import StepThree from "../InternationalFlow/StepThree";
import StepFour from "../InternationalFlow/StepFour";
import WalletsComponent from "../InternationalFlow/WalletsComponent";
import PaymentType from "../WalletToWalletFlow/PaymentType";
import StepFive from "../WalletToWalletFlow/StepFive";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import CreditCard from "../InternationalFlow/CreditCard";
import OtpConfirmation from "../InternationalFlow/OtpConfirmation";
import SchedulePayment from "../SchedulePayment";
import Recursive from "../RecursivePayment";
import { toast } from "react-toastify";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import FeesComponent from "../InternationalFlow/FeesComponent";
import QRCodeScan from "../QRCodeScan";
import QRRecipient from "../QRRecipient";
import AddQRDetails from "../Mobile/AddQRDetails";
import QRRecipientMobile from "../Mobile/QRRecipient"
import MobileWalletServices from "../InternationalFlow/MobileWalletServices";
import { createShambeToken } from "../../../Helper/CreateToken";
import NotFoundModal from "../../NotFound/NotFoundModal";
import { cleanString } from "../../../Helper/cleanString";
import { currencies } from "../InternationalFlow/StepOne";
import { apiErrorMessage } from "../InternationalFlow";

const leftSideContent = [
    "Choose the beneficiary!",
    "Enter The Amount",
    "Add Remarks And Comments",
    "Select Payment Type",
    "Review transfer"
]

const initialState = {
    loading: false,
    step: 1,
    amount: 1.00,
    recipient_amount: 0.00,
    new_amoount: 0.00,
    currency: {},
    currency_wallet: {},
    beneficiary: {},
    beneficiary_wallet: {},
    reason: "",
    comment: "",
    files: [],
    payment_type: {
        name: "InstaPay Wallet",
        value: "wallet",
        // icon: instapay,
        status: "Active"
    },
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
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        // other cases can be added here
        default:
            return state;
    }
}

const QRFlow = ({ sendPaymentType, setStep, setSendPaymentType, setIsWallet }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userDetails, authHeader, setProfileLockTime, userWallets, getUserWallets } = useContext(UserContext)
    const [data, dispatch] = useReducer(reducer, initialState)
    useEffect(() => {
        getUserWallets()
    }, [])
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

    useEffect(() => {
        if (userDetails?.tfa) {
            dataHandler("codeType", "authenticator")
        }
    }, [userDetails])


    useEffect(() => {
        const def = userWallets?.find((item) => item?.default === true)
        const wallet = { ...def, ...currencies.find(item => item.currency_code === def?.currency?.code) }
        dataHandler("wallet", def)
        dataHandler("currency", wallet)
        dataHandler("currency_wallet", wallet)
    }, [userWallets, currencies])


    useEffect(() => {
        if (data.wallet?._id) {
            if (data?.wallet?._id === data?.currency?._id) return;
            dataHandler("currency", data.wallet)
        }
    }, [data.wallet])

    const disabledButton = useMemo(() => {
        switch (data.step) {
            case 1:
                return !data.beneficiary_wallet?._id
            case 2:
                return !data.amount || !data.currency?._id || !data.exchange_rate?.exchange_rate || data.exchange_rate_error
            case 3:
                return !data.reason
            case 4:
                return !data.payment_type?.name || data.payment_type?.value === "wallet" ? !data.wallet?._id : false || data?.payment_duration?.value == "subscription" ? !data.payment_duration?.recStartDate || (!data.payment_duration?.cycles && !data.payment_duration?.unlimited) : data?.payment_duration?.value == "schedule" ? !data.payment_duration?.scheduleDate || !data.payment_duration?.scheduleTime : false
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
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("mobile_wallet_channels", dec?.data?.services ?? [])
            dataHandler("mobile_wallet_merchant", dec?.data?.merchant_id ?? "")
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
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            dataHandler("mobile_wallet_services", dec?.data?.payers ?? [])
        } catch {
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

    const sendOtp = async (codeType = "") => {
        dataHandler("loading", true)
        console.log(data.amount, data.recipient_amount)
        try {
            let payload = {
                data: {
                    "receiver_wallet_id": data.beneficiary_wallet?.wallet_id,
                    "sender_wallet_id": data.payment_type?.value !== "wallet" ? data.currency?._id : data?.wallet?._id,
                    "purpose": data.reason,
                    "amount": Number(cleanString(data.recipient_amount)),
                    "type": "instant",
                    "payment_type": "qr_pay",
                    'description': data.comment,
                    "token": data.exchange_rate?.token
                },
                type: codeType || data.codeType
            }
            const encrypted = encryptData(payload)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            if (!dec?.skipOtp) {
                dataHandler("showOtpModal", true)
            }
            else {
                data.payment_type?.value === "card" ? initiateCardPayment("1222", dec?.token) : data.payment_type?.value === "paypal" ? initiatePaypalPayment("1222", dec?.token) : verifyOtp("1222", dec?.token)
            }
            dataHandler("otp_token", dec?.token)
        } catch (error) {
            const decrypted = decryptData(error.response.data.data)
            dataHandler("error", decrypted?.message ?? "Something went wrong while sending the OTP!")
        } finally {
            dataHandler("loading", false)
        }
    }


    const verifyOtp = async (otp, token) => {
        dataHandler("loading", true)
        try {
            const payload = new FormData()
            Array.from(data.files).forEach((image) => {
                payload.append("files", image);
            });
            payload.append("type", data.codeType)
            payload.append("otp", otp)
            payload.append("token", token || data.otp_token)

            console.log(data.new_amoount)
            const urlEnds = data.payment_duration?.value === "instant" ? "insta-wallet-to-wallet" : data.payment_duration?.value === "subscription" ? "subscribe-payment-w2w" : "schedule-payment-w2w"
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/${urlEnds}`,
                payload,
                {
                    headers: authHeader
                }
            )

            const dec = decryptData(res.data.data)
            dataHandler("transaction_details", dec?.data ?? dec?.subscribtionDetails)
        } catch (err) {
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
        } finally {
            dataHandler("loading", false)
        }
    }
    const [showCardModal, setShowCardModal] = useState(false)
    const initiateCardPayment = async (otp, token) => {
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
                            token: token || data.otp_token
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
                            token: token || data.otp_token
                        },
                    }
                }
            }
            console.log(payload)
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/initiat-w2w${data.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
                { data: enc },
                { headers: authHeader }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("cardTransactionDetails", dec)
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            if (decrypted?.message === "Invalid card.") {
                setShowCardModal(true)
            }
            else {
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                const error2 = apiErrorMessage(decrypted?.message)

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
                }
                else {
                    dataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
                }
            }
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const initiatePaypalPayment = async (otp, token) => {
        dataHandler("loading", true)
        try {
            const payload = {
                token: token || data.otp_token,
                otp: otp,
                type: data.codeType,
            }
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/paypal/initiate-w2w-payment`,
                { data: enc },
                { headers: authHeader }
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

    const getTopupFees = async () => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-tbc-fee/${data.currency_wallet?._id}/${data.amount?.toString()?.split(".")?.[0]}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            return data.amount - Number(dec?.feeDetails)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            dataHandler("error", typeof dec === "string" ? dec : dec?.message ?? "Something went wrong, Please try again!")
        } finally {
            dataHandler("loading", false)
        }
    }

    const getPlainExchangeRate = async (from, to, amount) => {
        dataHandler("loading", true)
        try {
            const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`
            const res = await axios.get(url, { headers: authHeader });
            const dec = decryptData(res?.data?.data);
            dataHandler("new_amoount", dec?.exchangeRate?.exchanged_amount)
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
            console.log(decryptData(error?.response?.data?.data))
            dataHandler("error", "Something went wrong while getting exchange rate.")
            return 0;
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const getExchangeRate = async (amount, setLimitType, payment_method = "instant", from, setLoading) => {
        dataHandler("loading", true)
        dataHandler("exchange_rate_error", "")
        dataHandler("exchange_rate", {})
        try {
            const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${from}&to=${data.beneficiary_wallet?.currency?.code}&amount=${amount}&type=qr_pay&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${data.payment_type?.value ?? "wallet"}&receiver_wallet_id=${data.beneficiary_wallet?._id}&sender_wallet_id=${data.wallet?._id ?? data.currency?._id}&payment_method=${payment_method}`
            // console.log(url)
            const res = await axios.get(url, { headers: authHeader })

            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            const exchange_rate_details = {
                exchange_rate: decrypted?.data?.exchanged_rate?.value,
                receiver: { currency: decrypted?.data?.recipient?.currency, amount: decrypted?.data?.recipient?.value },
                fee: { amount: decrypted?.data?.fee?.value ?? 0.00, currency: decrypted?.data?.fee?.currency },
                sending: { amount: decrypted?.data?.sending?.value, currency: decrypted?.data?.sending?.currency },
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
                token: decrypted?.data?.token ?? ""
            }

            console.log(decrypted)
            if (decrypted?.data?.paypal) exchange_rate_details.paypal = decrypted?.data?.paypal;

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

            if (exchange_rate_details.receiver?.amount) {
                dataHandler("recipient_amount", exchange_rate_details.receiver?.amount)
            }


            console.log(exchange_rate_details)
            return exchange_rate_details
        }
        catch (err) {
            const dec = decryptData(err?.response?.data?.data)
            console.log(dec, err)
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
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        let timeout;
        if (data.payment_type?.value) {
            const getAmount = async () => {
                let amount;
                console.log(data.payment_type, data.wallet, data.currency_wallet, "shit")
                if (data.payment_type?.value === "wallet" && data?.wallet?.currency && data?.wallet?.currency?.code !== data?.currency_wallet?.currency?.code) {
                    amount = await getPlainExchangeRate(data?.currency_wallet?.currency?.code, data?.wallet?.currency?.code, data.amount)
                } else {
                    amount = data?.amount
                }
                return Number(typeof amount === "string" ? amount?.replace(/,/g, "") : amount)
            }
            timeout = setTimeout(() => {
                getAmount()
                    .then(res => {
                        getExchangeRate(res, () => { }, "instant", data?.payment_type?.value !== "wallet" ? data?.currency_wallet?.currency?.code : data?.wallet?.currency?.code)
                    })
            }, 100)
        }
        return () => clearTimeout(timeout)
    }, [data.payment_type?.value, data.wallet?._id, userDetails, userWallets, currencies])

    const handleClick = () => {
        switch (data.step) {
            case 1:
                dataHandler("step", 2)
                break;
            case 2:
                dataHandler("step", 3)
                break;
            case 3:
                dataHandler("step", 5)
                break;
            case 4:
                if (data.payment_type?.value === "mobile") {
                    console.log("")
                }
                else if (data.payment_type?.value === "wallet") {
                    // dataHandler("show_payment_type", true)
                    // if (data.show_payment_type) {
                    dataHandler("step", 5)
                    // }
                }
                else if (data.payment_type?.value === "paypal") {
                    dataHandler("step", 5)
                }
                else {
                    dataHandler("showCard", true)
                    dataHandler("step", 5)
                }
                break;

            case 5:
                if (data.payment_type?.value === "card") {
                    if (data.showCard) {
                        dataHandler("showCard", false)
                    } else {
                        sendOtp()
                    }
                }
                else {
                    sendOtp()
                }
                break;

            default:
                break;
        }
    }

    const currency = queryParams.get("currency")
    const amount = queryParams.get("amount")

    useEffect(() => {
        if (amount && currency && data.currency?.currency?.code) {
            getExchangeRate(amount, () => { }, "request")
                .then(res => {
                    dataHandler("amount", Number(res?.total - res?.fee?.amount).toFixed(2))
                })
        }
    }, [amount, currency, data.currency])

    useEffect(() => {
        if (data.beneficiary_wallet?.wallet_id) {
            const prev = window.location.search
            window.history.replaceState(null, null, `${prev}&wallet_id=${data.beneficiary_wallet?.wallet_id}`)
        }
    }, [data.beneficiary_wallet?.wallet_id])


    // console.log(data.payment_type)
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
                    title="QR Payment Failed"
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
                    }}
                    message={data.error}
                />
            }
            {
                data.cardTransactionDetails?.intlToken || data.cardTransactionDetails?.w2w_data
                    ?
                    <TrustpaymentPage
                        amount={data.amount}
                        card_cvc={data.cvc}
                        card_expiry={data.expiry}
                        card_number={data.cardNumber}
                        currency={data.currency_wallet?.currency?.code}
                        transaction={data.cardTransactionDetails}
                        paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                        tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                    />
                    :
                    <></>
            }
            {
                window.innerWidth > 1000
                    ?
                    <div style={{
                        display: "flex",
                        width: sendPaymentType === "qr_pay" ? "100%" : "fit-content",
                        transition: "500ms",
                        position: "relative",
                        order: sendPaymentType === "qr_pay" ? 1 : 9
                    }}>
                        <SendActionCard
                            bg={qr_code}
                            title={t("QR Code Payment")}
                            icon={qr}
                            desc={t("Instantly transfer money to other InstaPay users with our secure wallet-to-wallet \nservice. Send and receive funds hassle-free within seconds.")}
                            setter={setSendPaymentType}
                            setterValue="qr_pay"
                            setStep={setStep}
                            showDesc={sendPaymentType === "qr_pay"}
                            active={sendPaymentType === "qr_pay"}
                            sendPaymentType={sendPaymentType}
                            shrinkWidth={data.step === 4 && data.payment_type?.value === "wallet"}
                        />
                        {
                            sendPaymentType === "qr_pay" &&
                            (
                                data?.transaction_details
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
                                            "--min-width": data.step === 4 && data.payment_type?.value === "wallet" ? "65vw" : "55vw"
                                        }}
                                    >
                                        <div className={styles.left}>
                                            <div className={styles.l_top}>
                                                <h1>{t("Send Money")}</h1>
                                                <h2>{data.step === 5 && data.showCard ? t("Select Or Add Payment Card") : t(leftSideContent?.[data.step - 1])}</h2>
                                            </div>
                                            {
                                                data.step === 4
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
                                                                    data={data}
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
                                                                                    <strong>{data?.exchange_rate?.paypal?.fee?.currency}</strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
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
                                                                                        }}>1.00 {data?.exchange_rate?.paypal?.fee?.currency} = {Number(data?.exchange_rate?.paypal?.paypal_rate?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
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
                                                                                    }}>{Number(data?.exchange_rate?.paypal?.paypal_converted?.value)} USD</strong>
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
                                                data.step === 1
                                                &&
                                                (
                                                    data.beneficiary?._id
                                                        ?
                                                        <QRRecipient
                                                            wallet={{ ...data.beneficiary, ...data.beneficiary_wallet }}
                                                            dataHandler={dataHandler}
                                                        />
                                                        :
                                                        <QRCodeScan
                                                            setSubStep={() => { }}
                                                            dataHandler={dataHandler}
                                                        />
                                                )
                                            }
                                            {
                                                data.step === 2
                                                &&
                                                <StepTwo
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    getExchangeRate={getExchangeRate}
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
                                                data.step === 4
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
                                                    <>
                                                        {
                                                            !data.showCard
                                                                ?
                                                                <StepFive
                                                                    data={data}
                                                                />
                                                                :
                                                                <CreditCard
                                                                    url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                    tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                    data={data}
                                                                    dataHandler={dataHandler}
                                                                />
                                                        }
                                                        {
                                                            data.showOtpModal
                                                            &&
                                                            <OtpConfirmation
                                                                callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                                isLoading={data.loading}
                                                                isOpen={data.showOtpModal}
                                                                toggle={() => {
                                                                    dataHandler("showOtpModal", false)
                                                                }}
                                                                resendHandler={sendOtp}
                                                                error={data.otpError}
                                                            />
                                                        }
                                                    </>
                                                )
                                            }
                                            <div className={styles.bottom}>
                                                <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                    <HelpCircle size={16} />
                                                    {t("Trouble Sending Money")}
                                                </Link>
                                                <div className={styles?.buttons}>
                                                    {
                                                        data.step > 1
                                                        &&
                                                        <button className={styles.transparent} disabled={data.loading} onClick={() => {
                                                            if (data.step === 4 && data.payment_type?.value) {
                                                                dataHandler("payment_type", {})
                                                                dataHandler("payment_duration", {})
                                                                dataHandler("show_payment_type", false)
                                                            }
                                                            else if (data.step === 4 && data.payment_type?.value === "card") {
                                                                dataHandler("payment_type", {})
                                                                dataHandler("showCard", false)
                                                                dataHandler("step", data.step - 1)
                                                            }
                                                            // else if (data.step === 5) {
                                                            //     dataHandler("payment_type", {})
                                                            //     dataHandler("payment_duration", {})
                                                            //     dataHandler("show_payment_type", false)
                                                            //     dataHandler("step", data.step - 1)
                                                            //     dataHandler("showCard", false)
                                                            //     dataHandler("wallet", {})
                                                            // }
                                                            else if (data.step === 5) {
                                                                dataHandler("showCard", false)
                                                                dataHandler("step", data.step - 2)
                                                            }
                                                            else {
                                                                dataHandler("step", data.step - 1)
                                                            }
                                                        }}>{t("Back")}</button>
                                                    }
                                                    <button disabled={disabledButton || data.loading} onClick={handleClick}>
                                                        {

                                                            data.step === 5
                                                                ?
                                                                t("Confirm")
                                                                :
                                                                t("Next")
                                                        }
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            data.step === 4 && data.payment_type?.value === "wallet" && !data.show_payment_type
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
                        <div className={styles.m_top}>
                            <h1>{t("SEND MONEY")}</h1>
                            <h2>{data.payment_type?.value === "card" ? t("Select Or Add Payment Card") : t(leftSideContent?.[data.step - 1])}</h2>
                        </div>
                        <div className={styles.flow}>
                            {
                                data?.transaction_details
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
                                                data.step === 4 && !data.show_payment_type && (data.payment_type?.value === "wallet" || data.payment_type?.sub_name)
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
                                                            (
                                                                data.beneficiary?._id
                                                                    ?
                                                                    <QRRecipientMobile
                                                                        wallet={{ ...data.beneficiary, ...data.beneficiary_wallet }}
                                                                        dataHandler={dataHandler}
                                                                    />
                                                                    :
                                                                    <AddQRDetails
                                                                        setSubStep={() => { }}
                                                                        dataHandler={dataHandler}
                                                                    />
                                                            )
                                                        }
                                                        {
                                                            data.step === 2
                                                            &&
                                                            <StepTwo
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                                getExchangeRate={getExchangeRate}
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
                                                            data.step === 4
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
                                                                <>
                                                                    {
                                                                        !data.showCard
                                                                            ?
                                                                            <StepFive
                                                                                data={data}
                                                                            />
                                                                            :
                                                                            <CreditCard
                                                                                url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                                tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                                data={data}
                                                                                dataHandler={dataHandler}
                                                                            />
                                                                    }
                                                                    {
                                                                        data.showOtpModal
                                                                        &&
                                                                        <OtpConfirmation
                                                                            callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : verifyOtp}
                                                                            data={data}
                                                                            dataHandler={dataHandler}
                                                                            isLoading={data.loading}
                                                                            isOpen={data.showOtpModal}
                                                                            toggle={() => {
                                                                                dataHandler("showOtpModal", false)
                                                                            }}
                                                                            resendHandler={sendOtp}
                                                                            error={data.otpError}
                                                                        />
                                                                    }
                                                                </>
                                                            )
                                                        }
                                                    </>
                                            }
                                        </div>
                                        <div className={styles.bottom}>
                                            <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                <HelpCircle size={16} />
                                                {t("Trouble Sending Money")}
                                            </Link>
                                            <div className={styles.buttons}>
                                                {
                                                    data.step > 1
                                                    &&
                                                    <button disabled={data.loading} onClick={() => {
                                                        if (data.step === 4 && data.payment_type?.value) {
                                                            dataHandler("payment_type", {})
                                                            dataHandler("payment_duration", {})
                                                            dataHandler("show_payment_type", false)
                                                        }
                                                        else if (data.step === 4 && data.payment_type?.value === "card") {
                                                            dataHandler("payment_type", {})
                                                            dataHandler("showCard", false)
                                                            dataHandler("step", data.step - 1)
                                                        }
                                                        // else if (data.step === 5) {
                                                        //     dataHandler("payment_type", {})
                                                        //     dataHandler("payment_duration", {})
                                                        //     dataHandler("show_payment_type", false)
                                                        //     dataHandler("step", data.step - 1)
                                                        //     dataHandler("showCard", false)
                                                        //     dataHandler("wallet", {})
                                                        // }
                                                        else if (data.step === 5) {
                                                            dataHandler("showCard", false)
                                                            dataHandler("step", data.step - 2)
                                                        }
                                                        else {
                                                            dataHandler("step", data.step - 1)
                                                        }
                                                    }}>
                                                        <ChevronLeft />
                                                    </button>
                                                }
                                                <button className={styles.full} disabled={disabledButton || data.loading} onClick={handleClick}>
                                                    {
                                                        data.step === 5
                                                            ?
                                                            t("Confirm")
                                                            :
                                                            t("Next")
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </>
                            }
                        </div>
                    </div>
            }
        </>
    )
}

export default QRFlow