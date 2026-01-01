import { useTranslation } from "react-i18next";
import SendActionCard from "../Common/SendActionCard";
import styles from "./styles/index.module.css"
import React, { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import w3 from "../files/airtime.png"
import airtime from "../files/airtime.svg"
import ErrorModal from "../InternationalFlow/ErrorModal";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import cardStyles from "../styles/SendActionCard.module.scss"
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import StepFive from "./StepFive";
import OtpConfirmation from "../InternationalFlow/OtpConfirmation";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { LimitsErrorMessage } from "../OTPConfirmation";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather";
import WalletsComponent from "../InternationalFlow/WalletsComponent";
import CreditCard from "../InternationalFlow/CreditCard";
import { toast } from "react-toastify";
import { createShambeToken } from "../../../Helper/CreateToken";
import NotFoundModal from "../../NotFound/NotFoundModal";
import Receipt from "../InternationalFlow/Receipt";
import InstaPayLoader from "../../Loader";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import errors from "../../AddFunds/TrustPaymentErrors.json"
import StepTwoE from "../Esim/StepTwo"
import StepFourE from "../Esim/StepFour"
import ReceiptE from "../Esim/Receipt"
import countries from "../../CitiesDropDown/CitiesData.json"
import PrevModal from "./PrevModal";

const initialState = {
    loading: false,
    flow: "",
    error: "",
    step: 1,
    country: {},
    recipient: "",
    providers: [],
    operator: {},
    other_operators: [],
    service: 1,
    service_types: [],
    service_type: {},
    packages: [],
    package: {},
    airtime_amount: 0,
    payment_type: {},
    package_details: {},
    show_otp: false,
    otpError: "",
    codeType: "sms",
    created_transaction: {},
    verified: false,
    wallet: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    saveCard: false,
    cardError: "",
    selectedSavedCard: {},
    cardTransactionDetails: {},
    showCard: false,
    default_wallet: {},
    localWallet: {},
    eSimData: {
        region: "",
        selectedPlan: {},
        phone: "",
        email: '',
        simsModal: false
    }
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        // other cases can be added here
        case "UPDATE_FIELD_ESIM":
            return {
                ...state,
                eSimData: {
                    ...state.eSimData,
                    [action.field]: action.value
                }
            }


        default:
            return state;
    }
}

const Airtime = ({ setCurrentFlow, setAction, setStep }) => {
    const navigate = useNavigate()
    const { authHeader, userWallets, userDetails, setProfileLockTime } = useContext(UserContext)
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState)

    const updateDataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };

    const updateEsimHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD_ESIM", field, value })
    }
    useEffect(() => {
        if (userDetails?.tfa) {
            updateDataHandler("codeType", "authenticator")
        }
    }, [userDetails])



    useEffect(() => {
        if (userWallets?.length > 0 && countries) {
            const localCurrency = countries?.find(c => c?.iso3 === userDetails?.country_iso_code)?.currency
            let localWallet;

            if (localCurrency) {
                const wallet = userWallets?.find(item => item?.currency?.code === localCurrency)

                if (wallet && !wallet?.blocked && !wallet?.admin_blocked && wallet?.status?.toLowerCase() === "active") {
                    localWallet = wallet
                } else {
                    localWallet = userWallets?.find(item => item?.default)
                }


            } else {
                localWallet = userWallets?.find(item => item?.default)
            }

            updateDataHandler("localWallet", localWallet)
        }
    }, [userWallets])
    useEffect(() => {
        if (userDetails) {
            if (userDetails.phone) {
                updateEsimHandler("phone", userDetails.phone)
            }
            if (userDetails.email) {
                updateEsimHandler("email", userDetails.email)
            }
        }
    }, [userDetails])



    useEffect(() => {
        const getCountryOperators = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/dt/country-operators/${data.country?.alpha3}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log("other_operators =", dec?.data)
                updateDataHandler("other_operators", dec?.data)
            } catch (error) {
                updateDataHandler("other_operators", [])
            }
        }

        if (data.country?.alpha3) {
            getCountryOperators()
        }
    }, [data.country?.alpha3])

    const getPackageRates = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/dt/service-products-details/${data.localWallet?._id}/${data.package?.id || data.eSimData.selectedPlan?.productId}`, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            return dec?.data?.token
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            updateDataHandler("error", decrypted?.message ?? decrypted ?? "We cannot process your request at the moment, please try again later.")
        }
    }

    const getPackageDetails = async () => {
        updateDataHandler("loading", true)
        try {
            // const dataa = data.airtime_amount > 0 && data.service_type?.name?.toLowerCase()?.includes("airtime") ? {
            //     amount: data.airtime_amount,
            //     type: "RANGED_VALUE_RECHARGE",
            //     type: "Other"
            // } : {
            //     type: "Other"
            // }
            // // console.log(data)
            // const enc = encryptData(dataa);
            // const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/products/${data.package?.id}`, {
            //     data: enc
            // }, {
            //     headers: authHeader
            // })
            const isOpenRange = +String(data?.airtime_amount)?.replaceAll(",", "") > 0 && data.service_type?.name?.toLowerCase()?.includes("airtime");

            console.log(data.wallet, data.payment_type)
            const dataa =
            {
                "product_id": data?.package?.id || data.eSimData.selectedPlan?.productId,
                "payment_method": data.payment_type?.value,
                "wallet_id": data.payment_type?.value === "wallet" ? data.wallet?._id : data.localWallet?._id,
                "sub_service_id": data.flow === "e-sim" ? 14 : data.service_type?.id || 12,
                "local_wallet_id": data?.localWallet?._id,
                "type": data.flow === "e-sim" && "esim"
            }
            if (isOpenRange) {
                dataa.amount = +String(data?.airtime_amount)?.replaceAll(",", "")
            } else {
                const token = await getPackageRates()
                dataa.token = token
            }
            console.log(dataa)
            const enc = encryptData(dataa);

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/${isOpenRange ? "get-ranged-airtime-rates" : "rates"}`, {
                data: enc
            }, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data);
            console.log("package_details", decrypted)
            updateDataHandler("package_details", decrypted)
            updateDataHandler("step", data.step + 1)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            updateDataHandler("error", decrypted?.message ?? decrypted ?? "We cannot process your request at the moment, please try again later.")
        }
        finally {
            updateDataHandler("loading", false)
        }
    }


    const createTransaction = async (codeType = "") => {
        try {
            const payload = {
                data: {
                    wallet_id: data.wallet?._id,
                    token: data.package_details?.data?.token,
                    number: data.recipient ? `+${data.recipient}` : data.eSimData.phone ? `+${data.eSimData.phone}` : `+${userDetails.phone}`,
                    type: data.flow === "e-sim" && "esim"
                },
                type: codeType || data.codeType
            }



            if (data.eSimData.email) {
                payload.data.email = data.eSimData.email
            }
            const encrypted = encryptData(payload)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            updateDataHandler("created_transaction", dec)
            console.log("otpshow", "transactioncreated")
            updateDataHandler("show_otp", true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            updateDataHandler("error", dec?.message ?? "Something went wrong while confirming the transaction.")

        }
    }


    const verifyOtp = async (otp) => {
        updateDataHandler("loading", true)
        // const isFixedAirtime = data.service_type?.id === 11 && !data.packages?.[0]?.baseAmount
        // console.log(isFixedAirtime)
        try {
            const dataa = {
                token: data.created_transaction?.token,
                otp,
                type: data.codeType
            }
            console.log(dataa)
            const enc = encryptData(dataa)

            // const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/confirm${isFixedAirtime ? "-airtime" : ""}-transaction`, {    
            const isOpenRange = +String(data?.airtime_amount)?.replaceAll(",", "") > 0 && data.service_type?.name?.toLowerCase()?.includes("airtime");
            let url;

            if (data.flow === "airtime") {
                if (data.payment_type.value === "paypal") {
                    url = `${import.meta.env.VITE_IP_DEV_API}${isOpenRange ? "/api/paypal/initiate-airtime-ranged-payment" : "/api/paypal/initiate-airtime-fixed-payment"}`
                } else {
                    url = `${import.meta.env.VITE_IP_DEV_API}/api/dt/confirm${isOpenRange ? "-ranged" : ""}-airtime-transaction`
                }
            }
            else {
                if (data.payment_type.value === "wallet") {
                    url = `${import.meta.env.VITE_IP_DEV_API}/api/dt/confirm-esim-transaction`
                }
                else if (data.payment_type.value === "paypal") {
                    url = `${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-esim`
                }
            }
            const res = await axios.post(url, { data: enc }, { headers: authHeader })

            const dec = decryptData(res.data.data)
            console.log(dec)
            if (data.payment_type.value === "paypal") {
                window.location.href = dec.url
            }
            updateDataHandler("verified", true)
            updateDataHandler("show_otp", false)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
            if (error) {
                updateDataHandler("otpError", error)
            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            } else {
                updateDataHandler("otpError", decrypted?.message ?? "Something went wrong while verifying OTP!")
            }
        }
        finally {
            updateDataHandler("loading", false)
        }
    }


    const onClickHandler = () => {
        const array = [1, 2, 4]
        if (array.includes(data.step)) {
            if (data.step === 4) {

                if (!data.showCard) {
                    updateDataHandler("showCard", true)
                } else {
                    getPackageDetails()
                }
            }
            else {
                updateDataHandler("step", data.step + 1)
            }
        }
        if (data.step === 3) {
            updateDataHandler("step", data.step + 1)
        }
        if (data.step === 5) {
            if (data.verified) {
                navigate("/dashboard")
            } else {
                createTransaction()
            }
        }
    }

    // const disabled = () => {
    //     let disabled = false;
    //     const walletCheck = data.payment_type?.value === "wallet" ? !data.wallet?._id : false
    //     const cardCheck = data.payment_type?.value === "card" ? !data?.selectedSavedCard?._id && (!data.cardHolderName || !data.cardNumber || !data.cvc || !data.expiry || data.cardError) : false
    //     if (data.step === 1) {
    //         disabled = !data.flow
    //     }
    //     if (data.step === 2) {
    //         disabled = !data.providers?.[0]?.name || data.recipient?.length < 9
    //     }
    //     if (data.step === 3) {
    //         disabled = data.package?.baseAmount ? data.airtime_amount < data.package?.baseAmount?.min || data.airtime_amount > data.package?.baseAmount?.max : !data.package?.name
    //     }
    //     if (data.step === 4) {
    //         disabled = !data.payment_type?.name || walletCheck || cardCheck
    //     }
    //     return disabled
    // }

    const disabled = useMemo(() => {
        switch (data.step) {
            case 1:
                return !data.flow

            case 2:
                return !data.providers?.[0]?.name || data.recipient?.length < 9

            case 3:
                return data.package?.baseAmount ? +String(data?.airtime_amount)?.replaceAll(",", "") < data.package?.baseAmount?.min || +String(data?.airtime_amount)?.replaceAll(",", "") > data.package?.baseAmount?.max : !data.package?.name

            case 4:
                // return !data.payment_type?.name || data.payment_type?.value === "wallet" ? !data.wallet?._id : data.payment_type?.value === "card" ? !data?.selectedSavedCard?._id && (!data.cardHolderName || !data.cardNumber || !data.cvc || !data.expiry || data.cardError) : false
                if (data.payment_type?.value === "wallet") {
                    return !data.wallet?._id
                } else if (data.payment_type?.value === "card") {
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
                return false
        }
    }, [data])
    // toast.success(data.wallet?._id)

    const [showCardModal, setShowCardModal] = useState(false)

    const initiateCardPayment = async (otp) => {
        updateDataHandler("loading", true)
        try {
            const payload = {
                token: data.created_transaction?.token,
                otp: otp,
                type: data.codeType,
                panData: {
                    wallet_id: data.localWallet?._id,
                    number: data.recipient ? `+${data.recipient}` : data.eSimData.phone ? `+${data.eSimData.phone}` : `+${userDetails.phone}`,
                    payment_type: data.payment_type?.value ?? "card",
                    airtime_token: data.package_details?.data?.token,
                    type: data.flow === "e-sim" && "esim"
                }
            }

            if (data.flow === "e-sim" && data.eSimData.email) {
                payload.panData.email = data.eSimData.email;
            }
            data.selectedSavedCard?._id ? payload.panData.pan = data.selectedSavedCard?._id : payload.panData.is_card_save = data?.saveCard
            data.selectedSavedCard?._id ? console.log("") : payload.panData.se_shambey = createShambeToken(data)

            const enc = encryptData(payload)

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiate${data.selectedSavedCard?._id ? "-pan" : ""}-airtime-transaction`,
                { data: enc },
                { headers: authHeader }
            )
            const dec = decryptData(res.data.data)
            console.log(dec)
            updateDataHandler("cardTransactionDetails", dec)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data)
            console.log(decrypted)
            if (decrypted?.message === "invalid_card_details") {
                setShowCardModal(true)
            }
            else {
                const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                updateDataHandler("otpError", decrypted?.message ?? "You have entered wrong OTP.")
                if (error) {
                    updateDataHandler("otpError", error)
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
            updateDataHandler("loading", false)
        }
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const transaction_status = queryParams.get("transaction_status")
    const error_in_funds = queryParams.get("error_in_funds")
    const code = queryParams.get("code")

    useEffect(() => {
        const error_message = () => {
            return errors.find(item => item?.code == code)?.message
        }
        if (transaction_status === "error") {
            updateDataHandler("error", error_message() ?? error_in_funds?.toLowerCase() === "true" ? "We encountered an issue processing your selected payment method. Please try again later." : "We encountered an issue processing your Airtime, but your funds have been securely added to your wallet. Kindly check your transaction record, and when ready, you may retry the transfer at your convenience.")
        }
        if (transaction_status === "aborted") {
            updateDataHandler("error", error_message() ?? "It appears that the add funds request was canceled. Please try again later when you're ready.")
        }
    }, [transaction_status])


    const otpConfirmJSX = () => (
        data.show_otp
        &&
        <OtpConfirmation
            callback={data.payment_type?.value === "card" ? initiateCardPayment : verifyOtp}
            // callback={verifyOtp}
            data={data}
            dataHandler={updateDataHandler}
            isLoading={data.loading}
            isOpen={data.show_otp}
            toggle={() => {
                updateDataHandler("show_otp", false)
            }}
            resendHandler={createTransaction}
            error={data.otpError}
        />
    )


    return (
        <>
            {
                data.cardTransactionDetails?.transaction_id
                    ?
                    <TrustpaymentPage
                        amount={+String(data.amount)?.replaceAll(",", "")}
                        card_cvc={data.cvc}
                        card_expiry={data.expiry}
                        card_number={data.cardNumber}
                        currency={data.currency_wallet?.currency?.code}
                        transaction={data.cardTransactionDetails}
                        paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm${data.selectedSavedCard?._id ? "-pan" : ""}-airtime-transaction/${data.cardTransactionDetails?.transaction_id}`}
                        tokenUrl={() => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm${data.selectedSavedCard?._id ? "-pan" : ""}-airtime-transaction/${data.cardTransactionDetails?.transaction_id}`}
                    />
                    :
                    <></>
            }
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => setShowCardModal(false)}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    reEnter={() => updateDataHandler("step", 4)}
                    title="Airtime Failed"
                />
            }
            <PrevModal
                toggle={() => updateEsimHandler("simsModal", false)}
                isOpen={data.eSimData.simsModal}
                isMobile={window.innerWidth < 1000}
            />
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.main_container}>
                        {
                            data.error
                            &&
                            <ErrorModal
                                heading={data.step === 2 ? data?.error?.includes("operator") ? "Operator not available" : "Incorrect Phone Number" : "Transaction Failed"}
                                isOpen={data.error}
                                toggle={() => {
                                    updateDataHandler("error", "")
                                    // updateDataHandler("step", 1)
                                    // navigate("/payments")
                                }}
                                message={data.error}
                            />
                        }
                        <div
                            style={{ height: "650px !important", maxWidth: "320px !important", aspectRatio: "unset !important", width: "fit-content", minWidth: window.innerWidth > 1650 ? "270px" : "200px", minHeight: "650px" }}
                            className={cardStyles.container}
                        >
                            <img alt="" src={w3} className={cardStyles.bg} />
                            <div className={cardStyles.item_dets}
                                style={{ justifyContent: "space-between", minHeight: "650px" }}
                            >
                                <div>
                                    <img src={airtime} alt={""} style={window.innerWidth > 1650 ? { height: "40px", width: "40px", objectFit: "contain" } : { height: "30px", width: "30px", objectFit: "contain" }} />
                                    <h5
                                        style={{ fontSize: window.innerWidth > 1650 ? "2rem" : "1.2rem" }}
                                    >{t("SEND TOP-UP AND E-SIM")}</h5>
                                </div>
                                <p style={{ height: "fit-content", fontSize: window.innerWidth > 1650 ? ".75rem" : ".6rem" }}>{t("Keep yourself and your loved ones connected and covered, no matter where you are! InstaPay's Send Top-up service allows you to instantly recharge mobile phones, get eSIMs, purchase branded vouchers & gift cards, and pay for utilities & bills in over 150 countries. Ideal for gifts or ensuring you always have what you need, our service is designed for ease, speed, and security.")}</p>
                            </div>
                        </div>
                        {
                            data.verified || transaction_status
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
                                <div className={styles.content}>
                                    <div className={styles.left} style={{ justifyContent: "space-between", padding: "0 1.5rem" }}>
                                        <div>
                                            {
                                                data.flow
                                                &&
                                                <h1 style={{ marginBottom: "20px" }}>{t("Send Top-up")}</h1>
                                            }
                                            <h2>

                                                {data.flow === "e-sim" ? "eSim"
                                                    :
                                                    <>
                                                        {
                                                            data.step === 1
                                                            &&
                                                            t("SEND TOP-UP AND E-SIM")
                                                        }
                                                        {
                                                            data.step === 2
                                                            &&
                                                            t("Send Top-up")
                                                        }
                                                        {
                                                            data.step === 3
                                                            &&
                                                            t("available sunservices")
                                                        }
                                                        {
                                                            data.step === 4
                                                            &&
                                                            t("Select Payment Type")
                                                        }
                                                        {
                                                            data.step === 5
                                                            &&
                                                            (
                                                                data.verified
                                                                    ?
                                                                    t("Top-Up Initiated")
                                                                    :
                                                                    t("Top-Up Summary")
                                                            )
                                                        }

                                                    </>
                                                }
                                            </h2>
                                        </div>

                                        {data.flow === "e-sim" &&
                                            <div>
                                                <button onClick={() => updateEsimHandler("simsModal", true)} className={styles.manageBtn}>{t("Manage purchased eSIM")}</button>
                                            </div>
                                        }
                                    </div>
                                    <div className={styles.right} style={data.step === 4 && data.payment_type?.value === "wallet" ? { display: "flex" } : {}}>
                                        {
                                            data.step === 1
                                            &&
                                            <StepOne
                                                setCurrentFlow={setCurrentFlow} setAction={setAction} setStep={setStep}
                                                data={data}
                                                dataHandler={updateDataHandler}
                                            />
                                        }
                                        {
                                            data.step === 2
                                            &&
                                            <StepTwo
                                                data={data}
                                                dataHandler={updateDataHandler}
                                                eSimDataHandler={updateEsimHandler}
                                            />
                                        }
                                        {
                                            data.step === 3
                                            &&
                                            (data.flow === "airtime" ?
                                                <StepThree
                                                    getPackageDetails={getPackageDetails}
                                                    data={data}
                                                    dataHandler={updateDataHandler}
                                                /> :
                                                <StepTwoE
                                                    data={data}
                                                    dataHandler={updateDataHandler}
                                                    dataHandlerE={updateEsimHandler}
                                                />
                                            )
                                        }
                                        {
                                            data.step === 4
                                            &&
                                            (
                                                data.showCard
                                                    ?
                                                    <div className={styles.card}>
                                                        <CreditCard
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                            url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-airtime${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}/${data.service_type?.id === 11 && !data.packages?.[0]?.baseAmount ? "fixed" : "hulululu"}`}
                                                            tokenUrl={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-airtime${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}/${data.service_type?.id === 11 && !data.packages?.[0]?.baseAmount ? "fixed" : "hulululu"}`}
                                                        />
                                                        <div className={styles.buttons}>
                                                            <button disabled={data.loading} onClick={() => {
                                                                if (data.payment_type?.value === "card" && data.showCard) {
                                                                    updateDataHandler("showCard", false)
                                                                }
                                                                else {
                                                                    updateDataHandler("step", 3)
                                                                }
                                                            }} className={styles.trs}>{t("Back")}</button>
                                                            <button disabled={data.loading || !data.payment_type?.name || (!data?.selectedSavedCard?._id && (!data.cardHolderName || !data.cardNumber || !data.cvc || !data.expiry || data.cardError))} onClick={() => {
                                                                if (data.payment_type?.value === "card" && !data.showCard) {
                                                                    updateDataHandler("showCard", true)
                                                                } else {
                                                                    getPackageDetails()
                                                                }
                                                            }}>
                                                                {t("Next")}
                                                                <ChevronRight color="white" size={17} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    :
                                                    <StepFour
                                                        getPackageDetails={getPackageDetails}
                                                        data={data}
                                                        updateDataHandler={updateDataHandler}
                                                    />
                                            )
                                        }
                                        {
                                            data.step === 5
                                            &&
                                            <>
                                                {
                                                    data.flow === "airtime" ?
                                                        <StepFive
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                            createTransaction={createTransaction}
                                                        /> :
                                                        <StepFourE
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                            dataHandlerE={updateEsimHandler}
                                                        />
                                                }



                                                {otpConfirmJSX()}
                                            </>
                                        }
                                        {
                                            data.step === 4 && data.payment_type?.value === "wallet"
                                                ?
                                                <WalletsComponent
                                                    data={data}
                                                    dataHandler={updateDataHandler}
                                                />
                                                : ""
                                        }
                                        {data.step === 6 && (
                                            <>
                                                <ReceiptE
                                                    data={data}
                                                    dataHandler={updateDataHandler}
                                                    createTransaction={createTransaction}
                                                />

                                                {otpConfirmJSX()}
                                            </>
                                        )}
                                    </div>
                                </div>
                        }
                    </div>
                    :
                    <div className={styles.mobile}>
                        {
                            data.error
                            &&
                            <ErrorModal
                                heading={data.step === 2 ? "Phone Number Error" : "Transaction Failed"}
                                isOpen={data.error}
                                toggle={() => {
                                    updateDataHandler("error", "")
                                    // updateDataHandler("step", 1)
                                    // navigate("/payments")
                                }}
                                message={data.error}
                            />
                        }
                        {
                            data.verified || transaction_status
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
                                    <div className={styles.flow}>
                                        {
                                            <>
                                                {data.flow === "e-sim" &&
                                                    <div style={{ width: "100%", marginBottom: "15px" }}>
                                                        <button style={{ width: "100%" }} onClick={() => updateEsimHandler("simsModal", true)} className={styles.manageBtn}>{t("Manage purchased eSIM")}</button>
                                                    </div>
                                                }
                                                {
                                                    data.step === 1
                                                    &&
                                                    <StepOne
                                                        setCurrentFlow={setCurrentFlow} setAction={setAction} setStep={setStep}
                                                        data={data}
                                                        dataHandler={updateDataHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 2
                                                    &&
                                                    <StepTwo
                                                        data={data}
                                                        dataHandler={updateDataHandler}
                                                        eSimDataHandler={updateEsimHandler}
                                                    />
                                                }
                                                {
                                                    data.step === 3
                                                    &&
                                                    (data.flow === "airtime" ?
                                                        <StepThree
                                                            getPackageDetails={getPackageDetails}
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                        /> :
                                                        <StepTwoE
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                            dataHandlerE={updateEsimHandler}
                                                        />
                                                    )
                                                }
                                                {
                                                    data.step === 4
                                                    &&
                                                    (
                                                        data.showCard
                                                            ?
                                                            <div className={styles.card}>
                                                                <CreditCard
                                                                    data={data}
                                                                    dataHandler={updateDataHandler}
                                                                    url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-airtime${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}/${data.service_type?.id === 11 && !data.packages?.[0]?.baseAmount ? "fixed" : "hulululu"}`}
                                                                    tokenUrl={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-airtime${data.selectedSavedCard?._id ? "-pan" : ""}-transaction/${data.cardTransactionDetails?.transaction_id}/${data.cardTransactionDetails?.intlToken}/${data.service_type?.id === 11 && !data.packages?.[0]?.baseAmount ? "fixed" : "hulululu"}`}
                                                                />
                                                                {/* <div className={styles.buttons}>
                                                            <button disabled={data.loading} onClick={() => updateDataHandler("step", 3)} className={styles.trs}>{t("Back")}</button>
                                                            <button disabled={data.loading || !data.payment_type?.name} onClick={() => updateDataHandler("step", 5)}>
                                                                {t("Next")}
                                                                <ChevronRight color="white" size={17} />
                                                            </button>
                                                        </div> */}
                                                            </div>
                                                            :
                                                            <StepFour
                                                                getPackageDetails={getPackageDetails}
                                                                data={data}
                                                                updateDataHandler={updateDataHandler}
                                                            />
                                                    )
                                                }
                                                {
                                                    data.step === 5
                                                    &&
                                                    <>
                                                        {
                                                            data.flow === "airtime" ?
                                                                <StepFive
                                                                    data={data}
                                                                    dataHandler={updateDataHandler}
                                                                    createTransaction={createTransaction}
                                                                /> :
                                                                <StepFourE
                                                                    data={data}
                                                                    dataHandler={updateDataHandler}
                                                                    dataHandlerE={updateEsimHandler}
                                                                />
                                                        }
                                                        {otpConfirmJSX()}
                                                    </>
                                                }
                                                {data.step === 6 && (
                                                    <>
                                                        <ReceiptE
                                                            data={data}
                                                            dataHandler={updateDataHandler}
                                                            createTransaction={createTransaction}
                                                        />


                                                        {otpConfirmJSX()}
                                                    </>
                                                )}
                                            </>
                                        }
                                    </div>
                                    {/* {
                            data.step > 1
                            && */}
                                    {(data.flow !== "e-sim" || data.step === 1) &&
                                        <div className={styles.bottom}>
                                            <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                                <HelpCircle size={16} />
                                                {t("Trouble Sending Money")}
                                            </Link>

                                            {data.step !== 4 &&
                                                <div className={styles?.buttons} >
                                                    <button disabled={data.loading} onClick={() => {
                                                        if (data.verified) {
                                                            navigate("/transactions")
                                                        } else {
                                                            if (data.step === 1) {
                                                                setCurrentFlow("")
                                                                setAction("")
                                                                setStep(1)
                                                            } else if (data.payment_type?.value) {
                                                                updateDataHandler("showCard", false)
                                                                updateDataHandler("payment_type", {})
                                                                updateDataHandler("step", data.step - 1)
                                                            } else {
                                                                updateDataHandler("step", data.step - 1)
                                                            }
                                                        }
                                                    }}>
                                                        <ChevronLeft />
                                                    </button>
                                                    <button disabled={data.loading || disabled} className={styles.full} onClick={onClickHandler}>
                                                        {
                                                            data.step === 5
                                                                ?
                                                                data.verified
                                                                    ?
                                                                    t("Dashboard")
                                                                    :
                                                                    t("Confirm")
                                                                :
                                                                t("Continue")
                                                        }
                                                    </button>
                                                </div>}
                                        </div>
                                    }
                                    {/* } */}
                                </>
                        }
                    </div>
            }
        </>
    )
}

export default Airtime