import { useTranslation } from "react-i18next"
import styles from "./virtualIbanModal.module.scss"

const PendingStep = ({ transactionRef }) => {
    const { t } = useTranslation()

    return (
        <div className={styles.pendingState}>
            <div className={styles.pendingPulse}>
                <span />
            </div>
            <h3>{t("Your Virtual IBAN is being created!")}</h3>
            <p>
                {t("We've successfully received your request and are processing it. We'll notify you as soon as your Virtual IBAN is ready to use.")}
            </p>
        </div>
    )
}

export default PendingStep
