import { useTranslation } from "react-i18next";
import styles from "../styles/table.module.css";
import useWindowWidth from "../../../utils/useWindowWidth";
import InstaPayLoader from "../../Loader";

const ActivityTable = ({ filteredData, Loading }) => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const truncate = (text, max) => {
        if (!text) return "—";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    };

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>

                <div className={`${styles.tr} ${styles.thead}`}>

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
                        {t("Admin Name")}
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

                </div>

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
                                {item?.admin_name || "—"}
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
                                    {truncate(item?.description, 20) || "—"}
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

                        </div>
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

            </div>
        </div>
    );
};

export default ActivityTable;