import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardBody } from "reactstrap"
import PWizard from "./PWizard"
import AmountAndCurrency from "./AmountAndCurrency"
import w2 from "./files/w2.png"
import SendActionCard from "./Common/SendActionCard"
import WalletDetails from "./WalletDetails"
import SelectedWallet from "./SelectedWallet"
import ConfirmSendWallet from "./ConfirmSendWallet"
import wallet_ic from "./files/wallet.svg"
import c_vid from "./files/confirm.mp4"
import cfm_vid from "./files/confirmation.mp4"
import WalletReceipt from "./WalletReceipt"
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency"
import PaymentType from "./PaymentType"
import Recursive from "./RecursivePayment"
import SchedulePayment from "./SchedulePayment"
import wimm from "./files/wimm.png"
import where from "./files/where_w.png"
import Timeline from "./StatusTimeline"
import OTPConfirmation from "./OTPConfirmation"
import { UserContext } from "../../Context/UserContext"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import SelectedPaymentType from "./SelectedPaymentType"
import { useLocation } from "react-router"

// new
import w2w from "./files/w2w.png"

const WalletTransfer = ({ sendPaymentType, setStep, setSendPaymentType, setIsWallet }) => {
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
    const [sendType, setSendType] = useState("wallet")

    useEffect(() => {
        if (wallet) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-by-wallet-id/${wallet}`, {
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
        if (wallet_id && sendPaymentType === "wallet") {
            setWallet(wallet_id)
        }
    }, [wallet_id, sendPaymentType])

    useEffect(() => {
        if (payment_type_q) {
            setPayment_Type(payment_type_q)
        }
    }, [payment_type_q])

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [saveCard, setSaveCard] = useState(false)


    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])
    return (
        <>
            {
                showStatus
                    ?
                    <div style={{ display: "flex", height: "100%", width: "100%" }}>
                        <SendActionCard
                            bg={wimm}
                            title={t("Where Is My Money")}
                            icon={where}
                            desc={t("Send money across borders with ease. Transfer funds internationally \nto friends, family, or businesses in just a few clicks. Choose from \na wide range of payment channels including bank account, \nmobile money/mobile wallet, cash pick-up location, or payment card \nfor convenient and secure transactions.")}
                            setter={setExtra}
                            setterValue="abc"
                            setStep={setExtra}
                            showDesc={true}
                            active={true}
                            sendPaymentType={true}
                        />
                        <Card style={{ width: "100%" }}>
                            <CardBody style={{ display: "flex", padding: "24px", gap: "24px" }}>
                                <div style={{ width: "100%" }}>
                                    <WalletReceipt setIsWallet={setIsWallet} amount={amount} currency={currency} wallet={"INSTA-PAY#STASSY"} setShowStatus={setShowStatus} />
                                </div>
                                <Card style={{
                                    height: "100%",
                                    marginBottom: 0,
                                    boxShadow: "none",
                                    gap: "1.3rem",
                                    maxHeight: "540px",
                                    width: "100%"
                                }}>
                                    <CardBody style={{
                                        paddingBottom: "0",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2rem",
                                        borderRadius: "20px",
                                        padding: "30px",
                                        background: "rgba(0,0,0,.03)",
                                        paddingBottom: 0,
                                        width: "100%"
                                    }}>
                                        <span>Updates:</span>
                                        <Timeline items={timelineData} />
                                    </CardBody>
                                </Card>
                            </CardBody>
                        </Card>
                    </div>
                    :
                    <div style={{ display: "flex", width: sendPaymentType === "wallet" ? "90%" : "fit-content", transition: "500ms", order: 9 }} className="i_t_con">
                        <SendActionCard
                            // bg={w2}
                            bg={w2w}
                            title={t("Wallet to Wallet Transfer")}
                            icon={wallet_ic}
                            desc={t("Instantly transfer money to other InstaPay users with our secure wallet-to-wallet \nservice. Send and receive funds hassle-free within seconds.")}
                            setter={setSendPaymentType}
                            setterValue="wallet"
                            setStep={setStep}
                            showDesc={sendPaymentType === "wallet"}
                            active={sendPaymentType === "wallet"}
                            sendPaymentType={sendPaymentType}
                        />

                        {sendPaymentType === "wallet" &&
                            <Card style={{
                                height: "100%",
                                width: sendPaymentType === "wallet" ? "100%" : "0px",
                                transition: "500ms",
                                paddingBottom: "1rem"
                            }}>
                                <CardBody style={{
                                    display: "flex",
                                    gap: subStep === 4 ? "0rem" : "1rem",
                                    padding: window.innerWidth > 1500 ? "24px" : "18px"
                                }}>
                                    <div style={{
                                        flex: 1,
                                        minWidth: "180px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: 'space-between',
                                        gap: "1rem",
                                        maxWidth: "none"
                                    }}>
                                        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                            <div style={{ height: "100%" }}>
                                                <h4 className="head_left_side">
                                                    {
                                                        subStep === 1
                                                        &&
                                                        t("Enter the Wallet ID")
                                                    }
                                                    {
                                                        subStep === 2
                                                        &&
                                                        t("Enter the Amount You Wish to Transfer.")
                                                    }
                                                    {
                                                        subStep === 3
                                                        &&
                                                        t("Select Payment Type.")
                                                    }
                                                    {
                                                        subStep === 4 && confirmed
                                                        &&
                                                        t("Authenticate Your Payment.")
                                                    }
                                                </h4>
                                                {
                                                    subStep === 4 && !confirmed
                                                        ?
                                                        <div style={{
                                                            textAlign: "center",
                                                            height: "101%",
                                                            borderRadius: "24px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between",
                                                            marginTop: "-.6rem",
                                                            maxWidth: "320px"
                                                        }} className="confirm_container">
                                                            <h4 style={{ color: "#5936f0", wordBreak: "normal", padding: "2rem" }} className="head_confirm">{t("Confirm Your Payment")}</h4>
                                                            <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply", paddingBottom: "2rem" }}></video>
                                                        </div>
                                                        :
                                                        ""
                                                }
                                                {
                                                    confirmed && subStep === 5
                                                    &&
                                                    <div style={{
                                                        padding: "2rem",
                                                        textAlign: "center",
                                                        height: "101%",
                                                        borderRadius: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                        marginTop: "-.6rem",
                                                        maxWidth: "320px"
                                                    }} className="confirm_container">
                                                        <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">{t("Your Payment Is Confirmed")}</h4>
                                                        <video src={c_vid} autoPlay loop="true" style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply" }}></video>
                                                        <p>{("Thanks for using InstaPay")}</p>
                                                    </div>
                                                }
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {
                                                    wallet && subStep > 1 && subStep < 4
                                                    &&
                                                    <SelectedWallet wallet={walletDetails} setSubStep={setSubStep} />
                                                }
                                                {
                                                    subStep > 2 && subStep < 4
                                                    &&
                                                    <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={2} />
                                                }
                                                {
                                                    subStep > 2 && subStep < 4 && paymentType
                                                    &&
                                                    <SelectedPaymentType paymentType={paymentType} setSubStep={setSubStep} step={3} setter={setPaymentType} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} setNotInstant={setNotInstant} />
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            {
                                                subStep < 4
                                                &&
                                                <PWizard subStep={subStep} />
                                            }
                                        </div>
                                    </div>
                                    <div style={{ flex: 1.6, minWidth: "300px", height: "100%" }}>
                                        {
                                            subStep === 1
                                            &&
                                            <WalletDetails wallet={wallet} setWallet={setWallet} setSubStep={setSubStep} />
                                        }
                                        {
                                            subStep === 2
                                            &&
                                            <AmountAndCurrency setSubStep={setSubStep} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} comment={comment} setComment={setComment} reason={reason} setReason={setReason} setFiles={setFiles} files={files} paymentType="wallet" walletDetails={walletDetails} exchangeType={payment_type_q === "payment_address" ? "payment_address" : "wallet_to_wallet"}
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
                                            subStep === 3 && !notInstant
                                            &&
                                            <PaymentType paymentMethod={paymentType} setPaymentMethod={setPaymentType} setSubStep={setSubStep} setNotInstant={setNotInstant} sendType={sendType} />
                                        }
                                        {
                                            subStep === 3 && paymentType.value === "subscription" && notInstant
                                            &&
                                            <Recursive
                                                setSubStep={setSubStep}
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
                                            subStep === 3 && paymentType.value === "schedule" && notInstant
                                            &&
                                            <SchedulePayment
                                                scheduleDate={scheduleDate}
                                                setScheduleDate={setScheduleDate}
                                                scheduleTime={scheduleTime}
                                                setScheduleTime={setScheduleTime}
                                                setSubStep={setSubStep}
                                            />
                                        }
                                        {
                                            subStep === 4 && !confirmed
                                            &&
                                            <ConfirmSendWallet amount={amount} currency={currency} wallet={walletDetails} setConfirmed={setConfirmed} setSubStep={setSubStep} paymentType={paymentType} recCycle={recCycle} recStartDate={recStartDate} scheduleDate={scheduleDate} scheduleTime={scheduleTime} setNotInstant={setNotInstant} setPaymentType={setPaymentType}
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
                                        }
                                        {
                                            subStep === 4 && confirmed
                                            &&
                                            <OTPConfirmation setSubStep={setSubStep}
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
                                            confirmed && subStep === 5
                                            &&
                                            <WalletReceipt walletDetails={walletDetails} transactionDetails={transactionDetails} amount={amount} currency={currency} setIsWallet={setIsWallet} setShowStatus={setShowStatus} type={paymentType?.value} />
                                        }
                                    </div>
                                </CardBody>
                            </Card>}
                    </div>
            }
        </>
    )
}

export default WalletTransfer;