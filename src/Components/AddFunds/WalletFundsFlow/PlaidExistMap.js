export const PLAID_EXIT_MAP = {
  PAYMENT_INSUFFICIENT_FUNDS: {
    code: "PAYMENT_INSUFFICIENT_FUNDS",
    message:
      "There isn't enough money in this account to complete the payment. Try again, or select another account or bank.",
  },
  PAYMENT_ACCOUNT_INVALID: {
    code: "PAYMENT_ACCOUNT_INVALID",
    message: "This account is no longer active. Please select another account or bank.",
  },
  PAYMENT_ACCOUNT_BLOCKED: {
    code: "PAYMENT_ACCOUNT_BLOCKED",
    message:
      "This account cannot be used for payments. Contact your bank or select another account.",
  },
  PAYMENT_LIMIT_EXCEEDED: {
    code: "PAYMENT_LIMIT_EXCEEDED",
    message:
      "This payment exceeds your bank's daily or per-transaction limit. Try a smaller amount or contact your bank.",
  },
  PAYMENT_INVALID_CURRENCY: {
    code: "PAYMENT_INVALID_CURRENCY",
    message: "The selected currency is not supported. Please choose EUR, GBP, or USD.",
  },
  PAYMENT_EXPIRED: {
    code: "PAYMENT_EXPIRED",
    message: "This payment session has expired. Please start a new payment.",
  },
  PAYMENT_CANCELLED: {
    code: "PAYMENT_CANCELLED",
    message: "Payment cancelled.",
  },
  UNKNOWN: {
    code: "UNKNOWN",
    message: "Payment cancelled or failed. Please try again.",
  },
};

//   useEffect(() => {
//     if (!pendingTransactionId) return;

//     const checkTransactionStatus = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_IP_DEV_API}/api/plaid/transaction-status/${pendingTransactionId}`,
//           { headers: authHeader }
//         );

//         const { data } = response.data;
//         if (data?.redirect) {
//           clearInterval(pollingIntervalRef.current);
//           toast.info(data.redirect.message);
//           setTimeout(() => {
//             navigate("/wallets");
//           }, 1500);
//         }
//       } catch (error) {
//         console.warn("Transaction status check failed:", error?.message);
//       }
//     };

//     pollingIntervalRef.current = setInterval(checkTransactionStatus, 3000);

//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, [pendingTransactionId, authHeader, navigate]);
