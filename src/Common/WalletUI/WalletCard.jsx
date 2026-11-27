import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { removeCommasAndCurrency } from "../../Components/WalletsNew/AccountLimits";
import { formatCurrency } from "../../Helper/AmountFormat";
import glow from "./files/card-glow.svg";
import { currencySymbol, splitAmount } from "./utils";
import s from "./ui.module.scss";

const WalletCard = ({ wallet, limits, small = false, hidden = false, onSetDefault }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const code = wallet?.currency?.code ?? "";
  // Letter symbols ("CHF", "Rs") need a space before the amount; signs ("$", "€") do not.
  const rawSymbol = currencySymbol(code);
  const symbol = /[A-Za-z.]$/.test(rawSymbol) ? `${rawSymbol} ` : rawSymbol;
  const available = wallet?.balance?.available ?? 0;
  const reserved = wallet?.balance?.reserved ?? 0;
  const [whole, decimals] = splitAmount(formatCurrency(available + reserved, true) || "0.00");

  const balanceLimits = limits?.balance_limits;
  const used =
    (removeCommasAndCurrency(balanceLimits?.used) / removeCommasAndCurrency(balanceLimits?.total)) *
    100;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${wallet?.wallet_id?.toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${s.wcard} ${small ? s.wcardSm : ""}`}>
      <div className={s.wcardGlow} aria-hidden>
        <img src={glow} alt="" />
      </div>
      <div className={s.wcardTop}>
        <h4>
          {code} {t("Wallet")}
        </h4>
        {wallet?.default ? (
          <span className={s.wcardChip}>{t("Default")}</span>
        ) : (
          onSetDefault && (
            <button type="button" className={s.wcardChip} onClick={onSetDefault}>
              {t("Set as default")}
            </button>
          )
        )}
      </div>
      <div>
        <p className={s.wcardBalance}>
          {hidden ? (
            <b>*******</b>
          ) : (
            <>
              <b>
                {symbol}
                {whole}
              </b>
              <span>{decimals}</span>
            </>
          )}
        </p>
        {reserved > 0 && !hidden && (
          <p className={s.wcardMeta}>
            <span>
              {t("Available balance")}: <b>{formatCurrency(available, true)}</b>
            </span>
            <span>
              {t("Blocked balance")}: <b>{formatCurrency(reserved, true)}</b>
            </span>
          </p>
        )}
      </div>
      <div>
        <p className={s.wcardLabel}>{t("Wallet ID")}</p>
        <div className={s.wcardId}>
          {`${wallet?.wallet_type?.toUpperCase()}-${wallet?.wallet_id?.toUpperCase()}`}
          <button
            type="button"
            className="tap-target"
            aria-label={t("Copy")}
            onClick={copyToClipboard}
          >
            {copied ? <Check size={small ? 13 : 20} /> : <Copy size={small ? 13 : 20} />}
          </button>
        </div>
      </div>
      <div>
        <p className={s.wcardLimit}>
          <span className={small && s.small}>{t("Monthly limit")}</span>
          {balanceLimits && !hidden && (
            <b className={small && s.small}>
              {balanceLimits.used} / {balanceLimits.total}
            </b>
          )}
        </p>
        <div className={s.wcardBar}>
          <i style={{ width: `${Math.min(100, used > 0 ? used : 0)}%` }} />
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
