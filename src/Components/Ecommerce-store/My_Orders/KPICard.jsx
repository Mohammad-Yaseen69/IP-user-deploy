import { MoreVertical } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./styles/KPICard.module.scss";

const KPICard = ({
    title,
    value,
    percentage,
    description,
    bgimg,
    trend = "increased",
    height
}) => {
    const { t } = useTranslation();
    const renderColoredText = (text) => {
        if (!text) return null;

        return text.split(/(\+?\-?\d[\d,\.%]*)/g).map((part, index) => {
            if (/^\+?\-?\d/.test(part)) {
                const color = part.includes('-') ? 'red' : 'green';
                return (
                    <span key={index} style={{
                        color,
                        fontWeight: 'bold'
                    }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className={styles.card}
            style={{
                
                height: height || "100%"
            }}
        >
            <div className={styles.header}>
                <h3 className={styles.title}>{t(title)}</h3>
                <button className={styles.menuButton} aria-label="More options">
                    <MoreVertical size={18} color="#999" />
                </button>
            </div>

            <div
                className={styles.content}
                style={bgimg ? {
                    backgroundImage: `url(${bgimg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "right center",
                    backgroundRepeat: "no-repeat"
                } : undefined}
            >
                <div className={styles.metrics}>
                    <div className={styles.valueContainer}>
                        <span className={styles.value}>{value}</span>
                        {percentage !== undefined && (
                            <span className={styles.percentage}>
                                {renderColoredText(percentage)}
                            </span>)}
                    </div>
                    <p className={styles.description}>
                        {trend === "increased" ? t("Increased") : t("Decreased")} by{' '}
                        {renderColoredText(description)}
                    </p>

                </div>

           
            </div>
        </div>
    );
};

export default KPICard;

