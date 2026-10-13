import React, { useContext, useEffect, useMemo, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import styles from "../styles/cardToWallet.module.scss";
import { ctw_white } from "../files";
import ContactBox from "../PaymentModal/ContactBox";
import "../styles/modal.reset.css";
import Stepone from "./Stepone.jsx";
import PaymentStep from "../PaymentModal/PaymentStep.jsx";
import { UserContext } from "../../../Context/UserContext.jsx";
import { formatCurrency } from "../../../Helper/AmountFormat.js";
import { paymentInfoJSX } from "../PaymentModal/ConfirmationStep.jsx";
import gif from "../../QuickQrPay/files/success.gif";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption.jsx";
import { feeCol } from "../CardtoCardModal/index.jsx";
import OtpConfirmation from "../../../Common/Component/OtpVerification";
import StepOne from "../../PaymentsNewer/WalletToWalletFlow/StepOne.jsx";
import useWindowWidth from "../../../utils/useWindowWidth.jsx";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { apiErrorMessage } from "../../PaymentsNewer/InternationalFlow";

const CardtoWallet = ({
  isOpen,
  setOpen,
  card,
  setCurrentCardDetails,
  currentCardDetails,
}) => {
  // const [sideText, setSideText] = useState("")
  const [step, setStep] = useState(1);
  const [option, setOption] = useState("my");
  const { userWallets, authHeader, userDetails } = useContext(UserContext);
  const [userWallet, setUserWallet] = useState({});
  const [recipient, setRecipient] = useState({});
  const [amount, setAmount] = useState();
  const [feeDets, setFeeDets] = useState({});
  const [token, setToken] = useState(null);
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);
  const [loading, setLoading] = useState();
  const [otpError, setOtpError] = useState();
  const [showotp, setshowotp] = useState();
  const [otpToken, setOtpToken] = useState();
  const width = useWindowWidth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ctwMobile = queryParams.get("ctwMobile");
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen((prev) => ({ ...prev, ctw: false }));
    setStep(1);
    setOption("my");
    setUserWallet({});
    setRecipient({});
    setAmount("");
    setFeeDets({});
    setToken(null);
    setCodeType("sms");
    setOtpMethods(null);
    setLoading(false);
    setOtpError(null);
    setshowotp(false);
    setOtpToken(null);

    if (ctwMobile) {
      navigate("/my-mastercard");
    }
  };

  useEffect(() => {
    if (userDetails) {
      if (userDetails?.tfa) {
        setCodeType("authenticator");
      } else if (userDetails?.email_verification) {
        setCodeType("email");
      } else if (userDetails?.whatsapp_verification) {
        setCodeType("whatsapp");
      } else {
        setCodeType("sms");
      }
    }
  }, [userDetails]);

  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )
      ?.map((item) => ({
        name: item?.currency?.code,
        ...item,
      }))
      ?.sort((a, b) => {
        if (a.isSufficient && !b.isSufficient) return -1;
        if (!a.isSufficient && b.isSufficient) return 1;
        if (b?.default === true) return 1;
        if (a?.default === true) return -1;
        return b?.balance?.available - a?.balance?.available;
      });
  }, [userWallets]);

  console.log(option, step);

  const disabled = useMemo(() => {
    switch (step) {
      // case 1:
      //     return (!recipient?.wallet?.wallet_id && option === "other")
      case 2:
        return !userWallet?.wallet_id && !recipient.wallet?.wallet_id;
      case 3:
        return !amount;
      default:
        return false;
    }
  }, [step, userWallet, recipient, amount, option]);

  const getFeeDetails = async () => {
    setLoading(true);
    try {
      const data = {
        amount: +amount.toString().replace(/,/g, ""),
        cardId: card._id,
        walletId: userWallet?._id || recipient?.wallet?._id,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/card-to-wallet-fee`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      console.log(dec);
      setStep((prev) => prev + 1);
      setFeeDets(dec?.data?.feeDetails);
      setToken(dec?.data?.token);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      toast.error(
        dec?.message || "An error occurred while fetching fee details",
      );
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (methodId) => {
    const otpMethod = typeof methodId === "string" ? methodId : codeType;
    setLoading(true);
    try {
      const data = {
        data: {
          token,
          cardId: card._id,
          walletId: userWallet?._id || recipient?.wallet?._id,
        },
        type: otpMethod,
      };

      console.log(data);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setOtpMethods(dec);
      if (!showotp) {
        setCodeType(dec?.otp_sent_on || "sms");
      }
      setOtpToken(dec?.token);
      setshowotp(true);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      toast.error(dec?.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransaction = async (otp) => {
    setLoading(true);
    try {
      const data = {
        token: otpToken,
        otp,
        type: codeType,
      };

      console.log(data);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/card-to-wallet-transfer`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setOtpToken(dec?.token);
      setshowotp(false);
      setStep((prev) => prev + 1);
      setCurrentCardDetails((prev) => ({
        ...prev,
        balance: (
          prev.balance - feeDets?.totalAmount?.replace(/,/g, "")
        ).toFixed(2),
      }));
      console.log(dec);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      const error2 = apiErrorMessage(dec?.message);
      if (error2) {
        setOtpError(error2);
      } else {
        toast.error(dec?.message);
      }
      setOtpToken(null);
      setshowotp(false);
    } finally {
      setLoading(false);
    }
  };

  const content = () => (
    <div
      style={{
        minHeight: width < 1000 && "calc(95vh - 80px)",
        width: width < 1000 && "100%",
        gridTemplateColumns: width < 1000 && "1fr",
        gridTemplateRows: width < 1000 && ".1fr 1fr",
        gap: width < 1000 && "1rem",
      }}
      className={styles.container}
    >
      <div className={styles.left}>
        <div className={styles.top}>
          <span>
            <img src={ctw_white} alt="" />
          </span>
          <h3>{t("Card to Wallet")}</h3>
        </div>
        {width > 1000 && <ContactBox />}
      </div>

      <div
        style={{ border: width < 1000 && "none", padding: width < 1000 && "0" }}
        className={styles.right}
      >
        {step === 1 && (
          <div>
            <Stepone option={option} setOption={setOption} />
            <StepOne
              // key={option}
              style={{ display: option !== "other" && "none" }}
              data={{
                loading,
                beneficiary_wallet: recipient.wallet,
                step,
              }}
              dataHandler={(m, v) => {
                if (m === "beneficiary") {
                  setRecipient((prev) => ({
                    ...prev,
                    user: v,
                  }));
                }
                if (m === "beneficiary_wallet") {
                  console.log(v);
                  setRecipient((prev) => ({
                    ...prev,
                    wallet: v,
                  }));
                }
                if (m === "step") {
                  setStep(v);
                }
                if (m === "loading") {
                  setLoading(v);
                }
              }}
              cardToWallet={true}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <span
              style={{
                fontSize: "24px",
                color: "black",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              {t("Choose The Wallet")}
            </span>
            <div
              style={{
                maxHeight: width < 1000 ? "70vh" : "450px",
                overflow: "auto",
              }}
            >
              <PaymentStep
                filteredWallets={filteredWallets}
                paymentType={"wallet"}
                setWalletState={setUserWallet}
                walletState={userWallet}
                cardToWallet={true}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.amountDiv}>
            <h3>{t("Enter the amount")}</h3>
            <div className={styles.amount}>
              <p>{t("Amount")}</p>
              <input
                value={amount}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setAmount("");
                    return;
                  }
                  setAmount(e.target.value);
                }}
                onKeyUp={(e) =>
                  formatCurrency(e.target.value, false, setAmount)
                }
                onBlur={(e) => formatCurrency(e.target.value, true, setAmount)}
                type="text"
                placeholder="30.00"
                data-type="currency"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className={styles.head} style={{ marginBottom: "1.5rem" }}>
              <h3>{t("Transaction Summary")}</h3>
            </div>
            {paymentInfoJSX(
              {
                currency: `${feeDets?.currency} `,
                fee: feeDets?.recipientAmount,
              },
              false,
              t("Amount to be added in wallet"),
            )}
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                alignSelf: "stretch",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "18px",
                borderRadius: "6px",
                background: "rgba(109, 41, 220, 0.04)",
              }}
            >
              <span
                style={{ fontWeight: 600, color: "#8A8A8A", fontSize: "12px" }}
              >
                {t("You used")}
              </span>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span
                  style={{ fontWeight: 600, color: "#000", fontSize: "12px" }}
                >
                  {userWallet?.currency?.code ||
                    recipient?.wallet?.currency?.code}{" "}
                  {t("Wallet")}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#6C6C6C",
                    fontSize: "10px",
                  }}
                >
                  {userWallet?.wallet_id || recipient?.wallet?.wallet_id}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "18px",
                borderRadius: "6px",
                background: "#fafafa",
                display: "grid",
                gap: "8px",
              }}
            >
              {feeCol(t("Sending"), `${card?.currency} ${feeDets?.amount}`)}
              {feeCol(t("Fee"), `${card?.currency} ${feeDets?.fee}`)}
              {(feeDets?.exchangeRate ||
                feeDets?.exchangeRate !== 1 ||
                feeDets?.exchangeRate !== 1) &&
                feeCol(
                  t("Exchange Rate"),
                  `${feeDets?.currency} ${feeDets?.exchangeRate}`,
                )}
              {feeCol(
                t("Total"),
                `${card?.currency} ${feeDets?.totalAmount}`,
                true,
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.success}>
            <img src={gif} alt="" />

            <div className={styles.head} style={{ margin: "3rem 0" }}>
              <h3>{t("Transaction Summary")}</h3>
            </div>

            {paymentInfoJSX(
              { currency: feeDets?.currency, fee: feeDets?.recipientAmount },
              false,
              t("Funds added to Wallet"),
            )}
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                alignSelf: "stretch",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "18px",
                borderRadius: "6px",
                background: "rgba(109, 41, 220, 0.04)",
              }}
            >
              <span
                style={{ fontWeight: 600, color: "#8A8A8A", fontSize: "12px" }}
              >
                {t("You used")}
              </span>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <span
                  style={{ fontWeight: 600, color: "#000", fontSize: "12px" }}
                >
                  {userWallet?.currency?.code ||
                    recipient?.wallet?.currency?.code}{" "}
                  {t("Wallet")}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#6C6C6C",
                    fontSize: "10px",
                  }}
                >
                  {userWallet?.wallet_id || recipient?.wallet?.wallet_id}
                </span>
              </div>
            </div>
          </div>
        )}

        <div
          style={{ flexDirection: width < 1000 && "column-reverse" }}
          className={styles.btns}
        >
          {step !== 5 && (step !== 1 || width < 1000) && (
            <button
              style={{
                flex: width < 1000 && "none",
                background: width < 1000 && "none",
              }}
              onClick={() => {
                if (step === 2) {
                  setUserWallet({});
                  setRecipient({});
                }
                if (step === 3 && option === "other") {
                  setStep(step - 2);
                } else if (step === 1 && width < 1000) {
                  handleClose();
                } else {
                  setStep(step - 1);
                }
              }}
              className={styles.back}
            >
              {t("Back")}
            </button>
          )}
          <button
            style={{
              opacity: (disabled || loading) && 0.5,
              flex: width < 1000 && "none",
            }}
            disabled={disabled || loading}

            onClick={() => {
              if (step === 3) {
                getFeeDetails();
              } else if (step === 4) {
                sendOtp();
              } else if (step === 1 && option === "other") {
                setStep(step + 2);
              } else if (step === 5) {
                handleClose();
              } else {
                setStep(step + 1);
              }
            }}
            className={styles.continue}
          >
            {step === 5 ? t("Close") : t("Continue")}
          </button>
          {width < 1000 && (
            <ContactBox style={{ width: "100%", justifyContent: "center" }} />
          )}
        </div>
      </div>
    </div>
  );
  return (
    <div className="ctw-modal">
      {width > 1000 ? (
        <Modal
          isOpen={isOpen}
          toggle={handleClose}
          style={{ minWidth: "950px" }}
        >
          <ModalBody
            style={{ minHeight: "80vh", display: "flex", padding: "30px" }}
          >
            {content()}
          </ModalBody>
        </Modal>
      ) : (
        content()
      )}

      <OtpConfirmation
        variant="modal"
        data={{
          codeType,
          otpError,
        }}
        isLoading={loading}
        toggle={() => setshowotp(false)}
        isOpen={showotp}
        dataHandler={(m, v) => {
          m === "codeType" ? setCodeType(v) : setOtpError(v);
        }}
        resendHandler={sendOtp}
        methods={otpMethods}
        callback={confirmTransaction}
      />
    </div>
  );
};

export default CardtoWallet;
