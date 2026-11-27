import { Mail, ShieldOff } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "../styles/InactiveIban.module.css";

const InactiveIban = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <ShieldOff size={32} className={styles.centerIcon} />
      </div>

      <div className={styles.textContent}>
        <h3 className={styles.title}>{t("Your Virtual IBAN is inactive")}</h3>
        <p className={styles.description}>
          {t(
            "This virtual IBAN account has been deactivated and can no longer be used to send, receive, or manage funds. Please contact our support team for further assistance.",
          )}
        </p>
      </div>

      <a className={styles.supportButton} href="mailto:support@insta-pay.ch">
        <Mail size={18} />
        <span>{t("Contact Support")}</span>
      </a>
    </div>
  );
};

export default InactiveIban;
