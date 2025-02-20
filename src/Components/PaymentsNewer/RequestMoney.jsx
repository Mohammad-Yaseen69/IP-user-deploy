import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Modal, ModalBody } from "reactstrap";
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
import OTPConfirmation from "./OTPConfirmation";
import SelectedPaymentType from "./SelectedPaymentType";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { useNavigate } from "react-router";
import Icon from "../../assets/icons/cancel-user.png"

const RequestMoney = ({ setAction, setStep }) => {
    const { t } = useTranslation();
    const [subStep, setSubStep] = useState(1);
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
    const navigate = useNavigate()

    const [requestDetails, setRequestDetails] = useState(null)
    const [exchangeRate, setExchangeRate] = useState(null)
    const [token, setToken] = useState("")
    const [preferences, setPreferences] = useState({
        origin: false,
        live: false
    })
    const [isPreferencesCheck, SetIsPreferencesCheck] = useState(false)

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
        console.log(userDetails)
        setTimezone(userDetails?.timezone)
    }, [userDetails])

    const [coords, setCoords] = useState(null);



    const getPrefrences = async (liveCountry) => {
        console.log(beneficiary, userDetails.country.country_iso_code, liveCountry)
        const userId = beneficiary[0]?.user ? beneficiary[0]?._id : beneficiary[0]?._id
        console.log(beneficiary)
        try {

            if (userDetails.country.country_iso_code == liveCountry?.iso3) {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${userDetails.country.country_iso_code}`, {
                    headers: authHeader
                });

                const dec = decryptData(res.data?.data)

                console.log(dec)
                setPreferences({
                    live: dec.data[0].reason.includes("payment_request_live"),
                    origin: dec.data[0].reason.includes("payment_request_origin"),
                })
            } else {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${userDetails.country.country_iso_code}`, {
                    headers: authHeader
                });

                const dec = decryptData(res.data?.data)
                console.log(dec)

                setPreferences(prev => ({
                    ...prev,
                    origin: dec.data[0].reason.includes("payment_request_origin"),
                }))

                const res2 = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${liveCountry?.iso3}`, {
                    headers: authHeader
                });

                const dec2 = decryptData(res2.data?.data)

                setPreferences(prev => ({
                    ...prev,
                    live: dec2.data[0].reason.includes("payment_request_live"),
                }))
            }
        } catch (error) {
            
            console.log(error.response.data)
        } finally {
            SetIsPreferencesCheck(true)
        }


    }

    const NoAccessWarning = () => (
        <Modal 
            isOpen={isPreferencesCheck && (preferences.live || preferences.origin)} 
            backdrop="static" 
            keyboard={false}
            className="modal-dialog-centered" 
            style={{
                maxWidth: '600px',  // Increased from default
                width: '95%',
                margin: '1.75rem auto'
            }}
        >
            <ModalBody style={{
                padding: "3rem",  // Increased padding
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",  // Increased gap
                alignItems: "center",
                textAlign: "center",
                background: "white",  // Explicit background
                borderRadius: "8px",  // Added border radius
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)"  // Added shadow
            }}>
                <img src={Icon} style={{width: "70px", marginBottom: "7px"}} alt="" />
                <h4 style={{ 
                    color: "#D92D20", 
                    fontSize: "22px",  // Increased font size
                    fontWeight: "600",
                    marginBottom: "0"
                }}>
                    {t("Unsupported Recipient")}
                </h4>
                <p style={{ 
                    color: "#667085",
                    fontSize: "16px",  // Increased font size
                    lineHeight: "1.5",  // Added line height
                    maxWidth: "500px"  // Control text width
                }}>
                    {t(`It looks like ${beneficiary?.[0]?.username || beneficiary?.[0]?.user?.name || "this recipient"} has chosen to receive payments only from certain countries and locations, and your account's country or location isn't on the list. You may want to check with them to proceed with the payment request.`)}
                </p>
                <button 
                    onClick={() => navigate("/payments?payment_action=req_money")}
                    style={{
                        background: "#D92D20",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",  // Increased padding
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",  // Increased font size
                        fontWeight: "500",
                        minWidth: "120px",  // Added minimum width
                        transition: "background 0.3s",
                        "&:hover": {
                            background: "#C01E1E"
                        }
                    }}
                >
                    {t("Back")}
                </button>
            </ModalBody>
        </Modal>
    );

    return (
        <>
            <NoAccessWarning />
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
                    <div style={{ display: "flex" }} className="i_t_con">
                        <SendActionCard
                            bg={w2}
                            title={t("Request Money")}
                            icon={sm}
                            desc={t("Request money from anyone, anywhere, including across social networking platforms. With InstaPay, your payment requests are instantly accessible once accepted and funds are sent to your Receivable Accounts. Simplify your transactions and manage payments with ease and security.")}
                            setter={setExtra}
                            setterValue="abc"
                            setStep={setExtra}
                            showDesc={true}
                            active={true}
                            sendPaymentType={true}
                        />
                        <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem" }}>
                            <CardBody style={{
                                display: "flex", gap: subStep === 4 ? "0" : "1rem", flexWrap: "wrap",
                                padding: window.innerWidth > 1500 ? "24px" : "18px"
                            }}>
                                <div style={{
                                    flex: 1,
                                    minWidth: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    gap: "1rem",
                                    maxWidth: "none",
                                    minWidth: "300px"
                                }}>
                                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                        <h4 className="head_left_side">
                                            {subStep === 1 && t("Choose The Beneficiary")}
                                            {subStep === 2 && t("Enter the Amount You Wish to Transfer.")}
                                            {subStep === 3 && t("Choose Request Type")}
                                            {/* {subStep === 4 && completed && t("Authenticate Your Payment")} */}
                                        </h4>
                                        {
                                            subStep === 4 && !completed
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
                                            completed && subStep === 5
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
                                                                <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} step={1} setBeneficiary={setBeneficiary} />
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
                                <div style={{ flex: 1.5, minWidth: "300px" }}>
                                    {
                                        subStep === 1
                                        &&
                                        <PaymentsBeneficiary
                                            beneficiary={beneficiary}
                                            setBeneficiary={setBeneficiary}
                                            setSubStep={setSubStep}
                                            type={"Requesting"}
                                            backHandler={() => {
                                                setAction("")
                                                setStep(1)
                                            }}
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
                                            decrementHandler={() => setRecCycle(prev => prev - 1)}
                                            incrementHandler={() => setRecCycle(prev => prev + 1)}
                                            timezone={timezone}
                                            setTimezone={setTimezone}
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
                                            timezone={timezone}
                                            setTimezone={setTimezone}
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
                                        <ConfirmRequest beneficiary={beneficiary} amount={amount} currency={currency} paymentType={paymentType} setConfirmed={setCompleted} setSubStep={setSubStep} step={3} setter={setPaymentType} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} setNotInstant={setNotInstant} setBeneficiary={setBeneficiary}
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
                                            coords={coords}
                                            setCoords={setCoords}
                                            prefrencesFunc={getPrefrences}
                                            preferences={preferences}
                                            isPreferencesCheck={isPreferencesCheck}
                                        />
                                    }
                                    {
                                        subStep === 4 && completed &&
                                        <OTPConfirmation
                                            coords={coords}
                                            setSubStep={setSubStep}
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
                                        subStep === 5 && completed
                                        &&
                                        <RequestReceipt setShowStatus={setShowStatus} beneficiary={beneficiary} amount={amount} currency={currency} paymentType={paymentType} exchangeRate={exchangeRate} />
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