import { useTranslation } from "react-i18next"
import styles from "./styles/feescomp.module.css"
import { Info } from "react-feather"
import { cleanString } from "../../../Helper/cleanString"

const FeesComponent = ({ data, sendingLabel = "Sending", exchangeRateLabel = "Exchange Rate", feesLabel = "Transfer Fees", totalLabel = "Total Amount", error = "", receiverLabel = "They Receive", bright = false, extraContent, guest, receiverFee, isInvoice }) => {
    const { t } = useTranslation()

    const _exObj = data?.exchange_rate?.exchange_rate
    const exchangeRateValue = _exObj && typeof _exObj === "object" ? _exObj.exchange_rate : _exObj ?? data?.exchange_rate
    const exchangeRateSendingCurrency = data?.exchange_rate?.exchange_rate?.exchange_rate_sending_currency || data?.exchange_rate?.sending?.currency
    const exchangeRateCurrency = data?.exchange_rate?.exchange_rate?.exchange_rate_currency || data?.exchange_rate?.receiver?.currency
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
                    <div style={{ padding: guest && "12px", borderRadius: guest && '6px', gap: guest && ".3rem" }} className={styles.item}>
                        <span>{t(sendingLabel)}</span>
                        <p>{Number(cleanString(data?.exchange_rate?.sending?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {data.exchange_rate?.sending?.currency}</p>
                    </div>
                }
                {
                    data.exchange_rate?.receiver?.amount
                    &&
                    <div style={{ padding: guest && "12px", borderRadius: guest && '6px', gap: guest && ".3rem", background: guest && "rgba(109, 41, 220, 0.04)" }} className={styles.item}>
                        <span>{t(receiverLabel)}</span>
                        <p>{Number(cleanString(data?.exchange_rate?.receiver?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                            {data.exchange_rate?.receiver?.currency}
                            {(receiverFee || isInvoice) && ` (fee ${Number(cleanString(isInvoice ? data.exchange_rate?.service_fee?.amount : data?.exchange_rate?.fee?.paymentAddressFee))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} ${isInvoice ? data.exchange_rate?.service_fee?.currency : data.exchange_rate?.sending?.currency})`}
                        </p>
                    </div>
                }
                {
                    data.exchange_rate?.sending?.amount
                        &&
                        data.exchange_rate?.exchange_rate
                        &&
                        (data.wallet?.currency?.code ?? data.currency_wallet?.currency?.code) !== (data?.beneficiary_wallet?.currency?.code ?? data.recipient_currency)
                        &&
                        data.exchange_rate?.sending?.currency !== (data.exchange_rate?.exchange_rate_currency ?? data.exchange_rate?.receiver?.currency)
                        ?
                        <div className={styles.item}>
                            <span>{t(exchangeRateLabel)}</span>
                            <p className={styles.sm}>1.00 {exchangeRateSendingCurrency} = {(exchangeRateValue || exchangeRateValue === 0) ? Number(exchangeRateValue).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 7 }) : "?"} {exchangeRateCurrency}</p>
                        </div>
                        :
                        ""
                }
                {
                    data?.exchange_rate?.fee
                    &&
                    <div className={styles.fees}>
                        <Info color={bright ? "#BE9A08" : "white"} />
                        <span>{t(feesLabel)} {Number(isInvoice && data.exchange_rate?.topup_fee?.amount ? data.exchange_rate?.topup_fee?.amount : data?.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? "0.00"} {isInvoice && data.exchange_rate?.topup_fee?.currency ? data.exchange_rate?.topup_fee?.currency : data?.exchange_rate?.fee?.currency || data.exchange_rate?.sending?.currency}</span>
                    </div>
                }
                {
                    Boolean(data?.exchange_rate?.total)
                    &&
                    <div className={styles.item}>
                        <span>{t(totalLabel)}</span>
                        <p className={styles.lg}>{Number(cleanString(data?.exchange_rate?.total))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {data.exchange_rate?.total_currency ?? data.exchange_rate?.sending?.currency}</p>
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