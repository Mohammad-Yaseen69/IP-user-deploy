import { useState } from "react";
import styles from "./styles/index.module.scss";
import { useTranslation } from "react-i18next";
import InvoiceItem from "./InvoiceItem";
import useWindowWidth from "../../utils/useWindowWidth";

export const formatDateTime = (iso, dateOrTime = "both") => {
  try {
    if (dateOrTime === "time") {
      return new Date(iso).toLocaleTimeString();
    } else if (dateOrTime === "date") {
      return new Date(iso).toLocaleDateString();
    } else {
      return new Date(iso).toLocaleString();
    }
  } catch (_) {
    return iso;
  }
};

const InvoiceTable = ({ filteredInvoices, setEditModal }) => {
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
            style={{ flex: width <= 700 ? 0.28 : 0.18 }}
            className={styles.th}
          >
            {t("  ")}
          </div>
          <div
            style={{ flex: width <= 700 ? 0.62 : 0.24 }}
            className={styles.th}
          >
            {t("Title")}
          </div>
          {width > 700 && (
            <div style={{ flex: 0.26 }} className={styles.th}>
              {t("Description")}
            </div>
          )}
          {width > 700 && (
            <div
              style={{ flex: 0.12 }}
              className={`${styles.th} ${styles.amount}`}
            >
              {t("Amount")}
            </div>
          )}
          {width > 700 && (
            <div style={{ flex: 0.17 }} className={styles.th}>
              {t("Receiving Wallet")}
            </div>
          )}
          {width > 700 && (
            <div style={{ flex: 0.13 }} className={styles.th}>
              {t("Status")}
            </div>
          )}
          <div
            style={{ flex: 0.1 }}
            className={`${styles.th} ${styles.actions}`}
          >
            {t("Actions")}
          </div>
        </div>

        {filteredInvoices.map((inv, idx) => {
          const sn = idx + 1;
          const badgeClass =
            inv.status === "Accepted"
              ? styles.badgeAccepted
              : inv.status === "Declined"
                ? styles.badgeDeclined
                : styles.badgeRequested;

          return (
            <InvoiceItem
              setEditModal={setEditModal}
              menuOpenFor={menuOpenFor}
              setMenuOpenFor={setMenuOpenFor}
              sn={sn}
              badgeClass={badgeClass}
              inv={inv}
              key={idx}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceTable;
