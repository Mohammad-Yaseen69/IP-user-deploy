import { useTranslation } from "react-i18next";
import { FUNDING_METHODS, MOCK_WALLETS } from "../../../stateMachines/addFundsFlow";
import { getAmountNumber } from "../utils/amount";
import styles from "./addFundsModal.module.scss";

const ReviewStep = ({ amount, fundingMethod, selectedWallet }) => {
  const { t } = useTranslation();

  const methodInfo = FUNDING_METHODS.find((m) => m.id === fundingMethod);
  const walletInfo = MOCK_WALLETS.find((w) => w.id === selectedWallet);

  const formatAmount = (val) => {
    const num = getAmountNumber(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div>
      <div className={styles.reviewLabel}>{t("Review & Confirm")}</div>
      <div className={styles.reviewTable}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Amount")}</span>
          <span className={styles.reviewRowValue}>
            {t("EUR")}
            {formatAmount(amount)}
          </span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Method")}</span>
          <div className={styles.reviewRowMain}>
            {fundingMethod === "instapay_wallet" && (
              <div
                style={{
                  width: 24,
                  height: 16,
                  borderRadius: 4,
                  background: "#5926F0",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            {methodInfo ? t(methodInfo.label) : "—"}
          </div>
        </div>

        {fundingMethod === "instapay_wallet" && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewRowLabel}>{t("Wallet")}</span>
            <div className={styles.reviewRowMain}>{walletInfo ? walletInfo.name : "—"}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
