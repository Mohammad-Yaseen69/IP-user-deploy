import { useTranslation } from "react-i18next";
import styles from "./styles/AccountLimits.module.css";
import { useState } from "react";
import InstaPayLoader from "../Loader";

export function removeCommasAndCurrency(num) {
  return String(String(num)?.replace(/,/g, ""))?.replace(/[A-Za-z]+/g, "");
}

const splitAmount = (val) => {
  const s = String(val ?? "").trim();
  const idx = s.lastIndexOf(" ");
  if (idx === -1) return { amount: s, currency: "" };
  return { amount: s.slice(0, idx), currency: s.slice(idx + 1) };
};

const parseNum = (v) => Number(removeCommasAndCurrency(v)) || 0;
const calcPercent = (used, total) => {
  const t_ = parseNum(total);
  return t_ > 0 ? Math.min((parseNum(used) / t_) * 100, 100) : 0;
};

const getLimit = (data, key) => data?.others?.find((o) => o?.limits?.[key])?.limits?.[key] || {};

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const ROWS = [
  { title: "Incoming", source: "Incoming Limit" },
  { title: "Outgoing", source: "Sending Limit" },
  { title: "Transactions", source: "Allowed Number Of Transactions" },
];

const getRow = (data, source, periodKey) =>
  data?.others?.find((o) => o?.title === source)?.limits?.[periodKey] || {};

const AccountLimits = ({ currentWallet, data, loading, error }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("daily");
  const currency = currentWallet?.currency?.code ?? "";

  if (loading) {
    return (
      <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
        <InstaPayLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.left_limits}>
          <div className={styles.lim_top}>
            <div className={styles.lim_title}>
              <h1>{t("Limits")}</h1>
              <span>{`${currency}, ${t("resets at midnight")}`}</span>
            </div>
            <div className={styles.lim_toggle}>
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-selected={period === p.key}
                  className={`${styles.lim_tab} ${period === p.key ? styles.lim_tab_active : ""}`}
                  onClick={() => setPeriod(p.key)}
                >
                  {t(p.label)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.limit_section}>
            {ROWS.map((row) => (
              <LimitRow
                key={row.title}
                title={t(row.title)}
                limit={getRow(data, row.source, period)}
              />
            ))}

            <div className={styles.lim_mini_grid}>
              {[
                { label: t("Minimum top-up"), value: data?.min_topup_amount },
                { label: t("Maximum top-up"), value: data?.max_topup_amount },
                { label: t("Maximum per payment"), value: data?.transaction_amount_limit },
              ].map((item) => {
                const { amount, currency: cur } = splitAmount(item.value);
                return (
                  <div className={styles.lim_mini} key={item.label}>
                    <span>{item.label}</span>
                    <div className={styles.lim_mini_value}>
                      <strong>{amount}</strong>
                      {cur && <small>{cur}</small>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLimits;

const LimitRow = ({ title, limit }) => {
  const { t } = useTranslation();
  const pct = calcPercent(limit?.used, limit?.total);

  return (
    <div className={styles.lim_used_remaining}>
      <div className={styles.headings}>
        <h2>{title}</h2>
        <span className={styles.usedOfTotal}>
          <strong>{limit?.used ?? 0}</strong> {t("of")} {limit?.total ?? 0}
        </span>
      </div>
      <div className={styles.lim_progress}>
        <div className={styles.lim_progress_fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.lim_progress_text}>
        <span>
          {Math.round(pct)}% {t("used")}
        </span>
        <span>
          {limit?.remaining ?? 0} {t("left")}
        </span>
      </div>
    </div>
  );
};
