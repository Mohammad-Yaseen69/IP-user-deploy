import { useTranslation } from "react-i18next";
import styles from "./styles/ShippingDistance.module.scss";

const ShippingDistance = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.metrics}>
                    <div className={styles.valueContainer}>
                        <span className={styles.value}>0</span>
                        <span className={styles.unit}>{t("miles")}</span>
                        <span className={styles.percentage}>0.0%</span>
                    </div>
                    <p className={styles.description}>
                        {t("Increased")} by 0.0% {t("compared to the last period.")}
                    </p>
                </div>
                
                <div className={styles.iconContainer}>
                    <svg
                        width="120"
                        height="80"
                        viewBox="0 0 120 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.worldMap}
                    >
                        <path
                            d="M20 40 Q30 20, 50 25 T80 30 T100 35 L95 50 Q85 55, 70 50 T40 45 T20 40 Z"
                            stroke="#E0E0E0"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            fill="none"
                        />
                        <path
                            d="M25 45 Q35 30, 55 35 T85 40 T105 45 L100 60 Q90 65, 75 60 T45 55 T25 45 Z"
                            stroke="#E0E0E0"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            fill="none"
                        />
                        <circle cx="40" cy="40" r="3" fill="#D0D0D0" />
                        <circle cx="60" cy="35" r="3" fill="#D0D0D0" />
                        <circle cx="80" cy="45" r="3" fill="#D0D0D0" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ShippingDistance;

