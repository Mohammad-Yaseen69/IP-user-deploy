import React from "react"
import { useTranslation } from "react-i18next"
import {
    formatAmountValue,
    getAmountNumber,
    getAmountInputSize,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
    isSameAmount,
} from "../utils/amount"
import styles from "../ConvertFundsModal/convertFunds.module.scss"

const QUICK_USDT_AMOUNTS = [20, 50, 100, 250, 500]
const MIN_USDT_AMOUNT = 5
const MAX_USDT_AMOUNT = 50000

const AmountStep = ({ amount, setAmount, selectedIban }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const hasAmount = !!String(amount ?? "").trim()
    const isBelowMinimum = hasAmount && numericAmount < MIN_USDT_AMOUNT
    const isAboveMaximum = hasAmount && numericAmount > MAX_USDT_AMOUNT
    const showAmountError = isBelowMinimum || isAboveMaximum

    const handleQuickSelect = (val) => {
        setAmount(formatAmountValue(val))
    }

    return (
        <div>
            <div className={styles.amountLabel}>{t("Gross Deposit Amount in USDT")}</div>
            <div className={styles.amountInputBox}>
                <div className={styles.amountDisplay}>
                    <span className={styles.currencySymbol}>$</span>
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
                {showAmountError && (
                    <div className={styles.balanceError}>
                        {isBelowMinimum
                            ? t("Minimum deposit is $5 USDT.")
                            : t("Maximum deposit is $50,000 USDT.")}
                    </div>
                )}
                <div className={styles.availableText}>
                    {/* {t("Currency")}: <strong>USDT</strong> &middot; {t("Destination")}: <strong>{selectedIban?.iban || "Virtual IBAN"} ({selectedIban?.currency || "EUR"})</strong> */}
                </div>
                <div className={styles.quickAmounts} style={{ marginTop: "12px" }}>
                    {QUICK_USDT_AMOUNTS.map((val) => (
                        <button
                            key={val}
                            type="button"
                            className={`${styles.quickBtn} ${isSameAmount(numericAmount, val) ? styles.active : ""}`}
                            onClick={() => handleQuickSelect(val)}
                        >
                            ${val}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AmountStep
