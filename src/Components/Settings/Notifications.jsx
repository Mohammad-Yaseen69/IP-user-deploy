import NotifTable from "./NotifTable";
import { useTranslation } from "react-i18next";
import styles from "./styles/Notifications.module.scss";

const Notifications = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Notifications")}</h4>
          <p className={styles.sectionSubtitle}>{t("Choose what you hear about, and where.")}</p>
        </div>
      </div>
      <NotifTable />
    </div>
  );
};

export default Notifications;
