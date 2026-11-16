import { useContext, useEffect, useRef, useState } from "react";
import crypto_selected from "./files/crypto_selected.png";
import { Card, CardBody } from "reactstrap";
import c_vid from "../PaymentsNewer/files/confirm.mp4";
import CryptoCurrencyNew from "../PaymentsNewer/CryptoCurrencyNew";
import CryptoFundReceipt from "./CryptoFundReceipt";
import SelectedCryptoCurrency from "../PaymentsNewer/SelectedCryptoCurrency";
import styles from "../PaymentsNewer/Mobile/styles/International.module.css";
import flowStyles from "../PaymentsNewer/InternationalFlow/styles/index.module.css";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather";
import { Link } from "react-router-dom";
import TopIcon from "../PaymentsNewer/Mobile/files/Top";
import Amount from "./WalletFundsFlow/Amount";
import { useNavigate } from "react-router";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../Context/UserContext";
import FeesComponent from "../PaymentsNewer/InternationalFlow/FeesComponent";
import InstaPayLoader from "../Loader";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { apiErrorMessage } from "../PaymentsNewer/InternationalFlow";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import { WidgetSDK } from "@keabank/websdk";
import ErrorModal from "../PaymentsNewer/InternationalFlow/ErrorModal";
import CryptoDetailsModal from "../PaymentAddressPublic/CryptoDetailsModal";

const sdk = new WidgetSDK({
  integrationId: import.meta.env.VITE_KEABANK_INTEGRATION_ID,
  merchantId: import.meta.env.VITE_KEABANK_MERCHANT_ID,
});

const base_url = window.location.origin || "https://my.insta-pay.ch";

const CryptoFund = ({ setAction }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authHeader } = useContext(UserContext);
  const [subStep, setSubStep] = useState(1);
  const [cryptoCurrency, setCryptoCurrency] = useState({});
  const [amount, setAmount] = useState("10.00");
  const [exchangeRate, setExchangeRate] = useState({});
  const [loading, setLoading] = useState(false);

  const [exchangeRateError, setExchangeRateError] = useState("");
  const [amountLimitError, setAmountLimitError] = useState("");

  const [error, setError] = useState(null);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showCryptoDetailsModal, setShowCryptoDetailsModal] = useState(false);
  const [cryptoPaymentRef, setCryptoPaymentRef] = useState(null);
  const [limits, setLimits] = useState({
    min: 0,
    max: 0,
  });

  console.log(exchangeRateError, amountLimitError);

  const getCryptoFeeDetails = async (amountArg, signal) => {
    try {
      const enc = encryptData({
        from: cryptoCurrency?.currency?.code,
        to: "USDT",
        amount: Number(String(amountArg || amount)?.replaceAll(",", "")),
        isCryptoToFiat: true,
      });
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/crypto/rates`,
        { data: enc },
        {
          headers: authHeader,
          signal,
        },
      );
      const dec = decryptData(res.data.data);
      console.log(dec);
      setExchangeRateError(null);
      setExchangeRate({
        fee: {
          amount: dec?.data?.fee?.value,
          currency: dec?.data?.fee?.currency,
        },
        sending: {
          currency: dec?.data?.amount?.currency,
          amount: dec?.data?.amount?.value,
        },
        receiver: {
          currency: cryptoCurrency?.currency?.code,
          amount: dec?.data?.recipientReceives?.value,
        },
        total: dec?.data?.amount?.value,
        token: dec?.data?.token,
        rate: dec?.data?.rate?.value,
      });
    } catch (error) {
      if (
        axios.isCancel(error) ||
        error?.name === "AbortError" ||
        error?.name === "CanceledError"
      ) {
        // Request was cancelled due to newer input — ignore silently
        return;
      }
      const dec = decryptData(error?.response?.data?.data);
      setExchangeRateError(
        dec?.message ?? "We cannot process your request at the moment, please try again later.",
      );
      setError(
        dec?.message ?? "We cannot process your request at the moment, please try again later.",
      );
      console.log(dec);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const amountNumber = Number(String(amount || "0").replaceAll(",", ""));

    if (amountNumber < 10 || !cryptoCurrency?.currency?.code) {
      setExchangeRate({});
      setExchangeRateError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setExchangeRateError(null);
    setExchangeRate({});

    // Clear any previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Abort any in-flight request from previous keystroke
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(() => {
      if (amount && cryptoCurrency?.currency?.code) {
        getCryptoFeeDetails(amount, controller.signal);
      }
    }, 500);

    // Cleanup: cancel timeout and abort request on unmount or re-run
    return () => {
      clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [amount, cryptoCurrency]);

  const handleConfirm = async () => {
    setTransactionLoading(true);
    const payment_id = `instapay_topup_${Date.now()}`;

    const payload = {
      payment_id,
      wallet_id: cryptoCurrency?.wallet_id,
      token: exchangeRate?.token,
      amount: amount,
      // returnUrl: "https://your-url-here.com/status"
      returnUrl: `${base_url}/add-funds/crypto-success`,
    };

    try {
      const response = await apiWrapper({
        endpoint: `/api/crypto/topup-wallet`,
        isEncrypted: true,
        method: "POST",
        payload,
      });

      console.log(response);

      // Save payment reference for details modal
      // setCryptoPaymentRef(payment_id)

      window.location.href = response?.data?.checkout_url;

      // --- Keabank payment initialization (temporarily disabled) ---
      // const paymentConfig = {
      //     orderId: payment_id,
      //     amount: exchangeRate.total,
      //     currency: "USDT_TRC20",
      //     paymentPurpose: `Crypto Topup`
      // }

      // sdk.init(paymentConfig).then(() => {
      //     setTransactionComplete(true)
      // })
      // --- End keabank payment initialization ---

      // Show crypto details modal instead
      // setShowCryptoDetailsModal(true)
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);

      const error2 = apiErrorMessage(dec?.message);
      const error1 = LimitsErrorMessage(dec?.code);

      if (error1) {
        setError(t(error1));
      } else if (error2) {
        setError(t(error2));
      } else {
        setError(
          dec?.message ?? "We cannot process your request at the moment, please try again later.",
        );
      }
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleBack = () => {
    if (subStep === 1) {
      setAction("");
      setCryptoCurrency({});
    } else {
      setAmount("10.00");
      setExchangeRate({});
      setExchangeRateError(null);
      setAmountLimitError("");
      setSubStep(1);
    }
  };

  // console.log(amount, 'ya h wo amount')
  const amountNumber = Number(String(amount || "0").replaceAll(",", ""));
  return (
    <>
      <ErrorModal
        isOpen={error}
        message={error}
        toggle={() => setError(null)}
        heading="Crypto Topup Failed"
      />
      {window.innerWidth > 1000 ? (
        <div style={{ display: "flex" }} className="i_t_con">
          <img
            src={crypto_selected}
            // width="130px"
            loading="lazy"
            alt="cs"
            style={{
              maxHeight: window.innerWidth > 1500 ? "700px" : "530px",
              borderRadius: "10px",
            }}
            draggable="false"
          />
          <Card
            style={{
              width: "100%",
              marginBottom: 0,
              paddingBottom: "1rem",
              height: "fit-content",
              minHeight: "80vh",
            }}
          >
            <CardBody
              style={{
                display: "flex",
                gap: subStep === 5 ? "0" : "1rem",
                flexWrap: "wrap",
                padding: "24px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "180px",
                  display: subStep !== 3 && subStep !== 5 ? "flex" : "block",
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
                  <h4 className="head_left_side">
                    {subStep === 1 && t("Choose the Crypto that you intend to liquidate!")}
                    {subStep === 2 && t("Enter the amount you want to topup.")}
                  </h4>

                  {subStep === 3 && (
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
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          mixBlendMode: "multiply",
                        }}
                      ></video>
                      <p>{t("Thanks for using InstaPay")}</p>
                    </div>
                  )}
                  {subStep !== 3 && subStep < 5 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {subStep === 2 && (
                        <div style={{ marginTop: "3rem" }}>
                          {loading && (
                            <div
                              style={{
                                height: "100px",
                                width: "100px",
                                margin: "0 auto",
                              }}
                            >
                              <InstaPayLoader />
                            </div>
                          )}
                          {!loading && !exchangeRateError && (
                            <FeesComponent
                              receiverLabel={t("You Will Get")}
                              error={exchangeRateError}
                              feesLabel={t("Fees")}
                              sendingLabel={t("Sending Amount")}
                              totalLabel={t("Total Amount")}
                              data={{ exchange_rate: exchangeRate }}
                            />
                          )}
                        </div>
                      )}
                      {subStep > 1 && (
                        <SelectedCryptoCurrency
                          cryptoCurrency={cryptoCurrency}
                          setSubStep={setSubStep}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  flex: 1.5,
                  minWidth: "300px",
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "column",
                }}
              >
                {subStep === 1 && (
                  <CryptoCurrencyNew
                    cryptoCurrency={cryptoCurrency}
                    setCryptoCurrency={setCryptoCurrency}
                    setSubStep={setSubStep}
                    action=""
                  />
                )}
                {subStep === 2 && cryptoCurrency && typeof cryptoCurrency === "object" && (
                  <Amount
                    data={{
                      wallet: cryptoCurrency,
                      amount,
                      limits: limits || { min: 0, max: 0 },
                      exchangeRate: exchangeRateError,
                    }}
                    dataHandler={(key, value) => {
                      if (key === "amount") {
                        setAmount(value);
                      }
                      if (key === "limits") {
                        setLimits(value);
                      }
                      if (key === "exchangeRateError") {
                        setAmountLimitError(value);
                      }
                    }}
                  />
                )}

                <div className={flowStyles.bottom} style={{ marginTop: "1rem" }}>
                  <Link
                    to={"https://insta-pay.ch/faqs"}
                    target="_blank"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".7rem",
                    }}
                  >
                    <HelpCircle size={16} />
                    {t("Trouble Sending Money")}
                  </Link>
                  <div className={flowStyles?.buttons}>
                    <button
                      className={flowStyles.transparent}
                      onClick={handleBack}
                      disabled={loading || transactionLoading}
                    >
                      {t("Back")}
                    </button>
                    <button
                      disabled={
                        subStep === 1
                          ? !cryptoCurrency?._id
                          : !amount ||
                            !!exchangeRateError ||
                            !!amountLimitError ||
                            loading ||
                            transactionLoading
                      }
                      onClick={() => {
                        if (transactionComplete) {
                          navigate("/wallets");
                        } else {
                          if (subStep === 1) {
                            navigate("/add-funds?wallet_address=" + cryptoCurrency._id);
                            setSubStep((prev) => prev + 1);
                          } else {
                            handleConfirm();
                          }
                        }
                      }}
                    >
                      {transactionComplete ? t("Go to wallets.") : t("Next")}
                      {!transactionComplete && <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className={`${styles.container} ${flowStyles.mobile}`}>
          <div className={styles.top}>
            <button
              className={styles.back_btn}
              onClick={() => {
                if (subStep === 1) {
                  setAction("");
                } else {
                  setSubStep((prev) => (prev < 5 ? prev - 1 : prev));
                }
              }}
            >
              <ChevronLeft />
            </button>
            <h5>{t("Add Funds")}</h5>
            <div>
              <TopIcon fill={subStep > 1 ? "#5926f0" : "black"} />
            </div>
          </div>

          <div
            className={styles.bottom}
            style={{
              minHeight: "80vh",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            {subStep === 1 && (
              <CryptoCurrencyNew
                cryptoCurrency={cryptoCurrency}
                setCryptoCurrency={setCryptoCurrency}
                setSubStep={setSubStep}
                action=""
              />
            )}
            {subStep === 2 && cryptoCurrency && typeof cryptoCurrency === "object" && (
              <div>
                <Amount
                  data={{
                    wallet: cryptoCurrency,
                    amount,
                    limits: limits || { min: 0, max: 0 },
                    exchangeRate: exchangeRateError,
                  }}
                  dataHandler={(key, value) => {
                    if (key === "amount") {
                      setAmount(value);
                    }
                    if (key === "limits") {
                      setLimits(value);
                    }
                    if (key === "exchangeRateError") {
                      setAmountLimitError(value);
                    }
                  }}
                />

                <div style={{ marginTop: "1rem" }}>
                  {loading && (
                    <div
                      style={{
                        height: "100px",
                        width: "100px",
                        margin: "0 auto",
                      }}
                    >
                      <InstaPayLoader />
                    </div>
                  )}
                  {!loading && !exchangeRateError && (
                    <FeesComponent
                      receiverLabel={"You Will Get"}
                      error={exchangeRateError}
                      feesLabel="Fees"
                      sendingLabel="Sending Amount"
                      totalLabel="Total Amount"
                      data={{ exchange_rate: exchangeRate }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className={flowStyles.bottom}>
              <Link
                to={"https://insta-pay.ch/faqs"}
                target="_blank"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".7rem",
                }}
              >
                <HelpCircle size={16} />
                {t("Trouble Sending Money")}
              </Link>
              <div className={flowStyles.buttons}>
                {subStep > 1 && (
                  <button disabled={loading || transactionLoading} onClick={handleBack}>
                    <ChevronLeft />
                  </button>
                )}
                <button
                  className={flowStyles.full}
                  disabled={
                    subStep === 1
                      ? !cryptoCurrency?._id
                      : amountNumber < 10 ||
                        !amount ||
                        !!exchangeRateError ||
                        !!amountLimitError ||
                        loading ||
                        transactionLoading
                  }
                  onClick={() => {
                    if (transactionComplete) {
                      navigate("/wallets");
                    } else {
                      if (subStep === 1) {
                        navigate("/add-funds?wallet_address=" + cryptoCurrency._id);
                        setSubStep((prev) => prev + 1);
                      } else {
                        handleConfirm();
                      }
                    }
                  }}
                >
                  {transactionComplete ? t("Go to wallets.") : t("Next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <CryptoDetailsModal
        isOpen={showCryptoDetailsModal}
        toggle={() => {
          setShowCryptoDetailsModal(false);
          setTransactionComplete(true);
        }}
        amount={amount}
        currency={cryptoCurrency?.currency?.code}
        paymentReference={cryptoPaymentRef}
      />
    </>
  );
};

export default CryptoFund;
