import { useContext, useEffect, useState } from "react"
import styles from "./styles/International.module.css"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import TopIcon from "./files/Top"
import { ChevronLeft } from "react-feather"
import PaymentsBeneficiary from "../Beneficiary"
import AmountAndCurrency from "./AmountAndCurrency"
import RequestType from "./RequestType"
import Recursive from "./Recursive"
import SchedulePayment from "./Schedule"
import InstalmentPayment from "../InstalmentPayment"
import SplitPayment from "../SplitPayment"
import ConfirmRequest from "./ConfirmRequest"
import OTPConfirmation from "../OTPConfirmation"
import RequestReceipt from "../RequestReceipt"
import PWizard from "../PWizard"
import { UserContext } from "../../../Context/UserContext"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"

const RequestMoneyMobile = ({ step, setStep, setCurrentFlow, setAction }) => {
    const navigate = useNavigate()
    const { t } = useTranslation();
    const [beneficiary, setBeneficiary] = useState([]);
    const [currency, setCurrency] = useState("")
    const [amount, setAmount] = useState("1.00")
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

    const [requestDetails, setRequestDetails] = useState(null)
    const [exchangeRate, setExchangeRate] = useState(null)
    const [token, setToken] = useState("")

    const handleRemoveBeneficiary = (index) => {
        const updatedBeneficiaries = [...beneficiary];
        updatedBeneficiaries.splice(index, 1);
        setBeneficiary(updatedBeneficiaries);
    };
    const { userDetails, userWallets, authHeader } = useContext(UserContext)
    const [codeType, setCodeType] = useState("sms")
    const [totalBalance, setTotalBalance] = useState(0)
    const [timezone, setTimezone] = useState("")

    useEffect(() => {
        if (userWallets?.length > 0 && currency && userDetails?.user?.kyc_status !== "approved") {
            const getExchangedAmounts = async (from, to, amount) => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                        headers: authHeader
                    });
                    const dec = decryptData(res?.data?.data);
                    return dec?.exchangeRate?.exchanged_amount ?? 0;
                } catch (error) {
                    return 0; // return 0 in case of error
                }
            };

            const calculateTotal = async () => {
                const wallets = userWallets.filter(item => item?.wallet_type === "insta")
                const promises = wallets.map(item => getExchangedAmounts(item?.currency?.code, currency, item?.balance?.available));
                const balances = await Promise.all(promises);
                const total = balances.reduce((acc, balance) => acc + balance, 0);
                setTotalBalance(total ?? 0);
            };

            calculateTotal();
        }
    }, [userWallets, currency]);


    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
        setTimezone(userDetails?.timezone)
    }, [userDetails])

    const [coords, setCoords] = useState(null);

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <button className={styles.back_btn} disabled={step === 8 && completed} onClick={() => {
                    if (step === 6) {
                        setStep(1)
                        setCurrentFlow("")
                        setAction("")
                        navigate("/payments")
                    } else {
                        if (step === 2) {
                            setCurrentFlow("")
                            setAction("")
                        }
                        setStep(prev => prev - 1)
                    }
                }}>
                    <ChevronLeft />
                </button>
                <h5>{t("Request Money")}</h5>
                <div>
                    <TopIcon fill={step > 2 ? "#5926f0" : "black"} />
                </div>
            </div>
            {
                step < 5
                &&
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                    <PWizard subStep={step - 1} />
                </div>
            }
            <div className={styles.bottom}>
                {
                    step === 2
                    &&
                    <PaymentsBeneficiary
                        beneficiary={beneficiary}
                        setBeneficiary={setBeneficiary}
                        setSubStep={setStep}
                        type={"Requesting"}
                        backHandler={() => {
                            setAction("")
                            setCurrentFlow("")
                            setStep(1)
                        }}
                    />
                }
                {
                    step === 3
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
                        type={"Requesting"}
                    />
                }
                {
                    step === 4 && !notInstant
                    &&
                    <RequestType paymentMethod={paymentType} setPaymentMethod={setPaymentType} setStep={setStep} setNotInstant={setNotInstant} />
                }
                {
                    step === 4 && paymentType.value === "subscription" && notInstant
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
                        decrementHandler={() => setRecCycle(prev => prev - 1)}
                        incrementHandler={() => setRecCycle(prev => prev + 1)}
                        timezone={timezone}
                        setTimezone={setTimezone}
                    />
                }
                {
                    step === 4 && paymentType.value === "schedule" && notInstant
                    &&
                    <SchedulePayment
                        scheduleDate={scheduleDate}
                        setScheduleDate={setScheduleDate}
                        scheduleTime={scheduleTime}
                        setScheduleTime={setScheduleTime}
                        setSubStep={setStep}
                        timezone={timezone}
                        setTimezone={setTimezone}
                    />
                }
                {
                    step === 4 && paymentType.value === "instalment" && notInstant
                    &&
                    <InstalmentPayment
                        amount={amount}
                        currency={currency}
                        numOfTerms={numOfTerms}
                        setNumOfTerms={setNumOfTerms}
                        billingDate={billingDate}
                        setBillingDate={setBillingDate}
                        setStep={setStep}
                    />
                }
                {
                    step === 4 && paymentType.value === "split" && notInstant
                    &&
                    <SplitPayment
                        amount={amount}
                        currency={currency}
                        numOfSplits={numOfSplits}
                        setNumOfSplits={setNumOfSplits}
                        splitAmount={splitAmount}
                        setSplitAmount={setSplitAmount}
                        setStep={setStep}
                    />
                }
                {
                    step === 5 && !completed
                    &&
                    <ConfirmRequest
                        coords={coords}
                        setCoords={setCoords}
                        beneficiary={beneficiary}
                        amount={amount}
                        currency={currency}
                        paymentType={paymentType}
                        setConfirmed={setCompleted}
                        setSubStep={setStep}
                        setter={setPaymentType}
                        scheduleDate={`To: ${scheduleDate} ${scheduleTime}`}
                        subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`}
                        setNotInstant={setNotInstant}
                        setBeneficiary={setBeneficiary}
                        requestObject={{
                            amount,
                            reason: "PAYMENT_REQUEST",
                            beneficiary,
                            currency,
                            setRequestDetails,
                            setExchangeRate,
                            paymentType,
                            recCycle,
                            unlimited,
                            recStartDate,
                            scheduleDate,
                            scheduleTime,
                            files,
                            comment,
                            timezone
                        }}
                        setToken={setToken}
                        recCycle={recCycle}
                        recStartDate={recStartDate}
                        scheduleTime={scheduleTime}
                        setPaymentType={setPaymentType}
                        totalBalance={totalBalance}
                    />
                }
                {
                    step === 5 && completed
                    &&
                    <OTPConfirmation
                        coords={coords}
                        setSubStep={setStep}
                        type="request"
                        requestObject={{
                            amount,
                            reason: "PAYMENT_REQUEST",
                            beneficiary,
                            currency,
                            setRequestDetails,
                            setExchangeRate,
                            paymentType,
                            recCycle,
                            unlimited,
                            recStartDate,
                            scheduleDate,
                            scheduleTime,
                            files,
                            comment,
                            token,
                            timezone
                        }}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                }
                {
                    step === 6
                    &&
                    <RequestReceipt
                        setShowStatus={setShowStatus}
                        beneficiary={beneficiary}
                        amount={amount}
                        currency={currency}
                        paymentType={paymentType}
                        exchangeRate={exchangeRate}
                    />
                }
            </div>
        </div>
    )
}

export default RequestMoneyMobile