import { useTranslation } from "react-i18next";
import styles from "./styles/International.module.css"
import { useContext, useEffect, useState } from "react";
import { ChevronLeft } from "react-feather";
import Country from "./Country";
import TopIcon from "./files/Top";
import PayoutChannel from "./PayoutChannel";
import AvailableServices from "./AvailableServices";
import AmountAndCurrency from "./AmountAndCurrency";
import PaymentsBeneficiary from "../Beneficiary";
import ConfirmSend from "./ConfirmSend";
import OTPConfirmation from "../OTPConfirmation";
import Receipt from "../InternationalReceipt";
import { useNavigate } from "react-router";
import PWizard from "../PWizard";
import { UserContext } from "../../../Context/UserContext";
import InternationFlow from "../InternationalFlow";
// import ConfirmSend from "../ConfirmSend";
import recent from "./files/recent.svg"

const International = ({ step, setStep, setCurrentFlow, setSendPaymentType, sendPaymentType, setAction }) => {
    const { t } = useTranslation()
    const [country, setCountry] = useState(null);
    const [payoutChannel, setPayoutChannel] = useState(null);
    const [services, setServices] = useState([])
    const [subServices, setSubServices] = useState([])
    const [subService, setSubService] = useState(null)
    const [currency, setCurrency] = useState("USD")
    const [amount, setAmount] = useState("100.00")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState([])
    const [beneficiary, setBeneficiary] = useState([])

    const [quotationDetails, setQuotationDetails] = useState("")
    const [createdQuotation, setCreatedQuotation] = useState(null)
    const [confirmed, setConfirmed] = useState(false)
    const [createdTransaction, setCreatedTransaction] = useState("")
    const [transactionDetails, setTransactionDetails] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        setCountry("")
        setPayoutChannel("")
        setCurrency("USD")
        setAmount("100.00")
        setReason("")
        setComment("")
        setFiles([])
        setBeneficiary([])
        setConfirmed("")
    }, [sendPaymentType])

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [saveCard, setSaveCard] = useState(false)
    const [sendType, setSendType] = useState("wallet")
    const { userDetails } = useContext(UserContext)
    const [codeType, setCodeType] = useState("sms")

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <button className={styles.back_btn} disabled={step === 8 && confirmed} onClick={() => {
                    if (step === 9) {
                        setStep(1)
                        setCurrentFlow("")
                        setAction("")
                        setSendPaymentType("")
                        navigate("/payments")
                    } else {
                        if (step === 3) {
                            setCurrentFlow("")
                            setSendPaymentType("")
                        }
                        setStep(prev => prev - 1)
                    }
                }}>
                    <ChevronLeft />
                </button>
                <h5>{t("International Transfer")}</h5>
                <div>
                    <img src={recent} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                    {/* <TopIcon fill={step > 3 ? "#5926f0" : "black"} /> */}
                </div>
            </div>
            {/* {
                step < 8
                &&
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                    <PWizard subStep={step - 2} />
                </div>
            } */}
            {/* <div className={styles.bottom}>
                {
                    step === 3
                    &&
                    <Country country={country} setCountry={setCountry} setStep={setStep} setServices={setServices} />
                }
                {
                    step === 4
                    &&
                    <PayoutChannel
                        payoutChannel={payoutChannel}
                        setPayoutChannel={setPayoutChannel}
                        setStep={setStep}
                        setSubServices={setSubServices}
                        country={country}
                        services={services}
                    />
                }
                {
                    step === 5
                    &&
                    <AvailableServices
                        setSubService={setSubService}
                        setStep={setStep}
                        subService={subService}
                        subServices={subServices}
                    />
                }
                {
                    step === 6
                    &&
                    <AmountAndCurrency
                        setStep={setStep}
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
                        subService={subService}
                        quotationDetails={quotationDetails}
                        setQuotationDetails={setQuotationDetails}
                        paymentType="international"
                        payoutChannel={payoutChannel}
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
                        country={country}
                        sendType={sendType}
                        setSendType={setSendType}
                    />
                }
                {
                    step === 7
                    &&
                    <PaymentsBeneficiary
                        beneficiary={beneficiary}
                        setBeneficiary={setBeneficiary}
                        setSubStep={setStep}
                        payoutChannel={payoutChannel?.value}
                        international={{
                            amount,
                            payer_id: subService?.id,
                            token: quotationDetails.token,
                            currency,
                            setCreatedQuotation,
                            subServices
                        }}
                        country={country?.name}
                        countryCode={country?.alpha3}
                    />
                }
                {
                    beneficiary && step === 8 && !confirmed
                    &&
                    <div className="mt-4">
                        <h5 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", textAlign: "center" }}>{t("Confirm Your Payment")}</h5>
                        <ConfirmSend beneficiary={beneficiary} amount={amount} currency={currency} country={country} payoutChannel={payoutChannel} setConfirmed={setConfirmed} setSubStep={setStep} reason={reason} quotationDetails={quotationDetails} setCreatedTransaction={setCreatedTransaction} createdQuotation={createdQuotation} setBeneficiary={setBeneficiary} comment={comment} />
                    </div>
                }
                {
                    step === 8 && confirmed
                    &&
                    <OTPConfirmation setSubStep={setStep} createdTransaction={createdTransaction} setTransactionDetails={setTransactionDetails} intFiles={files} intComment={comment}
                        intResend={{
                            comment,
                            reason,
                            beneficiary: beneficiary?.[0],
                            payoutChannel,
                            currency,
                            token: quotationDetails?.token
                        }}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                }
                {
                    confirmed && step === 9
                    &&
                    <Receipt beneficiary={beneficiary} amount={amount} currency={currency} country={country} payoutChannel={payoutChannel} transactionDetails={transactionDetails} />
                }
            </div> */}
            <InternationFlow
                sendPaymentType={sendPaymentType}
                setIsInternational={() => { }}
                setSendPaymentType={setSendPaymentType}
                setStep={setStep}
            />
        </div>
    )
}

export default International