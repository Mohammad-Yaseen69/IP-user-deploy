import { MoreVertical } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./styles/KPICard.module.scss";

const KPICard = ({ 
    title, 
    value, 
    percentage, 
    description, 
    icon: Icon,
    trend = "increased" 
}) => {
    const { t } = useTranslation();

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t(title)}</h3>
                <button className={styles.menuButton} aria-label="More options">
                    <MoreVertical size={18} color="#999" />
                </button>
            </div>
            
            <div className={styles.content}>
                <div className={styles.metrics}>
                    <div className={styles.valueContainer}>
                        <span className={styles.value}>{value}</span>
                        {percentage !== undefined && (
                            <span className={styles.percentage}>{percentage}</span>
                        )}
                    </div>
                    <p className={styles.description}>
                        {trend === "increased" ? t("Increased") : t("Decreased")} by 0.0% {t(description)}
                    </p>
                </div>
                
                {Icon && (
                    <div className={styles.iconContainer}>
                        {typeof Icon === 'function' ? <Icon /> : Icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPICard;

