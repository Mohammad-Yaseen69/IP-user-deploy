import { useContext, useEffect, useState, lazy } from "react";
import styles from "./styles/index.module.scss";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { ChevronLeft } from "react-feather";
import TopRight from "../topRight";

//  Lazy-loaded components
const PaymentAction = lazy(() => import("./PaymentAction"));
const SendPaymentType = lazy(() => import("./SendPaymentType"));
const RequestMoney = lazy(() => import("./RequestMoney"));
const SendQuotation = lazy(() => import("./SendQuotation"));
const CryptoFiat = lazy(() => import("./CryptoFiat"));
const SendCrypto = lazy(() => import("./SendCrypto"));
const International = lazy(() => import("./Mobile/International"));
const WalletTransferMobile = lazy(() => import("./Mobile/Wallet"));
const RequestMoneyMobile = lazy(() => import("./Mobile/RequestMoney"));
const SendQuote = lazy(() => import("./Mobile/SendQuote"));
const CryptoFiatMobile = lazy(() => import("./Mobile/CryptoFiatMobile"));
const Airtime = lazy(() => import("./AirtimeFlow"));
const AirtimeMobile = lazy(() => import("./Mobile/Airtime"));
const QRPayment = lazy(() => import("./Mobile/QRPayment"));
const NonInstapayPayment = lazy(() => import("./NonInstapay"));

// Static assets (normal imports)
import rq from "./files/mobile/rq.png";
import sc from "./files/mobile/sc.png";
import qr from "./files/mobile/qr.png";
import w2_ic from "./files/wallet.svg";
import qr_ic from "./files/qr.svg";

import sendmoney_m from "./Mobile/files/send.png";
import reqmoney_m from "./Mobile/files/receive.png";
import quote_m from "./Mobile/files/quote.png";
import airtime_m from "./Mobile/files/airtime.png";
import internation_m from "./Mobile/files/international.png";
import wallet_m from "./Mobile/files/wallet.png";
import noninstapay_m from "./Mobile/files/non_ip_tablet.png";

import sm_m_i from "./files/sm.svg";
import rm_m_i from "./files/rm.svg";
import q_m_i from "./files/q.svg";
import a_m_i from "./files/airtime.svg";
import int_m_i from "./files/int.svg";
import ni_m_i from "./files/non_ip.svg";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const PaymentsNewer = () => {
  const {
    checkRegisteredBenficiaries,
    getAllActiveCountries,
    getUserWallets,
    userDetails,
    getUserBeneficiaries,
    beneficiaries,
  } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const payment_action = queryParams.get("payment_action");
  const send_type = queryParams.get("send_type");

  const { t } = useTranslation();
  const can = usePermission();

  // Permission: payments.international.send
  const canSendInternational = can("payments.international.send");
  // Permission: payments.wallet.send
  const canSendWallet = can("payments.wallet.send");
  // Permission: payments.qr.send
  const canSendQr = can("payments.qr.send");
  // Permission: payments.non-instapay.send
  const canSendNonInstapay = can("payments.non-instapay.send");
  const canSendMoney = canSendInternational || canSendWallet || canSendQr || canSendNonInstapay;

  // Permission: payments.money.request
  const canMoneyRequest = can("payments.money.request");
  // Permission: payments.quote.send
  const canQuoteSend = can("payments.quote.send");

  // Permission: payments.crypto.send
  const canSendCrypto = can("payments.crypto.send");

  // Permission: payments.airtime.topup
  const canAirtimeTopup = can("payments.airtime.topup");
  // Permission: payments.esim.buy
  const canEsimBuy = can("payments.esim.buy");
  // Permission: payments.esim.manage
  const canEsimManage = can("payments.esim.manage");
  const canAirtimeOrEsim = canAirtimeTopup || canEsimBuy || canEsimManage;
  // step info
  const [step, setStep] = useState(1);

  // payment states
  const [action, setAction] = useState("");
  // send payment
  const [sendPaymentType, setSendPaymentType] = useState("");

  useEffect(() => {
    if (payment_action) {
      if (window.innerWidth > 1000) {
        setStep(2);
        setAction(payment_action);
      } else {
        setActionType(payment_action);
        if (payment_action !== "send_money") {
          setCurrentFlow(payment_action);
        }
      }
    }
  }, [payment_action]);

  useEffect(() => {
    if (send_type) {
      if (window.innerWidth > 1000) {
        setStep(2);
        setSendPaymentType(send_type);
      } else {
        if (send_type === "wallet") {
          setCurrentFlow("wallet_to_wallet");
          setSendPaymentType("wallet_to_wallet");
          setStep(3);
        }
        if (send_type === "international") {
          setCurrentFlow("international");
          setSendPaymentType("international");
          setStep(3);
        }
        if (send_type === "qr_pay") {
          setCurrentFlow("qr_pay");
          setSendPaymentType("qr_pay");
          setStep(3);
        }
        if (send_type === "non-instapay") {
          setCurrentFlow("non-instapay");
          setSendPaymentType("non-instapay");
          setStep(3);
        }
      }
    }
  }, [send_type]);

  useEffect(() => {
    if (userDetails) {
      getUserWallets();
      getAllActiveCountries();
      checkRegisteredBenficiaries();
      getUserBeneficiaries();
    }
  }, [userDetails]);

  useEffect(() => {
    if (beneficiaries) {
      checkRegisteredBenficiaries();
    }
  }, [beneficiaries]);

  // mobile
  const setActionType = (actionType) => {
    setAction(actionType);
    setStep(2);
  };

  const [currentFlow, setCurrentFlow] = useState("");

  useEffect(() => {
    const hasParams = Boolean(payment_action || send_type);
    if (!hasParams) {
      setStep(1);
      setAction("");
      setSendPaymentType("");
      setCurrentFlow("");
    }
  }, [payment_action, send_type]);

  const resetToMain = () => {
    setStep(1);
    setAction("");
    setSendPaymentType("");
    setCurrentFlow("");
    window.history.replaceState(null, "", "/payments");
  };

  useEffect(() => {
    if (action && !payment_action) {
      window.history.replaceState(null, null, `?payment_action=${action}`);
    }
  }, [action]);
  useEffect(() => {
    if (sendPaymentType && !send_type) {
      window.history.replaceState(
        null,
        null,
        `?payment_action=${action}&send_type=${sendPaymentType}`,
      );
    }
  }, [sendPaymentType]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.top}>
          <h4 style={{ marginBottom: ".2rem" }}>{t("Payments")}</h4>
          {step > 1 && (
            <button
              onClick={resetToMain}
              style={{
                fontSize: ".75rem",
                padding: "4px 8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: "1px solid #e5e5e5",
                background: "#fff",
                color: "#444",
                cursor: "pointer",
                marginLeft: "auto",
              }}
              aria-label={t("Go back to main menu")}
            >
              <ChevronLeft color="#5826e9" size={14} />
              <span style={{ fontWeight: 600 }}>{t("Go back to main menu")}</span>
            </button>
          )}
          {step === 1 && (
            <p style={{ marginBottom: 0 }}>
              {t("Select the option that matches your needs from the list below:")}
            </p>
          )}
          <TopRight />
        </div>

        {step === 1 && <PaymentAction setAction={setAction} setStep={setStep} />}

        {step === 2 && action === "send_money" && canSendMoney && (
          <SendPaymentType
            setSendPaymentType={setSendPaymentType}
            sendPaymentType={sendPaymentType}
            setStep={setStep}
          />
        )}

        {step === 2 && action === "airtime" && canAirtimeOrEsim && (
          <Airtime setCurrentFlow={setCurrentFlow} setAction={setAction} setStep={setStep} />
        )}

        {step === 2 && action === "req_money" && canMoneyRequest && (
          <RequestMoney setAction={setAction} setStep={setStep} />
        )}
        {step === 2 && action === "send_quote" && canQuoteSend && (
          <SendQuotation setAction={setAction} setStep={setStep} />
        )}
        {step === 2 && action === "send_crypto" && canSendCrypto && <SendCrypto />}
        {step === 2 && action === "crypto_fiat" && canSendCrypto && <CryptoFiat />}
      </div>
      <div className={styles.mobile}>
        {currentFlow === "" ? (
          <>
            <div className={styles.top}>
              <button
                className={styles.back_btn}
                onClick={() => {
                  if (step === 1) {
                    navigate(-1);
                  } else {
                    resetToMain();
                  }
                }}
              >
                <ChevronLeft />
              </button>
              <div className={styles.title}>
                <h4 className={styles.heading}>{t("Payments")}</h4>
                {step === 1 && (
                  <p style={{ marginBottom: 0 }}>
                    {t("Select the option that matches your needs from the list below:")}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.cards}>
                {step === 1 && (
                  <>
                    {(
                      userDetails?.account_type === "individual"
                        ? userDetails?.level?.international_transfer?.bank ||
                          userDetails?.level?.wallet_to_wallet?.send ||
                          userDetails?.level?.international_transfer?.cash_pickup ||
                          userDetails?.level?.international_transfer?.mobile_money
                        : userDetails?.level?.international_transfer?.bank ||
                          userDetails?.level?.wallet_to_wallet?.send ||
                          userDetails?.level?.international_transfer?.cash_pickup ||
                          userDetails?.level?.international_transfer?.mobile_money
                    ) ? (
                      <button
                        data-action="send_money"
                        style={{ background: `url(${sendmoney_m})` }}
                        onClick={() => setActionType("send_money")}
                      >
                        <img
                          src={sm_m_i}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                          }}
                        >
                          {t("Send Money")}
                        </span>
                      </button>
                    ) : (
                      ""
                    )}
                    {(userDetails?.account_type === "individual"
                      ? userDetails?.level?.payment_request?.send
                      : userDetails?.level?.payment_request?.send) && (
                      <button
                        data-action="req_money"
                        style={{ background: `url(${reqmoney_m})` }}
                        onClick={() => {
                          setActionType("req_money");
                          setCurrentFlow("req_money");
                        }}
                      >
                        <img
                          src={rm_m_i}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                          }}
                        >
                          {t("Request Money")}
                        </span>
                      </button>
                    )}
                    {(userDetails?.account_type === "individual"
                      ? userDetails?.level?.quotation?.send
                      : userDetails?.level?.quotation?.send) && (
                      <button
                        data-action="send_quote"
                        style={{ background: `url(${quote_m})` }}
                        onClick={() => {
                          setActionType("send_quote");
                          setCurrentFlow("send_quote");
                        }}
                      >
                        <img
                          src={q_m_i}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                          }}
                        >
                          {t("Send A Quote")}
                        </span>
                      </button>
                    )}
                    <button
                      data-action="airtime"
                      style={{ background: `url(${airtime_m})` }}
                      onClick={() => {
                        setActionType("airtime");
                        setCurrentFlow("airtime");
                      }}
                    >
                      <img
                        src={a_m_i}
                        alt=""
                        loading="lazy"
                        style={{
                          width: "30px",
                          objectFit: "contain",
                          height: "30px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "1rem",
                          color: "white",
                          fontWeight: "600",
                          textAlign: "left",
                          maxWidth: "8ch",
                        }}
                      >
                        {t("Mobile Airtime")}
                      </span>
                    </button>
                    {/* {
                                                (
                                                    userDetails?.account_type === "individual"
                                                        ?
                                                        userDetails?.level?.wallet_to_wallet?.crypto_to_fiat
                                                        :
                                                        userDetails?.level?.wallet_to_wallet?.crypto_to_fiat
                                                )
                                                &&
                                                <button data-action="send_crypto" className={styles.disabled} disabled style={{ background: `url(${sc})`, padding: "0px" }} onClick={() => {
                                                    // setActionType("send_crypto")
                                                    // setCurrentFlow("send_crypto")
                                                }}>
                                                    <img src={sc} alt="payment types" />
                                                </button>
                                            } */}
                    <button
                      className={styles.disabled}
                      style={{ padding: "0px" }}
                      disabled
                      data-action="placeholder"
                    >
                      <img src={rq} alt="payment types" loading="lazy" />
                    </button>
                  </>
                )}
                {step === 2 && action === "send_money" ? (
                  <>
                    {(
                      userDetails?.account_type === "individual"
                        ? userDetails?.level?.international_transfer?.bank ||
                          userDetails?.level?.international_transfer?.cash_pickup ||
                          userDetails?.level?.international_transfer?.mobile_money
                        : userDetails?.level?.international_transfer?.bank ||
                          userDetails?.level?.international_transfer?.cash_pickup ||
                          userDetails?.level?.international_transfer?.mobile_money
                    ) ? (
                      <button
                        onClick={() => {
                          setCurrentFlow("international");
                          setSendPaymentType("international");
                          setStep(3);
                        }}
                        style={{ background: `url(${internation_m})` }}
                      >
                        <img
                          src={int_m_i}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                            maxWidth: "12ch",
                          }}
                        >
                          {t("International Transfer")}
                        </span>
                      </button>
                    ) : (
                      ""
                    )}
                    {(userDetails?.account_type === "individual"
                      ? userDetails?.level?.wallet_to_wallet?.send
                      : userDetails?.level?.wallet_to_wallet?.send) && (
                      <button
                        onClick={() => {
                          setCurrentFlow("wallet_to_wallet");
                          setSendPaymentType("wallet_to_wallet");
                          setStep(3);
                        }}
                        style={{ background: `url(${wallet_m})` }}
                      >
                        <img
                          src={w2_ic}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                            maxWidth: "15ch",
                          }}
                        >
                          {t("Wallet To Wallet Transfer")}
                        </span>
                      </button>
                    )}
                    {(userDetails?.account_type === "individual"
                      ? userDetails?.level?.qr_pay?.send
                      : userDetails?.level?.qr_pay?.send) && (
                      <button
                        onClick={() => {
                          setCurrentFlow("qr_pay");
                          setSendPaymentType("qr_pay");
                          setStep(3);
                        }}
                        style={{ background: `url(${qr})` }}
                      >
                        <img
                          src={qr_ic}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                            maxWidth: "8ch",
                          }}
                        >
                          {t("QR Code Payment")}
                        </span>
                      </button>
                    )}
                    {(userDetails?.account_type === "individual"
                      ? userDetails?.level?.wallet_to_wallet?.send
                      : userDetails?.level?.wallet_to_wallet?.send) && (
                      <button
                        onClick={() => {
                          setCurrentFlow("non-instapay");
                          setSendPaymentType("non-instapay");
                          setStep(3);
                        }}
                        style={{ background: `url(${noninstapay_m})` }}
                      >
                        <img
                          src={ni_m_i}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "30px",
                            objectFit: "contain",
                            height: "30px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: "600",
                            textAlign: "left",
                            maxWidth: "15ch",
                          }}
                        >
                          {t("To Non-InstaPay User")}
                        </span>
                      </button>
                    )}
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {sendPaymentType === "international" && canSendInternational && (
              <International
                setStep={setStep}
                step={step}
                setCurrentFlow={setCurrentFlow}
                setSendPaymentType={setSendPaymentType}
                sendPaymentType={sendPaymentType}
                setAction={setAction}
              />
            )}
            {sendPaymentType === "wallet_to_wallet" && canSendWallet && (
              <WalletTransferMobile
                setStep={setStep}
                step={step}
                setCurrentFlow={setCurrentFlow}
                setSendPaymentType={setSendPaymentType}
                sendPaymentType={sendPaymentType}
                setAction={setAction}
              />
            )}
            {sendPaymentType === "qr_pay" && canSendQr && (
              <QRPayment
                setStep={setStep}
                step={step}
                setCurrentFlow={setCurrentFlow}
                setSendPaymentType={setSendPaymentType}
                sendPaymentType={sendPaymentType}
                setAction={setAction}
              />
            )}
            {sendPaymentType === "non-instapay" && canSendNonInstapay && (
              <NonInstapayPayment
                setStep={setStep}
                step={step}
                setCurrentFlow={setCurrentFlow}
                setSendPaymentType={setSendPaymentType}
                sendPaymentType={sendPaymentType}
                setAction={setAction}
              />
            )}
            {action === "req_money" && canMoneyRequest && (
              <RequestMoneyMobile
                step={step}
                setStep={setStep}
                setCurrentFlow={setCurrentFlow}
                setAction={setAction}
              />
            )}
            {action === "send_quote" && canQuoteSend && (
              <SendQuote
                step={step}
                setStep={setStep}
                setCurrentFlow={setCurrentFlow}
                setAction={setAction}
              />
            )}
            {action === "send_crypto" && canSendCrypto && (
              <CryptoFiatMobile
                step={step}
                setStep={setStep}
                setCurrentFlow={setCurrentFlow}
                setAction={setAction}
              />
            )}
            {action === "airtime" && canAirtimeOrEsim && (
              <AirtimeMobile
                step={step}
                setStep={setStep}
                setCurrentFlow={setCurrentFlow}
                setAction={setAction}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PaymentsNewer;
