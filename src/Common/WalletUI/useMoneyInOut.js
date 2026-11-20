import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { bucketByMonth } from "./utils";

const MONTHS = 12;

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const useMoneyInOut = (wallet) => {
  const { authHeader } = useContext(UserContext);
  const [data, setData] = useState(() => bucketByMonth());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const walletId = wallet?.wallet_id;

  useEffect(() => {
    if (!walletId) return undefined;

    const controller = new AbortController();
    const now = new Date();
    const payload = {
      from: ymd(new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1)),
      to: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      query: "",
    };

    setLoading(true);
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${walletId}/0/0`,
        { data: encryptData(payload) },
        { headers: authHeader, signal: controller.signal },
      )
      .then((res) => {
        const list = decryptData(res.data.data)?.transactionList ?? [];
        setTransactions(list);
        setData(bucketByMonth(list, now));
      })
      .catch(() => {
        // The API answers with an error when the range has no transactions, so a failure means an empty chart.
        if (controller.signal.aborted) return;
        setTransactions([]);
        setData(bucketByMonth([], now));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [walletId]);

  return { data, transactions, loading };
};
