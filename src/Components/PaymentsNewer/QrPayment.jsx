import React, { useContext, useEffect, useState } from "react";
import SendActionCard from "./Common/SendActionCard";
import w1 from "./files/qr.png";
import qr from "./files/qr.svg";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import PWizard from "./PWizard";
import QRCodeScan from "./QRCodeScan";
import QRRecipient from "./QRRecipient";
import AmountAndCurrency from "./AmountAndCurrency";
import c_vid from "./files/confirm.mp4";
import cfm_vid from "./files/confirmation.mp4";
import OTPConfirmation from "./OTPConfirmation";
import WalletReceipt from "./WalletReceipt";
import { UserContext } from "../../Context/UserContext";
import ConfirmQRPayment from "./ConfirmQRPayment";

// new
import qr_code from "./files/qr_code.png";

const QrPayment = ({ setSendPaymentType, sendPaymentType, setStep }) => {
  const { t } = useTranslation();
  const { userWallets, userDetails } = useContext(UserContext);
  const [subStep, setSubStep] = useState(1);
  const [wallet, setWallet] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("100.00");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [extra, setExtra] = useState("");
  const [token, setToken] = useState("");

  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    setSubStep(1);
    setWallet("");
    setCurrency("USD");
    setAmount("100.00");
    setReason("");
    setComment("");
    setFiles([]);
    setConfirmed(false);
  }, [sendPaymentType]);

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
    <div
      style={{
        display: "flex",
        width: sendPaymentType === "qr_pay" ? "calc(100% - 240px)" : "fit-content",
        transition: "500ms",
        order: sendPaymentType === "qr_pay" ? 1 : 10,
      }}
      className="i_t_con"
    >
      <SendActionCard
        // bg={w1}
        bg={qr_code}
        title={t("QR Code Payment")}
        icon={qr}
        desc={t(
          "Instantly transfer money to other InstaPay users with our secure wallet-to-wallet \nservice. Send and receive funds hassle-free within seconds.",
        )}
        setter={setSendPaymentType}
        setterValue="qr_pay"
        setStep={setStep}
        showDesc={sendPaymentType === "qr_pay"}
        active={sendPaymentType === "qr_pay"}
        sendPaymentType={sendPaymentType}
      />

      {sendPaymentType === "qr_pay" && (
        <Card
          style={{
            height: "100%",
            width: sendPaymentType === "qr_pay" ? "100%" : "0px",
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
                    {subStep === 1 || (subStep === 2 && t("Scan/Upload QR Code of the Recipient"))}
                    {subStep === 3 && t("Enter the Amount You Wish to Transfer.")}
                    {subStep === 4 && confirmed && t("Please Authenticate Your Payment.")}
                  </h4>
                  {subStep === 4 && !confirmed ? (
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
                  {confirmed && subStep === 5 && (
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
                        style={{ color: "#5936f0", wordBreak: "normal" }}
                        className="head_confirm"
                      >
                        {t("Your payment is confirmed")}
                      </h4>
                      <video
                        src={c_vid}
                        autoPlay
                        loop="true"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          mixBlendMode: "multiply",
                        }}
                      ></video>
                      <p>{"Thanks for using InstaPay"}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>{subStep < 4 && <PWizard subStep={subStep} />}</div>
            </div>
            <div style={{ flex: 1.6, minWidth: "300px", height: "100%" }}>
              {subStep === 1 && <QRCodeScan setSubStep={setSubStep} setWallet={setWallet} />}
              {subStep === 2 && <QRRecipient setSubStep={setSubStep} wallet={wallet} />}
              {subStep === 3 && (
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
                  paymentType="wallet"
                  walletDetails={wallet}
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
                />
              )}
              {subStep === 4 && !confirmed && (
                <ConfirmQRPayment
                  amount={amount}
                  currency={currency}
                  wallet={wallet}
                  setConfirmed={setConfirmed}
                  setSubStep={setSubStep}
                  paymentDetails={{
                    receiver_wallet_id: wallet.wallet_id,
                    sender_wallet_id: userWallets.filter(
                      (item) => item.currency.code === currency,
                    )[0]?._id,
                    purpose: reason,
                    amount: +amount,
                    type: "instant",
                    payment_type: "qr_pay",
                    comment,
                  }}
                  setToken={setToken}
                />
              )}
              {subStep === 4 && confirmed && (
                <OTPConfirmation
                  setSubStep={setSubStep}
                  type="wallet"
                  paymentDetails={{
                    receiver_wallet_id: wallet.wallet_id,
                    sender_wallet_id: userWallets.filter(
                      (item) => item.currency.code === currency,
                    )[0]?._id,
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
                    transactionDetails,
                  }}
                  setTransactionDetails={setTransactionDetails}
                  authType={codeType}
                  setAuthType={setCodeType}
                />
              )}
              {confirmed && subStep === 5 && (
                <WalletReceipt
                  walletDetails={wallet}
                  transactionDetails={transactionDetails}
                  amount={amount}
                  currency={currency}
                  setIsWallet={setExtra}
                  setShowStatus={setExtra}
                  type={"instant"}
                />
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default QrPayment;
