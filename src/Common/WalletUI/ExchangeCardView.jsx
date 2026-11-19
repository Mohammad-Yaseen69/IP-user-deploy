import { ArrowLeftRight, ArrowUpDown, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../Helper/AmountFormat";
import { Panel } from "./Primitives";
import s from "./ui.module.scss";
import { currencySymbol } from "./utils";

const CurrencyPill = ({ label, value, wallets, onChange }) => {
  // Only real signs fit the 28px badge; letter symbols such as "CHF" fall back to the first letter.
  const symbol = currencySymbol(value);
  return (
    <label className={s.exCurrency}>
      <i>{symbol && symbol.length <= 2 ? symbol : value?.[0]}</i>
      {value}
      <ChevronDown size={16} />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {wallets.map((item) => (
          <option key={item?._id} value={item?.currency?.code}>
            {item?.currency?.code}
          </option>
        ))}
      </select>
    </label>
  );
};

const Balance = ({ wallet }) => {
  const { t } = useTranslation();
  return (
    <span>
      {t("Balance")}{" "}
      <b>
        {formatCurrency(wallet?.balance?.available ?? 0, true)} {wallet?.currency?.code}
      </b>
    </span>
  );
};

// Presentation only: every value and handler comes from CurConversion, which owns the conversion flow.
const ExchangeCardView = ({
  wallets,
  from,
  to,
  setFrom,
  setTo,
  amountInput,
  received,
  senderWallet,
  receiverWallet,
  rate,
  fee,
  error,
  loading,
  insufficient,
  disabled,
  onSwap,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <Panel title={t("Exchange")} sub={t("Between currencies in this wallet")}>
      {wallets.length > 1 ? (
        <form
          className={s.exBody}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className={s.exBoxes}>
            <div className={s.exBox}>
              <div className={s.exBoxTop}>
                <span>{t("You send")}</span>
                <Balance wallet={senderWallet} />
              </div>
              <div className={s.exBoxMain}>
                <input className={s.exAmount} aria-label={t("You send")} {...amountInput} />
                <CurrencyPill
                  label={t("Currency to send")}
                  value={from}
                  wallets={wallets.filter((item) => item?.currency?.code !== to)}
                  onChange={setFrom}
                />
              </div>
            </div>
            <div className={s.exBox}>
              <div className={s.exBoxTop}>
                <span>{t("You get")}</span>
                <Balance wallet={receiverWallet} />
              </div>
              <div className={s.exBoxMain}>
                <output className={`${s.exAmount} ${s.exAmountOut}`}>{received || "0.00"}</output>
                <CurrencyPill
                  label={t("Currency to receive")}
                  value={to}
                  wallets={wallets.filter((item) => item?.currency?.code !== from)}
                  onChange={setTo}
                />
              </div>
            </div>
            <button
              type="button"
              className={s.exSwap}
              aria-label={t("Swap currencies")}
              onClick={onSwap}
            >
              <ArrowUpDown size={20} />
            </button>
          </div>
          <p className={s.exLine}>
            {t("Rate")}
            <b>{rate ? `1 ${from} = ${rate} ${to}` : "—"}</b>
          </p>
          <p className={s.exLine}>
            {t("Fee")}
            <b>{fee || "—"}</b>
          </p>
          {error && <p className={s.exError}>{error}</p>}
          <button type="submit" className={s.exCta} disabled={disabled}>
            {insufficient ? (
              t(`Insufficient Balance in PKR`).replace("PKR", from)
            ) : (
              <>
                <ArrowLeftRight size={16} />
                {loading ? t("Fetching Rates...") : t("Exchange {{from}} to {{to}}", { from, to })}
              </>
            )}
          </button>
        </form>
      ) : (
        <div className={s.state}>
          {t("You must have at least two currencies wallet for this feature!")}
        </div>
      )}
    </Panel>
  );
};

export default ExchangeCardView;
