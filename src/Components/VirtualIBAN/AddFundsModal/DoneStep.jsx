import { useTranslation } from "react-i18next"
import styles from "./addFundsModal.module.scss"

const SealCheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
            d="M12 2L4 6V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V6L12 2Z"
            stroke="#fff"
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path
            d="M9 12L11 14L15 10"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const DoneStep = () => {
    const { t } = useTranslation()

    return (
        <div className={styles.doneContainer}>
            <div className={styles.doneCard}>
                <div className={styles.doneIcon}>
                    <SealCheckIcon />
                </div>
                <div className={styles.doneText}>
                    <h3>{t("Transaction completed")} 🎉</h3>
                    <p>{t("The transaction has been successfully initiated.")}</p>
                </div>
            </div>
        </div>
    )
}

export default DoneStep
