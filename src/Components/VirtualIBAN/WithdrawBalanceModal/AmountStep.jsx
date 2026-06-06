import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SOURCE_IBAN } from "../../../stateMachines/withdrawBalance"
import styles from "./withdrawBalance.module.scss"
import MT from "../VirtualIbanModal/icons/mt.svg"

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
        setAmount(SOURCE_IBAN.balance.replace(/,/g, ""))
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
            <div className={styles.amountLabel}>{t("Amount to withdraw")}</div>
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
                <div className={styles.availableText}>
                    {t("Available")} · €{SOURCE_IBAN.balance} {SOURCE_IBAN.currency}
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
                        className={`${styles.quickBtn} ${amount === SOURCE_IBAN.balance.replace(/,/g, "") ? styles.active : ""}`}
                        onClick={handleMaxClick}
                    >
                        {t("Max")}
                    </button>
                </div>
            </div>

            <div className={styles.fromSection}>
                <div className={styles.fromLabel}>{t("From")}</div>
                <div className={styles.sourceCard}>
                    <div className={styles.sourceCardLeft}>
                        <div className={styles.flag}>
                            <img src={MT} alt="MT" />
                        </div>
                        <div className={styles.sourceInfo}>
                            <h4>{SOURCE_IBAN.title}</h4>
                            <p>{SOURCE_IBAN.iban}</p>
                        </div>
                    </div>
                    <div className={styles.sourceBalance}>
                        <h4>€{SOURCE_IBAN.balance}</h4>
                        <p>{t("Available")}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AmountStep
