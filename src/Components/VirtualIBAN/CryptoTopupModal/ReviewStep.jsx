import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../ConvertFundsModal/convertFunds.module.scss";

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.25" stroke="#5926F0" strokeWidth="1.5" />
    <path
      d="M8 4.5V8L10.5 9.5"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshSpinnerIcon = () => (
  <svg className={styles.spinIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.0537 2 11.8724 3.03057 12.9554 4.6"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13 2V5H10"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.0537 2 11.8724 3.03057 12.9554 4.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13 2V5H10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 10.75C7.59 10.75 7.25 10.41 7.25 10C7.25 9.59 7.59 9.25 8 9.25C8.41 9.25 8.75 9.59 8.75 10C8.75 10.41 8.41 10.75 8 10.75ZM8.75 7.75H7.25V5.25H8.75V7.75Z"
      fill="#d97706"
    />
  </svg>
);

const ReviewStep = ({ amount, feeDetails, selectedIban, onRefreshFee, isRefreshing }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    setTimeLeft(60);
  }, [feeDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onRefreshFee?.();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefreshFee]);

  const totalVal = feeDetails?.total?.value ?? amount;
  const feeVal = feeDetails?.fee?.value ?? 0;
  const netVal = feeDetails?.amount?.value ?? Number(totalVal) - Number(feeVal);
  const rateVal = feeDetails?.exchanged_rate?.value ?? 0;
  const recipientVal = feeDetails?.recipient?.value ?? 0;

  return (
    <div>
      <div className={styles.reviewLabel}>{t("Review Topup & Fee Details")}</div>

      <div className={styles.quoteTimerBox}>
        <div className={styles.timerContent}>
          {isRefreshing ? (
            <>
              <RefreshSpinnerIcon />
              <span className={styles.timerText}>{t("Updating quote...")}</span>
            </>
          ) : (
            <>
              <ClockIcon />
              <span className={styles.timerText}>
                {t("Quote will reset in")}{" "}
                <strong className={styles.timerSeconds}>{timeLeft}</strong> {t("seconds")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.reviewTable}>
        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Gross Deposit Amount")}</div>
          <div className={styles.reviewRowValue}>
            ${totalVal}
            &nbsp;{t("USDT")}
          </div>
        </div>

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Fee")}</div>
          <div className={styles.reviewRowValue} style={{ color: "#d92d20" }}>
            -${feeVal}
            &nbsp;{t("USDT")}
          </div>
        </div>

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Net Crypto Amount")}</div>
          <div className={styles.reviewRowValue}>
            ${netVal}
            &nbsp;{t("USDT")}
          </div>
        </div>

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Exchange Rate")}</div>
          <div className={styles.reviewRowValue}>
            1&nbsp;{t("USDT")}&nbsp;= &nbsp;
            {rateVal}
            &nbsp;{t("EUR")}
          </div>
        </div>

        <div className={styles.reviewRow} style={{ background: "#f2eeff" }}>
          <div className={styles.reviewRowLabel} style={{ fontWeight: 600, color: "#5926f0" }}>
            {t("Recipient IBAN Receives")}
          </div>
          <div
            className={styles.reviewRowValue}
            style={{ fontWeight: 700, color: "#5926f0", fontSize: "16px" }}
          >
            €{recipientVal}
            &nbsp;{t("EUR")}
          </div>
        </div>

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Destination IBAN")}</div>
          <div className={styles.reviewRowValue}>{selectedIban?.iban || "Virtual IBAN"}</div>
        </div>
      </div>

      <div className={styles.rateBox} style={{ marginTop: "16px" }}>
        <span className={styles.rateText}>
          {t(
            "Upon confirmation, a crypto payment checkout link and deposit address will be generated.",
          )}
        </span>
      </div>

      <div className={styles.warningNoticeBox}>
        <WarningIcon />
        <span className={styles.warningNoticeText}>
          {t(
            "The fee and the received amount may vary a little depending upon the change in exchange rate at the time of execution.",
          )}
        </span>
      </div>
    </div>
  );
};

export default ReviewStep;
