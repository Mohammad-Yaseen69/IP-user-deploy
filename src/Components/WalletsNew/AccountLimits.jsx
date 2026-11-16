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

const AccountLimits = ({ currentWallet, data, loading, error }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

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
        <h1>{t("User Account Limit")}</h1>
        <div className={styles.left_limits}>
          <h2>{t("Monthly Balance Limit")}:</h2>
          <div className={styles.total_limits}>
            <span>{t("Total Limit")}</span>
            <strong>{data?.balance_limits?.total}</strong>
          </div>
          <div className={styles.bars}>
            <div
              style={{
                flex: removeCommasAndCurrency(data?.balance_limits?.used),
                background: "#5926F0",
              }}
            ></div>
            <div
              style={{
                flex: removeCommasAndCurrency(data?.balance_limits?.remaining),
                background: "#1E0568",
              }}
            ></div>
          </div>
          <div className={styles.used}>
            <div>
              <div className={styles.square} style={{ background: "#5926F0", color: "#5926F0" }}>
                .
              </div>
              <span>{t("Used")}</span>
            </div>
            <strong>{data?.balance_limits?.used}</strong>
          </div>
          <div className={styles.used}>
            <div>
              <div className={styles.square} style={{ background: "#1E0568", color: "#1E0568" }}>
                .
              </div>
              <span>{t("Remaining")}</span>
            </div>
            <strong>{data?.balance_limits?.remaining}</strong>
          </div>
        </div>
        <div className={styles.limits_card}>
          <span>{t("Allowed Minimum Topup Amount")}</span>
          <h4>{data?.min_topup_amount}</h4>
        </div>
        <div className={styles.limits_card}>
          <span>{t("Allowed Maximum Topup Amount")}</span>
          <h4>{data?.max_topup_amount}</h4>
        </div>
        <div className={styles.limits_card}>
          <span>{t("Allowed Maximum Amount Per Transaction")}</span>
          <h4>{data?.transaction_amount_limit}</h4>
        </div>
      </div>
      <div className={styles.right}>
        {window.innerWidth > 1000 ? (
          data?.others?.map((item) => (
            <RightItem setCurrent={setCurrent} item={item} key={item.title} />
          ))
        ) : (
          <RightItem
            setCurrent={setCurrent}
            item={data?.others?.[current]}
            key={data?.others?.[current]?.title}
          />
        )}
      </div>
    </div>
  );
};

export default AccountLimits;

const RightItem = ({ item, setCurrent }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.right_item}>
      {window.innerWidth > 1000 ? (
        <h2>{t(service_name_formatter(item?.title))}:</h2>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h2>{t(item?.title)}:</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div
              className={`${styles.chev} ${styles.chev_left}`}
              onClick={() => setCurrent((prev) => (prev === 0 ? 2 : prev - 1))}
            >
              <ChevronLeft size={16} color="#5926f0" />
            </div>
            <div
              className={`${styles.chev} ${styles.chev_right}`}
              onClick={() => setCurrent((prev) => (prev === 2 ? 0 : prev + 1))}
            >
              <ChevronRight size={16} color="#5926f0" />
            </div>
          </div>
        </div>
      )}
      <div className={styles.r_limits}>
        {item?.limits
          ? Object.keys(item?.limits)?.map((it, ind) => (
              <LimitItem
                item={item?.limits?.[it]}
                key={ind}
                title={`${service_name_formatter(it)} limit`}
                parent={item}
              />
            ))
          : null}
      </div>
    </div>
  );
};

const LimitItem = ({ item, title, parent }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.ri_limits}>
      <div className={styles.ril_top}>
        <span>{t(service_name_formatter(title))}</span>
        <strong>{item?.total}</strong>
      </div>
      <div className={styles.ri_bars}>
        <div
          style={{
            flex: removeCommasAndCurrency(item?.used),
            background: parent?.color_dark,
          }}
        ></div>
        <div
          style={{
            flex: removeCommasAndCurrency(item?.remaining),
            background: parent?.color_light,
          }}
        ></div>
      </div>
      <div className={styles.ril_used}>
        <div>
          <div
            className={styles.square}
            style={{
              background: parent?.color_dark,
              color: parent?.color_dark,
            }}
          >
            .
          </div>
          <span>{t("Used")}</span>
        </div>
        <strong>{item?.used}</strong>
      </div>
      <div className={styles.ril_remaining}>
        <div>
          <div
            className={styles.square}
            style={{
              background: parent?.color_light,
              color: parent?.color_light,
            }}
          >
            .
          </div>
          <span>{t("Remaining")}</span>
        </div>
        <strong>{item?.remaining}</strong>
      </div>
    </div>
  );
};
