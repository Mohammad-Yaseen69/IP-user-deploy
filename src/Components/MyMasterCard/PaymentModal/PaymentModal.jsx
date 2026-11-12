import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import { createShambeToken } from "../../../Helper/CreateToken";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import { CARD_TYPES } from "../../CreditInput/CreditCardTypes";
import { apiErrorMessage } from "../../PaymentsNewer/InternationalFlow";
import OTPConfirmation from "../../../Common/Component/OtpVerification";
import styles from "../styles/onboard.module.scss";
import ConfirmationStep from "./ConfirmationStep";
import PaymentSelect from "./PaymentSelectStep";
import PaymentStep from "./PaymentStep";
import SuccessStep from "./SuccessStep";
import PlaidBankPicker from "../../AddFunds/WalletFundsFlow/PlaidBankPicker";
import {
  getPlaidBankPayload,
  isPlaidBankSelected,
  isSavedBankPaymentStarted,
} from "../../AddFunds/WalletFundsFlow/plaidBank";
import PlaidLinkHandler from "../../PaymentsNewer/InternationalFlow/PlaidLinkHandler";
import PaymentProgressOverlay from "../../VirtualIBAN/PaymentProgressOverlay";
import MobileWalletStatus from "../../PaymentAddressPublic/PayAsGuest/MobileWalletStatus";

const PLACEHOLDER_CARD_TYPE = {
  type: "placeholder",
  format: "",
  startPattern: "",
  maxCardNumberLength: 16,
  cvcLength: 3,
};

const FEE_METHODS = {
  card: "card",
  wallet: "wallet",
  paypal: "paypal",
  mobile: "mobile_wallet",
  bank: "bank",
};

const EMPTY_PLAID_BANK = { savedBankId: null, recipient_iban: "" };

const PaymentModal = ({ isOpen, vvcCardType, setIsOpen, setStepParent, applePay, googlePay }) => {
  const [step, setStep] = useState(1);
  const { userWallets, getUserWallets, userDetails, authHeader, setProfileLockTime, checkAuth } =
    useContext(UserContext);
  const [walletState, setWalletState] = useState({});
  const [paymentType, setPaymentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [showOtpModal, setshowOtpModal] = useState(false);
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedSaveCard, setSelectedSaveCard] = useState({});
  const [cardTransactionDetails, setCardTransactionDetails] = useState({});
  const [plaidBank, setPlaidBank] = useState(EMPTY_PLAID_BANK);
  const [plaidLink, setPlaidLink] = useState(null);
  const [mobileWalletTransactionId, setMobileWalletTransactionId] = useState(null);
  const navigate = useNavigate();
  const [cardDetail, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardHolderName: "",
  });
  const [defaultWallet, setDefaultWallet] = useState({});
  const [feeDetails, setFeeDetails] = useState({});
  const [cardNumberError, setCardNumberError] = useState(null);
  const [disabledBtnS, setDisabledBtn] = useState(false);
  const [cardType, setCardType] = useState(PLACEHOLDER_CARD_TYPE);
  const [sideText, setSideText] = useState("Select the payment Type");
  const { t } = useTranslation();

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setPaymentType("");
    setWalletState({});
    setLoading(false);
    setToken(null);
    setshowOtpModal(false);
    setCodeType("sms");
    setOtpMethods(null);
    setSaveCard(false);
    setSelectedSaveCard({});
    setCardTransactionDetails({});
    setPlaidBank(EMPTY_PLAID_BANK);
    setPlaidLink(null);
    setMobileWalletTransactionId(null);
    setCardDetails({
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
      cardHolderName: "",
    });
  };

  useEffect(() => {
    switch (step) {
      case 1:
        setSideText(t("Select the payment Type"));
        break;
      case 2:
        paymentType === "card"
          ? setSideText(window.innerWidth > 1000 ? t("Enter card Details") : t("Payment Details"))
          : paymentType === "wallet" && setSideText(t("Choose The Wallet"));
        break;
      case 3:
        setSideText(t("Review the Payment"));
        break;
      case 4:
        setSideText(t("Your Payment is now Completed"));
        break;
      default:
    }
  }, [step]);

  useEffect(() => {
    getUserWallets();
  }, []);

  useEffect(() => {
    const getCardTypeByValue = function getCardTypeByValue(value) {
      return CARD_TYPES.filter(function (cardType) {
        return cardType.startPattern.test(value);
      })[0];
    };
    const type = getCardTypeByValue(cardDetail.cardNumber);
    if (!type || cardDetail.cardNumber.length < type?.maxCardNumberLength) {
      setCardNumberError(t("Invalid Card Number"));
    } else {
      setCardNumberError("");
    }
    setCardType(type ?? PLACEHOLDER_CARD_TYPE);
  }, [cardDetail.cardNumber]);

  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )
      ?.sort((a, b) => (b?.default === true ? 1 : -1))
      ?.map((item) => ({ name: item?.currency?.code, ...item }));
  }, [userWallets]);

  useEffect(() => {
    if (filteredWallets?.length) {
      setDefaultWallet(filteredWallets[0]);
    }

    console.log(filteredWallets);
  }, [filteredWallets]);

  console.log(googlePay, applePay);

  const sendOtp = async (methodId) => {
    if (methodId && typeof methodId.preventDefault === "function") {
      methodId.preventDefault();
    }
    const otpMethod = typeof methodId === "string" ? methodId : codeType;

    if (paymentType !== "wallet") {
      if (!feeDetails.token) return false;
    }

    setLoading(true);
    try {
      const twoYearsAhead = new Date();
      twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
      twoYearsAhead.setDate(twoYearsAhead.getDate() - 1);

      const formattedDate = `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, "0")}-${String(twoYearsAhead.getDate()).padStart(2, "0")}`;

      const cardData = {
        data: {
          currency: "USD",
          expdate: formattedDate,
          token: feeDetails?.token,
          cardType: vvcCardType === "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual",
          apple_pay: false,
          google_pay: false,
        },
        type: otpMethod,
      };

      if (applePay === true || googlePay === true) {
        cardData.data.cardType = "vcc_premium_plus_virtual";

        if (applePay) {
          cardData.data.apple_pay = true;
        }
        if (googlePay) {
          cardData.data.google_pay = true;
        }
      }

      if (paymentType === "card") {
        if (selectedSaveCard?._id) {
          cardData.data.pan = selectedSaveCard._id;
        } else {
          cardData.data.is_card_save = saveCard;
          cardData.data.se_shambey = createShambeToken(cardDetail);
        }
      }

      const data = {
        data: {
          account_id: userDetails?._id,
          wallet_id: walletState?.wallet_id,
          cardType: vvcCardType === "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual",
          currency: "USD",
          expdate: formattedDate,
          apple_pay: false,
          google_pay: false,
        },
        type: otpMethod,
      };

      if (["paypal", "mobile", "bank"].includes(paymentType)) {
        data.data.token = feeDetails?.token;
      }

      if (paymentType === "bank") {
        Object.assign(data.data, getPlaidBankData());
      }

      if (applePay === true || googlePay === true) {
        data.data.cardType = "vcc_premium_plus_virtual";

        if (applePay) {
          data.data.apple_pay = true;
        }
        if (googlePay) {
          data.data.google_pay = true;
        }
      }

      const encrypted = encryptData(paymentType === "card" ? cardData : data);
      console.log(encrypted, data);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setOtpMethods(dec);
      if (!showOtpModal) {
        setCodeType(dec?.otp_sent_on || "sms");
      }
      setToken(dec?.token);
      setshowOtpModal(true);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      console.log(dec);
      toast.error("Something went wrong while creating your virtual card! please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.innerWidth > 1000 && !mobileWalletTransactionId) {
      if (["paypal", "mobile"].includes(paymentType)) {
        if (feeDetails.token) {
          sendOtp();
        }
      }
    }
  }, [feeDetails, paymentType]);

  function errorHandler(err, setError) {
    const decrypted = decryptData(err.response.data.data);
    console.log(decrypted);
    setError(decrypted?.message ?? "Invalid Verification Code");
    if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
      const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
      const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
      setProfileLockTime(timeInSec);
      const coun = localStorage.getItem("ip_country");
      localStorage.clear();
      localStorage.setItem("ip_country", coun);
      navigate("/login");
    }
  }

  const createWallet = async (setter, type, otp, setError) => {
    setLoading(true);
    const data = {
      token: token,
      type: codeType,
      otp,
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/create-vvc`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data?.data);
      const vcc_request_will_be_pending = dec?.vcc_request_will_be_pending;

      if (!vcc_request_will_be_pending) {
        setToken(null);
        setStep(4);
        setshowOtpModal(false);
      } else {
        checkAuth();
        setToken(null);
        setshowOtpModal(false);
        setIsOpen(false);
      }
    } catch (err) {
      const decrypted = decryptData(err.response.data.data);
      const error2 = apiErrorMessage(decrypted?.message);
      if (error2) {
        setError(error2);
      } else {
        errorHandler(err, setError);
      }
    }
  };

  useEffect(() => {
    const getSavedCards = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const dec = decryptData(res.data.data);
        setCards(dec?.panList);
      } catch {
        setCards([]);
      }
    };

    if (userDetails?.tfa) {
      setCodeType("authenticator");
    } else if (userDetails?.email_verification) {
      setCodeType("email");
    } else if (userDetails?.whatsapp_verification) {
      setCodeType("whatsapp");
    } else {
      setCodeType("sms");
    }

    if (userDetails?._id) {
      getSavedCards();
    }
  }, [userDetails]);

  useEffect(() => {
    const getFee = async (method) => {
      try {
        const walletId = walletState?.wallet_id || defaultWallet?.wallet_id;

        if (!walletId) {
          console.log("No wallet ID available");
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-vvc-fee/${walletId}/${
            applePay || googlePay
              ? "vcc_premium_plus_virtual"
              : vvcCardType === "premium"
                ? "vcc_premium_virtual"
                : "vcc_standard_virtual"
          }/${method === "bank" ? "plaid" : method}`,
          { headers: authHeader },
        );

        const dec = decryptData(res.data.data);
        setFeeDetails(dec.data);
      } catch (error) {
        console.log(error);
      }
    };

    const walletId = walletState?.wallet_id || defaultWallet?.wallet_id;

    if (walletId && paymentType) {
      if (FEE_METHODS[paymentType]) getFee(FEE_METHODS[paymentType]);
    }
  }, [paymentType, walletState?.wallet_id, defaultWallet?.wallet_id]);
  useEffect(() => {
    const disabledBtn = () => {
      switch (paymentType) {
        case "wallet":
          return !walletState?.wallet_id;
        case "bank":
          return !isPlaidBankSelected(plaidBank);
        case "card":
          if (selectedSaveCard._id) {
            return false;
          }
          return (
            !cardDetail.cardNumber ||
            !cardDetail.cardExpiry ||
            !cardDetail.cardCVC ||
            !cardDetail.cardHolderName ||
            cardNumberError
          );
        default:
          return false;
      }
    };

    setDisabledBtn(disabledBtn());
  }, [walletState, paymentType, cardDetail, cardNumberError, selectedSaveCard, plaidBank]);

  const initiateCardVVC = async (setter, type, otp, setError) => {
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    twoYearsAhead.setDate(twoYearsAhead.getDate() - 1); // Subtract one day

    const formattedDate = `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, "0")}-${String(twoYearsAhead.getDate()).padStart(2, "0")}`;
    setLoading(true);
    const data = {
      token: token,
      type: codeType,
      otp,
      panData: {
        currency: "USD",
        expdate: formattedDate,
        token: feeDetails?.token,
        cardType: vvcCardType === "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual",
        apple_pay: false,
        google_pay: false,
      },
    };

    if (applePay === true || googlePay === true) {
      data.panData.cardType = "vcc_premium_plus_virtual";

      if (applePay) {
        data.panData.apple_pay = true;
      }
      if (googlePay) {
        data.panData.google_pay = true;
      }
    }

    if (selectedSaveCard?._id) {
      data.panData.pan = selectedSaveCard._id;
    } else {
      data.panData.is_card_save = saveCard;
      data.panData.se_shambey = createShambeToken(cardDetail);
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/initiate-vcc${selectedSaveCard._id ? "-pan" : ""}-card`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );
      setToken(null);
      setshowOtpModal(false);
      const dec = decryptData(res.data.data);
      setCardTransactionDetails(dec);
    } catch (err) {
      const decrypted = decryptData(err.response.data.data);
      const error2 = apiErrorMessage(decrypted?.message);
      if (error2) {
        setError(error2);
      } else {
        errorHandler(err, setError);
      }
    }
  };

  const initiatePaypalPayment = async (setter, type, otp, setError) => {
    try {
      const data = {
        token: token,
        type: codeType,
        otp,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/initiate-vcc-paypal`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      setToken(null);
      window.location.href = dec?.url;
    } catch (err) {
      const decrypted = decryptData(err.response.data.data);
      const error2 = apiErrorMessage(decrypted?.message);
      if (error2) {
        setError(error2);
      } else {
        errorHandler(err, setError);
      }
    }
  };

  const getVccCardData = () => {
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    twoYearsAhead.setDate(twoYearsAhead.getDate() - 1);

    const isPremiumPlus = applePay === true || googlePay === true;

    return {
      currency: "USD",
      expdate: `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, "0")}-${String(twoYearsAhead.getDate()).padStart(2, "0")}`,
      cardType: isPremiumPlus
        ? "vcc_premium_plus_virtual"
        : vvcCardType === "premium"
          ? "vcc_premium_virtual"
          : "vcc_standard_virtual",
      apple_pay: !!applePay,
      google_pay: !!googlePay,
    };
  };

  const getPlaidBankData = () => ({
    ...getPlaidBankPayload(plaidBank),
  });

  const initiateExternalVCC = async (setter, type, otp, setError) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/initiate-vcc-${paymentType === "bank" ? "plaid" : "mobile-wallet"}`,
        {
          data: encryptData({
            ...getVccCardData(),
            ...(paymentType === "bank" ? getPlaidBankData() : {}),
            token,
            type: codeType,
            otp,
          }),
        },
        { headers: authHeader },
      );

      const dec = decryptData(res.data?.data);
      const details = dec?.data ?? dec;

      if (paymentType === "bank") {
        if (isSavedBankPaymentStarted(dec)) {
          toast.success(t("Payment Initiated"));
          handlePlaidAuthorized();
          return;
        }
        if (!details?.linkToken) {
          setError(dec?.message || t("Verification failed"));
          return;
        }
        setToken(null);
        setshowOtpModal(false);
        setPlaidLink(details);
        return;
      }

      if (dec?.status === false || dec?.status === "false") {
        setError(dec?.message || t("Verification failed"));
        return;
      }

      const transactionId =
        details?.transactionId ||
        details?.transaction_id ||
        dec?.transactionId ||
        dec?.transaction_id;
      if (transactionId) {
        setToken(null);
        setshowOtpModal(false);
        setMobileWalletTransactionId(transactionId);
        return;
      }

      toast.info(
        t(
          "Please open your mobile money app and approve the payment notification you have received to complete and validate this transaction.",
        ),
      );
      checkAuth();
      handleClose();
    } catch (err) {
      const decrypted = decryptData(err?.response?.data?.data);
      const error2 = apiErrorMessage(decrypted?.message);
      if (error2) {
        setError(error2);
      } else {
        errorHandler(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidAuthorized = () => {
    checkAuth();
    handleClose();
  };

  const closeMobileWalletStatus = () => {
    checkAuth();
    handleClose();
  };

  const renderBankStep = () => (
    <div>
      <PlaidBankPicker value={plaidBank} onChange={setPlaidBank} />
      {window.innerWidth > 1000 && (
        <div className={styles.btns}>
          <button onClick={() => setStep(1)}>{t("Back")}</button>
          <button
            style={{
              color: "white",
              backgroundColor: "#5926F0",
              opacity: disabledBtnS && 0.4,
            }}
            disabled={disabledBtnS}
            onClick={() => setStep(3)}
          >
            {t("Continue")}
          </button>
        </div>
      )}
    </div>
  );

  const renderData = () => (
    <div className={styles.paymentContent} style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          flex: (step === 4 && 0.8) || (step === 2 && 1.2),
          padding: window.innerWidth < 1000 && "1rem 1rem 0 1rem",
        }}
        className={styles.left}
      >
        <div>
          <h1>{t(sideText)}</h1>
          {step === 4 && (
            <p style={{ marginBottom: window.innerWidth < 1000 && "2rem " }}>
              {t("Thanks for using InstaPay")}!
            </p>
          )}
        </div>

        {step !== 1 && window.innerWidth > 1000 && (
          <div className={styles.contact}>
            <div className={styles.circle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
              >
                <path
                  d="M7.39898 7.36508C7.56628 6.88948 7.89651 6.48843 8.33118 6.23297C8.76585 5.97751 9.2769 5.88413 9.77381 5.96937C10.2707 6.0546 10.7214 6.31295 11.0461 6.69866C11.3708 7.08437 11.5485 7.57254 11.5478 8.07671C11.5478 9.49997 9.41289 10.2116 9.41289 10.2116M9.46982 13.0581H9.47694M16.5861 9.49997C16.5861 13.4302 13.4 16.6163 9.46982 16.6163C5.53959 16.6163 2.35352 13.4302 2.35352 9.49997C2.35352 5.56975 5.53959 2.38367 9.46982 2.38367C13.4 2.38367 16.5861 5.56975 16.5861 9.49997Z"
                  stroke="#5926F0"
                  strokeWidth="1.42326"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#6F6F6F" }}>
                {t("Having Troubles?")}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "black" }}>
                {t("Contact Us")}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{ padding: window.innerWidth < 1000 && "0rem 1rem 1rem 1rem" }}
        className={styles.right}
      >
        {step === 1 && (
          <PaymentSelect
            paymentType={paymentType}
            setPaymentType={(type) => {
              setPaymentType(type);
              setFeeDetails({});
            }}
            setStep={setStep}
            enabledMethods={["mobile", "bank"]}
          />
        )}

        {step === 2 && paymentType === "bank" && renderBankStep()}

        {step === 2 && paymentType !== "bank" && (
          <PaymentStep
            cardDetail={cardDetail}
            cardNumberError={cardNumberError}
            cardType={cardType}
            cards={cards}
            disabledBtnS={disabledBtnS}
            filteredWallets={filteredWallets}
            paymentType={paymentType}
            saveCard={saveCard}
            setCardDetails={setCardDetails}
            setFeeDetails={setFeeDetails}
            setSaveCard={setSaveCard}
            setSelectedSaveCard={setSelectedSaveCard}
            setStep={setStep}
            setWalletState={setWalletState}
            vvcCardType={vvcCardType}
            walletState={walletState}
            setCards={setCards}
            selectedSaveCard={selectedSaveCard}
            applePay={applePay}
            googlePay={googlePay}
          />
        )}

        {step === 3 && (
          <ConfirmationStep
            feeDetails={feeDetails}
            sendOtp={sendOtp}
            setStep={setStep}
            paymentType={paymentType}
            walletState={{
              ...walletState,
              name: paymentType === "bank" ? "Bank transfer" : walletState?.name,
            }}
          />
        )}

        {step === 4 && (
          <SuccessStep
            feeDetails={feeDetails}
            setStep={setStep}
            paymentType={paymentType}
            setIsOpen={setIsOpen}
            setStepParent={setStepParent}
            walletState={walletState}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="vvc-modal">
      {window.innerWidth > 1000 && (
        <Modal
          isOpen={isOpen && !showOtpModal && !mobileWalletTransactionId}
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            minWidth: step === 4 ? "1000px" : "800px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              zIndex: 10,
              cursor: "pointer",
            }}
            onClick={handleClose}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#1F2937"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <ModalBody style={{ padding: "0" }}>{renderData()}</ModalBody>
        </Modal>
      )}

      <div className={styles.mobileView}>
        {renderData()}
        <div className={styles.bottom} style={{ marginTop: "30px" }}>
          <div className={styles.contact}>
            <div className={styles.circle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
              >
                <path
                  d="M7.39898 7.36508C7.56628 6.88948 7.89651 6.48843 8.33118 6.23297C8.76585 5.97751 9.2769 5.88413 9.77381 5.96937C10.2707 6.0546 10.7214 6.31295 11.0461 6.69866C11.3708 7.08437 11.5485 7.57254 11.5478 8.07671C11.5478 9.49997 9.41289 10.2116 9.41289 10.2116M9.46982 13.0581H9.47694M16.5861 9.49997C16.5861 13.4302 13.4 16.6163 9.46982 16.6163C5.53959 16.6163 2.35352 13.4302 2.35352 9.49997C2.35352 5.56975 5.53959 2.38367 9.46982 2.38367C13.4 2.38367 16.5861 5.56975 16.5861 9.49997Z"
                  stroke="#5926F0"
                  strokeWidth="1.42326"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#6F6F6F" }}>
                {t("Having Troubles?")}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "black" }}>
                {t("Contact Us")}
              </span>
            </div>
          </div>

          <div className={styles.btns}>
            {step !== 4 && (
              <button
                onClick={() => {
                  if (step === 1) {
                    handleClose();
                  } else {
                    setStep((prev) => prev - 1);
                    if (step === 2) {
                      setWalletState({});
                      setSelectedSaveCard({});
                    }
                  }
                }}
              >
                {t("Back")}
              </button>
            )}
            <button
              style={{
                color: "white",
                backgroundColor: "#5926F0",
                opacity: step === 2 && disabledBtnS ? 0.4 : 1,
              }}
              disabled={step === 2 && disabledBtnS}
              onClick={() => {
                if (step === 4) {
                  setStepParent(4);
                  setIsOpen(false);
                } else if (step === 3) {
                  sendOtp();
                } else if (step === 2) {
                  setStep(3);
                } else if (step === 1) {
                  if (!["paypal", "mobile"].includes(paymentType)) {
                    setStep(2);
                  } else {
                    sendOtp();
                  }
                }
              }}
            >
              {step === 4
                ? t("Continue")
                : step === 3
                  ? t("Proceed To Payment")
                  : t("Verify & Continue")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
              >
                <path
                  d="M5.25 11L8.75 7.5L5.25 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showOtpModal}>
        <ModalHeader toggle={() => setshowOtpModal(false)}> {t("Confirm")} </ModalHeader>
        <ModalBody>
          <OTPConfirmation
            variant="card"
            callback={
              paymentType === "wallet"
                ? createWallet
                : paymentType === "paypal"
                  ? initiatePaypalPayment
                  : ["mobile", "bank"].includes(paymentType)
                    ? initiateExternalVCC
                    : initiateCardVVC
            }
            setterValue={true}
            hideOtp={() => setshowOtpModal(false)}
            processing={loading}
            resendHandler={sendOtp}
            authType={codeType}
            setAuthType={setCodeType}
            methods={otpMethods}
            showAuthToggle={true}
          />
        </ModalBody>
      </Modal>

      <Modal isOpen={!!mobileWalletTransactionId} toggle={closeMobileWalletStatus} centered>
        <ModalBody>
          <MobileWalletStatus
            inGuestPay={false}
            transactionId={mobileWalletTransactionId}
            toggle={closeMobileWalletStatus}
            containerStyle={{ padding: "0", minHeight: "auto" }}
          />
        </ModalBody>
      </Modal>

      <PaymentProgressOverlay show={!!plaidLink} />
      {plaidLink?.linkToken && (
        <PlaidLinkHandler
          link={plaidLink}
          data={{
            recipient_iban: plaidBank?.recipient_iban,
            wallet: defaultWallet,
            exchange_rate: {
              sending: { amount: feeDetails?.actual_fee, currency: "USD" },
              fee: { amount: 0 },
            },
          }}
          onAuthorized={handlePlaidAuthorized}
          onCancelled={() => setPlaidLink(null)}
        />
      )}

      {cardTransactionDetails?.transaction_id ? (
        <TrustpaymentPage
          paymentWithSavedCard={selectedSaveCard?._id ? true : false}
          card_cvc={cardDetail.cardCVC}
          card_expiry={cardDetail.cardExpiry}
          card_number={cardDetail.cardNumber}
          currency={"USD"}
          transaction={cardTransactionDetails}
          amount={feeDetails?.totalFee}
          url={`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/confirm-vcc${selectedSaveCard._id ? "-pan" : ""}-card/${cardTransactionDetails?.transaction_id}/${cardTransactionDetails?.token}`}
          tokenUrl={() =>
            `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/confirm-vcc${selectedSaveCard._id ? "-pan" : ""}-card/${cardTransactionDetails?.transaction_id}/${cardTransactionDetails?.token}`
          }
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default PaymentModal;
