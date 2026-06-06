import { useTranslation } from "react-i18next"
import { getExchangeRate } from "../../../stateMachines/convertFunds"
import styles from "./convertFunds.module.scss"

const ReviewStep = ({ amount, wallet }) => {
    const { t } = useTranslation()


    const rateInfo = 1
    const formatAmount = (val) => {
        const num = parseFloat(val)
        if (isNaN(num)) return val
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const convertedAmount = (parseFloat(amount) * rateInfo.rate).toFixed(2)

    return (
        <div>
            <div className={styles.reviewLabel}>{t("Review & Confirm")}</div>
            <div className={styles.reviewTable}>
                {/* From */}
                {/* <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("From")}</span>
                    <span className={styles.reviewRowValue}>
                        {fromWallet} {t("Wallet")}
                    </span>
                </div> */}



                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Amount")}</span>
                    <span className={styles.reviewRowValue}>
                        {"EUR"} {formatAmount(amount)}
                    </span>
                </div>

                {/* Exchange Rate */}
                {/* <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("Exchange Rate")}</span>
                    <span className={styles.reviewRowValue}>
                        1 {fromWallet} = {rateInfo.rate} {toWallet}
                    </span>
                </div> */}

                {/* You Receive */}
                <div className={styles.reviewRow}>
                    <span className={styles.reviewRowLabel}>{t("You Receive")}</span>
                    <span className={styles.reviewRowValue}>
                        {wallet?.currency?.code} {formatAmount(convertedAmount)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ReviewStep
