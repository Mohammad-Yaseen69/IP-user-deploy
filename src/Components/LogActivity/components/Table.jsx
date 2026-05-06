import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";
import InstaPayLoader from "../../Loader";

const ActivityTable = ({ filteredData, Loading }) => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={`${styles.tr} ${styles.thead}`}>
                    {width > 700 && (
                        <div style={{ flex: 0.05 }} className={`${styles.th} ${styles.serial}`}>
                            {t("S.No")}
                        </div>
                    )}
                    <div style={{ flex: width <= 700 ? 0.25 : 0.18 }} className={styles.th}>
                        {t("Date")}
                    </div>
                    <div style={{ flex: width <= 700 ? 0.40 : 0.18 }} className={styles.th}>
                        {t("Admin Name")}
                    </div>
                    {width > 700 && (
                        <div style={{ flex: 0.26 }} className={styles.th}>
                            {t("Entity Type")}
                        </div>
                    )}
                    <div style={{ flex: width <= 700 ? 0.20 : 0.12 }} className={`${styles.th} ${styles.amount}`}>
                        {t("Action")}
                    </div>
                    {width > 700 && (
                        <div style={{ flex: 0.17 }} className={styles.th}>
                            {t("Description")}
                        </div>
                    )}
                    <div style={{ flex: width <= 700 ? 0.15 : 0.1 }} className={`${styles.th} ${styles.actions}`}>
                        {t("IP Address")}
                    </div>
                </div>

                {Loading ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <InstaPayLoader />
                    </div>
                ) : filteredData?.length > 0 ? (
                    filteredData.map((item, index) => (
                        <div key={item?._id || index} className={`${styles.tr} ${styles.dataRow}`}>

                            {width > 700 && (
                                <div style={{ flex: 0.05, textAlign: "center" }} className={`${styles.td} ${styles.serial}`}>
                                    {index + 1}
                                </div>
                            )}

                            <div style={{ flex: width <= 700 ? 0.25 : 0.18 }} className={styles.td}>
                                {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                            </div>

                            <div style={{ flex: width <= 700 ? 0.40 : 0.18 }} className={styles.td}>
                                {item?.admin_name || "—"}
                            </div>

                            {width > 700 && (
                                <div style={{ flex: 0.26 }} className={styles.td}>
                                    {item?.entity_type || "—"}
                                </div>
                            )}

                            <div style={{ flex: width <= 700 ? 0.20 : 0.12 }} className={styles.td}>
                                {item?.action || "—"}
                            </div>

                            {width > 700 && (
                                <div style={{ flex: 0.17 }} className={styles.td}>
                                    {item?.description || "—"}
                                </div>
                            )}

                            <div style={{ flex: width <= 700 ? 0.15 : 0.1 }} className={styles.td}>
                                {item?.ip_address || "—"}
                            </div>

                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" }}>
                        {t("No Activity found")}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ActivityTable;