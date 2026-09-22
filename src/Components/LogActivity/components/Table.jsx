import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";
import InstaPayLoader from "../../Loader";
import { MoreHorizontal, MoreVertical, X } from "react-feather";
import { useState } from "react";
import { useContext } from "react";
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
            <table className={styles.table}>

                {width > 700 && (
                    <thead>
                        <tr className={`${styles.tr} ${styles.thead}`}>
                            <th                     
                                className={`${styles.th} ${styles.serial}`}
                                style={{ width: "4%" }}
                            >
                                {t("S.No")}
                            </th>

                            <th className={styles.th} style={{ width: "14%" }} >
                                {t("Date")}
                            </th>

                            <th className={styles.th} style={{ width: "18%" }}>
                                {t("Name")}
                            </th>

                            <th className={styles.th} style={{ width: "14%" }}>
                                {t("Entity Type")}
                            </th>

                            <th className={styles.th} style={{ width: "18%" }}>
                                {t("Action")}
                            </th>

                            <th className={styles.th} style={{ width: "26%" }}>
                                {t("Description")}
                            </th>

                            <th className={styles.th} style={{ width: "12%" }}>
                                {t("IP Address")}
                            </th>

                            <th className={styles.th} style={{ width: "12%" }}></th>
                        </tr>
                    </thead>
                )}

                <tbody>
                    {Loading ? (
                        <tr>
                            <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                                <InstaPayLoader />
                            </td>
                        </tr>
                    ) : filteredData?.length > 0 ? (
                        filteredData.map((item, index) => (
                            width > 700 ? (
                                <tr
                                    key={item?._id || index}
                                    className={`${styles.tr} ${styles.dataRow}`}
                                >
                                    <td                                        
                                        className={`${styles.td} ${styles.serial}`}
                                        style={{ width: "6%", textAlign: "center"  }}
                                    >
                                        {index + 1}
                                    </td>

                                    <td className={styles.td} style={{ width: "14%", textAlign: "center"  }}>
                                        {item?.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td className={styles.td} style={{ width: "18%", textAlign: "center"  }}>
                                        {item?.agent?.first_name || userDetails?.company_name || ""}{item?.agent?.last_name || ""}
                                    </td>

                                    <td className={styles.td} style={{ width: "14%", textAlign: "center"  }}>
                                        {item?.entityType || "—"}
                                    </td>

                                    <td
                                        style={{ width: "18%", wordBreak: "break-word", textAlign: "center"  }}
                                        className={styles.td}
                                    >
                                        {truncate(item?.action, 15) || "—"}
                                    </td>

                                    <td
                                        style={{ width: "26%", wordBreak: "break-word", textAlign: "center"  }}
                                        className={styles.td}
                                    >
                                        {dynamicDesc(item?.description)}
                                    </td>

                                    <td className={styles.td} style={{ width: "12%", textAlign: "center"  }}>
                                        {item?.ipAddress || "—"}
                                    </td>

                                    <td
                                        style={{ width: "12%", cursor: "pointer", textAlign: "center"  }}
                                        onClick={() => {
                                            setSelectedActivity(item)
                                            setShowModal(true)
                                        }}
                                        className={styles.td}
                                    >
                                        <MoreVertical size={18} />
                                    </td>
                                </tr>
                            ) : (
                                <tr
                                    key={item?._id || index}
                                    className={`${styles.tr} ${styles.dataRow}`}
                                >
                                    <td className={styles.td}>
                                        {item?.agent?.first_name || userDetails?.company_name || ""}{item?.agent?.last_name || ""}

                                        <div
                                            onClick={() => {
                                                setSelectedActivity(item)
                                                setShowModal(true)
                                            }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </div>
                                    </td>

                                    <td className={styles.td}>
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Action")}</div>
                                        {truncate(item?.action, 15) || "—"}
                                    </td>

                                    <td className={styles.td}>
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Description")}</div>
                                        {dynamicDesc(item?.description)}
                                    </td>

                                    <td className={styles.td}>
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Ip Address")}</div>
                                        {item?.ipAddress || "—"}
                                    </td>

                                    <td className={styles.td}>
                                        <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Date")}</div>
                                        {item?.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={8}
                                style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" }}
                            >
                                {t("No Activity found")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

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
    );
};

export default ActivityTable;