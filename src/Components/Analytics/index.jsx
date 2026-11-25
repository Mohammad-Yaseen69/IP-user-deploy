import { useTranslation } from "react-i18next";
import styles from "../ChipsInNew/styles/index.module.scss";
import PageHeader from "../../Common/PageHeader";
import Reports from "./Reports";

const Analytics = () => {
  const { t } = useTranslation();
  return (
    <>
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <PageHeader title={t("Analytics")} subtitle={t("See how your money moves over time.")} />
          <Reports />
        </div>
      ) : (
        <div className={styles.mobile}>
          <div className={styles.top}>
            <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>{t("Analytics")}</h4>
          </div>
          <div className={styles.bottom}>
            <Reports />
          </div>
        </div>
      )}
    </>
  );
};

export default Analytics;
