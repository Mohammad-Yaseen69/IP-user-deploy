import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Panel, Segmented } from "../../Common/WalletUI/Primitives";
import u from "../../Common/WalletUI/ui.module.scss";
import { removeCommasAndCurrency } from "./AccountLimits";
import r from "./styles/redesign.module.scss";

const PERIODS = [
  { value: "daily", label: "Daily", resets: "resets at midnight" },
  { value: "monthly", label: "Monthly", resets: "resets every month" },
  { value: "yearly", label: "Yearly", resets: "resets every year" },
];

// Row titles for the three limit groups getLimits() returns, in the same order.
const LABELS = ["Incoming", "Outgoing", "Number of transactions"];

// "10,000.00 EUR " -> ["10,000.00", "EUR"]; plain counts come back as [count, undefined].
const parts = (value) =>
  String(value ?? "")
    .trim()
    .split(" ");

const WalletLimits = ({ currentWallet, data, loading, error }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("daily");
  const code = currentWallet?.currency?.code ?? "";
  const active = PERIODS.find((item) => item.value === period);

  const boxes = [
    data?.min_topup_amount && [t("Minimum top-up"), data.min_topup_amount],
    data?.max_topup_amount && [t("Maximum top-up"), data.max_topup_amount],
    data?.transaction_amount_limit && [t("Maximum per payment"), data.transaction_amount_limit],
  ].filter(Boolean);

  return (
    <Panel
      title={t("Limits")}
      sub={`${code}, ${t(active.resets)}`}
      right={
        <Segmented
          label={t("Limits")}
          options={PERIODS.map(({ value, label }) => ({ value, label: t(label) }))}
          value={period}
          onChange={setPeriod}
        />
      }
    >
      {loading ? (
        <div className={u.state}>{t("Loading...")}</div>
      ) : error ? (
        <div className={u.state}>{error}</div>
      ) : (
        <div className={r.limitsBody}>
          {data?.others?.map((group, index) => {
            const limit = group?.limits?.[period] ?? {};
            const percent =
              (removeCommasAndCurrency(limit.used) / removeCommasAndCurrency(limit.total)) * 100;
            const used = percent > 0 ? Math.min(100, percent) : 0;
            return (
              <div key={group.title} className={r.limit}>
                <p className={r.limitTop}>
                  {t(LABELS[index] ?? group.title)}
                  <span>
                    <b>{parts(limit.used)[0]}</b> {t("of")} {String(limit.total ?? "").trim()}
                  </span>
                </p>
                <div className={r.bar}>
                  <i style={{ width: `${used}%` }} />
                </div>
                <p className={r.limitMeta}>
                  <span>
                    {Math.round(used)}% {t("used")}
                  </span>
                  <span>
                    {String(limit.remaining ?? "").trim()} {t("left")}
                  </span>
                </p>
              </div>
            );
          })}
          {boxes.length > 0 && (
            <div className={r.limitFoot}>
              {boxes.map(([label, value]) => (
                <p key={label} className={r.limitBox}>
                  {label}
                  <span>
                    <b>{parts(value)[0]}</b>
                    <small>{parts(value)[1]}</small>
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};

export default WalletLimits;
