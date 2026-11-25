import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss";
import PageHeader from "../../Common/PageHeader";
import TransactionsTable from "./TransactionsTable";

const OtherTransactions = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.container}>
        <PageHeader title={t("Scheduled")} />
        <TransactionsTable />
      </div>
      <div className={styles.mobile}>
        <div className={styles.top}>
          <h4>{t("Scheduled")}</h4>
        </div>
        <TransactionsTable />
      </div>
    </>
  );
};

export default OtherTransactions;
