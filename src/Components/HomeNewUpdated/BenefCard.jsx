import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PaymentMethod from "./Payments/PaymentMethod";
import W2W from "./Payments/W2W";
import OTPConfirmation from "./Payments/OTPConfirmation";
import { UserContext } from "../../Context/UserContext";
import W2WReceipt from "./Payments/W2WReceipt";
import International from "./Payments/International";
import countries from "../PaymentsNewer/CountriesData.json";
import Receipt from "./Payments/InternationalReceipt";
import { useTranslation } from "react-i18next";

const BenefCard = ({ item, index, total }) => {
  const [showModal, setShowModal] = useState(false);
  const toggle = () => {
    // verifyToken()
    setShowModal(!showModal);
  };
  const [name, setName] = useState();
  const { t } = useTranslation();

  const setFullName = (e) => {
    // e.target.scrollIntoView()
    setName(
      item?.beneficiary_type === "individual"
        ? `${item?.first_name} ${item?.last_name}`
        : item?.company_name,
    );
  };
  const setHalfName = () => {
    setName(
      item?.beneficiary_type === "individual"
        ? item?.first_name.slice(0, 8) + ".."
        : item?.company_name?.slice(0, 8) + "..",
    );
  };

  useEffect(() => {
    if (item) {
      setHalfName();
    }
  }, [item]);

  const { userWallets } = useContext(UserContext);

  // modal states
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [reason, setReason] = useState("");
  const [paymentType, setPaymentType] = useState(null);
  const [unlimited, setUnlimited] = useState(false);
  const [recCycle, setRecCycle] = useState(0);
  const [recStartDate, setRecStartDate] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [walletDetails, setWalletDetails] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState("");
  const [createdTransaction, setCreatedTransaction] = useState("");
  const [transactionDetails, setTransactionDetails] = useState("");
  const country = useMemo(
    () =>
      countries.filter(
        (coun) => coun.name.toLowerCase() === item?.country_name?.toLowerCase(),
      )?.[0] ?? "",
    [item],
  );
  const [service, setService] = useState(null);

  useEffect(() => {
    if (item && item.wallet.length > 0) {
      setWalletDetails(item?.wallet?.[0]);
    }
  }, [item]);

  useEffect(() => {
    setStep(1);
    setPaymentMethod(null);
    setAmount("100");
    setCurrency("USD");
    setReason("");
    setPaymentType(null);
    setUnlimited(false);
    setRecCycle(0);
    setRecStartDate("");
    setScheduleDate("");
    setScheduleTime("");
    setWalletDetails(null);
    setTransactionDetails("");
    if (item && item.wallet.length > 0) {
      setWalletDetails(item?.wallet?.[0]);
    }
  }, [showModal, item]);

  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipPosition =
    index === total - 1 && total > 1
      ? { right: 0 }
      : index === 0
        ? { left: 0 }
        : { left: "50%", transform: "translateX(-50%)" };

  return (
    <>
      <div
        key={item}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: ".5rem",
          cursor: "pointer",
          transition: "500ms linear",
          minWidth: "fit-content",
          minWidth: "80px",
        }}
        onClick={toggle}
        onMouseEnter={(_) => setShowTooltip(true)}
        onMouseLeave={(_) => setShowTooltip(false)}
      >
        <div
          style={{
            padding: "3px",
            border: "1.224px solid #5926F0",
            boxShadow:
              "0px 15.82421px 17.14289px 0px rgba(109, 41, 220, 0.04), 0px 3.79584px 148.98665px 0px rgba(0, 0, 0, 0.09)",
            borderRadius: window.innerWidth > 1500 ? "25px" : "18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: window.innerWidth > 1500 ? "60px" : "45px",
              height: window.innerWidth > 1500 ? "60px" : "45px",
              borderRadius: window.innerWidth > 1500 ? "23px" : "17px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
              color: "white",
              fontSize: "1.4rem",
              fontWeight: 800,
            }}
          >
            {item?.beneficiary_type === "individual"
              ? item?.first_name?.[0]?.toUpperCase()
              : item?.company_name?.[0]?.toUpperCase()}
          </div>
        </div>
        <p
          style={{
            marginBottom: 0,
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          {name}
          {showTooltip && (
            <div
              style={{
                ...tooltipPosition,
                padding: "1px 10px",
                borderRadius: "3px",
                fontSize: ".8rem",
                backgroundColor: "#5926f0",
                color: "white",
                position: "absolute",
                bottom: "102%",
              }}
            >
              {item?.beneficiary_type === "individual"
                ? `${item?.first_name} ${item?.last_name}`
                : item?.company_name}
            </div>
          )}
        </p>
      </div>
      <Modal isOpen={showModal} toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {t("Send Money To")} {item?.first_name} {item?.last_name}
        </ModalHeader>
        <ModalBody>
          {step === 1 && paymentMethod === null && (
            <PaymentMethod setPaymentMethod={setPaymentMethod} item={item} setStep={setStep} />
          )}
          {step === 2 && paymentMethod?.value === "wallet" && (
            <W2W
              item={item}
              setStep={setStep}
              amount={amount}
              setAmount={setAmount}
              currency={currency}
              setCurrency={setCurrency}
              reason={reason}
              setReason={setReason}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              unlimited={unlimited}
              setUnlimited={setUnlimited}
              recCycle={recCycle}
              setRecCycle={setRecCycle}
              recStartDate={recStartDate}
              setRecStartDate={setRecStartDate}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              walletDetails={walletDetails}
            />
          )}
          {step === 2 && paymentMethod?.value !== "wallet" && (
            <International
              item={item}
              paymentMethod={paymentMethod}
              country={country}
              setService={setService}
              service={service}
              setStep={setStep}
              amount={amount}
              setAmount={setAmount}
              currency={currency}
              setCurrency={setCurrency}
              reason={reason}
              setReason={setReason}
              quotationDetails={quotationDetails}
              setQuotationDetails={setQuotationDetails}
              createdTransaction={createdTransaction}
              setCreatedTransaction={setCreatedTransaction}
            />
          )}
          {step === 3 && (
            <OTPConfirmation
              setStep={setStep}
              type={paymentMethod.value === "wallet" ? "wallet" : ""}
              paymentDetails={{
                receiver_wallet_id: walletDetails?.wallet_id,
                sender_wallet_id: userWallets.filter((item) => item.currency.code === currency)?.[0]
                  ?._id,
                purpose: reason,
                amount: +amount,
                type: paymentType?.value,
                recCycle,
                recStartDate,
                unlimited,
                scheduleDate,
                scheduleTime,
              }}
              createdTransaction={createdTransaction}
              setTransactionDetails={setTransactionDetails}
            />
          )}
          {step === 4 && paymentMethod?.value === "wallet" && (
            <W2WReceipt
              amount={amount}
              currency={currency}
              item={item}
              transactionDetails={transactionDetails}
              walletDetails={walletDetails}
              type={paymentType?.value}
            />
          )}
          {step === 4 && paymentMethod?.value !== "wallet" && (
            <Receipt
              amount={amount}
              currency={currency}
              country={country}
              payoutChannel={paymentMethod}
              item={item}
              transactionDetails={transactionDetails}
            />
          )}
        </ModalBody>
      </Modal>
      {/* <SendPaymentModal item={item} showModal={showModal} toggle={toggle} /> */}
    </>
  );
};

export default BenefCard;
