import { useTranslation } from "react-i18next"
import styles from "./styles/feescomp.module.css"
import { Info } from "react-feather"
import { cleanString } from "../../../Helper/cleanString"

const FeesComponent = ({ data, sendingLabel = "Sending", exchangeRateLabel = "Exchange Rate", feesLabel = "Transfer Fees", totalLabel = "Total Amount", error = "", receiverLabel = "They Receive", bright = false, extraContent }) => {
    const { t } = useTranslation()
    console.log(data.exchange_rate)
    return (
        error
            ?
            <div style={{ margin: "1rem 0", textAlign: "center", fontSize: ".9rem", fontWeight: 500, color: "red" }}>
                {error}
            </div>
            :
            <div className={bright ? styles.bright : styles.container}>
                {
                    data.exchange_rate?.sending?.amount
                    &&
                    <div className={styles.item}>
                        <span>{t(sendingLabel)}</span>
                        <p>{Number(cleanString(data?.exchange_rate?.sending?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {data.exchange_rate?.sending?.currency}</p>
                    </div>
                }
                {
                    data.exchange_rate?.receiver?.amount
                    &&
                    <div className={styles.item}>
                        <span>{t(receiverLabel)}</span>
                        <p>{Number(cleanString(data?.exchange_rate?.receiver?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {data.exchange_rate?.receiver?.currency}</p>
                    </div>
                }
                {
                    data.exchange_rate?.sending?.amount
                        &&
                        data.exchange_rate?.exchange_rate
                        &&
                        (data.wallet?.currency?.code ?? data.currency_wallet?.currency?.code) !== (data?.beneficiary_wallet?.currency?.code ?? data.recipient_currency)
                        ?
                        <div className={styles.item}>
                            <span>{t(exchangeRateLabel)}</span>
                            <p className={styles.sm}>1.00 {data.exchange_rate?.sending?.currency} = {Number(data?.exchange_rate?.exchange_rate)?.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 7 }) ?? "?"} {data.exchange_rate?.exchange_rate_currency ?? data.exchange_rate?.receiver?.currency}</p>
                        </div>
                        :
                        ""
                }
                {
                    data?.exchange_rate?.fee
                    &&
                    <div className={styles.fees}>
                        <Info color={bright ? "#BE9A08" : "white"} />
                        <span>{t(feesLabel)} {Number(data?.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? "0.00"} {data.exchange_rate?.sending?.currency}</span>
                    </div>
                }
                {
                    data?.exchange_rate?.total
                    &&
                    <div className={styles.item}>
                        <span>{t(totalLabel)}</span>
                        <p className={styles.lg}>{Number(cleanString(data?.exchange_rate?.total) ?? 0.00)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {data.exchange_rate?.total_currency ?? data.exchange_rate?.sending?.currency}</p>
                    </div>
                }
                {
                    extraContent
                    ??
                    ""
                }
            </div>
    )
}

export default FeesComponent