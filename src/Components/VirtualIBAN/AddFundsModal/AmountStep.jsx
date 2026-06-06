import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./addFundsModal.module.scss"

const QUICK_AMOUNTS = [100, 500, 2500]

const AmountStep = ({ amount, setAmount }) => {
    const { t } = useTranslation()
    const [activeQuick, setActiveQuick] = useState(
        QUICK_AMOUNTS.includes(parseFloat(amount)) ? parseFloat(amount) : null
    )

    const handleQuickSelect = (val) => {
        setActiveQuick(val)
        setAmount(val.toString())
    }

    const handleMaxClick = () => {
        setActiveQuick(null)
        setAmount("53180.07")
    }

    const handleInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, "")
        setAmount(val)
        const numVal = parseFloat(val)
        setActiveQuick(QUICK_AMOUNTS.includes(numVal) ? numVal : null)
    }

    const formatDisplay = (val) => {
        if (!val) return ""
        const num = parseFloat(val)
        if (isNaN(num)) return val
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <div>
            <div className={styles.amountLabel}>{t("Amount to add")}</div>
            <div className={styles.amountInputBox}>
                <div className={styles.amountDisplay}>
                    <span className={styles.currencySymbol}>€</span>
                    <input
                        className={styles.amountInput}
                        type="text"
                        value={formatDisplay(amount)}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        autoFocus
                    />
                </div>
                <div className={styles.quickAmounts}>
                    {QUICK_AMOUNTS.map((val) => (
                        <button
                            key={val}
                            className={`${styles.quickBtn} ${activeQuick === val ? styles.active : ""}`}
                            onClick={() => handleQuickSelect(val)}
                        >
                            €{val.toLocaleString()}
                        </button>
                    ))}
                    <button
                        className={styles.quickBtn}
                        onClick={handleMaxClick}
                    >
                        {t("Max")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AmountStep
