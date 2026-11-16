import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectedCountry from "./SelectedCountry";
import SelectedPayoutChannel from "./SelectedPayoutChannel";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import { Card, CardBody } from "reactstrap";
import PaymentCountry from "./Country";
import PayoutChannel from "./PayoutChannel";
import PWizard from "./PWizard";
import AmountAndCurrency from "./AmountAndCurrency";
import PaymentsBeneficiary from "./Beneficiary";
import ConfirmSend from "./ConfirmSend";
import w1 from "./files/w1.png";
import int from "./files/int.svg";
import SendActionCard from "./Common/SendActionCard";
import PaymentType from "./PaymentType";
import SelectedPaymentType from "./SelectedPaymentType";
import Receipt from "./InternationalReceipt";
import c_vid from "./files/confirm.mp4";
import cfm_vid from "./files/confirmation.mp4";
import Recursive from "./RecursivePayment";
import SchedulePayment from "./SchedulePayment";
import wimm from "./files/wimm.png";
import where from "./files/where_w.png";
import Timeline from "./StatusTimeline";
import InstalmentPayment from "./InstalmentPayment";
import SplitPayment from "./SplitPayment";
import "./styles/ConfirmContainer.css";
import "./styles/i_transfer.css";
import OTPConfirmation from "./OTPConfirmation";
import AvailableBankServices from "./AvailableBankServices";

// new
import international from "./files/international.png";
import { UserContext } from "../../Context/UserContext";

const InternationalTransfer = ({
  sendPaymentType,
  setStep,
  setSendPaymentType,
  setIsInternational,
}) => {
  const { userWallets, userDetails } = useContext(UserContext);
  const { t } = useTranslation();
  const [subStep, setSubStep] = useState(0);
  const [country, setCountry] = useState("");
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [subService, setSubService] = useState("");
  const [payoutChannel, setPayoutChannel] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("100.00");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [beneficiary, setBeneficiary] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notInstant, setNotInstant] = useState(false);
  const [extra, setExtra] = useState("");

  const [quotationDetails, setQuotationDetails] = useState("");
  const [createdQuotation, setCreatedQuotation] = useState(null);
  const [createdTransaction, setCreatedTransaction] = useState("");
  const [transactionDetails, setTransactionDetails] = useState("");

  // recursive payment
  const [recursiveType, setRecursiveType] = useState("Weekly");
  const [unlimited, setUnlimited] = useState(false);
  const [recDay, setRecDay] = useState("Monday");
  const [recCycle, setRecCycle] = useState(0);
  const [recStartDate, setRecStartDate] = useState("");

  // schedule payment
  const [scheduleDate, setScheduleDate] = useState();
  const [scheduleTime, setScheduleTime] = useState();

  // instalment payment
  const [billingDate, setBillingDate] = useState();
  const [numOfTerms, setNumOfTerms] = useState(0);

  // split payment
  const [numOfSplits, setNumOfSplits] = useState(0);
  const [splitAmount, setSplitAmount] = useState(0);

  // conditionals
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (recursiveType === "Monthly") {
      setRecDay("");
    } else {
      setRecDay("Monday");
    }
  }, [recursiveType]);

  useEffect(() => {
    setSubStep(1);
    setCountry("");
    setPayoutChannel("");
    setCurrency("USD");
    setAmount("100.00");
    setReason("");
    setComment("");
    setFiles([]);
    setBeneficiary([]);
    setPaymentMethod("");
    setConfirmed("");
    setNotInstant(false);
    setRecursiveType("Weekly");
    setUnlimited(false);
    setRecDay("Monday");
    setRecCycle(0);
    setRecStartDate("");
  }, [sendPaymentType]);

  useEffect(() => {
    if (subStep < 2) {
      setPayoutChannel("");
      setServices([]);
      setSubServices([]);
    }
    if (subStep < 3) {
      setSubService("");
    }
    if (subStep < 4) {
      setAmount("100.00");
    }
  }, [subStep]);

  const timelineData = [
    {
      id: Math.random() * Date.now(),
      name: `You used${payoutChannel.name}`,
    },
    {
      id: Math.random() * Date.now(),
      name: `You sent ${amount} ${currency}`,
    },
    {
      id: Math.random() * Date.now(),
      name: "Your Payment is being processed.",
    },
  ];

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCVC] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [sendType, setSendType] = useState("wallet");
  const [codeType, setCodeType] = useState("sms");

  useEffect(() => {
    setCodeType(userDetails?.tfa ? "authenticator" : "sms");
  }, [userDetails]);
  return (
    <>
      {showStatus ? (
        <div style={{ display: "flex", height: "100%", width: "100%" }}>
          <SendActionCard
            bg={wimm}
            title={t("Where Is My Money")}
            icon={where}
            desc={t(
              "Send money across borders with ease. Transfer funds internationally \nto friends, family, or businesses in just a few clicks. Choose from \na wide range of payment channels including bank account, \nmobile money/mobile wallet, cash pick-up location, or payment card \nfor convenient and secure transactions.",
            )}
            setter={setExtra}
            setterValue="abc"
            setStep={setExtra}
            showDesc={true}
            active={true}
            sendPaymentType={true}
          />
          <Card style={{ width: "100%", paddingBottom: "1rem" }}>
            <CardBody style={{ display: "flex", padding: "24px", gap: "24px" }}>
              <div style={{ width: "100%" }}>
                <Receipt
                  beneficiary={beneficiary}
                  amount={amount}
                  currency={currency}
                  country={country}
                  payoutChannel={payoutChannel}
                  paymentType={paymentMethod}
                  setShowStatus={setShowStatus}
                  setIsInternational={setIsInternational}
                />
              </div>
              <Card
                style={{
                  height: "100%",
                  marginBottom: 0,
                  boxShadow: "none",
                  gap: "1.3rem",
                  maxHeight: "540px",
                  width: "100%",
                }}
              >
                <CardBody
                  style={{
                    paddingBottom: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    borderRadius: "20px",
                    padding: "30px",
                    background: "rgba(0,0,0,.03)",
                    paddingBottom: 0,
                    width: "100%",
                  }}
                >
                  <span>{t("Updates")}:</span>
                  <Timeline items={timelineData} />
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            width: sendPaymentType === "international" ? "calc(100% - 130px)" : "fit-content",
            transition: "500ms",
          }}
          className="i_t_con"
        >
          <SendActionCard
            // bg={w1}
            bg={international}
            title={t("International Transfer")}
            icon={int}
            desc={t(
              "Send money across borders with ease. Transfer funds internationally \nto friends, family, or businesses in just a few clicks. Choose from \na wide range of payment channels including bank account, \nmobile money/mobile wallet, cash pick-up location, or payment card \nfor convenient and secure transactions.",
            )}
            setter={setSendPaymentType}
            setterValue="international"
            setStep={setStep}
            showDesc={sendPaymentType === "international"}
            active={sendPaymentType === "international"}
            sendPaymentType={sendPaymentType}
          />

          {sendPaymentType === "international" && (
            <Card
              style={{
                height: "100%",
                width: sendPaymentType === "international" ? "100%" : "0px",
                transition: "500ms",
                paddingBottom: "1rem",
              }}
            >
              <CardBody
                style={{
                  display: "flex",
                  gap: subStep === 7 ? "0rem" : "1rem",
                  padding: window.innerWidth > 1500 ? "24px" : "18px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    maxWidth: "none",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ height: "100%" }}>
                      <h4 className="head_left_side">
                        {subStep === 1 && t("Select the country where you want to send the money!")}
                        {subStep === 2 && t("Select Payout Channel")}
                        {payoutChannel?.value === "bank" && subStep === 3 && t("Select The Bank")}
                        {payoutChannel?.value === "mobile" &&
                          subStep === 3 &&
                          t("Select The Mobile Wallet")}
                        {payoutChannel?.value === "bank" && subStep === 4 && t("Bank Transfer")}
                        {subStep === 5 && t("Select Payment Type")}
                        {subStep === 6 && t("Choose the Beneficiary")}
                        {subStep === 7 && confirmed && t("Authenticate Your Payments")}
                      </h4>
                      {subStep === 2 && t("Select your most convenient option to send the money.")}
                      {subStep === 4 &&
                        payoutChannel?.value === "bank" &&
                        t(
                          "Send money directly to a recipient's bank account. Enjoy the convenience and security of transferring funds seamlessly to any bank around the world.",
                        )}
                      {subStep === 7 && !confirmed ? (
                        <div
                          style={{
                            textAlign: "center",
                            height: "101%",
                            borderRadius: "24px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            marginTop: "-.6rem",
                            maxWidth: "320px",
                          }}
                          className="confirm_container"
                        >
                          <h4
                            style={{
                              color: "#5936f0",
                              wordBreak: "normal",
                              padding: "2rem",
                            }}
                            className="head_confirm"
                          >
                            {t("Confirm Your Payment")}
                          </h4>
                          <video
                            src={cfm_vid}
                            autoPlay
                            loop="true"
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                              mixBlendMode: "multiply",
                              paddingBottom: "2rem",
                            }}
                          ></video>
                        </div>
                      ) : (
                        ""
                      )}
                      {confirmed && subStep === 8 && (
                        <div
                          style={{
                            padding: "2rem",
                            textAlign: "center",
                            height: "101%",
                            borderRadius: "24px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            marginTop: "-.6rem",
                            maxWidth: "320px",
                          }}
                          className="confirm_container"
                        >
                          <h4
                            style={{
                              color: "#5936f0",
                              wordBreak: "normal",
                              fontSize: "1rem",
                            }}
                            className="head_confirm"
                          >
                            {t("Your payment is confirmed")}
                          </h4>
                          <video
                            src={c_vid}
                            autoPlay
                            loop="true"
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                              mixBlendMode: "multiply",
                            }}
                          ></video>
                          <p>
                            {t("Thanks for Using")} <br /> {t("InstaPay")}
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {country && subStep > 1 && subStep < 7 && (
                        <SelectedCountry country={country} setSubStep={setSubStep} />
                      )}
                      {payoutChannel && subStep > 3 && subStep < 7 && (
                        <SelectedPayoutChannel
                          payoutChannel={payoutChannel}
                          setSubStep={setSubStep}
                        />
                      )}
                      {payoutChannel.value === "bank" && subStep > 4 && subStep < 7 && (
                        <SelectedAmountAndCurrency
                          amount={amount}
                          currency={currency}
                          setSubStep={setSubStep}
                          step={3}
                        />
                      )}
                      {paymentMethod && subStep > 5 && subStep < 7 && (
                        <SelectedPaymentType
                          paymentType={paymentMethod}
                          setSubStep={setSubStep}
                          scheduleDate={`To: ${scheduleDate} ${scheduleTime}`}
                          subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`}
                        />
                      )}
                    </div>
                  </div>
                  {subStep < 7 && (
                    <div>
                      <PWizard subStep={subStep} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1.6, minWidth: "300px" }}>
                  {subStep === 1 && (
                    <PaymentCountry
                      country={country}
                      setCountry={setCountry}
                      setSubStep={setSubStep}
                      services={services}
                      setServices={setServices}
                    />
                  )}
                  {subStep === 2 && (
                    <PayoutChannel
                      setSubStep={setSubStep}
                      payoutChannel={payoutChannel}
                      setPayoutChannel={setPayoutChannel}
                      services={services}
                      setSubServices={setSubServices}
                      country={country}
                    />
                  )}
                  {subStep === 3 && (
                    <AvailableBankServices
                      setSubService={setSubService}
                      subService={subService}
                      subServices={subServices}
                      setSubStep={setSubStep}
                      placeHolder={payoutChannel?.value ?? ""}
                    />
                  )}
                  {subStep === 4 &&
                    (payoutChannel?.value === "bank" ||
                      payoutChannel?.value === "mobile" ||
                      payoutChannel?.value === "cash") && (
                      <AmountAndCurrency
                        setSubStep={setSubStep}
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
                    )}
                  {subStep === 5 && !notInstant && (
                    <PaymentType
                      setSubStep={setSubStep}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      setNotInstant={setNotInstant}
                    />
                  )}
                  {subStep === 5 && paymentMethod.value === "subscription" && notInstant && (
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
                  )}
                  {subStep === 5 && paymentMethod.value === "schedule" && notInstant && (
                    <SchedulePayment
                      scheduleDate={scheduleDate}
                      setScheduleDate={setScheduleDate}
                      scheduleTime={scheduleTime}
                      setScheduleTime={setScheduleTime}
                      setSubStep={setSubStep}
                    />
                  )}
                  {subStep === 5 && paymentMethod.value === "instalment" && notInstant && (
                    <InstalmentPayment
                      amount={amount}
                      currency={currency}
                      numOfTerms={numOfTerms}
                      setNumOfTerms={setNumOfTerms}
                      billingDate={billingDate}
                      setBillingDate={setBillingDate}
                      setSubStep={setSubStep}
                    />
                  )}
                  {subStep === 5 && paymentMethod.value === "split" && notInstant && (
                    <SplitPayment
                      amount={amount}
                      currency={currency}
                      numOfSplits={numOfSplits}
                      setNumOfSplits={setNumOfSplits}
                      splitAmount={splitAmount}
                      setSplitAmount={setSplitAmount}
                      setSubStep={setSubStep}
                    />
                  )}
                  {subStep === 6 && (
                    <PaymentsBeneficiary
                      beneficiary={beneficiary}
                      setBeneficiary={setBeneficiary}
                      setSubStep={setSubStep}
                      payoutChannel={payoutChannel?.value}
                      international={{
                        amount,
                        payer_id: subService?.id,
                        token: quotationDetails.token,
                        currency,
                        setCreatedQuotation,
                        subServices,
                      }}
                      country={country?.name}
                      countryCode={country?.alpha3}
                    />
                  )}
                  {beneficiary && subStep === 7 && !confirmed && (
                    <ConfirmSend
                      beneficiary={beneficiary}
                      amount={amount}
                      currency={currency}
                      country={country}
                      payoutChannel={payoutChannel}
                      paymentType={paymentMethod}
                      setConfirmed={setConfirmed}
                      setSubStep={setSubStep}
                      scheduleDate={scheduleDate}
                      scheduleTime={scheduleTime}
                      recStartDate={recStartDate}
                      recCycle={recCycle}
                      reason={reason}
                      quotationDetails={quotationDetails}
                      setCreatedTransaction={setCreatedTransaction}
                      createdQuotation={createdQuotation}
                      setBeneficiary={setBeneficiary}
                      comment={comment}
                    />
                  )}
                  {subStep === 7 && confirmed && (
                    <OTPConfirmation
                      setSubStep={setSubStep}
                      createdTransaction={createdTransaction}
                      setTransactionDetails={setTransactionDetails}
                      intFiles={files}
                      intComment={comment}
                      intResend={{
                        comment,
                        reason,
                        beneficiary: beneficiary?.[0],
                        payoutChannel,
                        currency,
                        token: quotationDetails?.token,
                      }}
                      intSendType={sendType}
                      intCardPayment={{
                        wallet_id: userWallets.filter((item) => item.currency.code === currency)[0]
                          ?._id,
                        amount: +amount,
                        saveCard,
                      }}
                      authType={codeType}
                      setAuthType={setCodeType}
                    />
                  )}
                  {confirmed && subStep === 8 && (
                    <Receipt
                      beneficiary={beneficiary}
                      amount={amount}
                      currency={currency}
                      country={country}
                      payoutChannel={payoutChannel}
                      paymentType={paymentMethod}
                      setShowStatus={setShowStatus}
                      setIsInternational={setIsInternational}
                      transactionDetails={transactionDetails}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  );
};

export default InternationalTransfer;
