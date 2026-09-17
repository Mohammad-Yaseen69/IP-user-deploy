import { useTranslation } from "react-i18next"
import styles from "../cryptoPage.module.scss"

/** Network tabs for a wallet's deposit channels. */
const NetworkSelector = ({ networks = [], selectedIndex, onSelect }) => {
    const { t } = useTranslation()

    return (
        <div>
            <div className={styles.sectionLabel}>{t("Select Network")}</div>
            <div className={styles.networkTabs}>
                {networks.map((net, index) => {
                    const isSelected = index === selectedIndex
                    return (
                        <button
                            key={`${net.network}-${net.protocol}-${index}`}
                            type="button"
                            className={`${styles.networkTab} ${isSelected ? styles.networkTabActive : ""}`}
                            onClick={() => onSelect(index)}
                        >
                            <span>{net.network}</span>
                            {net.protocol ? (
                                <span className={`${styles.protocolChip} ${isSelected ? styles.protocolChipActive : ""}`}>
                                    {net.protocol}
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default NetworkSelector
