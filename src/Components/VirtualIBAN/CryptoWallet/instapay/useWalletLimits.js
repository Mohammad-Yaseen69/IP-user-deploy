import { useEffect, useState } from "react";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError";
import { formatCurrency } from "../../../../Helper/AmountFormat";

const PERIODS = ["daily", "monthly", "yearly"];

/** The crypto limits reply, in the shape AccountLimits renders. Receiving and top-up caps are not enforced yet, so they stay hidden. */
export const toAccountLimits = ({
  currency,
  limits = {},
  used = {},
  remaining = {},
  balance = {},
}) => {
  const money = (value) => `${formatCurrency(value ?? 0, true)} ${currency}`;
  const tab = (suffix, format) =>
    Object.fromEntries(
      PERIODS.map((period) => {
        const key = `${period}_${suffix}`;
        return [
          period,
          {
            total: format(limits[key]),
            used: format(used[key]),
            remaining: format(remaining[key]),
          },
        ];
      }),
    );

  return {
    transaction_amount_limit: money(limits.transaction_amount_limit),
    balance_limits: {
      total: money(limits.account_balance_limit),
      used: money(balance.held),
      remaining: money(balance.remaining),
    },
    others: [
      {
        title: "Sending Limit",
        color_dark: "#FFCA9C",
        color_light: "#FFE8D4",
        limits: tab("sending_limit", money),
      },
      {
        title: "Allowed Number Of Transactions",
        color_dark: "#FFA9F6",
        color_light: "#FFDDFC",
        limits: tab("transaction_count", (value) => value ?? 0),
      },
    ],
  };
};

/** The account-wide crypto limits, shown in the open wallet's currency. */
export const useWalletLimits = (wallet) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const walletId = wallet?._id;

  useEffect(() => {
    if (!walletId) return undefined;
    let stale = false;

    setLoading(true);
    setError(false);
    setData({});
    apiWrapper({ endpoint: `/api/crypto/limits/${walletId}`, isDecrypted: true })
      .then((res) => !stale && setData(toAccountLimits(res?.data || {})))
      .catch(
        (err) =>
          !stale &&
          handlePaymentApiError({
            error: err,
            fallback: "Something went wrong while fetching account limits.",
            setError,
          }),
      )
      .finally(() => !stale && setLoading(false));

    return () => {
      stale = true;
    };
  }, [walletId]);

  return { data, loading, error };
};

export default useWalletLimits;
