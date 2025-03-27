import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation";
import { useNavigate } from "react-router";
import { Modal, ModalBody } from "reactstrap";
import Receipt from "../PaymentsNewer/InternationalFlow/Receipt";
import InstaPayLoader from "../Loader";
import FeesComponent from "../PaymentsNewer/InternationalFlow/FeesComponent";
import StepFour from "../PaymentsNewer/InternationalFlow/StepFour";
import CreditCard from "../PaymentsNewer/InternationalFlow/CreditCard";
import StepFive from "../PaymentsNewer/WalletToWalletFlow/StepFive";
import OtpConfirmation from "../PaymentsNewer/InternationalFlow/OtpConfirmation";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, Info, X } from "react-feather";
import WalletsComponent from "../PaymentsNewer/InternationalFlow/WalletsComponent";
import MobileWalletServices from "../PaymentsNewer/InternationalFlow/MobileWalletServices";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import styles from "../PendingNew/PaymentsFlow/Modal.module.css"
import int_styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import paym_styles from "../PaymentsNewer/InternationalFlow/styles/index.module.css"
import { toast } from "react-toastify";
import recent from "../PaymentsNewer/Mobile/files/recent.svg"
import { createShambeToken } from "../../Helper/CreateToken";
import NotFoundModal from "../NotFound/NotFoundModal";
import TrustpaymentPage from "../AddFunds/WalletFund/CreditTransaction";

const initialState = {
    step: 1,
    payment_type: {},
    amount: 0,
    payers: {},
    currency: {},
    currency_wallet: {},
    wallet: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: "",
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    codeType: "sms",
    show_otp: false,
    show_receipt: false,
    show_wallets: false,
    show_cards: false,
    show_payers: false,
    loading: false,
    otp_error: "",
    verified: false,
    exchange_rate: {},
    exchange_rate_error: "",
    error: "",
    payment_token: "",
    recipient_currency: "",
    mobile_wallet_merchant: "",
    mobile_wallet_channels: [],
    mobile_wallet_services: [],
    mobile_wallet_channel: {},
    mobile_wallet_service: {},
    beneficiary: {}
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        default:
            return state;
    }
}

const headings = [
    "",
    "Select Payment Method",
    "Select the Currency",
]

const AcceptQuotation = ({ isOpen, toggle, item, type = "receive" }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState);
    const { userWallets, userDetails, authHeader, setProfileLockTime, verifyToken } = useContext(UserContext)
    const navigate = useNavigate()
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };
    useEffect(() => {
        if (userDetails?.tfa) {
            dataHandler("codeType", "authenticator")
        }
    }, [userDetails])

    useEffect(() => {
        dataHandler("amount", Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        dataHandler("recipient_currency", item?.amount_reciever_currency?.currency?.code)
        dataHandler("beneficiary", type === "receive" ? item?.sender : item?.receiver)
    }, [item])
    useEffect(() => {
        const def = userWallets?.[0]?.wallet_type === "insta" && !userWallets?.[0]?.blocked && !userWallets?.[0]?.admin_blocked && userWallets?.[0]?.status?.toLowerCase() === "active"
            ?
            userWallets?.[0]
            :
            userWallets?.find(item => item?.default)
        dataHandler("currency_wallet", def)
        dataHandler("currency", def)
    }, [userWallets])

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
                return false
            default:
                return false;
        }
    }, [data])

    const handleBackClick = () => {
        switch (data.step) {
            case 1:
                if (data.payment_type?.value === "wallet" && data.wallet?._id) {
                    dataHandler("wallet", {})
                    dataHandler("payment_type", {})
                }
                else if (data.payment_type?.value === "mobile") {
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

    const getExchangeRate = async (setLimitType = () => { }) => {
        dataHandler("loading", true)
        dataHandler("exchange_rate_error", "")
        dataHandler("exchange_rate", {})
        try {
            const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code}&to=${item?.amount_reciever_currency?.currency?.code}&amount=${item?.status?.toLowerCase()?.includes("accepted") ? item?.revised_amount : item?.amount}&type=quotation&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=${data.payment_type?.value ?? "wallet"}&receiver_wallet_id=${item?.amount_reciever_currency?._id}&sender_wallet_id=${data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id}&payment_method=request`
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

            if (decrypted?.data?.paypal) exchange_rate_details.paypal = decrypted?.data?.paypal;

            dataHandler("exchange_rate", exchange_rate_details)
            if (+item?.amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("daily")
            }
            else if (+item?.amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("monthly")
            }
            else if (+item?.amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
                dataHandler("exchange_rate_error", "exceed send")
                setLimitType("yearly")
            }
            else {
                if (item?.amount <= exchange_rate_details?.fee?.amount) {
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
            dataHandler("error", "Something went wrong while getting mobile wallet channels.")
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

    useEffect(() => {
        if (data.payment_type?.value) {
            getExchangeRate()
        }
    }, [data.payment_type, data.wallet])

    const sendOtp = async (codeType = "") => {
        dataHandler("loading", true)
        try {
            const payload = {
                data: {
                    receiver_wallet_id: data.payment_type?.value !== "wallet" ? data.currency_wallet?._id : data.wallet?._id,
                    quotation_id: item?._id,
                    "token": data.payment_type?.value === "paypal" ? data.exchange_rate?.token : ""
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
            // console.log(dec)
            dataHandler("show_otp", true)
            dataHandler("payment_token", dec?.token)
        } catch (error) {
            const err = decryptData(error.response.data.data)
            toast.error(err.message ?? "Something went wrong!")
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
                        type: "quotation",
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
                        type: "quotation",
                        body: {
                            otp: otp,
                            token: data.payment_token
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
                dataHandler("otp_error", decrypted?.message ?? "You have entered wrong OTP.")
                if (error) {
                    dataHandler("otp_error", error)
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
            console.log(data)
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

    const acceptRequest = async (otp) => {
        dataHandler("loading", true)
        try {
            const formdata = new FormData()
            formdata.append("token", data.payment_token)
            formdata.append("otp", otp)
            formdata.append("type", data.codeType)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/quotation/quotation-wallet-to-wallet`, formdata, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            dataHandler("verified", true)
        } catch (err) {
            console.log(err)
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            dataHandler("otp_error", decrypted?.message ?? "You have entered wrong OTP.")
            if (error) {
                dataHandler("otp_error", error)
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

    const handleClick = () => {
        switch (data.step) {
            case 1:
                if (data.payment_type?.value === "wallet") {
                    dataHandler("step", data.step + 1)
                    dataHandler("show_receipt", true)
                }
                if (data.payment_type?.value === "mobile") {
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
                    title="Accept Quotation Failed"
                    reEnter={() => {
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
                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                        tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                    />
                    :
                    <></>
            }
            {
                window.innerWidth > 1000
                    ?
                    <Modal
                        isOpen={isOpen}
                        style={{
                            width: "96vw",
                            maxWidth: data.step === 1 && (data.payment_type?.value === "wallet" || data.payment_type?.sub_name) ? "1300px" : "1050px",
                            transition: "500ms"
                        }}
                        contentClassName={styles.content}
                    >
                        <ModalBody className={styles.body} style={{ position: "relative" }}>
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
                                            verifyToken()
                                            toggle()
                                        }}
                                        showBack={true}
                                    />
                                    :
                                    <>
                                        <div className={styles.left}>
                                            <h1>{t("Accept Quotation")}</h1>
                                            <h2>
                                                {
                                                    data.step === 1
                                                    &&
                                                    t("Select Payment Type")
                                                }
                                                {
                                                    data.step === 2 &&
                                                    (
                                                        data.show_cards
                                                            ?
                                                            t("Select Or Add Payment Card")
                                                            :
                                                            data.show_receipt
                                                                ?
                                                                t("Review Payment")
                                                                :
                                                                ""
                                                    )
                                                }
                                            </h2>

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
                                                                                }}>{Number(data?.exchange_rate?.paypal?.paypal_converted?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
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
                                        <div className={styles.right} style={{ minWidth: "550px" }}>
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
                                                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                        tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    ""
                                            }
                                            {
                                                data.step === 2 && data.show_receipt
                                                    ?
                                                    <StepFive
                                                        showMid={false}
                                                        sending_currency={item?.amount_reciever_currency?.currency?.code}
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    ""
                                            }
                                            {
                                                data.show_otp
                                                &&
                                                <OtpConfirmation
                                                    callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : acceptRequest}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    isLoading={data.loading}
                                                    isOpen={data.show_otp}
                                                    toggle={() => {
                                                        dataHandler("show_otp", false)
                                                    }}
                                                    resendHandler={sendOtp}
                                                    error={data.otp_error}
                                                />
                                            }
                                            <div className={styles.bottom}>
                                                <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                    <HelpCircle size={16} />
                                                    {t("Trouble Sending Money")}
                                                </Link>
                                                <div className={styles?.buttons}>
                                                    <button className={styles.transparent} disabled={data.loading} onClick={handleBackClick}>{t("Back")}</button>
                                                    <button disabled={disabledButton || data.loading} onClick={handleClick}>
                                                        {
                                                            // userDetails?.user?.kyc_status === "approved"
                                                            //     ?
                                                            //     (
                                                            data.step === 2 && data.show_receipt
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
                                    <h1>{t("Accept Quotation")}</h1>
                                    <h2>
                                        {
                                            data.step === 1
                                            &&
                                            t("Select Payment Type")
                                        }
                                        {
                                            data.step === 2 &&
                                            (
                                                data.show_cards
                                                    ?
                                                    t("Select or Add Payment Card")
                                                    :
                                                    data.show_receipt
                                                        ?
                                                        t("Review Payment")
                                                        :
                                                        ""
                                            )
                                        }
                                    </h2>
                                </div>
                            </div>
                            <div className={paym_styles.flow}>

                                <div className={paym_styles.flow_com} style={{ minHeight: "50vh" }}>
                                    {
                                        data.verified
                                            ?
                                            <Receipt
                                                data={data}
                                                backHandler={() => {
                                                    verifyToken()
                                                    toggle()
                                                }}
                                                showBack={true}
                                            />
                                            :
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
                                                                url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                tokenUrl={(t) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w${data.selectedSavedCard?._id ? "-pan" : ""}-payment-confirmation/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken ?? data.cardTransactionDetails?.w2w_data}`}
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                            />
                                                            :
                                                            ""
                                                    }
                                                    {
                                                        data.step === 2 && data.show_receipt
                                                            ?
                                                            <StepFive
                                                                showMid={false}
                                                                sending_currency={item?.amount_reciever_currency?.currency?.code}
                                                                data={data}
                                                                dataHandler={dataHandler}
                                                            />
                                                            :
                                                            ""
                                                    }
                                                    {
                                                        data.show_otp
                                                        &&
                                                        <OtpConfirmation
                                                            callback={data.payment_type?.value === "card" ? initiateCardPayment : data.payment_type?.value === "paypal" ? initiatePaypalPayment : acceptRequest}
                                                            data={data}
                                                            dataHandler={dataHandler}
                                                            isLoading={data.loading}
                                                            isOpen={data.show_otp}
                                                            toggle={() => {
                                                                dataHandler("show_otp", false)
                                                            }}
                                                            resendHandler={sendOtp}
                                                            error={data.otp_error}
                                                        />
                                                    }
                                                </>
                                    }
                                </div>
                                <div className={paym_styles.bottom} style={{ flexDirection: "column-reverse", margin: "2rem 0", gap: "1.5rem" }}>
                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                        <HelpCircle size={16} />
                                        {t("Trouble Sending Money")}
                                    </Link>
                                    <div className={paym_styles?.buttons}>
                                        <button disabled={data.loading} onClick={handleBackClick}>
                                            <ChevronLeft />
                                        </button>
                                        <button disabled={disabledButton || data.loading} className={paym_styles.full} onClick={handleClick}>
                                            {
                                                // userDetails?.user?.kyc_status === "approved"
                                                //     ?
                                                //     (
                                                data.step === 2 && data.show_receipt
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
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default AcceptQuotation