import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import Settings from "./Settings";

const UserSettings = () => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("Settings")}</h4>
                <TopRight />
            </div>
            <Settings />
        </div>
    )
}

export default UserSettings;