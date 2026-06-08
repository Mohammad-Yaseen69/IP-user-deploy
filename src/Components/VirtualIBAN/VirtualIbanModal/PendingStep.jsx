import { useTranslation } from "react-i18next"
import styles from "./virtualIbanModal.module.scss"

const PendingStep = ({ transactionRef }) => {
    const { t } = useTranslation()

    return (
        <div className={styles.pendingState}>
            <div className={styles.pendingPulse}>
                <span />
            </div>
            <h3>{t("Your IBAN is being created")}</h3>
            <p>
                {t("We have received your request and are waiting for confirmation from our banking partner. This screen will update automatically once your IBAN is ready.")}
            </p>
        </div>
    )
}

export default PendingStep
