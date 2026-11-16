import { RefreshCw, XCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "../styles/InactiveIban.module.css";

const IbanCreationFailed = ({ feeRefunded, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <XCircle size={32} className={styles.centerIcon} />
      </div>

      <div className={styles.textContent}>
        <h3 className={styles.title}>{t("We couldn't create your Virtual IBAN")}</h3>
        <p className={styles.description}>
          {t(
            "Your account could not be verified by our banking partner, so the IBAN was not created.",
          )}
          {feeRefunded && ` ${t("The activation fee has been refunded to your wallet.")}`}
        </p>
      </div>

      <button type="button" className={styles.supportButton} onClick={onRetry}>
        <RefreshCw size={18} />
        <span>{t("Start again")}</span>
      </button>
    </div>
  );
};

export default IbanCreationFailed;
