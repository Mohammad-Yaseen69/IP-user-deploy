import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { PLAID_EXIT_MAP } from "../../Components/AddFunds/WalletFundsFlow/PlaidExistMap";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../utils/Functions/handlePaymentApiError";

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

const usePlaidLinkPayment = ({
  linkToken,
  transactionId,
  data,
  recipientData,
  type,
  autoOpen = false,
  onProcessing,
  onAuthorized,
  onCancelled,
}) => {
  const { userDetails, authHeader, setProfileLockTime } = useContext(UserContext);
  const navigate = useNavigate();
  const autoOpenedTokenRef = useRef(null);
  const completedTokenRef = useRef(null);

  const { mutateAsync: exchangePlaidToken, isPending: isExchangingToken } = useMutation({
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
        transactionId: transactionId || null,
        bankName,
        fee: data.exchange_rate?.fee?.amount ?? 0,
        transaction_id: transactionId || null,
      };
      const response = await apiWrapper({
        endpoint:
          type === "payment_address"
            ? "/api/guest-pay/exchange-bank-token"
            : "/api/plaid/exchange-token",
        method: "POST",
        payload: payload,
        isEncrypted: type === "payment_address" ? true : false,
        isDecrypted: type === "payment_address" ? true : false,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payment authorized successfully");
      onAuthorized?.();
    },
    onError: (error) => {
      handlePaymentApiError({
        error,
        setError: (message) => toast.error(message),
        setProfileLockTime,
        navigate,
        fallback:
          error?.response?.data?.message ||
          "We are unable to process your request at the moment, please try again later.",
      });
      onCancelled?.();
    },
  });

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      completedTokenRef.current = linkToken;

      if (type !== "verification_payment") {
        onProcessing?.();
        await exchangePlaidToken({ publicToken, metadata });
      } else {
        onAuthorized?.();
      }
    },
    onExit: (err) => {
      if (completedTokenRef.current === linkToken) return;
      const exitPayload = getExitPayload(err);
      try {
        toast.error(exitPayload.message);
      } catch (e) {
        console.warn("Toast failed:", e?.message || e);
      }
      (async () => {
        try {
          if (transactionId) {
            await axios.post(
              `${import.meta.env.VITE_IP_DEV_API}/api/plaid/transaction-exit`,
              {
                transactionId,
                userId: userDetails?._id,
                code: exitPayload.code,
                message: exitPayload.message,
              },
              { headers: authHeader },
            );
          }
        } catch (err2) {
          console.warn("Failed to record transaction-exit:", err2?.message || err2);
        }

        if (type === "add_funds") {
          setTimeout(() => {
            navigate("/wallets");
          }, 1500);
        }
      })();
      onCancelled?.();
    },
  });

  useEffect(() => {
    if (autoOpen && ready && linkToken && autoOpenedTokenRef.current !== linkToken) {
      autoOpenedTokenRef.current = linkToken;
      open();
    }
  }, [autoOpen, ready, linkToken, open]);

  const openLink = () => {
    if (ready && linkToken) {
      open();
    } else {
      toast.error("Plaid is not ready. Please try again.");
    }
  };

  return { openLink, ready, isExchangingToken };
};

export default usePlaidLinkPayment;
