import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";



const DelegateTable = ({ filteredInvoices, setEditModal, isRole }) => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const [menuOpenFor, setMenuOpenFor] = useState(null);


  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={`${styles.tr} ${styles.thead}`}>
          {width > 700 && (
            <div
              style={{ textAlign: "justify", flex: 0.05 }}
              className={`${styles.th} ${styles.serial}`}
            >
              {t("S.No")}
            </div>
          )}
          <div
            style={{ flex: width <= 700 ? 0.25 : 0.18 }}
            className={styles.th}
          >
            {t("Name")}
          </div>
          <div
            style={{ flex: width <= 700 ? 0.40 : 0.24 }}
            className={styles.th}
          >
            {t("Phone")}
          </div>
          {width > 700 && (
            <div style={{ flex: 0.26 }} className={styles.th}>
              {t("Email")}
            </div>
          )}

          <div
            style={{ flex: width <= 700 ? 0.20 : 0.12 }}
            className={`${styles.th} ${styles.amount}`}
          >
            {
              isRole ? t("Roles") : t("Agents")
            }
          </div>
          {width > 700 && (
            <div style={{ flex: 0.17 }} className={styles.th}>
              {t("Status")}
            </div>
          )}

          <div
            style={{ flex: width <= 700 ? 0.15 : 0.1 }}
            className={`${styles.th} ${styles.actions}`}
          >
            {t("Actions")}
          </div>
        </div>


      </div>
    </div>
  );
};

export default DelegateTable;
