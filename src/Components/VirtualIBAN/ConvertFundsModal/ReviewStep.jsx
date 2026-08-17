import { useTranslation } from "react-i18next"
import { getAmountNumber } from "../utils/amount"
import styles from "./convertFunds.module.scss"

const formatAmount = (amount) => {
    const num = getAmountNumber(amount)
    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const MoneyValue = ({ value }) => {
    if (!value) return "-"
    return `${value.currency} ${formatAmount(value.value)}`
}

const ReviewStep = ({ amount, wallet, feeDetails, iban }) => {
    const { t } = useTranslation()

    return (
        <div>
            <div className={styles.reviewLabel}>{t("Review & Confirm")}</div>
            <div className={styles.reviewTable}>
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("From")}</span>
                    <span className={styles.reviewRowValue}>{iban?.currency}{t("IBAN")}</span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Amount")}</span>
                    <span className={styles.reviewRowValue}>
                        {iban?.currency} {feeDetails?.sending?.value}
                    </span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Fee")}</span>
                    <span className={styles.reviewRowValue}>
                        <MoneyValue value={feeDetails?.fee} />
                    </span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Total")}</span>
                    <span className={styles.reviewRowValue}>
                        <MoneyValue value={feeDetails?.total} />
                    </span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Exchange Rate")}</span>
                    <span className={styles.reviewRowValue}>
                        <MoneyValue value={{
                            currency: feeDetails?.recipient?.currency,
                            value: feeDetails?.exchanged_rate?.value
                        }} />
                    </span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("You Receive")}</span>
                    <span className={styles.reviewRowValue}>
                        <MoneyValue value={feeDetails?.recipient} />
                    </span>
                </div>

                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Destination")}</span>
                    <span className={styles.reviewRowValue}>
                        {wallet?.currency?.code || wallet?.name} {t("Wallet")}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ReviewStep
