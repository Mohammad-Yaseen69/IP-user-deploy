import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.css"
import { useEffect, useMemo, useReducer, useState } from "react";
import StepOne from "./StepOne";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, HelpCircle, Info, X } from "react-feather";
import Country from "./Country";
import CreditCard from "../../PaymentsNewer/InternationalFlow/CreditCard";
import PhoneInput from "../../PhoneInput";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import FeesComponent from "../../PaymentsNewer/InternationalFlow/FeesComponent";
import InstaPayLoader from "../../Loader";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import PaypalCurrencies from "../../AddFunds/PaypalCurrencies.json"
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import { PaymentReviewSVG } from "./Svgs";
import int_styles from "../../PaymentsNewer/Mobile/styles/International.module.css"
import paym_styles from "../../PaymentsNewer/InternationalFlow/styles/index.module.css"
import ErrorModal from "../../PaymentsNewer/InternationalFlow/ErrorModal";
import { createShambeToken } from "../../../Helper/CreateToken";
import NotFoundModal from "../../NotFound/NotFoundModal";


const initialState = {
    loading: false,
    step: 1,
    payment_type: {},
    country: {},
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolderName: "",
    cardError: "",
    cardTransactionDetails: {},
    fullName: "",
    phone: "",
    email: "",
    exchange_rate: {},
    exchange_rate_error: "",
    paypal_fx: {},
    error: "",
    phone_error: ""
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
    "Select Your Country",
    "Select Payment Type",
    "Enter card details",
    "Enter Personal Details"
]

const PayAsGuest = ({ amount, isOpen, toggle, user, wallet, username }) => {
    const { t } = useTranslation()
    const [data, dispatch] = useReducer(reducer, initialState)
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };


    const initiatePaypalPayment = async () => {
        dataHandler("loading", true)
        try {
            const payload = encryptData({
                token: data.exchange_rate?.paypal_token,
                name: data.fullName,
                email: data.email,
                phone: data.phone
            })
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/initiate-paypal`, {
                data: payload
            })

            const dec = decryptData(res.data.data)
            window.location.href = dec?.url;
        }
        catch (error) {
            const dec = decryptData(error?.response?.data?.data);
            dataHandler("error", dec?.message ?? "Something went wrong.")
            dataHandler("loading", false)
        }
        finally {
        }
    }
    const [showCardModal, setShowCardModal] = useState(false)
    const initiateCardPayment = async () => {
        dataHandler("loading", true)
        try {
            const payload = encryptData({
                se_shambey: createShambeToken(data),
                token: data.exchange_rate?.token,
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                iso_code: data.country?.alpha3

            })
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/initiate-card-payment`, {
                data: payload
            })

            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("cardTransactionDetails", dec)
        }
        catch (error) {
            const dec = decryptData(error?.response?.data?.data);
            if (dec?.message === "Invalid card.") {
                setShowCardModal(true)
            }
            dataHandler("error", dec?.message ?? "Something went wrong.")
            dataHandler("loading", false)
        }
        finally {
        }
    }

    const checkIfPhoneIsValid = async (callback) => {
        dataHandler("loading", true)
        dataHandler("phone_error", "")
        try {
            const payload = { number: `+${data.phone}` }
            const enc = encryptData(payload)

            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
                data: enc
            })
            const decrypted = decryptData(res.data.data)
            console.log(decrypted)
            callback()
        }
        catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
            dataHandler("phone_error", "Incorrect phone number, please enter a valid number.")
        }
        finally {
            dataHandler("loading", false)
        }
    }

    const onClickHandler = () => {
        switch (data.step) {
            case 1:
                dataHandler("step", 2)
                break;
            case 2:
                dataHandler("step", 3)
                break;
            case 3:
                if (data.payment_type?.value === "card") {
                    dataHandler("step", 4)
                }
                else {
                    checkIfPhoneIsValid(() => dataHandler("step", 4))
                }
                break;
            case 4:
                if (data.payment_type?.value === "paypal") {
                    initiatePaypalPayment();
                } else {
                    checkIfPhoneIsValid(() => dataHandler("step", 5))
                }
                break;
            case 5:
                if (data.payment_type?.value === "card") {
                    initiateCardPayment();
                } else {
                    // dataHandler("step", 5)
                }
                break;

            default:
                break;
        }
    }
    const onBackClickHandler = () => {
        switch (data.step) {
            case 1:
                toggle()
                break;
            case 2:
                dataHandler("step", 1)
                break;
            case 3:
                dataHandler("step", 2)
                break;
            case 4:
                dataHandler("step", 3)
                break;
            case 5:
                dataHandler("step", 4)
                break;

            default:
                break;
        }
    }

    const disabled = useMemo(() => {
        let disabled = false;
        if (data.step === 1) {
            disabled = !data.country?.name
        }
        if (data.step === 2) {
            disabled = !data.payment_type?.value
        }
        if (data.step === 3) {
            if (data.payment_type?.value === "paypal") {
                disabled = data.fullName.length < 3 || data.phone.length < 9 || (data.email?.length > 0 ? !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email) : false)
            }
            if (data.payment_type?.value === "card") {
                const [contentMonth, contentYear] = data.expiry.split("/").map(Number);
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear() % 100;

                const isValidExpiry = contentYear > currentYear ||
                    (contentYear === currentYear && contentMonth > currentMonth);
                return !data.selectedSavedCard?._id && (!data.cardNumber || !data.expiry || !isValidExpiry || !data.cvc || data.cvc?.length < 3 || !data.cardHolderName)
            }
        }
        if (data.step === 4) {
            if (data.payment_type?.value === "card") {
                disabled = data.fullName.length < 3 || data.phone.length < 9 || (data.email?.length > 0 ? !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email) : false)
            }
        }
        return disabled;
    }, [data])

    const getFeesPaypal = async () => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/paypal-fee/${wallet?.wallet_id}/${amount}`)
            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("exchange_rate", {
                fee: { amount: dec?.data?.fee, paymentAddressFee: dec?.data?.paymentAddressFee },
                sending: { currency: wallet?.currency?.code, amount: amount },
                receiver: { currency: wallet?.currency?.code, amount: dec?.data?.recipient_amount },
                total: dec?.data?.total_amount,
                paypal_token: dec?.data?.token,
                rate: dec?.data?.rate
            })

            dataHandler("paypal_fx", {
                amount: dec?.data?.converted_amount,
                exchange_rate: dec?.data?.rate
            })
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data);
            dataHandler("exchange_rate_error", dec?.message ?? "Something went wrong.")
            console.log(dec)
        } finally {
            dataHandler("loading", false)
        }
    }

    const getFeesCard = async () => {
        dataHandler("loading", true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/card-fee/${wallet?.wallet_id}/${amount}`)
            const dec = decryptData(res.data.data)
            console.log(dec)
            dataHandler("exchange_rate", {
                fee: { amount: dec?.feeDetails, paymentAddressFee: dec?.paymentAddressFee },
                sending: { currency: wallet?.currency?.code, amount: amount },
                receiver: { currency: wallet?.currency?.code, amount: dec?.recipient_amount },
                total: dec?.total,
                token: dec?.token
            })
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data);
            dataHandler("exchange_rate_error", dec?.message ?? "Something went wrong.")
            console.log(dec)
        } finally {
            dataHandler("loading", false)
        }
    }

    useEffect(() => {
        if (data.payment_type?.value === "paypal") {
            getFeesPaypal()
        }
        if (data.payment_type?.value === "card") {
            getFeesCard()
        }
    }, [data.payment_type])

    const [allowed, setAllowed] = useState([])
    useEffect(() => {
        const getPayouts = async () => {
            dataHandler("loading", true)
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/payment-methods/${user?.level?._id}`)
                const dec = decryptData(res.data.data)
                setAllowed(dec?.data ?? [])
            }
            catch (error) {
                const dec = decryptData(error.response.data.data)
                dataHandler("error", dec?.message)
            }
            finally {
                dataHandler("loading", false)
            }
        }

        if (user?.level?._id) {
            getPayouts()
        }
    }, [user])

    console.log(data.exchange_rate?.fee?.paymentAddressFee)


    return (
        <>
            {
                showCardModal
                &&
                <NotFoundModal
                    isOpen={showCardModal}
                    toggle={() => setShowCardModal(false)}
                    buttonText="Close"
                    messages={[
                        `Oops! It looks like the card you entered isn’t recognized as being issued in ${data.country?.name}.`,
                        `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${data.country?.name} to complete your transaction.`,
                        `Thank you for your understanding!`
                    ]}
                    title="Payment Failed"
                    reEnter={() => dataHandler("step", 3)}
                />
            }
            {
                data.cardTransactionDetails?.transaction_ref
                &&
                <TrustpaymentPage
                    amount={amount}
                    card_cvc={data.cvc}
                    card_expiry={data.expiry}
                    card_number={data.cardNumber}
                    currency={wallet?.currency?.code}
                    transaction={data.cardTransactionDetails}
                    url={`${process.env.REACT_APP_IP_DEV_API}/api/guest-pay/confirm-card-payment/${data.cardTransactionDetails?.transaction_ref}`}
                    guestUserName={username}
                    guestWallet={wallet}
                    guestUser={user}
                    guestDetails={{
                        name: data.fullName,
                        phone: data.phone,
                        email: data.email
                    }}
                    compareToken={false}
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
                window.innerWidth > 1000
                    ?
                    <Modal isOpen={isOpen} style={{ width: "100vw", maxWidth: "1000px" }} contentClassName={styles.content}>
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
                            <div className={styles.left}>
                                <div className={styles.l_top}>
                                    <h1>{t("PAY AS A GUEST")}</h1>
                                    <h2>
                                        {
                                            data.step === 1
                                            &&
                                            "Select Your Country"
                                        }
                                        {
                                            data.step === 2
                                            &&
                                            "Select Payment Type"
                                        }
                                        {
                                            data.step === 3
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Enter Card Details"
                                                    :
                                                    "Enter Your Personal Details"
                                            )
                                        }
                                        {
                                            data.step === 4
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Enter Your Personal Details"
                                                    :
                                                    "Review Payment"
                                            )
                                        }
                                        {
                                            data.step === 5
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Review Payment"
                                                    :
                                                    ""
                                            )
                                        }
                                    </h2>
                                </div>
                                {
                                    data.step > 1
                                    &&
                                    <div className={styles.l_bottom}>
                                        {
                                            data.loading
                                                ?
                                                <div style={{ height: "200px", width: "200px" }}>
                                                    <InstaPayLoader />
                                                </div>
                                                :
                                                <>
                                                    <FeesComponent
                                                        data={data}
                                                        receiverLabel={`They will get  ${data?.exchange_rate?.fee?.paymentAddressFee ? `(after a ${Number(data?.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? "0.00"} ${data.exchange_rate?.sending?.currency} receiver fee deduction)` :""}`}
                                                        error={data.exchange_rate_error}
                                                        feesLabel="Fees"
                                                        sendingLabel="Sending"
                                                        totalLabel="Amount To Pay"
                                                        bright={true}
                                                        extraContent={
                                                            data.payment_type?.value === "card" && data.step > 3
                                                                ?
                                                                <div className={styles.card_dets}>
                                                                    <div className={styles.cd_top}>
                                                                        <span>{t("You are using")}</span>
                                                                        <button onClick={() => dataHandler("step", 3)}>{t("Change")}</button>
                                                                    </div>
                                                                    <div className={styles.cd_bot}>
                                                                        <h5>Card ending {data.cardNumber?.slice(data?.cardNumber?.length - 5, data?.cardNumber?.length)}</h5>
                                                                        <span>Exp date: {data.expiry}</span>
                                                                    </div>
                                                                </div>
                                                                :
                                                                ""
                                                        }
                                                    />
                                                    {
                                                        data.payment_type?.value === "paypal" && !PaypalCurrencies.some(item => item === wallet?.currency?.code)
                                                            ?
                                                            <>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "flex-start",
                                                                        gap: ".7rem",
                                                                        padding: "12px",
                                                                        borderRadius: "6px",
                                                                        background: "rgba(255, 218, 68, 0.24)"
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
                                                                        <strong>{wallet?.currency?.code} </strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
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
                                                                            }}>1.00 {wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)} USD</strong>
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
                                                                        }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                                                                    </div>
                                                                </div>
                                                            </>
                                                            :
                                                            ""
                                                    }
                                                </>
                                        }
                                    </div>
                                }
                            </div>
                            <div className={styles.right}>
                                {
                                    data.step === 1
                                    &&
                                    <Country
                                        data={data}
                                        dataHandler={dataHandler}
                                    />
                                }
                                {
                                    data.step === 2
                                    &&
                                    <StepOne
                                        data={data}
                                        dataHandler={dataHandler}
                                        allowed={allowed}
                                    />
                                }
                                {
                                    data.step === 3
                                    &&
                                    (
                                        data.payment_type?.value === "card"
                                            ?
                                            <div style={{ height: "100%" }}>
                                                <div className={styles.bot_top}>
                                                    <h5>{t("Payment Details")}</h5>
                                                    <span>{t("Complete your payment by providing your payment details")}</span>
                                                </div>
                                                <CreditCard
                                                    showSave={false}
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                    tokenUrl={e => ""}
                                                    url={""}
                                                    showCards={false}
                                                />
                                            </div>
                                            :
                                            data.payment_type?.value === "paypal"
                                                ?
                                                <RecipientDetails
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                                :
                                                ""

                                    )
                                }
                                {
                                    data.step === 4
                                    &&
                                    (
                                        data.payment_type?.value === "paypal"
                                            ?
                                            // <StepFive
                                            <PaymentDetails
                                                dataHandler={dataHandler}
                                                data={data}
                                                amount={amount}
                                            />
                                            :
                                            data.payment_type?.value === "card"
                                                ?
                                                <RecipientDetails
                                                    data={data}
                                                    dataHandler={dataHandler}
                                                />
                                                :
                                                ""
                                    )
                                }
                                {
                                    data.step === 5
                                    &&
                                    (
                                        data.payment_type?.value === "card"
                                            ?
                                            // <StepFive
                                            <PaymentDetails
                                                dataHandler={dataHandler}
                                                data={data}
                                                amount={amount}
                                            />
                                            :
                                            ""
                                    )
                                }
                                <div className={styles.bottom} style={{ marginTop: "auto" }}>
                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                        <HelpCircle size={16} />
                                        {t("Trouble Sending Money")}
                                    </Link>
                                    <div className={styles?.buttons}>
                                        <button className={styles.transparent} disabled={data.loading} onClick={onBackClickHandler}>{t("Back")}</button>
                                        <button disabled={data.loading || disabled} onClick={onClickHandler}>
                                            {
                                                t("Next")
                                            }
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                    </Modal>
                    :
                    <div className={styles.payment_flow_mobile}>
                        <div className={int_styles.container}>
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
                            {/* <div className={int_styles.top}>
                                <button className={int_styles.back_btn} onClick={toggle}>
                                    <ChevronLeft />
                                </button>
                                <h5>{t("")}</h5>
                                <div>
                                    <img src={recent} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                                </div>
                            </div> */}

                            <div className={paym_styles.mobile} style={{ marginTop: 0 }}>
                                <div className={paym_styles.m_top}>
                                    <h1>{t("Pay As Guest")}</h1>
                                    <h2>
                                        {
                                            data.step === 1
                                            &&
                                            "Select Your Country"
                                        }
                                        {
                                            data.step === 2
                                            &&
                                            "Select Payment Type"
                                        }
                                        {
                                            data.step === 3
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Enter Card Details"
                                                    :
                                                    "Enter Your Personal Details"
                                            )
                                        }
                                        {
                                            data.step === 4
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Enter Your Personal Details"
                                                    :
                                                    "Review Payment"
                                            )
                                        }
                                        {
                                            data.step === 5
                                            &&
                                            (
                                                data.payment_type?.value === "card"
                                                    ?
                                                    "Review Payment"
                                                    :
                                                    ""
                                            )
                                        }
                                    </h2>
                                </div>
                            </div>
                            <div className={paym_styles.flow}>
                                {
                                    data.step === 2 && data?.payment_type?.value
                                        ?
                                        data.loading
                                            ?
                                            <div style={{ height: "200px", width: "200px" }}>
                                                <InstaPayLoader />
                                            </div>
                                            :
                                            <>
                                                <FeesComponent
                                                    data={data}
                                                    receiverLabel={"They will get"}
                                                    error={data.exchange_rate_error}
                                                    feesLabel="Fees"
                                                    sendingLabel="Sending"
                                                    totalLabel="Amount To Pay"
                                                    bright={true}
                                                    extraContent={
                                                        data.payment_type?.value === "card" && data.step > 3
                                                            ?
                                                            <div className={styles.card_dets}>
                                                                <div className={styles.cd_top}>
                                                                    <span>{t("You are using")}</span>
                                                                    <button onClick={() => dataHandler("step", 3)}>{t("Change")}</button>
                                                                </div>
                                                                <div className={styles.cd_bot}>
                                                                    <h5>Card ending {data.cardNumber?.slice(data?.cardNumber?.length - 5, data?.cardNumber?.length)}</h5>
                                                                    <span>Exp date: {data.expiry}</span>
                                                                </div>
                                                            </div>
                                                            :
                                                            ""
                                                    }
                                                />
                                                {
                                                    data.payment_type?.value === "paypal" && !PaypalCurrencies.some(item => item === wallet?.currency?.code)
                                                        ?
                                                        <>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "flex-start",
                                                                    gap: ".7rem",
                                                                    padding: "12px",
                                                                    borderRadius: "6px",
                                                                    background: "rgba(255, 218, 68, 0.24)"
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
                                                                    <strong>{wallet?.currency?.code} </strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
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
                                                                        }}>1.00 {wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
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
                                                                    }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
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
                                <div className={paym_styles.flow_com} style={{ minHeight: "50vh" }}>
                                    {
                                        data.step === 1
                                        &&
                                        <Country
                                            data={data}
                                            dataHandler={dataHandler}
                                        />
                                    }
                                    {
                                        data.step === 2
                                        &&
                                        <StepOne
                                            data={data}
                                            dataHandler={dataHandler}
                                            allowed={allowed}
                                        />
                                    }
                                    {
                                        data.step === 3
                                        &&
                                        (
                                            data.payment_type?.value === "card"
                                                ?
                                                <div style={{ height: "100%" }}>
                                                    <div className={styles.bot_top}>
                                                        <h5>{t("Payment Details")}</h5>
                                                        <span>{t("Complete your payment by providing your payment details")}</span>
                                                    </div>
                                                    <CreditCard
                                                        showSave={false}
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                        tokenUrl={e => ""}
                                                        url={""}
                                                        showCards={false}
                                                    />
                                                </div>
                                                :
                                                data.payment_type?.value === "paypal"
                                                    ?
                                                    <RecipientDetails
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    ""

                                        )
                                    }
                                    {
                                        data.step === 4
                                        &&
                                        (
                                            data.payment_type?.value === "paypal"
                                                ?
                                                // <StepFive
                                                <>
                                                    <PaymentDetails
                                                        dataHandler={dataHandler}
                                                        data={data}
                                                        amount={amount}
                                                    />
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
                                                            <strong>{wallet?.currency?.code} </strong> is not supported by Paypal, <strong>USD</strong> will be used as the default currency.
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
                                                                }}>1.00 {wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
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
                                                            }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                data.payment_type?.value === "card"
                                                    ?
                                                    <RecipientDetails
                                                        data={data}
                                                        dataHandler={dataHandler}
                                                    />
                                                    :
                                                    ""
                                        )
                                    }
                                    {
                                        data.step === 5
                                        &&
                                        (
                                            data.payment_type?.value === "card"
                                                ?
                                                // <StepFive
                                                <PaymentDetails
                                                    dataHandler={dataHandler}
                                                    data={data}
                                                    amount={amount}
                                                />
                                                :
                                                ""
                                        )
                                    }
                                </div>

                                <div className={paym_styles.bottom} style={{ flexDirection: "column-reverse", margin: "2rem 0", gap: "1.5rem" }}>
                                    <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                        <HelpCircle size={16} />
                                        {t("Trouble Sending Money")}
                                    </Link>
                                    <div className={paym_styles?.buttons}>
                                        <button className={styles.transparent} disabled={data.loading} onClick={onBackClickHandler}>
                                            <ChevronLeft />
                                        </button>
                                        <button disabled={data.loading || disabled} onClick={onClickHandler} style={{ width: "100%" }}>
                                            {t("Next")}
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

export default PayAsGuest

const RecipientDetails = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "100%" }}>
            <div className={styles.bot_top}>
                <h5>{t("Personal Details")}</h5>
                <span>{t("Please finalize your payment by entering the required personal information.")}</span>
            </div>

            <div className={styles.personal}>
                <div className={styles.inpt_co}>
                    <label>{t("Full Name")} <span>*</span> </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={data.fullName}
                        onChange={e => dataHandler("fullName", e.target.value)}
                    />
                </div>
                <div className={styles.inpt_co}>
                    <label>{t("Phone Number")} <span>*</span> </label>
                    <PhoneInput
                        country={data.country?.alpha3}
                        setPhone={e => dataHandler("phone", e)}
                        disabledDropdown={true}
                        phone={data.phone}
                    />
                    {
                        data?.phone_error
                        &&
                        <div style={{ color: "red", fontWeight: 500, marginTop: ".5rem" }}>
                            {t("Incorrect phone number, please enter a valid number.")}
                        </div>
                    }
                </div>
                <div className={styles.inpt_co}>
                    <label>{t("Email")} ({t("Optional")}) </label>
                    <input
                        required={true}
                        type="email"
                        placeholder="ie: abc@gmail.com"
                        value={data.email}
                        onChange={e => dataHandler("email", e.target.value.trim())}
                    />
                    {
                        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email) && data.email.length > 0
                            ?
                            <span style={{ fontWeight: "600", color: "red", padding: ".4rem .7rem" }}>
                                Please enter a valid email address.
                            </span>
                            :
                            ""
                    }
                </div>
            </div>
        </div>
    )
}

const PaymentDetails = ({ data, amount, dataHandler }) => {
    const { t } = useTranslation()
    return (
        <div style={{ height: "100%" }}>
            <div className={styles.bot_top}>
                <h5>{t("Review your payment details")}</h5>
                <span>{t("Please take a few moments to carefully review and verify the information to your payment details.")}</span>
            </div>
            <div className={styles.recipient_amount_details}>
                <span>{t("You have to pay")}</span>
                <h5>{Number(data.exchange_rate?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span>{data.exchange_rate?.sending?.currency}</span></h5>
                <div><PaymentReviewSVG /></div>
            </div>
            <div className={styles.other_details}>
                {
                    data.payment_type?.value === "card"
                    &&
                    <div className={styles.card_dets} style={{ padding: "1rem" }}>
                        <div className={styles.cd_top} style={{ alignItems: "flex-start" }}>
                            <span>{t("You are using")}</span>
                            <div className={styles.cd_bot}>
                                <h5>Card ending {data.cardNumber?.slice(data?.cardNumber?.length - 5, data?.cardNumber?.length)}</h5>
                                <span>Exp date: {data.expiry}</span>
                            </div>
                            <button onClick={() => dataHandler("step", 3)}>{t("Change")}</button>
                        </div>
                    </div>
                }
                <div className={styles.aao_item}>
                    <span>{t("Sending")}</span>
                    <span>{Number(data.exchange_rate?.sending?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                </div>
                <div className={styles.aao_item}>
                    <span>{t("Transfer Fees")}</span>
                    <span>{Number(data.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                </div>
                <div className={styles.aao_item}>
                    <span>{t("Estimated Time")}</span>
                    <span>{t("within minutes")}</span>
                </div>
                <div className={styles.aao_item}>
                    <span>{t("Receiver Gets")} {t("(Including fee)")}</span>
                    <span>{Number(data.exchange_rate?.receiver?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                </div>
                <div className={styles.total}>
                    <span>{t("Total")}</span>
                    <span>{Number(data.exchange_rate?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                </div>
            </div>
        </div>
    )
}