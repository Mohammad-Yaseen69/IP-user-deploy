import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import SelectedCountry from "./SelectedCountry"
import SelectedPayoutChannel from "./SelectedPayoutChannel"
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency"
import { Card, CardBody } from "reactstrap"
import PaymentCountry from "./Country"
import PayoutChannel from "./PayoutChannel"
import PWizard from "./PWizard"
import AmountAndCurrency from "./AmountAndCurrency"
import PaymentsBeneficiary from "./Beneficiary"
import ConfirmSend from "./ConfirmSend"
import w1 from "./files/w1.png"
import int from "./files/int.svg"
import SendActionCard from "./Common/SendActionCard"
import PaymentType from "./PaymentType"
import SelectedPaymentType from "./SelectedPaymentType"
import Receipt from "./InternationalReceipt"
import c_vid from "./files/confirm.mp4"
import cfm_vid from "./files/confirmation.mp4"
import Recursive from "./RecursivePayment"
import SchedulePayment from "./SchedulePayment"
import wimm from "./files/wimm.png"
import where from "./files/where_w.png"
import Timeline from "./StatusTimeline"
import InstalmentPayment from "./InstalmentPayment"
import SplitPayment from "./SplitPayment"
import "./styles/ConfirmContainer.css"

const InternationalTransfer = ({ sendPaymentType, setStep, setSendPaymentType, setIsInternational }) => {
    const { t } = useTranslation()
    const [subStep, setSubStep] = useState(0)
    const [country, setCountry] = useState("")
    const [payoutChannel, setPayoutChannel] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState([])
    const [beneficiary, setBeneficiary] = useState([])
    const [paymentMethod, setPaymentMethod] = useState("")
    const [confirmed, setConfirmed] = useState(false)
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

    // instalment payment
    const [billingDate, setBillingDate] = useState()
    const [numOfTerms, setNumOfTerms] = useState(0)

    // split payment
    const [numOfSplits, setNumOfSplits] = useState(0)
    const [splitAmount, setSplitAmount] = useState(0)

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
        setCountry("")
        setPayoutChannel("")
        setCurrency("USD")
        setAmount("")
        setReason("")
        setComment("")
        setFiles([])
        setBeneficiary([])
        setPaymentMethod("")
        setConfirmed("")
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
            name: `You used${payoutChannel.name}`
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
                                    <Receipt beneficiary={beneficiary} amount={amount} currency={currency} country={country} payoutChannel={payoutChannel} paymentType={paymentMethod} setShowStatus={setShowStatus} setIsInternational={setIsInternational} />
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
                    <div style={{ display: "flex", width: sendPaymentType === "international" ? "100%" : "fit-content", transition: "500ms" }}>
                        <SendActionCard
                            bg={w1}
                            title={t("International Transfer")}
                            icon={int}
                            desc={t("Send money across borders with ease. Transfer funds internationally to friends, family, or businesses in just a few clicks. Choose from a wide range of payment channels including bank account, mobile money/mobile wallet, cash pick-up location, or payment card for convenient and secure transactions")}
                            setter={setSendPaymentType}
                            setterValue="international"
                            setStep={setStep}
                            showDesc={sendPaymentType === "international"}
                            active={sendPaymentType === "international"}
                            sendPaymentType={sendPaymentType}
                        />

                        {sendPaymentType === "international" &&
                            <Card style={{
                                height: "100%",
                                width: sendPaymentType === "international" ? "100%" : "0px",
                                transition: "500ms",
                            }}>
                                <CardBody style={{
                                    display: "flex",
                                    gap: subStep === 6 ? "0rem" : "1rem",
                                    flexWrap: "wrap",
                                    padding:/*subStep === 6 ? "14px" :*/ "24px"
                                }}>
                                    <div style={{
                                        flex: 1,
                                        minWidth: "180px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: 'space-between',
                                        gap: "1rem",
                                        maxWidth: /*subStep === 6 ? "300px" :*/ "none"
                                    }}>
                                        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                            <div style={{ height: "100%" }}>
                                                <h4 style={{ fontSize: "1.3rem" }}>
                                                    {
                                                        subStep === 1
                                                        &&
                                                        t("Select the country where you want to send the money!")
                                                    }
                                                    {
                                                        subStep === 2
                                                        &&
                                                        t("Select Payout Channel")
                                                    }
                                                    {
                                                        payoutChannel?.value === "bank" && subStep === 3
                                                        &&
                                                        t("Bank Transfer")
                                                    }
                                                    {
                                                        subStep === 4
                                                        &&
                                                        t("Select Payment Type")
                                                    }
                                                    {
                                                        subStep === 5
                                                        &&
                                                        t("Choose The Beneficiary")
                                                    }
                                                </h4>
                                                {
                                                    subStep === 2
                                                    &&
                                                    t("Select your most convenient option to send the money.")
                                                }
                                                {
                                                    subStep === 3 && payoutChannel?.value === "bank"
                                                    &&
                                                    t("Send money directly to a recipient's bank account. Enjoy the convenience and security of transferring funds seamlessly to any bank around the world.")
                                                }
                                                {
                                                    subStep === 6 && !confirmed
                                                        ?
                                                        <div style={{
                                                            // background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                                            padding: "2rem",
                                                            textAlign: "center",
                                                            height: "100%",
                                                            borderRadius: "24px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between",
                                                        }} className="confirm_container">
                                                            <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Confirm Your Payment</h4>
                                                            <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                                        </div>
                                                        :
                                                        ""
                                                }
                                                {
                                                    confirmed && subStep === 6
                                                    &&
                                                    <div style={{
                                                        // background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                                        padding: "2rem",
                                                        textAlign: "center",
                                                        height: "100%",
                                                        borderRadius: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                    }} className="confirm_container">
                                                        <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Your payment is confirmed</h4>
                                                        <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                                        <p>Thanks for using InstaPay</p>
                                                    </div>
                                                }
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {
                                                    country && subStep > 1 && subStep < 6
                                                    &&
                                                    <SelectedCountry country={country} setSubStep={setSubStep} />
                                                }
                                                {
                                                    payoutChannel && subStep > 2 && subStep < 6
                                                    &&
                                                    <SelectedPayoutChannel payoutChannel={payoutChannel} setSubStep={setSubStep} />
                                                }
                                                {
                                                    payoutChannel.value === "bank" && subStep > 3 && subStep < 6
                                                    &&
                                                    <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={3} />
                                                }
                                                {
                                                    paymentMethod && subStep > 4 && subStep < 6
                                                    &&
                                                    <SelectedPaymentType paymentType={paymentMethod} setSubStep={setSubStep} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} />
                                                }
                                            </div>
                                        </div>
                                        {
                                            subStep < 6
                                            &&
                                            <div>
                                                <PWizard subStep={subStep} />
                                            </div>
                                        }
                                    </div>
                                    <div style={{ flex: 1.6, minWidth: "300px", height: "100%" }}>
                                        {
                                            subStep === 1
                                            &&
                                            <PaymentCountry country={country} setCountry={setCountry} setSubStep={setSubStep} />
                                        }
                                        {
                                            subStep === 2
                                            &&
                                            <PayoutChannel setSubStep={setSubStep} payoutChannel={payoutChannel} setPayoutChannel={setPayoutChannel} />
                                        }
                                        {
                                            subStep === 3 && payoutChannel?.value === "bank"
                                            &&
                                            <AmountAndCurrency setSubStep={setSubStep} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} comment={comment} setComment={setComment} reason={reason} setReason={setReason} setFiles={setFiles} files={files} />
                                        }
                                        {
                                            subStep === 4 && !notInstant
                                            &&
                                            <PaymentType setSubStep={setSubStep} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} setNotInstant={setNotInstant} />
                                        }
                                        {
                                            subStep === 4 && paymentMethod.value === "subscription" && notInstant
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
                                            subStep === 4 && paymentMethod.value === "schedule" && notInstant
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
                                            subStep === 4 && paymentMethod.value === "instalment" && notInstant
                                            &&
                                            <InstalmentPayment
                                                amount={amount}
                                                currency={currency}
                                                numOfTerms={numOfTerms}
                                                setNumOfTerms={setNumOfTerms}
                                                billingDate={billingDate}
                                                setBillingDate={setBillingDate}
                                                setSubStep={setSubStep}
                                            />
                                        }
                                        {
                                            subStep === 4 && paymentMethod.value === "split" && notInstant
                                            &&
                                            <SplitPayment
                                                amount={amount}
                                                currency={currency}
                                                numOfSplits={numOfSplits}
                                                setNumOfSplits={setNumOfSplits}
                                                splitAmount={splitAmount}
                                                setSplitAmount={setSplitAmount}
                                                setSubStep={setSubStep}
                                            />
                                        }
                                        {
                                            subStep === 5
                                            &&
                                            <PaymentsBeneficiary beneficiary={beneficiary} setBeneficiary={setBeneficiary} setSubStep={setSubStep} />
                                        }
                                        {
                                            beneficiary && subStep === 6 && !confirmed
                                            &&
                                            <ConfirmSend beneficiary={beneficiary} amount={amount} currency={currency} country={country} payoutChannel={payoutChannel} paymentType={paymentMethod} setConfirmed={setConfirmed} setSubStep={setSubStep} scheduleDate={scheduleDate} scheduleTime={scheduleTime} recStartDate={recStartDate} recCycle={recCycle} />
                                        }
                                        {
                                            confirmed && subStep === 6
                                            &&
                                            <Receipt beneficiary={beneficiary} amount={amount} currency={currency} country={country} payoutChannel={payoutChannel} paymentType={paymentMethod} setShowStatus={setShowStatus} setIsInternational={setIsInternational} />
                                        }
                                    </div>
                                </CardBody>
                            </Card>}
                    </div>
            }
        </>
    )
}

export default InternationalTransfer;