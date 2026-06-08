import { useTranslation } from "react-i18next"
import {
    formatAmountValue,
    getAmountNumber,
    getCurrencySymbol,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
} from "../utils/amount"
import styles from "./convertFunds.module.scss"

const QUICK_AMOUNTS = [100, 500, 2500]

const AmountStep = ({ amount, setAmount, currencyCode }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const activeQuick = QUICK_AMOUNTS.includes(numericAmount) ? numericAmount : null
    const symbol = getCurrencySymbol(currencyCode)

    const handleQuickSelect = (value) => {
        setAmount(formatAmountValue(value))
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
                        value={amount}
                        onChange={(event) => handleAmountInputChange(event, setAmount)}
                        onKeyUp={(event) => handleAmountInputKeyUp(event, setAmount)}
                        onBlur={(event) => handleAmountInputBlur(event, setAmount)}
                        placeholder="0.00"
                        autoFocus
                    />
                </div>
                <div className={styles.quickAmounts}>
                    {QUICK_AMOUNTS.map((value) => (
                        <button
                            key={value}
                            className={`${styles.quickBtn} ${activeQuick === value ? styles.active : ""}`}
                            onClick={() => handleQuickSelect(value)}
                        >
                            {symbol}{value.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AmountStep
