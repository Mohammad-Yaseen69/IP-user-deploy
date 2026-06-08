import { useState } from "react"
import { Modal, ModalBody } from "reactstrap"
import { FileText } from "react-feather"
import { useTranslation } from "react-i18next"
import styles from "./statementModal.module.scss"

const PERIODS = [
    "This month",
    "Last month",
    "Last 90 days",
    "Custom",
]

const FORMATS = [
    {
        id: "pdf",
        label: "PDF",
        sub: "Print-ready",
    },
    {
        id: "csv",
        label: "CSV",
        sub: "For spreadsheets",
    },
]

const FileBadge = ({ type }) => (
    <div className={styles.fileBadge}>
        <FileText size={18} />
        <span>{type}</span>
    </div>
)

const StatementModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation()
    const [period, setPeriod] = useState("Last month")
    const [format, setFormat] = useState("pdf")

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            centered
            style={{ maxWidth: "816px", width: "calc(100% - 32px)" }}
        >
            <ModalBody className={styles.modalBody}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerIcon}>
                            <FileText size={22} />
                        </div>
                        <h2>{t("Download statement")}</h2>
                    </div>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h3>{t("Period")}</h3>
                            <div className={styles.periodTabs}>
                                {PERIODS.map((item) => (
                                    <button
                                        type="button"
                                        key={item}
                                        className={`${styles.periodTab} ${period === item ? styles.activePeriod : ""}`}
                                        onClick={() => setPeriod(item)}
                                    >
                                        {t(item)}
                                    </button>
                                ))}
                            </div>

                            {period === "Custom" && (
                                <div className={styles.customRange}>
                                    <label>
                                        <span>{t("From")}</span>
                                        <input type="date" />
                                    </label>
                                    <label>
                                        <span>{t("To")}</span>
                                        <input type="date" />
                                    </label>
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h3>{t("Format")}</h3>
                            <div className={styles.formatGrid}>
                                {FORMATS.map((item) => {
                                    const isActive = format === item.id

                                    return (
                                        <button
                                            type="button"
                                            key={item.id}
                                            className={`${styles.formatCard} ${isActive ? styles.activeFormat : ""}`}
                                            onClick={() => setFormat(item.id)}
                                        >
                                            <span className={styles.radio}>
                                                {isActive && <span />}
                                            </span>
                                            <FileBadge type={item.label} />
                                            <span className={styles.formatText}>
                                                <strong>{t(item.label)}</strong>
                                                <small>{t(item.sub)}</small>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={toggle}
                        >
                            {t("Cancel")}
                        </button>
                        <button type="button" className={styles.downloadBtn}>
                            {t("Download statement")}
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default StatementModal
