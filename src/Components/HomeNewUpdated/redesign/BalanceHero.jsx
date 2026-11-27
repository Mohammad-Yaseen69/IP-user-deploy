import {
  ArrowDownToLine,
  ArrowUpRight,
  CircleCheck,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  QrCode,
  Quote,
  WalletCards,
} from "lucide-react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Skeleton from "../../../Common/WalletUI/Skeleton";
import { splitAmount } from "../../../Common/WalletUI/utils";
import { UserContext } from "../../../Context/UserContext";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import d from "./dashboard.module.scss";

const usd = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Same destinations as the old quick links card.
const LINKS = [
  { Icon: Plus, text: "Add Funds", to: "/add-funds" },
  { Icon: ArrowUpRight, text: "Send Money", to: "/payments?payment_action=send_money" },
  { Icon: ArrowDownToLine, text: "Request Money", to: "/payments?payment_action=req_money" },
  { Icon: Quote, text: "Send A Quote", to: "/payments?payment_action=send_quote" },
  { Icon: QrCode, text: "My QR Code Sticker", to: "/chips-in" },
  { Icon: MapPin, text: "My Payment Address", to: "/payment-address" },
];

const MASK = "*******";

const BalanceHero = ({ hidden, onToggleHidden, activity, walletCount, activityLoading }) => {
  const { t } = useTranslation();
  const can = usePermission();
  const {
    available = 0,
    blocked = 0,
    balanceLoading,
    walletsLoading,
    totalReferralAmount,
    getReferralCommission,
    userDetails,
    referralLoading,
  } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getReferralCommission();
    }
  }, [userDetails]);

  const showBalance = can("dashboard.balance.view");
  const [whole, decimals] = splitAmount(usd(available - blocked));
  const HideIcon = hidden ? EyeOff : Eye;
  const amount = (value) =>
    hidden ? (
      MASK
    ) : balanceLoading ? (
      <Skeleton width={72} height={20} sx={{ display: "inline-block", verticalAlign: "middle" }} />
    ) : (
      usd(value)
    );

  return (
    <div className={d.heroMain}>
      {showBalance && (
        <>
          <div className={d.heroTop}>
            {t("Available balance")}
            <button type="button" className={d.ghost} onClick={onToggleHidden}>
              <HideIcon size={16} />
              {hidden ? t("Show balances") : t("Hide balances")}
            </button>
          </div>
          <div className={d.balance}>
            <div className={d.balanceMain}>
              <p className={d.balanceValue}>
                <small>USD</small>
                {hidden ? (
                  <b className={d.masked}>{MASK}</b>
                ) : balanceLoading ? (
                  <Skeleton
                    width={180}
                    height={56}
                    sx={{ alignSelf: "center", borderRadius: "10px" }}
                  />
                ) : (
                  <>
                    <b>{whole}</b>
                    <span>{decimals}</span>
                  </>
                )}
              </p>
              <button
                type="button"
                className={d.eye}
                aria-label={hidden ? t("Show balances") : t("Hide balances")}
                onClick={onToggleHidden}
              >
                <HideIcon size={18} />
              </button>
            </div>
            <p className={d.balanceMeta}>
              {activityLoading && !activity ? (
                <Skeleton
                  width={250}
                  height={14}
                  sx={{ display: "inline-block", verticalAlign: "middle" }}
                />
              ) : (
                activity && (
                  <span>
                    <CircleCheck size={16} />
                    {t("{{currency}} activity: {{amount}} this month", {
                      currency: activity.code,
                      amount: hidden
                        ? MASK
                        : `${activity.net >= 0 ? "+" : "−"}${usd(Math.abs(activity.net))}`,
                    })}
                  </span>
                )
              )}
              <span>
                <WalletCards size={16} />
                {walletsLoading && !walletCount ? (
                  <Skeleton
                    width={56}
                    height={14}
                    sx={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                ) : walletCount === 1 ? (
                  t("1 wallet")
                ) : (
                  t("{{n}} wallets", { n: walletCount })
                )}
              </span>
              <small>{t("Estimated total value in USD")}</small>
            </p>
          </div>
        </>
      )}

      {/* <div className={d.stats}>
        {showBalance && (
          <>
            <p className={d.stat}>
              {t("Total balance")}
              <span>
                <b>{amount(available)}</b>
                <small>USD</small>
              </span>
            </p>
            <p className={d.stat}>
              {t("Blocked balance")}
              <span>
                <b>{amount(blocked)}</b>
                <small>USD</small>
              </span>
            </p>
          </>
        )}
        <Link to="/referrals" className={d.stat}>
          {t("Referral Rewards")}
          <span>
            <b>
              {hidden ? (
                MASK
              ) : referralLoading ? (
                <Skeleton
                  width={72}
                  height={20}
                  sx={{ display: "inline-block", verticalAlign: "middle" }}
                />
              ) : (
                usd(totalReferralAmount)
              )}
            </b>
            <small>USD</small>
          </span>
        </Link>
      </div> */}

      <div className={d.actions}>
        {LINKS.map(({ Icon, text, to }, index) => (
          <Link
            key={to}
            to={to}
            className={`${d.action} ${index === 0 ? d.actionPrimary : ""}`}
            title={t(text)}
          >
            <i>
              <Icon size={18} strokeWidth={1.75} />
            </i>
            <span>{t(text)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BalanceHero;
