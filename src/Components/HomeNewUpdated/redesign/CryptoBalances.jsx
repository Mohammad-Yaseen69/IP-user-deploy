import { ChevronRight, Coins } from "lucide-react";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Skeleton from "../../../Common/WalletUI/Skeleton";
import u from "../../../Common/WalletUI/ui.module.scss";
import { UserContext } from "../../../Context/UserContext";
import { formatCurrency } from "../../../Helper/AmountFormat";
import d from "./dashboard.module.scss";

// Shows the user's crypto wallets when they have any, otherwise the live prices the dashboard always showed.
const CryptoBalances = ({ tickers = [], hidden, pricesLoading = false }) => {
  const { t } = useTranslation();
  const { userWallets, walletsLoading } = useContext(UserContext);
  const wallets = useMemo(
    () => (userWallets ?? []).filter((w) => w?.wallet_type === "crypto" || w?.provider === "bvnk"),
    [userWallets],
  );
  const hasWallets = wallets.length > 0;
  const showSkeleton = walletsLoading && !hasWallets;
  const columns = Math.min(4, hasWallets ? wallets.length : tickers.length) || 1;

  return (
    <section className={u.panel}>
      <div className={`${u.panelHead} ${d.cryptoHead}`}>
        <div>
          {showSkeleton ? (
            <>
              <Skeleton width={140} height={20} />
              <Skeleton width={200} height={14} sx={{ mt: 1 }} />
            </>
          ) : (
            <>
              <h3 className={u.title}>{hasWallets ? t("Crypto balances") : t("Crypto prices")}</h3>
              <p className={u.sub}>
                {hasWallets
                  ? t("Your crypto and stablecoin wallets")
                  : t("Live market prices in USD")}
              </p>
            </>
          )}
        </div>
        <Link to="/crypto-wallets" className={u.link}>
          {t("Open Crypto")}
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className={d.cryptoGrid} style={{ "--cols": columns }}>
        {showSkeleton
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className={d.crypto}>
                <p className={d.cryptoTop}>
                  <Skeleton width={24} height={24} sx={{ borderRadius: "6px", flex: "none" }} />
                  <Skeleton width={80} height={14} />
                </p>
                <Skeleton width="60%" height={20} />
              </div>
            ))
          : hasWallets
            ? wallets.map((wallet) => (
                <div key={wallet?._id} className={d.crypto}>
                  <p className={d.cryptoTop}>
                    <span className={d.cryptoIcon}>
                      <Coins size={14} />
                    </span>
                    {wallet?.currency?.code}
                    <small>{wallet?.currency?.name}</small>
                  </p>
                  <p className={d.cryptoValue}>
                    {hidden ? "••••••" : formatCurrency(wallet?.balance?.available ?? 0, true)}{" "}
                    {wallet?.currency?.code}
                  </p>
                </div>
              ))
            : tickers.map((item) => (
                <div key={item.name} className={d.crypto}>
                  <p className={d.cryptoTop}>
                    <img src={item.img} alt="" loading="lazy" />
                    {item.value.toUpperCase()}
                    <small>{t(item.name)}</small>
                  </p>
                  {pricesLoading ? (
                    <Skeleton width="60%" height={20} />
                  ) : (
                    <p className={d.cryptoValue}>
                      $
                      {Number(item.price || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      <small>{t("Market price")}</small>
                    </p>
                  )}
                </div>
              ))}
      </div>
    </section>
  );
};

export default CryptoBalances;
