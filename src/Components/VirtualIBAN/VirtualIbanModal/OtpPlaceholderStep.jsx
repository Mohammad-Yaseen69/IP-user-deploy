import { useTranslation } from "react-i18next"
import styles from "./virtualIbanModal.module.scss"

const OtpPlaceholderStep = () => {
    const { t } = useTranslation()

    return (
        <div className={styles.otpPlaceholder}>
            <h3>{t("Confirm")}</h3>
            <p>
                {t(
                    "OTP verification will open here once payment APIs are connected. For now, use Continue to proceed to identity verification."
                )}
            </p>
        </div>
    )
}

export default OtpPlaceholderStep
