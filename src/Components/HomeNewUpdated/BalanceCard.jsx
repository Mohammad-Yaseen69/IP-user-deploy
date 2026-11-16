import React, { useContext, useState } from "react";
import { Card, CardBody } from "reactstrap";
import styles from "./styles/balance.module.css";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";

const CURRENCY_LABEL = "USD";

const EyeIcon = ({ off }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="1" y1="1" x2="23" y2="23" />}
  </svg>
);

const WalletIcon = ({ size = 16 }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3.5H13C13.5523 3.5 14 3.94772 14 4.5V11.5C14 12.0523 13.5523 12.5 13 12.5H3C2.44772 12.5 2 12.0523 2 11.5V4.5C2 3.94772 2.44772 3.5 3 3.5Z"
      stroke-width="1.33333"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="#9AA3B2"
    />
    <path
      d="M2 7.5H6C6 8.03043 6.21071 8.53914 6.58579 8.91421C6.96086 9.28929 7.46957 9.5 8 9.5C8.53043 9.5 9.03914 9.28929 9.41421 8.91421C9.78929 8.53914 10 8.03043 10 7.5H14"
      stroke-width="1.33333"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="#9AA3B2"
    />
    <path
      d="M2 5.5H14"
      stroke-width="1.33333"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke="#9AA3B2"
    />
  </svg>
);
const BalanceComponent = () => {
  const { t } = useTranslation();
  const {
    available: totalBalance = 0,
    balanceLoading: isLoading,
    userWallets = [],
  } = useContext(UserContext);

  const walletCount = userWallets?.length ?? 0;

  const [hidden, setHidden] = useState(false);

  const formatted =
    Number(totalBalance)?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00";

  const [wholePart, decimalPart = "00"] = formatted.split(".");

  return (
    <Card className={styles.wrapper} style={{ marginBottom: 0, minWidth: "220px", flex: 2 }}>
      <CardBody className={`b_card ${styles.body}`}>
        <div className={styles.header}>
          <span className={styles.label}>{t("Available balance")}</span>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setHidden((prev) => !prev)}
          >
            <EyeIcon off={hidden} />
            <span>{hidden ? t("Show balances") : t("Hide balances")}</span>
          </button>
        </div>

        <div className={styles.panel}>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" color="primary" role="status">
                <span className="sr-only">{t("Loading...")}</span>
              </div>
            </div>
          ) : (
            <div className={styles.amountRow}>
              <span className={styles.currency}>{CURRENCY_LABEL}</span>
              <h4 className={styles.head}>
                {hidden ? (
                  <span className={styles.mask}>*******</span>
                ) : (
                  <>
                    {wholePart}
                    <span className={styles.decimals}>.{decimalPart}</span>
                  </>
                )}
              </h4>
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setHidden((prev) => !prev)}
                aria-label={hidden ? t("Show balances") : t("Hide balances")}
              >
                <EyeIcon off={hidden} />
              </button>
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <span className={styles.footerItem}>
                <WalletIcon />
                {walletCount} {walletCount === 1 ? t("wallet") : t("wallets")}
              </span>
            </div>
            <span className={styles.footerItem}>{t("Estimated total value in USD")}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BalanceComponent;
