import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildMonthlyData = (transactions = [], walletId, months = 12) => {
  const now = new Date();
  const buckets = {};

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets[monthKey(d)] = {
      month: d.toLocaleString("en-US", { month: "short" }),
      in: 0,
      out: 0,
    };
  }

  transactions.forEach((tx) => {
    // Sirf completed transactions
    if (tx?.status?.toLowerCase() !== "completed") return;

    // Sirf selected wallet ki transactions
    if (walletId && tx?.wallet_id !== walletId) return;

    const d = new Date(tx.createdAt);
    const bucket = buckets[monthKey(d)];
    if (!bucket) return;

    const amount = Math.abs(Number(tx.amount) || 0);

    if (tx.transaction_type === "credit") bucket.in += amount;
    else if (tx.transaction_type === "debit") bucket.out += amount;
  });

  return Object.values(buckets);
};

export const useMoneyInOut = (currentWallet) => {
  const { userDetails, authHeader } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userDetails?._id) return;

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const payload = encryptData({
      from: formatDate(from),
      to: formatDate(now),
      query: "",
    });

    setLoading(true);
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails._id}/0/1000`,
        { data: payload },
        { headers: authHeader },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        console.log("transactions count", decrypted?.transactionList?.length);
        setData(buildMonthlyData(decrypted?.transactionList ?? [], currentWallet?.wallet_id));
      })
      .catch((err) => {
        const msg = err?.response?.data?.data ? decryptData(err.response.data.data) : err?.message;
        console.error("transactions error", msg);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [userDetails, currentWallet]);

  return { data, loading };
};
