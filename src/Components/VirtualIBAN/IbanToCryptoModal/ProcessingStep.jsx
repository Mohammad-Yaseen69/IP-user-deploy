import { useTranslation } from "react-i18next";
import convertStyles from "../ConvertFundsModal/convertFunds.module.scss";
import styles from "./ibanToCrypto.module.scss";

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
    <path
      d="M12 7V12L15 14"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const money = (value, currency, maxDigits) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: maxDigits })} ${currency ?? ""}`.trim();
};

const ProcessingStep = ({ result }) => {
  const { t } = useTranslation();

  return (
    <div className={convertStyles.doneContainer}>
      <div className={convertStyles.doneCard}>
        <div className={convertStyles.doneIcon}>
          <ClockIcon />
        </div>
        <div className={convertStyles.doneText}>
          <h3>{t("Your transaction is processing")}</h3>
          <p>
            {t(
              "{{amount}} left your IBAN. About {{estimate}} will arrive in your USDT wallet shortly — we'll notify you when it does.",
              {
                amount: money(result?.total?.value, result?.total?.currency, 2),
                estimate: money(
                  result?.recipient?.value,
                  result?.recipient?.currency,
                  6,
                ),
              },
            )}
          </p>
        </div>
      </div>
      {result?.reference_id && (
        <p className={styles.reference}>
          {t("Reference")}: {result.reference_id}
        </p>
      )}
    </div>
  );
};

export default ProcessingStep;
