import { useContext, useState, useEffect, useRef } from "react";
import styles from "./BankDeposit.module.scss";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { UserContext } from "../../../Context/UserContext";
import { ChevronRight, Check, Info } from "react-feather";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../Helper/AmountFormat";
import InstaPayLoader from "../../Loader";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";
import cardStyles from "../../PaymentsNewer/InternationalFlow/styles/creditcard.module.css";
import logo_w from "../../../assets/images/logo/logo_white.png";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { PLAID_EXIT_MAP } from "./PlaidExistMap";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import { PlaidCurrencies } from ".";

const PlaidBankTransfer = ({
  data,
  dataHandler,
  type = "add_funds",
  toggle,
  initiatePayload,
  endpoint = ""
}) => {
  const { userDetails, authHeader, setProfileLockTime } = useContext(UserContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plaidStep, setPlaidStep] = useState(1);
  const [showAddNewBank, setShowAddNewBank] = useState(true);
  const [savedBanks, setSavedBanks] = useState([]);
  const [loadingSavedBanks, setLoadingSavedBanks] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [recipientData, setRecipientData] = useState({
    iban: "",
    saveForFutureUse: true,
  });
  const [linkToken, setLinkToken] = useState(null);
  const [pendingTransactionId, setPendingTransactionId] = useState(null);

  useEffect(() => {
    if (userDetails?._id) {
      fetchSavedBanks();
    }
  }, [userDetails?._id]);

  useEffect(() => {
    if (plaidStep === 4 && type === "add_funds") {
      const redirectTimer = setTimeout(() => {
        toast.success("Redirecting to wallets...");
        setTimeout(() => {
          navigate("/wallets");
        }, 500);
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [plaidStep, navigate]);

  const fetchSavedBanks = async () => {
    try {
      setLoadingSavedBanks(true);
      const response = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/plaid/saved-banks/${userDetails?._id}`,
        { headers: authHeader },
      );
      console.log("Saved banks fetched:", response.data);
      setSavedBanks(response.data.data || []);
      if (!response.data.data || response.data.data.length === 0) {
        setShowAddNewBank(true);
        setSelectedBankId(null);
      }
    } catch (error) {
      console.error("Error fetching saved banks:", error);
      setSavedBanks([]);
      setShowAddNewBank(true);
      setSelectedBankId(null);
    } finally {
      setLoadingSavedBanks(false);
    }
  };

  const calculateFee = () => {
    return 0;
  };

  calculateFee();

  const { mutateAsync: initiatePlaidPayment, isPending: isInitiatingPlaid } = useMutation({
    mutationFn: async () => {
      const initiatePayloadResponse = {
        ...initiatePayload(true),
        recipient_iban: recipientData.iban,
        saveForFutureUse: recipientData.saveForFutureUse,
      }

      if (type === "add_funds") {
        initiatePayloadResponse.recipientIban = recipientData.iban
      }

      console.log("Initiating Plaid Payment with payload:", initiatePayloadResponse);

      const response = await apiWrapper({
        endpoint: type === "payment_address" ? "/api/guest-pay/initiate-bank-payment" : endpoint || "/api/plaid/initiate-payment",
        method: "POST",
        payload: initiatePayloadResponse,
        isEncrypted: type === "add_funds" || type === "wallet_to_wallet" ? false : true,
        isDecrypted: type === "add_funds" ? false : true,
      })
      console.log("Plaid initiation response:", response);
      return response;
    },
    onSuccess: (res) => {
      console.log(res)
      setLinkToken(res?.linkToken || res?.data?.linkToken);
      setPendingTransactionId(res?.transaction_id || res?.data?.transactionId || res?.data?.data?.transactionId || null);
      setPlaidStep(2);
    },
    onError: (error) => {
      console.error("Failed to initiate Plaid payment:", error);
      if (type !== "payment_address") {
        handlePaymentApiError({
          error,
          setError: (m) => dataHandler("error", m),
          setProfileLockTime,
          navigate,
          fallback: "We are unable to process your request at the moment, please try again later.",
        });
      } else {
        toast.error(
          "We are unable to process your request at the moment, please try again later!"
        );
      }
    },
  });

  const { mutateAsync: exchangePlaidToken, isPending: isExchangingToken } =
    useMutation({
      mutationFn: async ({ publicToken, metadata }) => {
        const bankName = metadata?.institution?.name || null;
        const payload = {
          public_token: publicToken,
          userId: userDetails?._id,
          amount: data.exchange_rate?.sending?.amount,
          walletId: data.wallet?._id,
          walletCurrency: data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code,
          recipientIban: recipientData.iban,
          saveForFutureUse: recipientData.saveForFutureUse,
          transactionId: pendingTransactionId || null,
          bankName,
          fee: data.exchange_rate?.fee?.amount ?? 0,
          transaction_id: pendingTransactionId || null
        };
        console.log("Exchanging Plaid token with payload:", payload);
        // 
        const response = await apiWrapper({
          endpoint: type === "payment_address" ? "/api/guest-pay/exchange-bank-token" : "/api/plaid/exchange-token",
          method: "POST",
          payload: payload,
          isEncrypted: type === "payment_address" ? true : false,
          isDecrypted: type === "payment_address" ? true : false,
        })
        console.log("Token exchange response:", response.data);
        return response.data;
      },
      onSuccess: () => {
        setPlaidStep(4);
        toast.success("Payment authorized successfully");
      },
      onError: (error) => {
        console.error("Failed to exchange Plaid token:", error);
        toast.error(
          "we are unable to process your request at the moment, please try again later!" | error?.response?.data?.message || error.message
        );
        setPlaidStep(1);
      },
    });

  const { mutateAsync: performSavedBankPayment, isPending: isUsingSavedBank } =
    useMutation({
      mutationFn: async () => {
        if (!selectedBankId) {
          throw new Error("No bank selected");
        }
        const topupPayload = {
          userId: userDetails?._id,
          amount: data.exchange_rate?.sending?.amount,
          walletId: data.wallet?._id,
          savedBankId: selectedBankId,
        };

        const payload = {
          ...initiatePayload(true),
          recipient_iban: recipientData.iban,
          saveForFutureUse: recipientData.saveForFutureUse,
        }

        console.log("Using saved bank with payload:", payload);

        const response = await apiWrapper({
          endpoint: endpoint || "/api/plaid/use-saved-bank",
          payload: type === "add_funds" ? topupPayload : payload,
          isEncrypted: type === "add_funds" || type === "wallet_to_wallet" ? false : true,
          isDecrypted: type === "add_funds" ? false : true,
        })

        console.log("Saved bank payment response:", response);
        return response;
      },
      onSuccess: () => {
        setPlaidStep(4);
        toast.success("Payment initiated successfully!");
      },
      onError: (error) => {
        console.error("Failed to use saved bank:", error);
        if (error.response?.data?.action === "RECONNECT_REQUIRED") {
          toast.error(
            "This bank needs to be reconnected. Please add it again.",
          );
          if (userDetails?._id) {
            fetchSavedBanks();
          }
        } else {
          toast.error(
            error?.response?.data?.message || "Failed to process payment",
          );
        }
      },
    });

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      console.log("Plaid success:", { publicToken, metadata });
      setPlaidStep(3);
      await exchangePlaidToken({ publicToken, metadata });
    },
    onExit: (err, metadata) => {
      console.log("Plaid Exit:", { err, metadata });
      const exitPayload = getExitPayload(err);
      try {
        toast.error(exitPayload.message);
      } catch (e) {
        console.warn("Toast failed:", e?.message || e);
      }
      (async () => {
        try {
          if (pendingTransactionId) {
            await axios.post(
              `${import.meta.env.VITE_IP_DEV_API}/api/plaid/transaction-exit`,
              {
                transactionId: pendingTransactionId,
                userId: userDetails?._id,
                code: exitPayload.code,
                message: exitPayload.message,
              },
              { headers: authHeader },
            );
          }
        } catch (err2) {
          console.warn(
            "Failed to record transaction-exit:",
            err2?.message || err2,
          );
        }

        if (type === "add_funds") {
          setTimeout(() => {
            navigate("/wallets");
          }, 1500);
        }
      })();
      setPlaidStep(1);
    },
    onEvent: (eventName, metadata) => {
      console.log("Plaid event:", eventName, metadata);
    },
  });


  const getExitPayload = (err) => {
    if (err) {
      const errCode = (err?.error_code || err?.errorCode || err?.code || "").toString();

      if (errCode && PLAID_EXIT_MAP[errCode]) return PLAID_EXIT_MAP[errCode];

      const rawMsg = (err?.display_message || err?.error_message || err?.message || "").toLowerCase();

      if (rawMsg.includes("insufficient")) return PLAID_EXIT_MAP.PAYMENT_INSUFFICIENT_FUNDS;
      if (rawMsg.includes("expired")) return PLAID_EXIT_MAP.PAYMENT_EXPIRED;
      if (rawMsg.includes("limit")) return PLAID_EXIT_MAP.PAYMENT_LIMIT_EXCEEDED;

      return {
        code: errCode || PLAID_EXIT_MAP.UNKNOWN.code,
        message: err?.display_message || PLAID_EXIT_MAP.UNKNOWN.message,
      };
    }
    return PLAID_EXIT_MAP.PAYMENT_CANCELLED;
  };

  const handleRecipientChange = (field, value) => {
    setRecipientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onBackClickHandler = () => {
    if (plaidStep === 1) {
      if (type === "wallet_to_wallet") {
        dataHandler("step", 4);
      } else {
        dataHandler("step", 3);
        dataHandler("exchange_rate", data.exchange_rate_backup);
      }
    } else if (plaidStep === 2 || plaidStep === 3) {
      setPlaidStep(1);
      setLinkToken(null);
    } else if (plaidStep === 4) {
      if (type === "payment_address") {
        toggle();
      } else {
        navigate(`/wallets`);
      }
    }
  };

  const handleConfirmPayment = () => {
    if (ready && linkToken) {
      open();
    } else {
      toast.error("Plaid is not ready. Please try again.");
    }
  };

  console.log(ready)
  return (
    <div
      style={{
        minHeight:
          window.innerWidth < 1000 && type === "payment_address" && "80vh",
      }}
      className={styles.container}
    >
      {plaidStep === 1 && (
        <div className={styles.bankDets}>
          {!showAddNewBank && savedBanks.length > 0 ? (
            <>
              <h4>{t("Select Your Saved Bank")}</h4>
              <div className={cardStyles.cards}>
                {savedBanks.map((bank) => (
                  <div
                    key={bank._id}
                    className={cardStyles.card}
                    onClick={() => setSelectedBankId(bank._id)}
                  >
                    <div className={cardStyles.c_top}>
                      <img src={logo_w} alt="" />
                    </div>
                    <div className={cardStyles.c_bot}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          maxWidth: "80%",
                        }}
                      >
                        <span style={{ fontSize: ".75rem", opacity: 0.85 }}>
                          {bank.bankName || "Bank Account"}
                        </span>
                        <span style={{ fontSize: ".7rem" }}>
                          {bank.recipientIbanMasked}
                        </span>
                        <span style={{ fontSize: ".65rem", opacity: 0.85 }}>
                          {bank.transactionCount} {t("transactions")}
                        </span>
                      </div>
                      {selectedBankId === bank._id && (
                        <Check style={{ color: "white" }} size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount Summary */}
              {/* <div
                style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "6px",
                  marginTop: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>{t("Total")}</span>
                  <strong>
                    {formatCurrency(data.exchange_rate?.sending?.amount)}{" "}
                    {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                  </strong>
                </div>
                {data.exchange_rate?.fee?.amount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>{t("Fee")}</span>
                    <strong>
                      {formatCurrency(data.exchange_rate?.fee?.amount)}{" "}
                      {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                    </strong>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  <span>{t("Amount")}</span>
                  <strong>
                    {formatCurrency(totalAmount)} {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                  </strong>
                </div>
              </div> */}

              {/* Option to add new bank */}
              <button
                onClick={() => {
                  setShowAddNewBank(true);
                  setRecipientData({ iban: "", saveForFutureUse: false });
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "3rem",
                  background: "bg-gradient-to-r from-gray-100 to-gray-200",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  color: "#666",
                }}
              >
                ➕ {t("Payment with  new bank")}
              </button>
            </>
          ) : (
            <>
              {/* SHOW ADD NEW BANK FORM */}
              <h4>
                {showAddNewBank
                  ? t('')
                  : t("Enter recipient IBAN for Plaid Bank Transfer")}
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginTop: "2rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 700,
                      fontSize: "16px"
                    }}
                  >
                    {t("Type in the IBAN of the bank account you'll be transferring from:")}
                  </label>
                  <input
                    type="text"
                    value={recipientData.iban}
                    onChange={(e) =>
                      handleRecipientChange("iban", e.target.value)
                    }
                    placeholder="Example: GB33BUKB20201555555555"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontFamily: "Manrope",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                {type !== "payment_address" &&
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      marginTop: "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="saveForFuture"
                      checked={recipientData.saveForFutureUse}
                      onChange={(e) => handleRecipientChange("saveForFutureUse", e.target.checked)
                      }
                      style={{ cursor: "pointer", width: "18px", height: "18px" }}
                    />
                    <label
                      htmlFor="saveForFuture"
                      style={{ cursor: "pointer", marginBottom: 0, flex: 1 }}
                    >
                      <strong>{t("Save this bank for future use")}</strong>
                      <small
                        style={{
                          display: "block",
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      ></small>
                    </label>

                  </div>
                }
                {/* <div
                  style={{
                    background: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "6px",
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span>{t("Amount")}</span>
                    <strong>
                      {formatCurrency(data.exchange_rate?.sending?.amount)}{" "}
                      {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                    </strong>
                  </div>
                  {data.exchange_rate?.fee?.amount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>{t("Fee")}</span>
                      <strong>
                        {formatCurrency(data.exchange_rate?.fee?.amount)}{" "}
                        {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                      </strong>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid #ddd",
                      fontWeight: "600",
                    }}
                  >
                    <span>{t("Total")}</span>
                    <strong>
                      {formatCurrency(totalAmount)}{" "}
                      {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                    </strong>
                  </div>
                </div> */}

                {showAddNewBank && savedBanks.length > 0 && (
                  <button
                    onClick={() => {
                      setShowAddNewBank(false);
                      setRecipientData({ iban: "", saveForFutureUse: false });
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "1rem",
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      color: "#666",
                    }}
                  >
                    ← {t("Back to Saved Banks")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {plaidStep === 2 && (
        <div className={styles.bankDets}>
          <h4>{t("Review Your Transfer")}</h4>

          <div style={{ marginTop: "2rem" }}>
            <div className={styles.bankData}>
              <div className={styles.data}>
                <p>IBAN</p>
                <span>{recipientData.iban}</span>
              </div>
              <div className={styles.data}></div>
              {type !== "payment_address" && <div className={styles.data}>
                <p>{t("Save for future use")}</p>
                <span>{recipientData.saveForFutureUse ? " Yes" : " No"}</span>
              </div>}
              <div className={styles.data}>
                <p>{type === "payment_address" ? t("You are Sending") : t("Amount")}</p>
                <span>
                  {formatCurrency(
                    data.amount || data.exchange_rate?.sending?.amount,
                  )}{" "}
                  {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                </span>
              </div>
              {data.exchange_rate?.sending?.currency &&
                data.exchange_rate?.sending?.currency !==
                data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code && (
                  <div className={styles.data}>
                    <p>{t("Amount to Pay")}</p>
                    <span style={{ color: "#303c82", fontWeight: "600" }}>
                      {formatCurrency(data?.exchange_rate?.total)}{" "}
                      {data.exchange_rate?.sending?.currency}
                    </span>
                  </div>
                )}
              {data.exchange_rate?.fee?.amount > 0 && (
                <div className={styles.data}>
                  <p>{type === "payment_address" ? t("Sending Fees") : t("Fee")}</p>
                  <span>
                    {formatCurrency(data.exchange_rate?.fee?.amount)}{" "}
                    {data.exchange_rate?.fee?.currency ||
                      data.exchange_rate?.sending?.currency}
                  </span>
                </div>
              )}
              {type === "payment_address" && data.exchange_rate?.fee?.paymentAddressFee > 0 && (
                <div className={styles.data}>
                  <p>{t("Payment Address Fee")}</p>
                  <span>
                    {formatCurrency(data.exchange_rate?.fee?.paymentAddressFee)}{" "}
                    {data.exchange_rate?.sending?.currency}
                  </span>
                </div>
              )}
              <div className={styles.data}>
                <p>{type === "payment_address" ? t("They will receive") : t("Will Receive in Wallet")}</p>
                <strong>
                  {formatCurrency(data.exchange_rate?.receiver?.amount)}{" "}
                  {data.exchange_rate?.receiver?.currency ||
                    data.exchange_rate?.sending?.currency}
                </strong>
              </div>
            </div>
            {type !== "add_funds" && data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency) && (
              <div style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".7rem",
                    padding: ".5rem",
                    background: "#edecf1ff",
                    borderRadius: "6px",
                    color: "#5926F0",
                    fontSize: ".7rem",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.28px",
                    marginBottom: "0.5rem"
                  }}
                >
                  <Info size={16} />
                  <span>
                    {t("plaid_currency_not_supported", {
                      currency: data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code,
                      defaultCurrency: data?.exchange_rate?.plaid_currency,
                    })}
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: ".9rem",
                  padding: ".8rem",
                  background: "#fff",
                  borderRadius: "6px",
                  boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    justifyContent: "space-between"
                  }}>
                    <span style={{
                      color: '#8A8A8A',
                      fontFamily: 'Manrope',
                      fontSize: ".7rem",
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 1.5,
                      letterSpacing: '-0.14px'
                    }}>{t("Exchange Rate")}</span>
                    <strong
                      style={{
                        color: '#000',
                        fontFamily: 'Manrope',
                        fontSize: ".7rem",
                        fontStyle: 'normal',
                        lineHeight: 1.5,
                        letterSpacing: '-0.14px'
                      }}>1.00 {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code} = {Number(data.exchange_rate?.plaid_fx)} {data?.exchange_rate?.plaid_currency}</strong>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    justifyContent: "space-between"
                  }}>
                    <span style={{
                      color: '#8A8A8A',
                      fontFamily: 'Manrope',
                      fontSize: ".7rem",
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 1.5,
                      letterSpacing: '-0.14px'
                    }}>{t("Amount in CHF").replace("CHF", data?.exchange_rate?.plaid_currency)}</span>
                    <strong style={{
                      color: '#000',
                      fontFamily: 'Manrope',
                      fontSize: "1.2rem",
                      fontStyle: 'normal',
                      fontWeight: 700,
                      lineHeight: 1.7,
                      letterSpacing: '-0.8px'
                    }}>{Number(data.exchange_rate?.plaid_amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.exchange_rate?.plaid_currency}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {plaidStep === 3 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            gap: "2rem",
          }}
        >
          <InstaPayLoader />
          <h4>{t("Processing your payment...")}</h4>
        </div>
      )}

      {plaidStep === 4 && (
        <div className={styles.success}>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                d="M8.0013 15.4167H13.0013M6.0013 1.66666H15.0013C15.468 1.66666 15.7014 1.66666 15.8796 1.75748C16.0364 1.83738 16.1639 1.96486 16.2438 2.12166C16.3346 2.29992 16.3346 2.53328 16.3346 2.99999V4.72875C16.3346 5.1364 16.3346 5.34023 16.2886 5.53204C16.2478 5.7021 16.1804 5.86468 16.089 6.0138C15.986 6.18199 15.8418 6.32612 15.5536 6.61437L13.1108 9.05718C12.7808 9.3872 12.6158 9.5522 12.5539 9.74248C12.4996 9.90985 12.4996 10.0901 12.5539 10.2575C12.6158 10.4478 12.7808 10.6128 13.1108 10.9428L15.5536 13.3856C15.8418 13.6739 15.986 13.818 16.089 13.9862C16.1804 14.1353 16.2478 14.2979 16.2886 14.4679C16.3346 14.6597 16.3346 14.8636 16.3346 15.2712V17C16.3346 17.4667 16.3346 17.7001 16.2438 17.8783C16.1639 18.0351 16.0364 18.1626 15.8796 18.2425C15.7014 18.3333 15.468 18.3333 15.0013 18.3333H6.0013C5.53459 18.3333 5.30124 18.3333 5.12298 18.2425C4.96617 18.1626 4.83869 18.0351 4.7588 17.8783C4.66797 17.7001 4.66797 17.4667 4.66797 17V15.2712C4.66797 14.8636 4.66797 14.6597 4.71402 14.4679C4.75485 14.2979 4.82219 14.1353 4.91357 13.9862C5.01664 13.818 5.16076 13.6739 5.44902 13.3856L7.89183 10.9428C8.22184 10.6128 8.38685 10.4478 8.44867 10.2575C8.50305 10.0901 8.50305 9.90985 8.44867 9.74248C8.38685 9.5522 8.22184 9.38719 7.89183 9.05718L5.44902 6.61437C5.16077 6.32612 5.01664 6.18199 4.91357 6.0138C4.82219 5.86468 4.75485 5.7021 4.71402 5.53204C4.66797 5.34023 4.66797 5.1364 4.66797 4.72875V2.99999C4.66797 2.53328 4.66797 2.29992 4.7588 2.12166C4.83869 1.96486 4.96617 1.83738 5.12298 1.75748C5.30124 1.66666 5.53459 1.66666 6.0013 1.66666Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h4
            style={{ color: "black", textAlign: "center", marginBottom: "0px" }}
          >
            {t(
              type === "payment_address" ? "Payment authorized successfully, the recipient will receive the amount once the transfer is complete, you can now close this modal" : "Payment authorized successfully! Your wallet will be credited once the transfer is complete.",
            )}
          </h4>
        </div>
      )}

      <div className={styles.bottom}>
        <div></div>
        <div
          className={`${styles?.buttons} ${type === "payment_address" && window.innerWidth < 1000 && styles.mobileButtons}`}
        >
          {(plaidStep === 1 || plaidStep === 2) && (
            <button
              className={styles.transparent}
              onClick={onBackClickHandler}
              disabled={isInitiatingPlaid || isExchangingToken}
            >
              {t("Back")}
            </button>
          )}
          {plaidStep === 1 && (
            <button
              disabled={
                isInitiatingPlaid ||
                isUsingSavedBank ||
                (showAddNewBank && !recipientData.iban?.trim()) ||
                (!showAddNewBank && savedBanks.length > 0 && !selectedBankId)
              }
              onClick={async () => {
                console.log("clicked")
                try {
                  console.log(showAddNewBank, recipientData)
                  if (!showAddNewBank && selectedBankId) {
                    console.log("Using saved bank:", selectedBankId);
                    const result = await performSavedBankPayment();
                    console.log("Saved bank payment result:", result);
                  } else if (showAddNewBank) {
                    console.log("Adding new bank");
                    await initiatePlaidPayment();
                  }
                } catch (error) {
                  console.error("Button click error:", error);
                }
              }}
            >
              {isInitiatingPlaid || isUsingSavedBank
                ? t("Processing...")
                : !showAddNewBank && selectedBankId
                  ? t("Pay Now")
                  : t("Next")}
              {window.innerWidth > 1000 && <ChevronRight size={18} />}
            </button>
          )}
          {plaidStep === 2 && (
            <button
              disabled={isExchangingToken || !ready}
              onClick={handleConfirmPayment}
            >
              {isExchangingToken ? t("Processing...") : t("Connect Bank")}
              {window.innerWidth > 1000 && <ChevronRight size={18} />}
            </button>
          )}
          {plaidStep === 4 && (
            <button onClick={onBackClickHandler}>
              {type === "payment_address"
                ? t("Close")
                : t("Go back to wallets")}
              {window.innerWidth > 1000 && <ChevronRight size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaidBankTransfer;
