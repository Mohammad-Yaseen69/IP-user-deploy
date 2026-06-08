import { useTranslation } from "react-i18next"
import { SOURCE_IBAN } from "../../../stateMachines/withdrawBalance"
import {
    formatAmountValue,
    getAmountNumber,
    getCurrencySymbol,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
} from "../utils/amount"
import styles from "./withdrawBalance.module.scss"
import MT from "../VirtualIbanModal/icons/mt.svg"

const QUICK_AMOUNTS = [100, 500, 2500]

const AmountStep = ({ amount, setAmount }) => {
    const { t } = useTranslation()
    const numericAmount = getAmountNumber(amount)
    const sourceBalance = getAmountNumber(SOURCE_IBAN.balance)
    const activeQuick = QUICK_AMOUNTS.includes(numericAmount) ? numericAmount : null
    const symbol = getCurrencySymbol(SOURCE_IBAN.currency)

    const handleQuickSelect = (value) => {
        setAmount(formatAmountValue(value))
    }

    const handleMaxClick = () => {
        setAmount(formatAmountValue(SOURCE_IBAN.balance))
    }

    return (
        <div>
            <div className={styles.amountLabel}>{t("Amount to withdraw")}</div>
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
                <div className={styles.availableText}>
                    {t("Available")} · {symbol}{SOURCE_IBAN.balance} {SOURCE_IBAN.currency}
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
                    <button
                        className={`${styles.quickBtn} ${numericAmount === sourceBalance ? styles.active : ""}`}
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
                        <h4>{symbol}{SOURCE_IBAN.balance}</h4>
                        <p>{t("Available")}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AmountStep
