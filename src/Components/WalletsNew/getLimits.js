import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { formatCurrency } from "../../Helper/AmountFormat";

export const getLimits = async (
  currentWallet,
  setData,
  authHeader,
  setLoading,
  setError,
  cancelToken,
) => {
  setLoading(true);
  setData({});
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-account-limits/${currentWallet?._id}`,
      { headers: authHeader, cancelToken },
    );
    const dec = decryptData(res?.data?.data);
    const { topup_values, limits, limits_used } = dec.data;

    const data = {
      min_topup_amount: `${formatCurrency(topup_values.topup_min_amount, true)} ${currentWallet?.currency?.code} `,
      max_topup_amount: `${formatCurrency(topup_values.topup_max_amount, true)} ${currentWallet?.currency?.code} `,
      transaction_amount_limit: `${formatCurrency(limits?.transaction_amount_limit, true)} ${currentWallet?.currency?.code} `,
      balance_limits: {
        total: `${formatCurrency(limits.account_balance_limit, true)} ${currentWallet?.currency?.code} `,
        used: `${formatCurrency(limits_used.account_balance_limit_used, true)} ${currentWallet?.currency?.code} `,
        remaining: `${formatCurrency(limits.account_balance_limit - limits_used.account_balance_limit_used, true)} ${currentWallet?.currency?.code} `,
      },
      others: [
        {
          title: "Incoming Limit",
          color_dark: "#A1BAFF",
          color_light: "#DCE5FF",
          limits: {
            daily: {
              total: `${formatCurrency(limits.daily_receiving_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.daily_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.daily_receiving_limit - limits_used.daily_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
            monthly: {
              total: `${formatCurrency(limits.monthly_receiving_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.monthly_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.monthly_receiving_limit - limits_used.monthly_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
            yearly: {
              total: `${formatCurrency(limits.yearly_receiving_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.yearly_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.yearly_receiving_limit - limits_used.yearly_receiving_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
          },
        },
        {
          title: "Sending Limit",
          color_dark: "#FFCA9C",
          color_light: "#FFE8D4",
          limits: {
            daily: {
              total: `${formatCurrency(limits.daily_sending_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.daily_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.daily_sending_limit - limits_used.daily_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
            monthly: {
              total: `${formatCurrency(limits.monthly_sending_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.monthly_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.monthly_sending_limit - limits_used.monthly_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
            yearly: {
              total: `${formatCurrency(limits.yearly_sending_limit, true)} ${currentWallet?.currency?.code} `,
              used: `${formatCurrency(limits_used.yearly_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
              remaining: `${formatCurrency(limits.yearly_sending_limit - limits_used.yearly_sending_limit_used, true)} ${currentWallet?.currency?.code} `,
            },
          },
        },
        {
          title: "Allowed Number Of Transactions",
          color_dark: "#FFA9F6",
          color_light: "#FFDDFC",
          limits: {
            daily: {
              total: limits.daily_transaction_count,
              used: limits_used.daily_transaction_count_used,
              remaining: limits.daily_transaction_count - limits_used.daily_transaction_count_used,
            },
            monthly: {
              total: limits.monthly_transaction_count,
              used: limits_used.monthly_transaction_count_used,
              remaining:
                limits.monthly_transaction_count - limits_used.monthly_transaction_count_used,
            },
            yearly: {
              total: limits.yearly_transaction_count,
              used: limits_used.yearly_transaction_count_used,
              remaining:
                limits.yearly_transaction_count - limits_used.yearly_transaction_count_used,
            },
          },
        },
      ],
    };

    console.log(data, "wallet data from account limit api");
    setData(data);
  } catch (error) {
    if (error.response?.data?.data) {
      const dec = decryptData(error.response?.data?.data);
      if (axios.isCancel(error)) {
        return;
      }
      setError(dec?.message ?? "Something went wrong while fetching account limits.");
    }
  } finally {
    setLoading(false);
  }
};
