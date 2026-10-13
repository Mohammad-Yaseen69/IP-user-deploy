import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss";
import TopRight from "../topRight";
import TransactionsTable from "./TransactionsTable";

const OtherTransactions = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.container}>
        <div className={styles.top}>
          <h4>{t("Subscriptions & Scheduled")}</h4>
          <TopRight />
        </div>
        <TransactionsTable />
      </div>
      <div className={styles.mobile}>
        <div className={styles.top}>
          <h4>{t("Subscriptions & Scheduled")}</h4>
        </div>
        <TransactionsTable />
      </div>
    </>
  );
};

export default OtherTransactions;
