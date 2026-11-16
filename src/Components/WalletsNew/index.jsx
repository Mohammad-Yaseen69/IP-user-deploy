// import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next";
import TopRight from "../topRight";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Top from "./Top";
import CenterContainer from "./Center";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import AccountLimits from "./AccountLimits";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import QrGenerate from "../Settings/QrGenerate";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { formatCurrency } from "../../Helper/AmountFormat";
import MoneyInOut from "./MoneyInOut/MoneyInOut";
import { useMoneyInOut } from "./MoneyInOut/useMoneyInOut";
import TransactionsTable from "../TransactionsNewApi/TransactionsTable";
import CurConversion from "../HomeNewUpdated/CurConversion";
import CryptoCard from "../HomeNewUpdated/CryptoCard";
import { ChevronRight } from "lucide-react";
// import { useLocation } from "react-router"
import btc from "../PaymentsNewer/files/bitcoin.png";
import eth from "../PaymentsNewer/files/etherium.png";
import usdt from "../PaymentsNewer/files/Tether.png";

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
  const [currentType, setCurrentType] = useState("");
  const [filtered, setFiltered] = useState([]);
  const can = usePermission();
  const { data: moneyData, loading: moneyLoading } = useMoneyInOut(currentWallet);

  const [categories, setCategories] = useState([
    {
      _id: "uncategorized",
      name: "Uncategorized",
      value: 0,
      color: "#5926f0",
    },
  ]);

  const [currenciesData, setCurrenciesData] = useState([
    {
      name: "Bitcoin",
      img: btc,
      value: "btc",
      color: "#f39900",
      graph_values: [13, 15, 25, 20, 30, 26, 24, 15, 16, 20],
      item_bg: "#FFE1B4",
      price: 0,
      eurPrice: null,
      text_color: "#ff9921",
      text_bg: "rgba(255, 153, 33, 0.20)",
      increment: "2.05%",
      inc_bg: "#91BE65",
      inc_color: "white",
    },
    {
      name: "Tether",
      img: usdt,
      value: "usdt",
      color: "#009393",
      graph_values: [15, 12, 13, 10, 12, 14, 16, 16, 8],
      item_bg: "#01E2E2",
      price: 0,
      eurPrice: null,
      text_color: "#009393",
      text_bg: "rgba(0, 147, 147, 0.22)",
      increment: "2.05%",
      inc_bg: "#fff",
      inc_color: "black",
    },
    {
      name: "Ethereum",
      img: eth,
      value: "eth",
      color: "#101010",
      graph_values: [8, 9, 16, 7, 20, 8, 12, 14],
      item_bg: "#ececec",
      price: 0,
      eurPrice: null,
      text_color: "#000",
      text_bg: "rgba(0,0,0,.2)",
      increment: "2.05%",
      inc_bg: "#FD0D1b",
      inc_color: "white",
    },
  ]);

  useEffect(() => {
    const getCryptoRates = async () => {
      try {
        const symbols = encodeURIComponent(JSON.stringify(["BTCUSDT", "ETHUSDT"]));

        const [cryptoRes, exchangeRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`),
          fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR"),
        ]);

        if (!cryptoRes.ok || !exchangeRes.ok) {
          throw new Error("Failed to fetch currency rates");
        }

        const cryptoData = await cryptoRes.json();
        const exchangeData = await exchangeRes.json();

        const usdToEur = Number(exchangeData?.rates?.EUR);

        if (!usdToEur) {
          throw new Error("Invalid USD to EUR exchange rate");
        }

        const btcPrice = Number(cryptoData.find((i) => i.symbol === "BTCUSDT")?.price || 0);

        const ethPrice = Number(cryptoData.find((i) => i.symbol === "ETHUSDT")?.price || 0);

        setCurrenciesData((prev) =>
          prev.map((currency) => {
            let price = 0;

            if (currency.value === "btc") price = btcPrice;
            else if (currency.value === "eth") price = ethPrice;
            else if (currency.value === "usdt") price = 1;

            return {
              ...currency,
              price,
              eurPrice: price * usdToEur,
              increment: "0.00%",
            };
          }),
        );
      } catch (error) {
        console.error("Error fetching crypto rates:", error);
      }
    };

    getCryptoRates();
  }, []);

  useEffect(() => {
    const updatedCategories = categories.map((category) => {
      const filteredTransactions = filtered.filter((trx) => {
        return (
          trx?.status?.toLowerCase() == "completed" &&
          trx?.categories?.some((trxCat) => trxCat === category._id) &&
          trx?.transaction_type === currentType
        );
      });

      const totalAmount = filteredTransactions.reduce((acc, trx) => acc + trx.amount, 0);

      return {
        ...category,
        value: totalAmount,
      };
    });

    const uncategorizedTransactions = filtered.filter(
      (trx) =>
        trx?.status?.toLowerCase() == "completed" &&
        (!trx.categories || trx.categories?.length === 0) &&
        trx?.transaction_type === currentType,
    );
    const totalUncategorizedAmount = uncategorizedTransactions.reduce(
      (acc, trx) => acc + trx.amount,
      0,
    );

    const uncategorizedIndex = updatedCategories.findIndex(
      (category) => category._id === "uncategorized",
    );

    if (uncategorizedIndex !== -1) {
      updatedCategories[uncategorizedIndex].value = totalUncategorizedAmount;
    } else {
      const uncategorizedCategory = {
        _id: "uncategorized",
        name: "Uncategorized",
        value: totalUncategorizedAmount,
        color: "#5926f0",
      };

      updatedCategories.push(uncategorizedCategory);
    }

    setCategories(updatedCategories);
  }, [currentType]);

  useEffect(() => {
    let timeeout;
    setCurrentType("debit");
    timeeout = setTimeout(() => {
      setCurrentType("credit");
    }, 500);
    return () => clearTimeout(timeeout);
  }, [filtered]);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { authHeader, userWallets } = useContext(UserContext);

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

  if (!can("wallet.view")) return null;

  return (
    <>
      {nonQrWallets?.length > 0 && (
        <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
      )}
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <div className={styles.top}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
              <p className={styles.w_m_sub}>{t("One wallet, every currency")}</p>
            </div>
            <TopRight />
          </div>
          <div
            className={styles.bottom}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "36px",
              marginBottom: "1rem",
            }}
          >
            <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: "24px",
                alignItems: "stretch",
              }}
            >
              {can("wallet.analytics.view") && (
                <MoneyInOut
                  currency={currentWallet?.currency?.code}
                  data={moneyData}
                  loading={moneyLoading}
                />
              )}
              <CurConversion />
            </div>

            {can("wallet.limits.view") && (
              <AccountLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )}

            {can("transactions.wallet.list") && (
              <TransactionsTable
                title="Wallet transactions   "
                description="Every payment in and out of this wallet, all currencies"
              />
            )}
          </div>
        </div>
      ) : (
        <div className={`${styles.mobile} ${styles.w_m_root}`}>
          <div className={styles.w_m_head}>
            <h4 className={styles.w_m_title}>{t("My Wallet")}</h4>
            <p className={styles.w_m_sub}>{t("One wallet, every currency")}</p>
          </div>
          <div
            className={styles.bottom}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "1rem",
            }}
          >
            <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />
            <div className={styles.crypto_row}>
              <div className={styles.crypto_top}>
                <h3 className={styles.crypto_heading}>Crypto</h3>
                <a href="/onboarding-IBAN/crypto" className={styles.crypto_link}>
                  Open Crypto
                  <ChevronRight size={14} />
                </a>
              </div>
              <div className={styles.crypto_track}>
                {currenciesData.map((item) => (
                  <div key={item.name} className={styles.crypto_item}>
                    <div className={styles.crypto_left}>
                      <span className={styles.crypto_icon} style={{ background: item.item_bg }}>
                        <img src={item.img} alt={item.name} />
                      </span>
                      <div className={styles.crypto_info}>
                        <strong>{item.name}</strong>
                        <small>{item.value.toUpperCase()}</small>
                      </div>
                    </div>

                    <div className={styles.crypto_right}>
                      <strong>${item.price ? item.price.toLocaleString("en-US") : "0.00"}</strong>
                      <small>≈ {item.eurPrice ? item.eurPrice.toFixed(2) : "0.00"} EUR</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* {can("wallet.limits.view") && (
              <AccountLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )} */}
            {can("wallet.analytics.view") && (
              <MoneyInOut
                currency={currentWallet?.currency?.code}
                data={moneyData}
                loading={moneyLoading}
              />
            )}
            <CurConversion />
            {can("transactions.wallet.list") && (
              <TransactionsTable
                title="Wallet transactions   "
                description="Every payment in and out of this wallet, all currencies"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WalletsNew;
