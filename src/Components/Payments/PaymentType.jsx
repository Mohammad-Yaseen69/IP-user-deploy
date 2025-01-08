import { useEffect, useState } from "react";
import { VerticalTimeline } from "react-vertical-timeline-component";
import TimelineAmount from "./TimelineAmount";
import TimelinePaymentDetails from "./TimelinePaymentDetails";
import TimelinePaymentType from "./TimelinePaymentType";
import TimelineOtpVerification from "./TimelineOtpVerification";
import TimelineReceipt from "./TimelineReceipt";
import TimelineChooseCountry from "./TimelineChooseCountry";
import TimelineChooseMethod from "./TimelineChooseMethod";
import TimelineAction from "./TimelineAction";
import TimelineChooseRecipient from "./TimelineChooseRecipient";
import TimelinePaymentDetailsFull from "./TimelinePaymentDetailsFull";
import TimelineSchedule from "./TimelineSchedule";
import TimelineRecursive from "./TimelineRecursive";
import TimelineRequestBeneficient from "./TimelineRequestBeneficient";
import TimelineQuoteBeneficiary from "./TimelineQuoteBeneficiary";
import TimelineReason from "./TimelineReason";
import ThankYou from "./ThankYou";
import TimelineChooseSendMethod from "./TimelineChooseSendMethod";
import TimelineWalletForm from "./TimelineWalletForm";
// import TimelineRequestMethod from "./TimelineRequestMethod";
// import TimelineBulkRequests from "./TimelineBulkRequests";

const PaymentType = ({ mobileView, sbt }) => {
    const [stepNumber, setStepNumber] = useState(0)
    const [method, setMethod] = useState("")
    const [action, setAction] = useState("")
    const [amount, setAmount] = useState("")
    const [receiverCurrency, setReceiverCurrency] = useState("")
    const [sendMethod, setSendMethod] = useState("")
    const [requestMethod, setRequestMethod] = useState("")
    const [country, setCountry] = useState("")
    const [paymentType, setPaymentType] = useState("")
    const [scheduleDate, setScheduleDate] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")
    const [recursiveType, setRecursiveType] = useState("Monthly")
    const [recursiveDay, setRecursiveDay] = useState("")
    const [recursiveCycles, setRecursiveCycles] = useState()
    const [unlimitedCycles, setUnlimitedCycles] = useState(false)
    const [recursiveStart, setRecursiveStart] = useState("")
    const [sendBeneficiaries, setSendBeneficiaries] = useState("")
    const [requestedRecipient, setRequestedRecipient] = useState([])
    const [quotedRecipient, setQuotedRecipient] = useState([])

    useEffect(() => {
        if (action === "request" || action === "quote") {
            setMethod("P2P")
        }
        if (action === "quote") {
            setPaymentType("instant")
            setRequestedRecipient([])
        }
        if (action === "request") {
            setQuotedRecipient([])
        }
    }, [action])

    useEffect(() => {
        if (stepNumber > 0) {
            window.scrollTo(0, document.body.scrollHeight - 90);
        }
    }, [stepNumber]);

    return (
        <div className="card">
            <VerticalTimeline layout={"1-column"}>
                <TimelineAction mobileView={mobileView} sbt={sbt} setStepNumber={setStepNumber} action={action} setAction={setAction} />
                {
                    action === "send"
                    &&
                    <TimelineChooseSendMethod mobileView={mobileView} setStepNumber={setStepNumber} sendMethod={sendMethod} setSendMethod={setSendMethod} />
                }
                {/* {
                    action === "request"
                    &&
                    <TimelineRequestMethod mobileView={mobileView} setRequestMethod={setRequestMethod} requestMethod={requestMethod} setStepNumber={setStepNumber} />
                } */}
                {
                    sendMethod === "Wallet To Wallet Transfer"
                    &&
                    <TimelineWalletForm mobileView={mobileView} setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 0 && action === "send" && sendMethod !== "Wallet To Wallet Transfer"
                    &&
                    <TimelineChooseCountry mobileView={mobileView} setStepNumber={setStepNumber} country={country} setCountry={setCountry} src={setReceiverCurrency} />
                }
                {
                    action === "request" && stepNumber > 0
                        ?
                        <TimelineRequestBeneficient setStepNumber={setStepNumber} requestedRecipient={requestedRecipient} setRequestedRecipient={setRequestedRecipient} srm={setRequestMethod} />
                        :
                        ""
                }
                {/* {
                    action === "request" && requestMethod === "bulk" && stepNumber > 0
                        ?
                        <TimelineBulkRequests mobileView={mobileView} setStepNumber={setStepNumber} beneficiaries={requestedRecipient} srr={setRequestedRecipient} />
                        :
                        ""
                } */}
                {
                    stepNumber > 0 && action === "quote"
                        ?
                        <TimelineQuoteBeneficiary setStepNumber={setStepNumber} quotedRecipient={quotedRecipient} setQuotedRecipient={setQuotedRecipient} />
                        :
                        ""
                }
                {
                    stepNumber > 1 && action !== "request" && action !== "quote" && sendMethod !== "Wallet To Wallet Transfer"
                        ?
                        <TimelineChooseMethod method={method} setMethod={setMethod} mobileView={mobileView} setStepNumber={setStepNumber} />
                        :
                        ""
                }
                {
                    stepNumber > 2 && requestMethod !== "bulk" && action !== "request"
                    &&
                    <TimelineAmount setAmount={setAmount} amount={amount} action={action} mobileView={mobileView} setStepNumber={setStepNumber} quotedRecipient={quotedRecipient} rc={receiverCurrency} />
                }
                {
                    stepNumber > 3
                    &&
                    <TimelineReason action={action} mobileView={mobileView} setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 4 && action !== "quote"
                        ?
                        <TimelinePaymentType action={action} mobileView={mobileView} setStepNumber={setStepNumber} setPaymentType={setPaymentType} paymentType={paymentType} />
                        :
                        ""
                }
                {
                    stepNumber > 5 && paymentType === "scheduled"
                    &&
                    <TimelineSchedule action={action} mobileView={mobileView} scheduleDate={scheduleDate} setScheduleDate={setScheduleDate} scheduleTime={scheduleTime} setScheduleTime={setScheduleTime} setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 5 && paymentType === "recursive"
                    &&
                    <TimelineRecursive action={action} mobileView={mobileView} recursiveType={recursiveType} recursiveCycles={recursiveCycles} recursiveDay={recursiveDay} setRecursiveType={setRecursiveType} setRecursiveCycles={setRecursiveCycles} setRecursiveDay={setRecursiveDay} recursiveStart={recursiveStart} setRecursiveStart={setRecursiveStart} setStepNumber={setStepNumber} unlimitedCycles={unlimitedCycles} setUnlimitedCycles={setUnlimitedCycles} />
                }
                {
                    stepNumber > 6 && action !== "request" && action !== "quote"
                        ?
                        <TimelinePaymentDetails action={action} mobileView={mobileView} setStepNumber={setStepNumber} paymentType={paymentType} scheduleDate={scheduleDate} recursiveStart={recursiveStart} />
                        :
                        ""
                }
                {
                    stepNumber > 7 && action !== "request" && action !== "quote"
                        ?
                        <TimelineChooseRecipient mobileView={mobileView} setStepNumber={setStepNumber} sendBeneficiaries={sendBeneficiaries} setSendBeneficiaries={setSendBeneficiaries} />
                        :
                        ""
                }
                {
                    stepNumber > 8
                    &&
                    <TimelinePaymentDetailsFull amount={amount} sendBeneficiaries={sendBeneficiaries} action={action} mobileView={mobileView} setStepNumber={setStepNumber} paymentType={paymentType} scheduleDate={scheduleDate} recursiveStart={recursiveStart} />
                }
                {
                    stepNumber > 9
                    &&
                    <TimelineOtpVerification st={stepNumber} mobileView={mobileView} setStepNumber={setStepNumber} />
                }
                {
                    stepNumber > 10
                    &&
                    <TimelineReceipt action={action} mobileView={mobileView} setStepNumber={setStepNumber} paymentType={paymentType} scheduleDate={scheduleDate} />
                }
                {
                    stepNumber > 11
                    &&
                    <ThankYou mobileView={mobileView} />
                }

            </VerticalTimeline>
        </div>
    )
};

export default PaymentType;