import { useTranslation } from "react-i18next"
import styles from "./virtualIbanModal.module.scss"
import { useNavigate } from "react-router";

const PendingStep = ({ transactionRef }) => {
    const { t } = useTranslation()
    const navigate = useNavigate();
    return (
        <div className={styles.pendingState}>
            <div className={styles.pendingPulse}>
                <span />
            </div>
            <h3>{t("Your Virtual IBAN is being created!")}</h3>
            <p>
                {t("We've successfully received your request and are processing it. We'll notify you as soon as your Virtual IBAN is ready to use.")}
            </p>
            <button onClick={() => navigate("/dashboard/default")}
                style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#5626e6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >{t("Go To Dashboard")}</button>
        </div>
    )
}

export default PendingStep
