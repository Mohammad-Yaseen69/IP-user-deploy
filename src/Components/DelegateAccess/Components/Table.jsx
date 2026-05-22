import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";
import TableItem from "./TableItem";
import InstaPayLoader from "../../Loader";

const DelegateTable = ({ filteredInvoices, setEditData, setShowModal, isRole, roleLoading }) => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>

        {width > 700 && (isRole ? (
          <div className={`${styles.tr} ${styles.thead}`}>
            {width > 700 && (
              <div style={{ flex: 0.09 }} className={`${styles.th} ${styles.serial}`}>
                {t("S.No")}
              </div>
            )}
            <div style={{ flex: width <= 700 ? 0.40 : 0.30 }} className={styles.th}>
              {t("Title")}
            </div>
            {width > 700 && (
              <div style={{ flex: 0.35 }} className={styles.th}>
                {t("Description")}
              </div>
            )}
            <div style={{ flex: width <= 700 ? 0.35 : 0.25 }} className={styles.th}>
              {t("Permissions")}
            </div>
            <div style={{ flex: width <= 700 ? 0.15 : 0.1 }} className={`${styles.th} ${styles.actions}`}>
            </div>
          </div>) : (
          <div className={`${styles.tr} ${styles.thead}`}>
            {width > 700 && (
              <div style={{ flex: 0.05 }} className={`${styles.th} ${styles.serial}`}>
                {t("S.No")}
              </div>
            )}
            <div style={{ flex: width <= 700 ? 0.25 : 0.18 }} className={styles.th}>
              {t("Name")}
            </div>
            <div style={{ flex: width <= 700 ? 0.40 : 0.18 }} className={styles.th}>
              {t("Phone")}
            </div>
            {width > 700 && (
              <div style={{ flex: 0.26 }} className={styles.th}>
                {t("Email")}
              </div>
            )}
            <div style={{ flex: width <= 700 ? 0.20 : 0.12 }} className={`${styles.th} ${styles.amount}`}>
              {t("Role")}
            </div>
            {width > 700 && (
              <div style={{ flex: 0.17 }} className={styles.th}>
                {t("Status")}
              </div>
            )}
            <div style={{ flex: width <= 700 ? 0.15 : 0.1 }} className={`${styles.th} ${styles.actions}`}>
            </div>
          </div>
        ))}

        {roleLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <InstaPayLoader />
          </div>
        ) : filteredInvoices?.length > 0 ? (
          filteredInvoices.map((item, index) => (
            <TableItem
              key={item._id}
              isRole={isRole}
              item={item}
              index={index}
              menuOpenFor={menuOpenFor}
              setMenuOpenFor={setMenuOpenFor}
              width={width}
              setEditData={setEditData}
              setShowModal={setShowModal}
            />
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" }}>
            {t(isRole ? "No roles found" : "No agents found")}
          </div>
        )}

      </div>
    </div>
  );
};

export default DelegateTable;