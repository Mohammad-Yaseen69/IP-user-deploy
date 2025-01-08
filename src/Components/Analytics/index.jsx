import { useTranslation } from "react-i18next";
import styles from "../ChipsInNew/styles/index.module.scss"
import TopRight from "../topRight";
import Reports from "./Reports";

const Analytics = () => {
    const { t } = useTranslation()
    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <h4>{t("Analytics")}</h4>
                            <TopRight />
                        </div>
                        <Reports />
                    </div>
                    :
                    <div className={styles.mobile}>
                        <div className={styles.top}>
                            <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                {t("Analytics")}
                            </h4>
                        </div>
                        <div className={styles.bottom}>
                            <Reports />
                        </div>
                    </div>
            }
        </>
    )
}

export default Analytics;