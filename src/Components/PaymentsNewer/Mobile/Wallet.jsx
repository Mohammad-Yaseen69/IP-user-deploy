import { useTranslation } from "react-i18next";
import styles from "./styles/International.module.css"
import { useContext, useEffect, useState } from "react";
import { ChevronLeft } from "react-feather";
import TopIcon from "./files/Top";
import { useLocation, useNavigate } from "react-router";
import WalletDetails from "./WalletDetails";
import AmountAndCurrency from "./AmountAndCurrency";
import PaymentType from "./PaymentType";
import ConfirmSendWallet from "./ConfirmSendWallet";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../../Context/UserContext";
import OTPConfirmation from "../OTPConfirmation";
import WalletReceipt from "../WalletReceipt";
import Recursive from "./Recursive";
import SchedulePayment from "./Schedule";
import PWizard from "../PWizard";
import WalletToWalletFlow from "../WalletToWalletFlow";

const WalletTransferMobile = ({ step, setStep, setCurrentFlow, setSendPaymentType, sendPaymentType, setAction }) => {
    const { t } = useTranslation()
    const { userWallets, authHeader, userDetails } = useContext(UserContext)
    const [subStep, setSubStep] = useState(1)
    const [wallet, setWallet] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("100.00")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState([])
    const [confirmed, setConfirmed] = useState(false)
    const [paymentType, setPaymentType] = useState("")
    const [notInstant, setNotInstant] = useState(false)
    const [extra, setExtra] = useState("")

    // recursive payment
    const [recursiveType, setRecursiveType] = useState("Weekly")
    const [unlimited, setUnlimited] = useState(false)
    const [recDay, setRecDay] = useState("Monday")
    const [recCycle, setRecCycle] = useState(0)
    const [recStartDate, setRecStartDate] = useState("")

    // schedule payment
    const [scheduleDate, setScheduleDate] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")

    // conditionals
    const [showStatus, setShowStatus] = useState(false)

    const [transactionDetails, setTransactionDetails] = useState(null)
    const [walletDetails, setWalletDetails] = useState(null)
    const [payment_type, setPayment_Type] = useState("wallet_to_wallet")

    // token
    const [token, setToken] = useState("")

    useEffect(() => {
        if (wallet) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-by-wallet-id/${wallet}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    if (decrypted.status === true) {
                        setWalletDetails(decrypted.walletDetails)
                    }
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    // console.log(decrypted)
                })
        }
    }, [wallet])

    useEffect(() => {
        if (recursiveType === "Monthly") {
            setRecDay("")
        } else {
            setRecDay("Monday")
        }
    }, [recursiveType])

    useEffect(() => {
        setSubStep(1)
        setWallet("")
        setCurrency("USD")
        setAmount("100.00")
        setReason("")
        setComment("")
        setFiles([])
        setConfirmed(false)
        setPaymentType("")
        setNotInstant(false)
        setRecursiveType("Weekly")
        setUnlimited(false)
        setRecDay("Monday")
        setRecCycle(0)
        setRecStartDate("")
        setScheduleDate("")
        setScheduleTime("")
    }, [sendPaymentType])

    const timelineData = [
        {
            id: Math.random() * Date.now(),
            name: `You choosed INSTA-PAY#STASSY`
        },
        {
            id: Math.random() * Date.now(),
            name: `You sent ${amount} ${currency}`
        },
        {
            id: Math.random() * Date.now(),
            name: "Your Payment is being processed."
        },
    ]


    // if there is wallet id in query parameters
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_id = queryParams.get("wallet_id")
    const payment_type_q = queryParams.get("payment_type")

    useEffect(() => {
        if (wallet_id && sendPaymentType === "wallet_to_wallet") {
            setWallet(wallet_id)
        }
    }, [wallet_id, sendPaymentType])

    useEffect(() => {
        if (payment_type_q) {
            setPayment_Type(payment_type_q)
        }
    }, [payment_type_q])

    const navigate = useNavigate()

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [sendType, setSendType] = useState("wallet")
    const [saveCard, setSaveCard] = useState(false)
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <button className={styles.back_btn} disabled={step === 6 && confirmed} onClick={() => {
                    if (step === 7) {
                        setStep(1)
                        setCurrentFlow("")
                        setSendPaymentType("")
                        setAction("")
                        navigate("/payments")
                    }
                    else {
                        if (step === 3) {
                            setCurrentFlow("")
                            setSendPaymentType("")
                        }
                        setStep(prev => prev - 1)
                    }
                }}>
                    <ChevronLeft />
                </button>
                <h5>{t("Wallet To Wallet").toUpperCase()}</h5>
                <div>
                    <TopIcon fill={step > 3 ? "#5926f0" : "black"} />
                </div>
            </div>
            <WalletToWalletFlow
                sendPaymentType={sendPaymentType}
                setIsWallet={() => { }}
                setSendPaymentType={setSendPaymentType}
                setStep={setStep}
            />
            {/* {
                step < 6
                &&
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                    <PWizard subStep={step - 2} />
                </div>
            }
            <div className={styles.bottom}>
                {
                    step === 3
                    &&
                    <WalletDetails wallet={wallet} setStep={setStep} setWallet={setWallet} />
                }
                {
                    step === 4
                    &&
                    <AmountAndCurrency
                        amount={amount}
                        setAmount={setAmount}
                        currency={currency}
                        setCurrency={setCurrency}
                        comment={comment}
                        setComment={setComment}
                        reason={reason}
                        setReason={setReason}
                        setFiles={setFiles}
                        files={files}
                        paymentType="wallet"
                        setStep={setStep}
                        walletDetails={walletDetails}
                        exchangeType={payment_type_q === "payment_address" ? "payment_address" : "wallet_to_wallet"}
                        cardNumber={cardNumber}
                        expiry={expiry}
                        cvc={cvc}
                        cardHolderName={cardHolderName}
                        setCardNumber={setCardNumber}
                        setExpiry={setExpiry}
                        setCVC={setCVC}
                        setCardHolderName={setCardHolderName}
                        saveCard={saveCard}
                        setSaveCard={setSaveCard}
                        sendType={sendType}
                        setSendType={setSendType}
                    />
                }
                {
                    step === 5 && !notInstant
                    &&
                    <PaymentType
                        paymentMethod={paymentType}
                        setPaymentMethod={setPaymentType}
                        setStep={setStep}
                        setNotInstant={setNotInstant}
                        sendType={sendType}
                    />
                }
                {
                    step === 5 && paymentType.value === "subscription" && notInstant
                    &&
                    <Recursive
                        setSubStep={setStep}
                        recursiveType={recursiveType}
                        setRecursiveType={setRecursiveType}
                        unlimited={unlimited}
                        setUnlimited={setUnlimited}
                        recDay={recDay}
                        setRecDay={setRecDay}
                        recCycle={recCycle}
                        setRecCycle={setRecCycle}
                        recStartDate={recStartDate}
                        setRecStartDate={setRecStartDate}
                    />
                }
                {
                    step === 5 && paymentType.value === "schedule" && notInstant
                    &&
                    <SchedulePayment
                        scheduleDate={scheduleDate}
                        setScheduleDate={setScheduleDate}
                        scheduleTime={scheduleTime}
                        setScheduleTime={setScheduleTime}
                        setSubStep={setStep}
                    />
                }
                {
                    step === 6 && !confirmed
                    &&
                    <div className="mt-4">
                        <h5 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", textAlign: "center" }}>{t("Confirm Your Payment")}</h5>
                        <ConfirmSendWallet
                            amount={amount}
                            currency={currency}
                            paymentType={paymentType}
                            setConfirmed={setConfirmed}
                            setNotInstant={setNotInstant}
                            setPaymentType={setPaymentType}
                            setSubStep={setStep}
                            wallet={walletDetails}
                            paymentDetails={{
                                receiver_wallet_id: wallet,
                                sender_wallet_id: userWallets.filter(item => item.currency.code === currency)[0]?._id,
                                purpose: reason,
                                amount: +amount,
                                type: paymentType?.value,
                                recCycle,
                                recStartDate,
                                unlimited,
                                scheduleDate,
                                scheduleTime,
                                payment_type,
                                comment,
                                files
                            }}
                            setToken={setToken}
                        />
                    </div>
                }
                {
                    step === 6 && confirmed
                    &&
                    <OTPConfirmation setSubStep={setStep}
                        type="wallet"
                        paymentDetails={{
                            receiver_wallet_id: wallet,
                            sender_wallet_id: userWallets.filter(item => item.currency.code === currency)[0]?._id,
                            purpose: reason,
                            amount: +amount,
                            type: paymentType?.value,
                            recCycle,
                            recStartDate,
                            unlimited,
                            scheduleDate,
                            scheduleTime,
                            payment_type,
                            comment,
                            files,
                            token,
                            sendType,
                            saveCard,
                            cardHolderName,
                            cardNumber,
                            cvc,
                            expiry,
                            currency,
                            transactionDetails
                        }}
                        setTransactionDetails={setTransactionDetails}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                }
                {
                    step === 7
                    &&
                    <WalletReceipt
                        walletDetails={walletDetails}
                        transactionDetails={transactionDetails}
                        amount={amount}
                        currency={currency}
                        type={paymentType?.value}
                    />
                } */}
            {/* </div> */}
        </div>
    )
}

export default WalletTransferMobile