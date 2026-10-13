import { useTranslation } from "react-i18next";
import success from "../VirtualIbanModal/icons/success.png";
import styles from "./withdrawBalance.module.scss";

const DoneStep = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.doneContainer}>
      <div className={styles.doneCard}>
        <img src={success} />
        <div className={styles.doneText}>
          <h3>
            {t("Transaction initiated")}
            {t("🎉")}
          </h3>
          <p>{t("The transaction has been successfully initiated.")}</p>
        </div>
      </div>
    </div>
  );
};

export default DoneStep;
