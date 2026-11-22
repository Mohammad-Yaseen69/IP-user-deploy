import { useTranslation } from "react-i18next";
import TopRight from "../topRight";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Top from "./Top";
import WalletLimits from "./WalletLimits";
import WalletLedger from "./WalletLedger";
// import ComingUp from "./ComingUp";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import QrGenerate from "../Settings/QrGenerate";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { formatCurrency } from "../../Helper/AmountFormat";
import CurConversion from "../HomeNewUpdated/CurConversion";
import MoneyInOut from "../../Common/WalletUI/MoneyInOut";
import { useMoneyInOut } from "../../Common/WalletUI/useMoneyInOut";
import u from "../../Common/WalletUI/ui.module.scss";

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

const WalletsNew = () => {
  const { t } = useTranslation();
  const [currentWallet, setCurrentWallet] = useState(null);
  const cancelTokenRef = useRef();
  const can = usePermission();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { authHeader, userWallets } = useContext(UserContext);
  const { data: moneyData, loading: moneyLoading } = useMoneyInOut(currentWallet);

  useEffect(() => {
    if (currentWallet?._id) {
      if (cancelTokenRef.current) {
        cancelTokenRef.current?.cancel();
      }

      cancelTokenRef.current = axios.CancelToken.source();
      getLimits(
        currentWallet,
        setData,
        authHeader,
        setLoading,
        setError,
        cancelTokenRef.current.token,
      );
    }

    return () => {
      if (cancelTokenRef?.current) {
        cancelTokenRef.current?.cancel();
      }
    };
  }, [currentWallet]);

  const nonQrWallets = useMemo(() => {
    return userWallets?.filter((item) => !item?.qrCode?.url) ?? [];
  }, [userWallets]);

  // Same list the wallet carousel shows: crypto wallets live on the Crypto page.
  const currencyCount = useMemo(
    () =>
      (userWallets ?? []).filter((w) => w?.provider !== "bvnk" && w?.wallet_type !== "crypto")
        .length,
    [userWallets],
  );

  if (!can("wallet.view")) return null;

  return (
    <>
      {nonQrWallets?.length > 0 && (
        <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
      )}
      <div className={u.page}>
        <header className={u.header}>
          <div className={u.headerText}>
            <h1>{t("My Wallets")}</h1>
            <p>
              {currencyCount === 1
                ? t("1 currency in one wallet.")
                : t("{{n}} currencies in one wallet.", { n: currencyCount })}
              {currentWallet?.wallet_id &&
                ` ${t("Wallet ID")} ${currentWallet?.wallet_type?.toUpperCase()}-${currentWallet.wallet_id.toUpperCase()}.`}
            </p>
          </div>
          <div className={u.headerRight}>
            <TopRight position="static" />
          </div>
        </header>
        <div className={u.content}>
          <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />

          <div className={`${u.row} ${u.rowWide}`}>
            {can("wallet.analytics.view") && (
              <MoneyInOut
                currency={currentWallet?.currency?.code}
                data={moneyData}
                loading={moneyLoading}
              />
            )}
            {can("wallet.payment.conversion") && <CurConversion variant="card" />}
          </div>

          <div className={`${u.row} ${u.rowWide}`}>
            {can("wallet.limits.view") && (
              <WalletLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )}
            {/* {can("schedules.view") && <ComingUp />} */}
          </div>

          {can("transactions.wallet.list") && <WalletLedger currentWallet={currentWallet} />}
        </div>
      </div>
    </>
  );
};

export default WalletsNew;
