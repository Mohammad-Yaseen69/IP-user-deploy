import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import confirm from "./files/confirm_f.png"
import SelectedCountry from "./SelectedCountry"
import { Card, CardBody } from "reactstrap"
import PaymentCountry from "./Country"
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

const WalletTransfer = ({ sendPaymentType, setStep, setSendPaymentType, setIsWallet }) => {
    const { t } = useTranslation()
    const [subStep, setSubStep] = useState(1)
    const [wallet, setWallet] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("")
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
    const [scheduleDate, setScheduleDate] = useState()
    const [scheduleTime, setScheduleTime] = useState()

    // conditionals
    const [showStatus, setShowStatus] = useState(false)

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
        setAmount("")
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
                            desc={t("Send money across borders with ease. Transfer funds internationally to friends, family, or businesses in just a few clicks. Choose from a wide range of payment channels including bank account, mobile money/mobile wallet, cash pick-up location, or payment card for convenient and secure transactions.")}
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
                    <div style={{ display: "flex", width: sendPaymentType === "wallet" ? "100%" : "fit-content", transition: "500ms" }}>
                        <SendActionCard
                            bg={w2}
                            title={t("Wallet to Wallet Transfer")}
                            icon={wallet_ic}
                            desc={t("Request a customized price quote from service providers or vendors. Get accurate cost estimates and quotes for the services or products you need.")}
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
                            }}>
                                <CardBody style={{
                                    display: "flex",
                                    gap: subStep === 4 ? "0rem" : "1rem",
                                    flexWrap: "wrap",
                                    padding: /*subStep === 4 ? "14px" :*/ "24px"
                                }}>
                                    <div style={{
                                        flex: 1,
                                        minWidth: "180px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: 'space-between',
                                        gap: "1rem",
                                        maxWidth: /*subStep === 4 ? "300px" :*/ "none"
                                    }}>
                                        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                            <div style={{ height: "100%" }}>
                                                <h4 style={{ fontSize: "1.3rem" }}>
                                                    {
                                                        subStep === 1
                                                        &&
                                                        t("Enter the Wallet ID")
                                                    }
                                                    {
                                                        subStep === 2
                                                        &&
                                                        t("Enter the amount that you wish to transfer.")
                                                    }
                                                    {
                                                        subStep === 3
                                                        &&
                                                        t("Select Payment Type.")
                                                    }
                                                </h4>
                                                {
                                                    subStep === 4 && !confirmed
                                                        ?
                                                        <div style={{
                                                            // background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                                            padding: "2rem",
                                                            textAlign: "center",
                                                            height: "100%",
                                                            borderRadius: "24px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between"
                                                        }} className="confirm_container">
                                                            <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Confirm Your Payment</h4>
                                                            <video src={cfm_vid} autoPlay loop="true" style={{ width: "100%", height: "100%", objectFit: "cover" }}></video>
                                                        </div>
                                                        :
                                                        ""
                                                }
                                                {
                                                    confirmed && subStep === 4
                                                    &&
                                                    <div style={{
                                                        // background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                                        padding: "2rem",
                                                        textAlign: "center",
                                                        height: "100%",
                                                        borderRadius: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between"
                                                    }} className="confirm_container">
                                                        <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Your payment is confirmed</h4>
                                                        <video src={c_vid} autoPlay loop="true" style={{ width: "100%", height: "100%", objectFit: "cover" }}></video>
                                                        <p>Thanks for using InstaPay</p>
                                                    </div>
                                                }
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {
                                                    wallet && subStep > 1 && subStep < 4
                                                    &&
                                                    <SelectedWallet wallet={"INSTA-PAY#STASSY"} setSubStep={setSubStep} />
                                                }
                                                {
                                                    subStep > 2 && subStep < 4
                                                    &&
                                                    <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={2} />
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
                                            <AmountAndCurrency setSubStep={setSubStep} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} comment={comment} setComment={setComment} reason={reason} setReason={setReason} setFiles={setFiles} files={files} />
                                        }
                                        {
                                            subStep === 3 && !notInstant
                                            &&
                                            <PaymentType paymentMethod={paymentType} setPaymentMethod={setPaymentType} setSubStep={setSubStep} setNotInstant={setNotInstant} />
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
                                            <ConfirmSendWallet amount={amount} currency={currency} wallet={"abc"} setConfirmed={setConfirmed} setSubStep={setSubStep} paymentType={paymentType} />
                                        }
                                        {
                                            confirmed && subStep === 4
                                            &&
                                            <WalletReceipt setIsWallet={setIsWallet} amount={amount} currency={currency} wallet={"INSTA-PAY#STASSY"} setShowStatus={setShowStatus} />
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