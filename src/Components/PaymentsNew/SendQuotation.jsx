import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import PaymentsBeneficiary from "./Beneficiary";
import AmountAndCurrency from "./AmountAndCurrency";
import ConfirmRequest from "./ConfirmRequest";
import SendActionCard from "./Common/SendActionCard";
import w3 from "./files/w3.png"
import q from "./files/q.svg"
import c_vid from "./files/confirm.mp4"
import cfm_vid from "./files/confirmation.mp4"
import PWizard from "./PWizard";
import ConfirmQuote from "./ConfirmQuote";
import SendQuoteReceipt from "./SendQuoteReceipt";

const SendQuotation = () => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
    const [beneficiary, setBeneficiary] = useState([]);
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState([])
    const [completed, setCompleted] = useState(false)
    const [extra, setExtra] = useState("")

    const handleRemoveBeneficiary = (index) => {
        const updatedBeneficiaries = [...beneficiary];
        updatedBeneficiaries.splice(index, 1);
        setBeneficiary(updatedBeneficiaries);
    };
    return (
        <div style={{ display: "flex", height: "100%" }}>
            <SendActionCard
                bg={w3}
                title={t("Send Quotation")}
                icon={q}
                desc={t("Send a detailed price quote to your clients or customers. Present your services, products, or offers in a professional manner with a personalized quote.")}
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
                                {subStep === 2 && "Enter the amount that you wish quote."}
                            </h4>
                            {
                                subStep === 3 && !completed
                                    ?
                                    <div style={{
                                        background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                        padding: "2rem",
                                        textAlign: "center",
                                        height: "100%",
                                        borderRadius: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}>
                                        <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Confirm Your Payment</h4>
                                        <video src={cfm_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                    </div>
                                    :
                                    ""
                            }
                            {
                                completed && subStep === 3
                                &&
                                <div style={{
                                    background: "linear-gradient(0deg, #FAFAFA 0%, #FAFAFA 100%), #D2D2D2",
                                    padding: "2rem",
                                    textAlign: "center",
                                    height: "100%",
                                    borderRadius: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}>
                                    <h4 style={{ color: "#5936f0", fontSize: "32px" }}>Your payment is confirmed</h4>
                                    <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover" }}></video>
                                    <p>Thanks for using InstaPay</p>
                                </div>
                            }
                        </div>
                        <div>
                            {
                                subStep < 3
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
                                type={"Quoting"}
                            />
                        }
                        {
                            subStep === 2
                            &&
                            <AmountAndCurrency setSubStep={setSubStep} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} comment={comment} setComment={setComment} reason={reason} setReason={setReason} setFiles={setFiles} files={files} type={"Quoting"} />
                        }
                        {
                            subStep === 3 && !completed
                            &&
                            <ConfirmQuote beneficiary={beneficiary} amount={amount} currency={currency} setConfirmed={setCompleted} setSubStep={setSubStep} />
                        }
                        {
                            subStep === 3 && completed
                            &&
                            <SendQuoteReceipt beneficiary={beneficiary} amount={amount} currency={currency} />
                        }
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default SendQuotation;