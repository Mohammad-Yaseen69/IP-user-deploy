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

const AmountStep = ({ amount, setAmount, currencyCode = "EUR", availableBalance = 0 }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(availableBalance)
    const quickAmounts = getQuickAmountsFromBalance(sourceBalance)
    const symbol = getCurrencySymbol(currencyCode)
    const exceedsBalance = numericAmount > sourceBalance

    const handleQuickSelect = (value) => {
        setAmount(formatAmountValue(value))
    }
    const amountLength = amount?.length || 0;

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
                        size={getAmountInputSize(amount)}
                        placeholder="0.00"
                        maxLength={12}
                        autoFocus
                    />
                </div>
                <div className={styles.availableText}>
                    {t("Available")} &middot; {symbol}{formatAmountValue(sourceBalance)} {currencyCode}
                </div>
                {exceedsBalance && (
                    <div className={styles.balanceError}>
                        {t("Amount cannot exceed available balance")}
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
