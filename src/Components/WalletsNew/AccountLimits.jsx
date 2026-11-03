import { useTranslation } from "react-i18next";
import styles from "./styles/AccountLimits.module.css";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { ChevronLeft, ChevronRight } from "react-feather";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import InstaPayLoader from "../Loader";
import { UserContext } from "../../Context/UserContext";

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
  { key: "daily", label: "Daily", title: "Daily Limit" },
  { key: "monthly", label: "Monthly", title: "Monthly Limit" },
  { key: "yearly", label: "Yearly", title: "Yearly Limit" },
];

const AccountLimits = ({ currentWallet, data, loading, error }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState(null);

  console.log(data);
  return loading ? (
    <div
      style={{
        height: "300px",
        width: "300px",
        margin: "0 auto",
      }}
    >
      <InstaPayLoader />
    </div>
  ) : error ? (
    <div
      style={{
        height: "300px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1rem",
        fontWeight: 600,
      }}
    >
      {error}
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.left_limits}>
          <div className={styles.lim_top}>
            <div className={styles.lim_title}>
              <h1>{t("Limit")}</h1>
              <span>{t("EUR, resets at midnight")}</span>
            </div>
            <div className={styles.lim_toggle}>
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`${styles.lim_tab} ${period === p.key ? styles.lim_tab_active : ""}`}
                  onClick={() => setPeriod(period === p.key ? null : p.key)}
                >
                  {t(p.label)}
                </button>
              ))}
            </div>
          </div>
          <div></div>
          <div className={styles.limit_section}>
            {PERIODS.filter((p) => !period || p.key === period).map((p) => (
              <LimitRow key={p.key} title={t(p.title)} limit={getLimit(data, p.key)} />
            ))}

            <div className={styles.lim_mini_grid}>
              {[
                { label: t("Minimum top-up"), value: data?.min_topup_amount },
                { label: t("Maximum top-up"), value: data?.max_topup_amount },
                { label: t("Maximum per payment"), value: data?.transaction_amount_limit },
              ].map((item) => {
                const { amount, currency } = splitAmount(item.value);
                return (
                  <div className={styles.lim_mini} key={item.label}>
                    <span>{item.label}</span>
                    <div className={styles.lim_mini_value}>
                      <strong>{amount}</strong>
                      {currency && <small>{currency}</small>}
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
        <strong>{limit?.total}</strong>
      </div>
      <div className={styles.lim_progress}>
        <div className={styles.lim_progress_fill} style={{ width: `${pct}%` }}></div>
      </div>
      <div className={styles.lim_progress_text}>
        <span>
          {Math.round(pct)}% {t("used")}
        </span>
        <span>
          {limit?.remaining} {t("left")}
        </span>
      </div>
    </div>
  );
};
