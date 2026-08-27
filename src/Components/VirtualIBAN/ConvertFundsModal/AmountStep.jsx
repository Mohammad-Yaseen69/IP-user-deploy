import { useTranslation } from "react-i18next"
import {
    formatAmountValue,
    getAmountNumber,
    getAmountInputSize,
    getCurrencySymbol,
    getQuickAmountsFromBalance,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
    isSameAmount,
} from "../utils/amount"
import styles from "./convertFunds.module.scss"

const AmountStep = ({ amount, setAmount, currencyCode = "EUR", availableBalance = 0, label = "Amount to convert", min = null, max = null }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(availableBalance)
    const quickAmounts = getQuickAmountsFromBalance(sourceBalance)
    const symbol = getCurrencySymbol(currencyCode)

    const amountEntered = numericAmount > 0

    const amountError = (() => {
        if (!amountEntered) return null
        if (min !== null && numericAmount < min)
            return t(`Minimum transfer amount is ${symbol}${min.toLocaleString("en-US")}`)
        if (max !== null && numericAmount > max)
            return t(`Maximum transfer amount is ${symbol}${max.toLocaleString("en-US")}`)
        if (numericAmount > sourceBalance)
            return t("Amount cannot exceed available balance")
        return null
    })()

    const handleQuickSelect = (value) => {
        setAmount(formatAmountValue(value))
    }

    return (
        <div>
            <div className={styles.amountLabel}>{t(label)}</div>
            <div className={styles.amountInputBox}>
                <div className={styles.amountDisplay}>
                    <span className={styles.currencySymbol}>{symbol}</span>
                    <input
                        className={styles.amountInput}
                        type="text"
                        style={{ width }}
                        value={amount}
                        onChange={(event) => handleAmountInputChange(event, setAmount)}
                        onKeyUp={(event) => handleAmountInputKeyUp(event, setAmount)}
                        onBlur={(event) => handleAmountInputBlur(event, setAmount)}
                        size={getAmountInputSize(amount)}
                        placeholder="0.00"
                        maxLength={12}
                        autoFocus
                    />
                </div>
                <div style={{display: "flex", flexDirection: "column"}} className={styles.availableText}>
                    <span>
                        {t("Available")} &middot; {symbol}{formatAmountValue(sourceBalance)}
                    </span>


                    {min !== null && max !== null && (
                        <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                            · {t("Min")} {symbol}{min.toLocaleString("en-US")} · {t("Max")} {symbol}{max.toLocaleString("en-US")}
                        </span>
                    )}
                </div>
                {amountError && (
                    <div className={styles.balanceError}>
                        {amountError}
                    </div>
                )}
                <div className={styles.quickAmounts}>
                    {quickAmounts.map(({ percent, value }) => (
                        <button
                            key={percent}
                            className={`${styles.quickBtn} ${isSameAmount(numericAmount, value) ? styles.active : ""}`}
                            onClick={() => handleQuickSelect(value)}
                            disabled={sourceBalance <= 0}
                        >
                            {symbol}{formatAmountValue(value)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AmountStep
