import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import PaymentsBeneficiary from "./Beneficiary";
import AmountAndCurrency from "./AmountAndCurrency";
import ConfirmRequest from "./ConfirmRequest";
import SendActionCard from "./Common/SendActionCard";
import w2 from "./files/w2.png"
import sm from "./files/sm.svg"
import c_vid from "./files/confirm.mp4"
import cfm_vid from "./files/confirmation.mp4"
import RequestType from "./RequestType";
import Recursive from "./RecursivePayment";
import PWizard from "./PWizard";
import RequestReceipt from "./RequestReceipt";
import SchedulePayment from "./SchedulePayment";
import wimm from "./files/wimm.png"
import where from "./files/where_w.png"
import Timeline from "./StatusTimeline"
import { Swiper, SwiperSlide } from "swiper/react";
import SelectedRecipient from "./SelectedRecipient";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import InstalmentPayment from "./InstalmentPayment";
import SplitPayment from "./SplitPayment";

const RequestMoney = () => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
    const [beneficiary, setBeneficiary] = useState([]);
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState([])
    const [paymentType, setPaymentType] = useState("")
    const [completed, setCompleted] = useState(false)
    const [extra, setExtra] = useState("")
    const [notInstant, setNotInstant] = useState(false)

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

    const handleRemoveBeneficiary = (index) => {
        const updatedBeneficiaries = [...beneficiary];
        updatedBeneficiaries.splice(index, 1);
        setBeneficiary(updatedBeneficiaries);
    };

    const timelineData = [
        {
            id: Math.random() * Date.now(),
            name: `You request money.`
        },
        {
            id: Math.random() * Date.now(),
            name: `You requested ${amount} ${currency}`
        },
        {
            id: Math.random() * Date.now(),
            name: "Your Request is being processed."
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
                                    <RequestReceipt setShowStatus={setShowStatus} amount={amount} beneficiary={beneficiary} currency={currency} paymentType={paymentType} />
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
                    <div style={{ display: "flex", height: "100%" }}>
                        <SendActionCard
                            bg={w2}
                            title={t("RequestMoney")}
                            icon={sm}
                            desc={t("Request a customized price quote from service providers or vendors. Get accurate cost estimates and quotes for the services or products you need.")}
                            setter={setExtra}
                            setterValue="abc"
                            setStep={setExtra}
                            showDesc={true}
                            active={true}
                            sendPaymentType={true}
                        />
                        <Card style={{ width: "100%" }}>
                            <CardBody style={{ display: "flex", gap: subStep === 4 ? "0" : "1rem", flexWrap: "wrap", padding: "24px" }}>
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
                                        <h4>
                                            {subStep === 1 && "Choose The Beneficiary or Group"}
                                            {subStep === 2 && "Enter the amount that you wish to request."}
                                            {subStep === 3 && "Choose Request Type"}
                                        </h4>
                                        {
                                            subStep === 4 && !completed
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
                                                    <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                                </div>
                                                :
                                                ""
                                        }
                                        {
                                            completed && subStep === 4
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
                                                <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                                <p>Thanks for using InstaPay</p>
                                            </div>
                                        }
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            {
                                                subStep > 1 && subStep < 4
                                                &&
                                                <Swiper
                                                    slidesPerView="auto"
                                                    centeredSlides
                                                    spaceBetween={10}
                                                    grabCursor={true}
                                                    style={{
                                                        width: "100%"
                                                    }}
                                                >
                                                    {
                                                        beneficiary.map((item, index) => (
                                                            <SwiperSlide key={item.id}>
                                                                <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} />
                                                            </SwiperSlide>
                                                        ))
                                                    }
                                                </Swiper>
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
                                <div style={{ flex: 1.5, minWidth: "300px" }}>
                                    {
                                        subStep === 1
                                        &&
                                        <PaymentsBeneficiary
                                            beneficiary={beneficiary}
                                            setBeneficiary={setBeneficiary}
                                            setSubStep={setSubStep}
                                            type={"Requesting"}
                                        />
                                    }
                                    {
                                        subStep === 2
                                        &&
                                        <AmountAndCurrency setSubStep={setSubStep} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} comment={comment} setComment={setComment} reason={reason} setReason={setReason} setFiles={setFiles} files={files} type={"Requesting"} />
                                    }
                                    {
                                        subStep === 3 && !notInstant
                                        &&
                                        <RequestType paymentMethod={paymentType} setPaymentMethod={setPaymentType} setSubStep={setSubStep} setNotInstant={setNotInstant} />
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
                                        subStep === 3 && paymentType.value === "instalment" && notInstant
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
                                        subStep === 3 && paymentType.value === "split" && notInstant
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
                                        subStep === 4 && !completed
                                        &&
                                        <ConfirmRequest beneficiary={beneficiary} amount={amount} currency={currency} paymentType={paymentType} setConfirmed={setCompleted} setSubStep={setSubStep} />
                                    }
                                    {
                                        subStep === 4 && completed
                                        &&
                                        <RequestReceipt setShowStatus={setShowStatus} beneficiary={beneficiary} amount={amount} currency={currency} paymentType={paymentType} />
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>
            }
        </>
    );
};

export default RequestMoney;
