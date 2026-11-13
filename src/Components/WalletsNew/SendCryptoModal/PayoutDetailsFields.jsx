import { useTranslation } from "react-i18next";
import styles from "./sendCrypto.module.scss";
import {
  DOCUMENT_REFERENCE_MAX_LENGTH,
  getPurposeOptions,
} from "../../../stateMachines/cryptoPayout";

const PURPOSE_OPTIONS = getPurposeOptions();

const PayoutDetailsFields = ({ purpose, setPurpose, documentReference, setDocumentReference }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.payoutDetails}>
      <label className={styles.fieldLabel} htmlFor="crypto-payout-purpose">
        {t("Purpose of payment")} <span className={styles.optionalTag}>{t("Optional")}</span>
      </label>
      <select
        id="crypto-payout-purpose"
        className={styles.fieldInput}
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
      >
        {PURPOSE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>

      <label className={styles.fieldLabel} htmlFor="crypto-payout-reference">
        {t("Invoice or contract reference")}{" "}
        <span className={styles.optionalTag}>{t("Optional")}</span>
      </label>
      <input
        id="crypto-payout-reference"
        type="text"
        className={styles.fieldInput}
        value={documentReference}
        maxLength={DOCUMENT_REFERENCE_MAX_LENGTH}
        placeholder={t("e.g. INV-2026-0042")}
        onChange={(event) => setDocumentReference(event.target.value)}
      />
      <div className={styles.fieldHint}>
        {t("Up to {{max}} characters. Leave empty and we use our own transaction reference.", {
          max: DOCUMENT_REFERENCE_MAX_LENGTH,
        })}
      </div>
    </div>
  );
};

export default PayoutDetailsFields;
