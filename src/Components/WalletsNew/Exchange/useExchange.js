import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";

export const useExchange = (from, to) => {
  const { userWallets, authHeader } = useContext(UserContext);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);

  const wallets = useMemo(
    () => (userWallets || []).filter((w) => w?.wallet_type !== "crypto"),
    [userWallets],
  );

  const balances = useMemo(() => {
    const map = {};
    wallets.forEach((w) => {
      const code = w?.currency?.code;
      if (code) map[code] = w?.balance?.available ?? 0;
    });
    return map;
  }, [wallets]);

  const currencies = useMemo(
    () =>
      wallets.map((w) => ({
        code: w?.currency?.code,
        name: w?.currency?.name,
        wallet_id: w?.wallet_id,
      })),
    [wallets],
  );

  useEffect(() => {
    if (!from || !to || from === to) {
      setRate(null);
      return;
    }

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate`, {
        headers: authHeader,
        params: { from, to, amount: 1 },
      })
      .then((res) => {
        const dec = decryptData(res?.data?.data);
        setRate(dec?.exchangeRate?.exchanged_amount ?? null);
      })
      .catch(() => setRate(null))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { balances, currencies, rate, loading };
};
