import { useContext, useEffect, useMemo, useState, lazy } from "react";
import styles from "./styles/index.module.scss";
import cardsStyle from "./styles/CardsContainer.module.css";
import { useTranslation } from "react-i18next";
import { BsFillPlayFill } from "react-icons/bs";
import { MessageCircle } from "lucide-react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { service_name_formatter } from "../../utils/Functions/serviceNameFormatter";
import RenderWhenVisible from "./RenderWhenVisible";
import {
  loadBalanceCard,
  loadBusinessModal,
  loadCryptoCard,
  loadCurConversion,
  loadEarnMoneyBanner,
  loadOtherBalance,
  loadQuickLinksMobile,
  loadQuickLinksNew,
  loadRecentBeneficiaries,
  loadRecentTrans,
  loadReferalRewards,
  loadRightContainer,
  loadSearch,
  loadTopBar,
  loadTransDetails,
  loadWalletsMobile,
} from "./dashboardChunks";

const EarnMoneyBanner = lazy(() => import("./EarnMoneyBanner"));
const TransDetails = lazy(() => import("./TransDetails"));
const Stats = lazy(() => import("./Stats"));
const SearchComponent = lazy(() => import("./Search"));
const CryptoCard = lazy(() => import("./CryptoCard"));
const RecentBeneficiaries = lazy(() => import("./RecentBeneficiaries"));
const WalletsMobile = lazy(() => import("./WalletsMobile"));
const CurConversion = lazy(() => import("./CurConversion"));
const QuickLinksMobile = lazy(() => import("./QuickLinksMobile"));
const TopBar = lazy(() => import("../../Layout/TopBar"));
const BusinessModal = lazy(() => import("../BusinessModal"));

import btc from "../PaymentsNewer/files/btc.png";
import eth from "../PaymentsNewer/files/eth.webp";
import usdt from "../PaymentsNewer/files/usdt.webp";
import crown from "./files/crown.svg";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import TopRight from "../topRight";
import MoneyInOut from "../../Common/WalletUI/MoneyInOut";
import { useMoneyInOut } from "../../Common/WalletUI/useMoneyInOut";
import u from "../../Common/WalletUI/ui.module.scss";
import BalanceHero from "./redesign/BalanceHero";
import WalletPanel from "./redesign/WalletPanel";
import QuickTransfer from "./redesign/QuickTransfer";
import RecentActivity from "./redesign/RecentActivity";
import CryptoBalances from "./redesign/CryptoBalances";
import SpendingCard from "./redesign/SpendingCard";
import { PartnerBanner, UpgradeCard } from "./redesign/Promos";
import d from "./redesign/dashboard.module.scss";

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
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`);
        const data = await res.json();

        const btcPrice = data.find((i) => i.symbol === "BTCUSDT")?.price || 0;
        const ethPrice = data.find((i) => i.symbol === "ETHUSDT")?.price || 0;

        setCurrenciesData((prev) =>
          prev.map((currency) => {
            let price = currency.price;
            if (currency.value === "btc") price = Number(btcPrice);
            else if (currency.value === "eth") price = Number(ethPrice);
            else if (currency.value === "usdt") price = 1.0;

            return {
              ...currency,
              price: price,
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

  const { userDetails, profileCompletedPercentage, userWallets, isAgentLogin, agentDetails } =
    useContext(UserContext);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const { t, i18n } = useTranslation();

  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const {
    data: moneyData,
    transactions: walletTransactions,
    loading: moneyLoading,
  } = useMoneyInOut(window.innerWidth > 1000 ? selectedWallet : null); // the mobile layout has its own charts
  const walletCurrency = selectedWallet?.currency?.code ?? "";
  const thisMonth = moneyData[moneyData.length - 1];

  const walletCount = useMemo(
    () => (userWallets ?? []).filter((w) => w?.wallet_type !== "crypto").length,
    [userWallets],
  );

  const firstName =
    userDetails?.account_type?.toLowerCase() === "individual"
      ? userDetails?.user?.first_name
      : isAgentLogin
        ? agentDetails?.first_name
        : userDetails?.company?.company_name;

  return (
    <>
      {window.innerWidth > 1000 && (
        <div
          className={u.page}
          onClick={() => {
            if (profileCompletedPercentage < 100 && !showCompletionModal) {
              setShowCompletionModal(true);
            }
          }}
        >
          <header className={u.header}>
            <div className={u.headerText}>
              <h1>{t("Dashboard")}</h1>
              <p>{t("Manage and monitor your InstaPay Wallet")}</p>
            </div>
            <div className={u.headerRight}>
              <TopRight position="static" />
            </div>
          </header>

          <div className={u.content}>
            <div className={d.greeting}>
              <div>
                <h2>
                  {t(getGreeting())}
                  {firstName ? `, ${firstName}` : ""}
                </h2>
                <p>
                  {new Date().toLocaleDateString(i18n.language, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <div className={d.greetingTools}>
                <SearchComponent showOthers={false} />
                <a
                  href="https://api.whatsapp.com/send/?phone=41783192428"
                  target="_blank"
                  rel="noreferrer"
                  className={d.chat}
                >
                  <MessageCircle size={16} />
                  {t("Chat with us")}
                </a>
              </div>
            </div>

            <section className={d.hero}>
              <BalanceHero
                hidden={hideBalances}
                onToggleHidden={() => setHideBalances((prev) => !prev)}
                walletCount={walletCount}
                activity={
                  can("dashboard.insights.view") && selectedWallet && !moneyLoading
                    ? { code: walletCurrency, net: thisMonth.in - thisMonth.out }
                    : null
                }
              />
              {can("wallet.list.view") && (
                <WalletPanel setCurrentWallet={setSelectedWallet} hidden={hideBalances} />
              )}
            </section>

            <QuickTransfer />

            <div className={`${u.row} ${u.rowDash}`}>
              {can("dashboard.insights.view") && (
                <MoneyInOut currency={walletCurrency} data={moneyData} loading={moneyLoading} />
              )}
              {can("dashboard.recent-transactions.view") && (
                <RecentActivity currentWallet={selectedWallet} />
              )}
            </div>

            <CryptoBalances tickers={currenciesData} hidden={hideBalances} />

            <div className={`${u.row} ${u.rowDash}`}>
              {can("dashboard.insights.view") && (
                <SpendingCard
                  transactions={walletTransactions}
                  currency={walletCurrency}
                  loading={moneyLoading}
                />
              )}
              {can("wallet.payment.conversion") && <CurConversion variant="card" />}
            </div>

            <div className={`${u.row} ${u.rowDash}`}>
              <PartnerBanner hidden={hideBalances} />
              {userDetails?.account_type === "individual" && (
                <UpgradeCard onUpgrade={() => setShowBusinessModal(true)} />
              )}
            </div>
          </div>
          <BusinessModal isOpen={showBusinessModal} toggle={() => setShowBusinessModal(false)} />
        </div>
      )}
      {window.innerWidth < 1000 && (
        <div
          className={styles.mobile_home}
          onClick={() => {
            if (profileCompletedPercentage < 100 && !showCompletionModal) {
              setShowCompletionModal(true);
            }
          }}
        >
          <BusinessModal isOpen={showBusinessModal} toggle={() => setShowBusinessModal(false)} />
          <TopBar />
          <EarnMoneyBanner />
          <RecentBeneficiaries />
          {can("wallet.list.view") && <WalletsMobile setCurrentWallet={setSelectedWallet} />}
          {/* crypto */}
          <div className={styles.crypto}>
            <h5>
              {t("crypto wallet balance")
                .split(" ")
                ?.map((item) => service_name_formatter(item))
                ?.join(" ")}
            </h5>
            <div className={styles.scroll_view}>
              {currenciesData.map((item) => (
                <CryptoCard key={item.name} item={item} />
              ))}
            </div>
            {userDetails?.account_type === "individual" && (
              <button
                onClick={() => setShowBusinessModal(true)}
                className={cardsStyle.button}
                style={{
                  background: "linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
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
            )}
          </div>
          <QuickLinksMobile />
          {can("dashboard.insights.view") && (
            <RenderWhenVisible minHeight={300}>
              <Stats currentWallet={selectedWallet} />
            </RenderWhenVisible>
          )}
          {can("dashboard.insights.view") && (
            <RenderWhenVisible minHeight={300}>
              <TransDetails selectedWallet={selectedWallet} />
            </RenderWhenVisible>
          )}
          <CurConversion />
        </div>
      )}
    </>
  );
};

export default HomeNewUpdated;
