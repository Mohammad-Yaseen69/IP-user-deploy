import { useTranslation } from "react-i18next";
import { TRANSFER_SPEEDS } from "../../../stateMachines/withdrawBalance";
import { Euro } from "../../MyMasterCard/files";
import { getAmountNumber } from "../utils/amount";
import { formatWithdrawFee, getSavedBankName, getSavedBankSubtitle } from "./DestinationStep";
import styles from "./withdrawBalance.module.scss";

const ReviewStep = ({
  amount,
  transferSpeed,
  selectedBank,
  selectedIban,
  currencyCode = "EUR",
}) => {
  const { t } = useTranslation();

  const speedInfo = TRANSFER_SPEEDS.find((s) => s.id === transferSpeed);

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
          <span className={styles.reviewRowLabel}>{t("From")}</span>
          <div className={styles.reviewRowComplex}>
            <div className={styles.reviewRowMain}>
              <img src={Euro} alt="" style={{ width: 16, height: 12, borderRadius: 2 }} />
              {selectedIban?.title || `${currencyCode} IBAN`}
            </div>
            <span className={styles.reviewRowSub}>{selectedIban?.iban || "-"}</span>
          </div>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Amount")}</span>
          <span className={styles.reviewRowValue}>
            {currencyCode} {formatAmount(amount)}
          </span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Speed")}</span>
          <span className={styles.reviewRowValueNormal}>
            {speedInfo ? t(speedInfo.label) : "-"}
          </span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Fee")}</span>
          <span className={styles.reviewRowValue}>
            {formatWithdrawFee(amount, transferSpeed, currencyCode)}
          </span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Destination")}</span>
          <div className={styles.reviewRowComplex}>
            <span className={styles.reviewRowMain}>
              {selectedBank ? getSavedBankName(selectedBank) : "-"}
            </span>
            {selectedBank && (
              <span className={styles.reviewRowSub}>{getSavedBankSubtitle(selectedBank)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
