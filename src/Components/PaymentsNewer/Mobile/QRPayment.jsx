import { useNavigate } from "react-router";
import styles from "./styles/International.module.css";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { ChevronLeft } from "react-feather";
import TopIcon from "./files/Top";
import { UserContext } from "../../../Context/UserContext";
import QRFlow from "../QRFlow";

const QRPayment = ({
  step,
  setStep,
  setCurrentFlow,
  setSendPaymentType,
  sendPaymentType,
  setAction,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const { userWallets, userDetails } = useContext(UserContext);
  const [wallet, setWallet] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("100.00");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setWallet("");
    setCurrency("USD");
    setAmount("100.00");
    setReason("");
    setComment("");
    setFiles([]);
    setConfirmed(false);
  }, [sendPaymentType]);

  const [codeType, setCodeType] = useState("sms");

  useEffect(() => {
    setCodeType(userDetails?.tfa ? "authenticator" : "sms");
  }, [userDetails]);
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <button
          className={styles.back_btn}
          disabled={step === 6 && confirmed}
          onClick={() => {
            if (step === 7) {
              setStep(1);
              setCurrentFlow("");
              setSendPaymentType("");
              setAction("");
              navigate("/payments");
            } else {
              if (step === 3) {
                setCurrentFlow("");
                setSendPaymentType("");
              }
              setStep((prev) => prev - 1);
            }
          }}
        >
          <ChevronLeft />
        </button>
        <h5>{t("QR Code Payment").toUpperCase()}</h5>
        <div>
          <TopIcon fill={step > 3 ? "#5926f0" : "black"} />
        </div>
      </div>
      <QRFlow
        sendPaymentType={sendPaymentType}
        setIsWallet={() => {}}
        setSendPaymentType={setSendPaymentType}
        setStep={setStep}
      />
      {/* {
                step < 6
                &&
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                    <PWizard subStep={step - 2} />
                </div>
            }
            <div className={styles.bottom}>
                {
                    step === 3
                    &&
                    <AddQRDetails
                        setSubStep={setStep}
                        setWallet={setWallet}
                    />
                }
                {
                    step === 4
                    &&
                    <QRRecipient
                        setSubStep={setStep}
                        wallet={wallet}
                    />
                }
                {
                    step === 5
                    &&
                    <AmountAndCurrency
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
                        paymentType="wallet"
                        setStep={setStep}
                        exchangeType="qr_pay"
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
                        sendType={sendType}
                        setSendType={setSendType}
                        walletDetails={wallet}
                    />
                }
                {
                    step === 6 && !confirmed
                    &&
                    <div className="mt-4">
                        <h5 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", textAlign: "center" }}>{t("Confirm Your Payment")}</h5>
                        <ConfirmQRPayment
                            amount={amount}
                            currency={currency}
                            wallet={wallet}
                            setConfirmed={setConfirmed}
                            setSubStep={setStep}
                            setToken={setToken}
                            paymentDetails={{
                                receiver_wallet_id: wallet.wallet_id,
                                sender_wallet_id: userWallets.filter(item => item.currency.code === currency)[0]?._id,
                                purpose: reason,
                                amount: +amount,
                                type: "instant",
                                payment_type: "qr_pay",
                                comment
                            }}
                        />
                    </div>
                }
                {
                    step === 6 && confirmed
                    &&
                    <OTPConfirmation setSubStep={setStep}
                        type="wallet"
                        paymentDetails={{
                            receiver_wallet_id: wallet.wallet_id,
                            sender_wallet_id: userWallets.filter(item => item.currency.code === currency)[0]?._id,
                            purpose: reason,
                            amount: +amount,
                            type: "instant",
                            payment_type: "qr_pay",
                            token,
                            files,
                            sendType,
                            saveCard,
                            cardHolderName,
                            cardNumber,
                            cvc,
                            expiry,
                            currency,
                            transactionDetails
                        }}
                        setTransactionDetails={setTransactionDetails}
                        authType={codeType}
                        setAuthType={setCodeType}
                    />
                }
                {
                    step === 7
                    &&
                    <WalletReceipt
                        walletDetails={wallet} transactionDetails={transactionDetails} amount={amount} currency={currency} setIsWallet={setExtra} setShowStatus={setExtra} type={"instant"}
                    />
                }
            </div> */}
    </div>
  );
};

export default QRPayment;
