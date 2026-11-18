import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

export const transactionFilter = (t) =>
  !(
    t.transaction_type?.toLowerCase() === "credit" &&
    t.status?.toLowerCase() === "failed" &&
    t.payment_type?.toLowerCase() === "mobile_wallet"
  );

export const useAccountTransactions = ({ limit = 15 } = {}) => {
  const { userDetails, authHeader } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userDetails?._id) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails._id}/1/${limit}`,
        { headers: authHeader, signal: controller.signal },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setTransactions((decrypted?.transactionList ?? []).filter(transactionFilter));
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setTransactions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [userDetails?._id, authHeader, limit]);

  return { transactions, isLoading };
};
