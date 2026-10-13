import { useContext, useEffect, useState } from "react";
import styles from "./styles/International.module.css";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import TopIcon from "./files/Top";
import { ChevronLeft } from "react-feather";
import PaymentsBeneficiary from "../Beneficiary";
import AmountAndCurrency from "./AmountAndCurrency";
import RequestType from "./RequestType";
import Recursive from "./Recursive";
import SchedulePayment from "./Schedule";
import InstalmentPayment from "../InstalmentPayment";
import SplitPayment from "../SplitPayment";
import ConfirmRequest from "./ConfirmRequest";
import OTPConfirmation from "../OTPConfirmation";
import RequestReceipt from "../RequestReceipt";
import PWizard from "../PWizard";
import { UserContext } from "../../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { Modal, ModalBody } from "reactstrap";
import Icon from "../../../assets/icons/cancel-user.png";
import { useNavigate as RouterNavigate } from "react-router-dom";

const RequestMoneyMobile = ({ step, setStep, setCurrentFlow, setAction }) => {
  const navigate = useNavigate();
  const navigate2 = RouterNavigate();
  const { t } = useTranslation();
  const [beneficiary, setBeneficiary] = useState([]);
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState("1.00");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [completed, setCompleted] = useState(false);
  const [extra, setExtra] = useState("");
  const [notInstant, setNotInstant] = useState(false);

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

  const [requestDetails, setRequestDetails] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [token, setToken] = useState("");

  const handleRemoveBeneficiary = (index) => {
    const updatedBeneficiaries = [...beneficiary];
    updatedBeneficiaries.splice(index, 1);
    setBeneficiary(updatedBeneficiaries);
  };
  const { userDetails, userWallets, authHeader } = useContext(UserContext);
  const [codeType, setCodeType] = useState("sms");
  const [totalBalance, setTotalBalance] = useState(0);
  const [timezone, setTimezone] = useState("");
  const [preferences, setPreferences] = useState({
    origin: false,
    live: false,
  });
  const [isPreferencesCheck, SetIsPreferencesCheck] = useState(false);

  useEffect(() => {
    if (userWallets?.length > 0 && currency && userDetails?.user?.kyc_status !== "approved") {
      const getExchangedAmounts = async (from, to, amount) => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`,
            {
              headers: authHeader,
            },
          );
          const dec = decryptData(res?.data?.data);
          return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
          return 0; // return 0 in case of error
        }
      };

      const calculateTotal = async () => {
        const wallets = userWallets.filter((item) => item?.wallet_type === "insta");
        const promises = wallets.map((item) =>
          getExchangedAmounts(item?.currency?.code, currency, item?.balance?.available),
        );
        const balances = await Promise.all(promises);
        const total = balances.reduce((acc, balance) => acc + balance, 0);
        setTotalBalance(total ?? 0);
      };

      calculateTotal();
    }
  }, [userWallets, currency]);

  useEffect(() => {
    setCodeType(userDetails?.tfa ? "authenticator" : "sms");
    setTimezone(userDetails?.timezone);
  }, [userDetails]);

  const getPrefrences = async (liveCountry) => {
    console.log(beneficiary, userDetails.country.country_iso_code, liveCountry);
    const userId = beneficiary[0]?.user ? beneficiary[0]?.user?._id : beneficiary[0]?._id;
    try {
      if (userDetails.country.country_iso_code == liveCountry?.iso3) {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${userDetails.country.country_iso_code}`,
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data?.data);

        setPreferences({
          live: dec.data[0].reason.includes("payment_request_live"),
          origin: dec.data[0].reason.includes("payment_request_origin"),
        });
      } else {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${userDetails.country.country_iso_code}`,
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data?.data);

        setPreferences((prev) => ({
          ...prev,
          origin: dec.data[0].reason.includes("payment_request_origin"),
        }));

        const res2 = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/user-preferences/get-preferences/${userId}/${liveCountry?.iso3}`,
          {
            headers: authHeader,
          },
        );

        const dec2 = decryptData(res2.data?.data);

        setPreferences((prev) => ({
          ...prev,
          live: dec2.data[0].reason.includes("payment_request_live"),
        }));
      }
    } catch (error) {
      //
    } finally {
      SetIsPreferencesCheck(true);
    }
  };

  const NoAccessWarning = () => (
    <Modal
      isOpen={isPreferencesCheck && (preferences.live || preferences.origin)}
      backdrop="static"
      keyboard={false}
      className="modal-dialog-centered"
      style={{
        maxWidth: "600px", // Increased from default
        width: "95%",
        margin: "1.75rem auto",
      }}
    >
      <ModalBody
        style={{
          padding: "3rem", // Increased padding
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem", // Increased gap
          alignItems: "center",
          textAlign: "center",
          background: "white", // Explicit background
          borderRadius: "8px", // Added border radius
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)", // Added shadow
        }}
      >
        <img src={Icon} style={{ width: "70px", marginBottom: "7px" }} alt="" />
        <h4
          style={{
            color: "#D92D20",
            fontSize: "22px", // Increased font size
            fontWeight: "600",
            marginBottom: "0",
          }}
        >
          {t("Unsupported Recipient")}
        </h4>
        <p
          style={{
            color: "#667085",
            fontSize: "16px", // Increased font size
            lineHeight: "1.5", // Added line height
            maxWidth: "500px", // Control text width
          }}
        >
          {t(
            `It looks like ${beneficiary?.[0]?.username || beneficiary?.[0]?.user?.name || "this recipient"} has chosen to receive payments only from certain countries and locations, and your account's country or location isn't on the list. You may want to check with them to proceed with the payment request.`,
          )}
        </p>
        <button
          onClick={() => {
            navigate("/payments?payment_action=req_money");
            SetIsPreferencesCheck(false);
          }}
          style={{
            background: "#D92D20",
            color: "white",
            border: "none",
            padding: "12px 24px", // Increased padding
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px", // Increased font size
            fontWeight: "500",
            minWidth: "120px", // Added minimum width
            transition: "background 0.3s",
            "&:hover": {
              background: "#C01E1E",
            },
          }}
        >
          {t("Back")}
        </button>
      </ModalBody>
    </Modal>
  );

  const [coords, setCoords] = useState(null);

  return (
    <div className={styles.container}>
      <NoAccessWarning />
      <div className={styles.top}>
        <button
          className={styles.back_btn}
          disabled={step === 8 && completed}
          onClick={() => {
            if (step === 6) {
              setStep(1);
              setCurrentFlow("");
              setAction("");
              navigate("/payments");
            } else {
              if (step === 2) {
                setCurrentFlow("");
                setAction("");
              }
              setStep((prev) => prev - 1);
            }
          }}
        >
          <ChevronLeft />
        </button>
        <h5>{t("Request Money")}</h5>
        <div>
          <TopIcon fill={step > 2 ? "#5926f0" : "black"} />
        </div>
      </div>
      {step < 5 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PWizard subStep={step - 1} />
        </div>
      )}
      <div className={styles.bottom}>
        {step === 2 && (
          <PaymentsBeneficiary
            beneficiary={beneficiary}
            setBeneficiary={setBeneficiary}
            setSubStep={setStep}
            type={"Requesting"}
            backHandler={() => {
              setAction("");
              setCurrentFlow("");
              setStep(1);
            }}
          />
        )}
        {step === 3 && (
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
        )}
        {step === 4 && !notInstant && (
          <RequestType
            paymentMethod={paymentType}
            setPaymentMethod={setPaymentType}
            setStep={setStep}
            setNotInstant={setNotInstant}
          />
        )}
        {step === 4 && paymentType.value === "subscription" && notInstant && (
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
            decrementHandler={() => setRecCycle((prev) => prev - 1)}
            incrementHandler={() => setRecCycle((prev) => prev + 1)}
            timezone={timezone}
            setTimezone={setTimezone}
          />
        )}
        {step === 4 && paymentType.value === "schedule" && notInstant && (
          <SchedulePayment
            scheduleDate={scheduleDate}
            setScheduleDate={setScheduleDate}
            scheduleTime={scheduleTime}
            setScheduleTime={setScheduleTime}
            setSubStep={setStep}
            timezone={timezone}
            setTimezone={setTimezone}
          />
        )}
        {step === 4 && paymentType.value === "instalment" && notInstant && (
          <InstalmentPayment
            amount={amount}
            currency={currency}
            numOfTerms={numOfTerms}
            setNumOfTerms={setNumOfTerms}
            billingDate={billingDate}
            setBillingDate={setBillingDate}
            setStep={setStep}
          />
        )}
        {step === 4 && paymentType.value === "split" && notInstant && (
          <SplitPayment
            amount={amount}
            currency={currency}
            numOfSplits={numOfSplits}
            setNumOfSplits={setNumOfSplits}
            splitAmount={splitAmount}
            setSplitAmount={setSplitAmount}
            setStep={setStep}
          />
        )}
        {step === 5 && !completed && (
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
              timezone,
            }}
            setToken={setToken}
            recCycle={recCycle}
            recStartDate={recStartDate}
            scheduleTime={scheduleTime}
            setPaymentType={setPaymentType}
            totalBalance={totalBalance}
            prefrencesFunc={getPrefrences}
            preferences={preferences}
            isPreferencesCheck={isPreferencesCheck}
          />
        )}
        {step === 5 && completed && (
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
              timezone,
            }}
            authType={codeType}
            setAuthType={setCodeType}
          />
        )}
        {step === 6 && (
          <RequestReceipt
            setShowStatus={setShowStatus}
            beneficiary={beneficiary}
            amount={amount}
            currency={currency}
            paymentType={paymentType}
            exchangeRate={exchangeRate}
          />
        )}
      </div>
    </div>
  );
};

export default RequestMoneyMobile;
