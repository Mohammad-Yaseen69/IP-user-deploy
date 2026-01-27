import { useTranslation } from "react-i18next"
import styles from "./styles/feescomp.module.css"
import { Info } from "react-feather"
import { cleanString } from "../../../Helper/cleanString"

const FeesComponent = ({ data, sendingLabel = "Sending", exchangeRateLabel = "Exchange Rate", feesLabel = "Transfer Fees", totalLabel = "Total Amount", error = "", receiverLabel = "They Receive", bright = false, extraContent, guest, receiverFee, paypalValues = false }) => {
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
            <>
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
                                {receiverFee && ` (fee ${Number(cleanString(data?.exchange_rate?.fee?.paymentAddressFee))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} ${data.exchange_rate?.sending?.currency})`}
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
                            <span>{t(feesLabel)} {Number(data?.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) ?? "0.00"} {data?.exchange_rate?.fee?.currency || data.exchange_rate?.sending?.currency}</span>
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
                {
                    data.payment_type?.value === "paypal" && !data?.exchange_rate?.paypal?.paypal_currency_supported && paypalValues
                        ?
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: ".7rem",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    background: "rgba(255, 218, 68, 0.24)",
                                    marginTop: "1rem"
                                }}
                            >
                                <Info
                                    color="#BE9A08"
                                    size={20}
                                />
                                <span style={{
                                    color: '#BE9A08',
                                    fontFamily: 'Manrope',
                                    fontSize: ".7rem",
                                    fontStyle: 'normal',
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                    letterSpacing: '-0.28px'
                                }}>
                                    <strong>{data?.exchange_rate?.paypal?.fee?.currency}</strong> {t("is not supported by Paypal,")} <strong>USD</strong> {t("will be used as the default currency.")}
                                </span>
                            </div>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: ".9rem",
                                padding: ".8rem",
                                background: "#fff",
                                borderRadius: "6px",
                                boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{
                                        color: '#8A8A8A',
                                        fontFamily: 'Manrope',
                                        fontSize: ".7rem",
                                        fontStyle: 'normal',
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        letterSpacing: '-0.14px'
                                    }}>{t("Exchange Rate")}</span>
                                    <strong
                                        style={{
                                            color: '#000',
                                            fontFamily: 'Manrope',
                                            fontSize: ".7rem",
                                            fontStyle: 'normal',
                                            lineHeight: 1.5,
                                            letterSpacing: '-0.14px'
                                        }}>1.00 {data?.exchange_rate?.paypal?.fee?.currency} = {Number(data?.exchange_rate?.paypal?.paypal_rate?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD</strong>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{
                                        color: '#8A8A8A',
                                        fontFamily: 'Manrope',
                                        fontSize: ".7rem",
                                        fontStyle: 'normal',
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        letterSpacing: '-0.14px'
                                    }}>{t("Amount in USD")}</span>
                                    <strong style={{
                                        color: '#000',
                                        fontFamily: 'Manrope',
                                        fontSize: "1.2rem",
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: 1.7,
                                        letterSpacing: '-0.8px'
                                    }}>{Number(data?.exchange_rate?.paypal?.paypal_converted?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</strong>
                                </div>
                            </div>
                        </>
                        :
                        ""
                }

                {
                    data.payment_type?.value === "mobile_wallet" && data?.exchange_rate?.external_transaction_data
                        ?
                        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: ".3rem",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    background: "rgba(255, 218, 68, 0.24)",
                                    marginTop: "1rem"
                                }}
                            >
                                <Info
                                    color="#BE9A08"
                                    size={20}
                                />
                                <span style={{
                                    color: '#BE9A08',
                                    fontFamily: 'Manrope',
                                    fontSize: ".7rem",
                                    fontStyle: 'normal',
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                    letterSpacing: '-0.28px'
                                }}>
                                    <strong>
                                        {t("You'll pay the following amout through your mobile wallet.")}
                                    </strong>
                                </span>
                            </div>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: ".9rem",
                                padding: ".8rem",
                                background: "#fff",
                                borderRadius: "6px",
                                boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{
                                        color: '#8A8A8A',
                                        fontFamily: 'Manrope',
                                        fontSize: ".7rem",
                                        fontStyle: 'normal',
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        letterSpacing: '-0.14px'
                                    }}>{t(`Amount in ${data?.exchange_rate?.external_transaction_data?.total?.currency}`)}</span>
                                    <strong style={{
                                        color: '#000',
                                        fontFamily: 'Manrope',
                                        fontSize: "1.2rem",
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: 1.7,
                                        letterSpacing: '-0.8px'
                                    }}>{Number(data?.exchange_rate?.external_transaction_data?.total?.value)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.exchange_rate?.external_transaction_data?.total?.currency}</strong>
                                </div>
                            </div>
                        </div>
                        :
                        ""
                }
            </>
    )
}

export default FeesComponent