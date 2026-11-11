import { useMemo, useContext, useEffect, useState, lazy } from "react";
import styles from "./styles/index.module.scss";
import cardsStyle from "./styles/CardsContainer.module.css";
import { useTranslation } from "react-i18next";
import { BsFillPlayFill } from "react-icons/bs";
import { ChevronRight } from "react-feather";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { useMoneyInOut } from "../WalletsNew/MoneyInOut/useMoneyInOut";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const BalanceComponent = lazy(() => import("./BalanceCard"));
const EarnMoneyBanner = lazy(() => import("./EarnMoneyBanner"));
const TransDetails = lazy(() => import("./TransDetails"));
const QuickLinksNew = lazy(() => import("./QuickLinksNew"));
const Stats = lazy(() => import("./Stats"));
const RecentTrans = lazy(() => import("./RecentTrans"));
const RightContainer = lazy(() => import("./RightContainer"));
const SearchComponent = lazy(() => import("./Search"));
const ReferalRewards = lazy(() => import("./ReferalRewards"));
const CryptoCard = lazy(() => import("./CryptoCard"));
const RecentBeneficiaries = lazy(() => import("./RecentBeneficiaries"));
const WalletsMobile = lazy(() => import("./WalletsMobile"));
const CurConversion = lazy(() => import("./CurConversion"));
const QuickLinksMobile = lazy(() => import("./QuickLinksMobile"));
const TopBar = lazy(() => import("../../Layout/TopBar"));
const BusinessModal = lazy(() => import("../BusinessModal"));
const OtherBalance = lazy(() => import("./OtherBalance"));
const MoneyInOut = lazy(() => import("../WalletsNew/MoneyInOut/MoneyInOut"));
const SpendingBreakdown = lazy(() => import("../Analytics/SpendingBreakdown"));

import btc from "../PaymentsNewer/files/bitcoin.png";
import eth from "../PaymentsNewer/files/etherium.png";
import usdt from "../PaymentsNewer/files/Tether.png";
import crown from "./files/crown.svg";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import TopRight from "../topRight";

const HomeNewUpdated = () => {
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
  const can = usePermission();

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

  const getTodayDate = () => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const {
    userDetails,
    profileCompletedPercentage,
    userWallets,
    authHeader,
    croppedImages,
    isAgentLogin,
    agentDetails,
    totalReferralAmount,
  } = useContext(UserContext);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const activeWallet = selectedWallet ?? userWallets?.[0];
  const [friendsJoined, setFriendsJoined] = useState(0);
  const [analyticsReports, setAnalyticsReports] = useState({});
  const [analyticsSummary, setAnalyticsSummary] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!userDetails?._id || userDetails?.account_type !== "individual") return;

    axios
      .get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-referral/${userDetails._id}`, {
        headers: authHeader,
      })
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setFriendsJoined(decrypted?.data?.length ?? 0);
      })
      .catch(() => setFriendsJoined(0));
  }, [userDetails?._id]);

  const [apiDates, setApiDates] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return {
      from: start.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  });

  const analyticsSummaryForWallet = useMemo(() => {
    const code = activeWallet?.currency?.code;
    if (code && analyticsSummary?.[code]) return analyticsSummary[code];
    return Object.values(analyticsSummary ?? {})[0] ?? {};
  }, [analyticsSummary, activeWallet]);

  useEffect(() => {
    if (!userDetails?._id || !activeWallet?.wallet_id || !apiDates) return;

    const BASE = import.meta.env.VITE_IP_DEV_API;

    const getAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const [typeRes, summaryRes] = await Promise.all([
          axios.post(
            `${BASE}/api/transaction/search-account-transactions-by-date-type/${userDetails._id}/0/0`,
            { data: encryptData({ ...apiDates }) },
            { headers: authHeader },
          ),
          axios.post(
            `${BASE}/api/transaction/get-transactions-report-user/0/0`,
            {
              data: encryptData({
                ...apiDates,
                account_id: userDetails._id,
                wallet_id: activeWallet.wallet_id,
              }),
            },
            { headers: authHeader },
          ),
        ]);

        const typeDecrypted = decryptData(typeRes.data.data);
        const summaryDecrypted = decryptData(summaryRes.data.data);

        setAnalyticsReports(typeDecrypted?.transactionsByServiceTypeAndCurrency ?? {});
        setAnalyticsSummary(summaryDecrypted?.transactionSummary ?? {});
      } catch (err) {
        console.error("analytics error", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    getAnalytics();
  }, [userDetails?._id, activeWallet?.wallet_id, apiDates]);
  const { data: moneyData, loading: moneyLoading } = useMoneyInOut(selectedWallet);
  const currency = selectedWallet?.currency?.code ?? userWallets?.[0]?.currency?.code;

  const { t } = useTranslation();

  const [showBusinessModal, setShowBusinessModal] = useState(false);

  const firstName = (
    userDetails?.account_type?.toLowerCase() === "individual"
      ? userDetails?.user?.first_name
      : isAgentLogin
        ? agentDetails?.first_name
        : userDetails?.company?.company_name
  )?.split(" ")[0];

  return (
    <>
      {window.innerWidth > 1000 && (
        <div
          className={styles.container}
          onClick={() => {
            if (profileCompletedPercentage < 100 && !showCompletionModal) {
              setShowCompletionModal(true);
            }
          }}
        >
          <div className={styles.top}>
            <div className={styles.top_section}>
              <h4>{t("Dashbaord")}</h4>
              <p>Manage and monitor your InstaPay Wallet</p>
            </div>
            <TopRight />
          </div>
          <div className={styles.greeting}>
            <h1>
              {getGreeting()}, <span className={styles.name}>{firstName}</span>
            </h1>
            <div className={styles.greeting_alert}>
              <span className={styles.date}>{getTodayDate()}</span>
              {/* <span className={`${styles.pill} ${styles.pill_warning}`}>
                {t("2 bills due this week")}
              </span> */}
              {/* <span className={`${styles.pill} ${styles.pill_info}`}>
                {t("1 payment pending")}
              </span> */}
            </div>
          </div>
          <div className={styles.sub}>
            <div className={styles.left}>
              <div className={styles.card}>
                <div className={styles.balance_currencies}>
                  {can("dashboard.balance.view") && <BalanceComponent />}
                  {can("dashboard.balance.view") &&
                    userWallets.some((item) => item?.balance?.reserved) && <OtherBalance />}
                </div>
                <QuickLinksNew />
              </div>
            </div>
          </div>

          <div className={styles.right}>
            {can("wallet.list.view") && (
              <RightContainer
                setCurrentWallet={setSelectedWallet}
                showBusinessModal={showBusinessModal}
                setShowBusinessModal={setShowBusinessModal}
              />
            )}
          </div>
          <div className={styles.Money_section}>
            {can("dashboard.insights.view") && (
              <MoneyInOut currency={currency} data={moneyData} loading={moneyLoading} />
            )}
            {can("dashboard.recent-transactions.view") && (
              <RecentTrans currentWallet={selectedWallet} />
            )}
          </div>
          <div className={styles.quickTransfer}>
            <RecentBeneficiaries />
          </div>
          <div className={styles.crypto_row}>
            <div className={styles.crypto_top}>
              <div className={styles.crypto_title}>
                <h4>Crypto balances</h4>
                <p>Every service you use, with what needs your attention</p>
              </div>
              <a href="/onboarding-IBAN/crypto" className={styles.crypto_link}>
                Open Crypto
                <span className={styles.crypto_chevron}>
                  <ChevronRight size={17} />
                </span>
              </a>
            </div>
            {userWallets.some((item) => item?.balance?.reserved) ? (
              <div className={styles.crypto_track} style={{ maxWidth: "33vw" }}>
                {currenciesData.map((item) => (
                  <CryptoCard key={item.name} item={item} />
                ))}
              </div>
            ) : (
              <div
                className={styles.crypto_track}
                style={{ display: "flex", scrollbarWidth: "none" }}
              >
                {currenciesData.map((item) => (
                  <CryptoCard key={item.name} item={item} />
                ))}
              </div>
            )}
          </div>
          {userDetails?.account_type === "individual" && (
            <div className={styles.banner_row}>
              <div className={styles.banner_business}>
                <button
                  onClick={() => setShowBusinessModal(true)}
                  className={cardsStyle.button}
                  style={{
                    background:
                      "linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: ".75rem",
                    borderRadius: "7px",
                    padding: "1rem",
                  }}
                >
                  <img src={crown} alt="c" loading="lazy" style={{ width: "20px" }} />
                  <span
                    style={{
                      color: "white",
                      WebkitTextFillColor: "white",
                      fontSize: ".9rem",
                    }}
                  >
                    {t("Upgrade to Business Account")}
                  </span>
                  <BsFillPlayFill size={25} style={{ marginLeft: "auto" }} />
                </button>
              </div>
            </div>
          )}
          <div className={styles.analytics_row}>
            <SpendingBreakdown
              data={analyticsSummaryForWallet}
              reports={analyticsReports}
              currentWallet={activeWallet}
              setApiDates={setApiDates}
              isLoading={analyticsLoading}
            />
            <CurConversion />
          </div>
          <div className={styles.banner_main}>
            <EarnMoneyBanner
              showLink={true}
              code={userDetails?.username}
              rewardsEarned={totalReferralAmount}
              friendsJoined={friendsJoined}
            />
          </div>
        </div>
      )}
      {/* 
      mobile screen */}
      {window.innerWidth < 1000 && (
        <div
          className={styles.mobile_home}
          onClick={() => {
            if (profileCompletedPercentage < 100 && !showCompletionModal) {
              setShowCompletionModal(true);
            }
          }}
        >
          {/* <BusinessModal isOpen={showBusinessModal} toggle={() => setShowBusinessModal(false)} /> */}
          <TopBar />
          {/* <EarnMoneyBanner /> */}
          <div className={styles.greeting}>
            <h1>
              {getGreeting()}, {firstName}
            </h1>
            <p>{getTodayDate()}</p>
          </div>
          <div className={styles.mobile_balance}>
            {can("dashboard.balance.view") && <BalanceComponent />}
            <QuickLinksNew />
          </div>
          <RecentBeneficiaries />
          {can("dashboard.insights.view") && (
            <MoneyInOut currency={currency} data={moneyData} loading={moneyLoading} />
          )}
          {can("dashboard.recent-transactions.view") && (
            <RecentTrans currentWallet={activeWallet} />
          )}
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
          <CurConversion />
        </div>
      )}
    </>
  );
};

export default HomeNewUpdated;
