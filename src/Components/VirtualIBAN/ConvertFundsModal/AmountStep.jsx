import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./convertFunds.module.scss"

const QUICK_AMOUNTS = [100, 500, 2500]

const AmountStep = ({ amount, setAmount, currencyCode }) => {
    const { t } = useTranslation()
    const [activeQuick, setActiveQuick] = useState(
        QUICK_AMOUNTS.includes(parseFloat(amount)) ? parseFloat(amount) : null
    )

    const symbol = currencyCode === "USD" ? "$" : currencyCode === "GBP" ? "£" : currencyCode === "INR" ? "₹" : "€"

    const handleQuickSelect = (val) => {
        setActiveQuick(val)
        setAmount(val.toString())
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
            <div className={styles.amountLabel}>{t("Amount to convert")}</div>
            <div className={styles.amountInputBox}>
                <div className={styles.amountDisplay}>
                    <span className={styles.currencySymbol}>{symbol}</span>
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
                            {symbol}{val.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AmountStep
