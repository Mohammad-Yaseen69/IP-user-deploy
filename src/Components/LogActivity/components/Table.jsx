import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";
import InstaPayLoader from "../../Loader";
import { MoreHorizontal, MoreVertical, X } from "react-feather";
import { useState } from "react";
import { useContext, useMemo } from "react";
import { UserContext } from "../../../Context/UserContext";
import { Link } from "react-router-dom";

const ActivityTable = ({ filteredData, Loading }) => {
    const { t } = useTranslation();
    const { userDetails } = useContext(UserContext)
    const width = useWindowWidth();
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const truncate = (text, max) => {
        if (!text) return "—";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    };

    const dynamicDesc = (desc) => {
        const isTransaction = desc?.toLowerCase()?.includes("transaction created with reference id:")
        if (isTransaction) {
            const reference = desc?.split("reference ID: ")?.[1]
            if (reference) {
                return (
                    <span>
                        {t("Transaction created with reference id:")} {" "}
                        <Link to={`/transactions?search=${reference}`}>
                            {reference}
                        </Link>
                    </span>
                )
            } else {
                return desc || "—"
            }
        } else {
            return truncate(desc, 20) || "—"
        }
    }

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>

                {
                    width > 700 && <div className={`${styles.tr} ${styles.thead}`}>

                        {width > 700 && (
                            <div
                                style={{
                                    flex: 0.04,
                                    textAlign: "center",
                                    justifyContent: "center"
                                }}
                                className={`${styles.th} ${styles.serial}`}
                            >
                                {t("S.No")}
                            </div>
                        )}

                        <div
                            style={{
                                flex: width <= 700 ? 0.20 : 0.14,
                                textAlign: "center"
                            }}
                            className={styles.th}
                        >
                            {t("Date")}
                        </div>

                        <div
                            style={{
                                flex: width <= 700 ? 0.30 : 0.18,
                                textAlign: "center"
                            }}
                            className={styles.th}
                        >
                            {t("Name")}
                        </div>

                        {width > 700 && (
                            <div
                                style={{
                                    flex: 0.14,
                                    textAlign: "center"
                                }}
                                className={styles.th}
                            >
                                {t("Entity Type")}
                            </div>
                        )}

                        <div
                            style={{
                                flex: width <= 700 ? 0.22 : 0.18,
                                textAlign: "center"
                            }}
                            className={styles.th}
                        >
                            {t("Action")}
                        </div>

                        {width > 700 && (
                            <div
                                style={{
                                    flex: 0.26,
                                    textAlign: "center"
                                }}
                                className={styles.th}
                            >
                                {t("Description")}
                            </div>
                        )}

                        <div
                            style={{
                                flex: width <= 700 ? 0.18 : 0.12,
                                textAlign: "center"
                            }}
                            className={styles.th}
                        >
                            {t("IP Address")}
                        </div>
                        <div
                            style={{
                                flex: width <= 700 ? 0.18 : 0.12,
                                textAlign: "center"
                            }}
                            className={styles.th}
                        >
                        </div>

                    </div>
                }

                {Loading ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center"
                        }}
                    >
                        <InstaPayLoader />
                    </div>
                ) : filteredData?.length > 0 ? (

                    filteredData.map((item, index) => (
                        (
                            width > 700 ?
                                <div
                                    key={item?._id || index}
                                    className={`${styles.tr} ${styles.dataRow}`}
                                >

                                    {width > 700 && (
                                        <div
                                            style={{
                                                flex: 0.04,
                                                textAlign: "center",
                                                justifyContent: "center"
                                            }}
                                            className={`${styles.td} ${styles.serial}`}
                                        >
                                            {index + 1}
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            flex: width <= 700 ? 0.20 : 0.14,
                                            textAlign: "center"
                                        }}
                                        className={styles.td}
                                    >
                                        {item?.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : "—"}
                                    </div>

                                    <div
                                        style={{
                                            flex: width <= 700 ? 0.30 : 0.18,
                                            textAlign: "center"
                                        }}
                                        className={styles.td}
                                    >
                                        {item?.agent?.first_name || userDetails?.company_name || ""}{item?.agent?.last_name || ""}
                                    </div>

                                    {width > 700 && (
                                        <div
                                            style={{
                                                flex: 0.14,
                                                textAlign: "center"
                                            }}
                                            className={styles.td}
                                        >
                                            {item?.entityType || "—"}
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            flex: width <= 700 ? 0.22 : 0.18,
                                            textAlign: "center",
                                            wordBreak: "break-word"
                                        }}
                                        className={styles.td}
                                    >
                                        {truncate(item?.action, 15) || "—"}
                                    </div>

                                    {width > 700 && (
                                        <div
                                            style={{
                                                flex: 0.26,
                                                textAlign: "center",
                                                wordBreak: "break-word"
                                            }}
                                            className={styles.td}
                                        >
                                            {dynamicDesc(item?.description)}
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            flex: width <= 700 ? 0.18 : 0.12,
                                            textAlign: "center"
                                        }}
                                        className={styles.td}
                                    >
                                        {item?.ipAddress || "—"}
                                    </div>
                                    <div
                                        style={{
                                            flex: width <= 700 ? 0.18 : 0.12,
                                            textAlign: "center"
                                        }}
                                        onClick={() => {
                                            setSelectedActivity(item)
                                            setShowModal(true)
                                        }}
                                        className={styles.td}
                                    >
                                        <MoreVertical size={18} />

                                    </div>

                                </div> :
                                <div
                                    key={item?._id || index}
                                    className={`${styles.tr} ${styles.dataRow}`}
                                >
                                    <div
                                        className={styles.td}
                                    >

                                        {item?.agent?.first_name || userDetails?.company_name || ""}{item?.agent?.last_name || ""}

                                        <div
                                            onClick={() => {
                                                setSelectedActivity(item)
                                                setShowModal(true)
                                            }}
                                        >
                                            <MoreHorizontal size={18} />

                                        </div>
                                    </div>
                                    <div

                                        className={styles.td}
                                    >
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Action")}</div>

                                        {truncate(item?.action, 15) || "—"}
                                    </div>

                                    <div

                                        className={styles.td}
                                    >
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Description")}</div>

                                        {dynamicDesc(item?.description)}
                                    </div>

                                    <div

                                        className={styles.td}
                                    >
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Ip Address")}</div>
                                        {item?.ipAddress || "—"}
                                    </div>

                                    <div

                                        className={styles.td}
                                    >
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Date")}</div>

                                        {item?.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : "—"}                                    </div>
                                </div>
                        )
                    ))

                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#aaa",
                            fontSize: "14px"
                        }}
                    >
                        {t("No Activity found")}
                    </div>
                )}
                {showModal && selectedActivity && (
                    <div
                        className={styles.modalOverlay}
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className={styles.modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3>{t("Activity Details")}</h3>

                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowModal(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>

                                <div className={styles.detailRow}>
                                    <span>{t("ID")}</span>
                                    <p>{selectedActivity?._id}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("Action")}</span>
                                    <p>{selectedActivity?.action}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("Description")}</span>
                                    <p>{selectedActivity?.description}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("Entity Type")}</span>
                                    <p>{selectedActivity?.entityType}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("Entity ID")}</span>
                                    <p>{selectedActivity?.entityId}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("IP Address")}</span>
                                    <p>{selectedActivity?.ipAddress}</p>
                                </div>

                                <div className={styles.detailRow}>
                                    <span>{t("Created At")}</span>
                                    <p>
                                        {selectedActivity?.createdAt
                                            ? new Date(selectedActivity.createdAt).toLocaleString()
                                            : "—"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTable;