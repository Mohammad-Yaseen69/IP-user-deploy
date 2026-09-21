import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import convertStyles from "../../VirtualIBAN/ConvertFundsModal/convertFunds.module.scss"
import styles from "./sendCrypto.module.scss"
import { getProtocolLabel } from "./cryptoProtocols"

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="#5926F0" strokeWidth="1.5" />
        <path d="M8 4.5V8L10.5 9.5" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const DangerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 10.75C7.59 10.75 7.25 10.41 7.25 10C7.25 9.59 7.59 9.25 8 9.25C8.41 9.25 8.75 9.59 8.75 10C8.75 10.41 8.41 10.75 8 10.75ZM8.75 7.75H7.25V5.25H8.75V7.75Z" fill="#b42318" />
    </svg>
)

const formatTimeLeft = (seconds) => {
    const safe = Math.max(0, seconds)
    const minutes = Math.floor(safe / 60)
    const remainder = safe % 60
    return `${minutes}:${String(remainder).padStart(2, "0")}`
}

const formatMoney = (value, currency) => {
    const amount = Number(value ?? 0)
    return `${Number.isFinite(amount) ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : value} ${currency}`
}

const boundaryAddress = (address) => {
    const value = String(address || "")
    if (value.length <= 12) return value
    return `${value.slice(0, 6)}......${value.slice(-6)}`
}

const ReviewStep = ({
    feeDetails,
    address,
    protocol,
    cryptoCurrency,
    beneficiaryName,
    confirmedNetwork,
    setConfirmedNetwork,
    quoteExpiresAt,
    isQuoteExpired,
    onRefreshQuote,
    isRefreshing,
}) => {
    const { t } = useTranslation()
    const [secondsLeft, setSecondsLeft] = useState(0)

    useEffect(() => {
        if (!quoteExpiresAt) return undefined

        const tick = () => setSecondsLeft(Math.max(0, Math.round((quoteExpiresAt - Date.now()) / 1000)))
        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [quoteExpiresAt])

    const totalCurrency = feeDetails?.total?.currency || cryptoCurrency
    const networkLabel = getProtocolLabel(protocol)

    return (
        <div>
            <div className={convertStyles.reviewLabel}>{t("Review & Confirm")}</div>

            {isQuoteExpired ? (
                <div className={styles.expiredBox}>
                    <span className={styles.expiredText}>
                        {t("Quote expired or invalid. Please retry.")}
                    </span>
                    <button
                        type="button"
                        className={styles.refreshQuoteBtn}
                        onClick={onRefreshQuote}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? t("Updating...") : t("Refresh quote")}
                    </button>
                </div>
            ) : (
                <div className={convertStyles.quoteTimerBox}>
                    <div className={convertStyles.timerContent}>
                        <ClockIcon />
                        <span className={convertStyles.timerText}>
                            {t("This quote expires in")}{" "}
                            <strong className={convertStyles.timerSeconds}>{formatTimeLeft(secondsLeft)}</strong>
                        </span>
                    </div>
                </div>
            )}

            <div className={convertStyles.reviewTable}>
                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("You send")}</div>
                    <div className={convertStyles.reviewRowValue}>
                        {formatMoney(feeDetails?.total?.value, totalCurrency)}
                    </div>
                </div>

                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("Our fee")}</div>
                    <div className={convertStyles.reviewRowValue} style={{ color: "#d92d20" }}>
                        -{formatMoney(feeDetails?.fee?.value, feeDetails?.fee?.currency || totalCurrency)}
                    </div>
                </div>

                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("Network fee")}</div>
                    <div className={convertStyles.reviewRowValue} style={{ color: "#d92d20" }}>
                        -{formatMoney(feeDetails?.network_fee?.value, feeDetails?.network_fee?.currency || totalCurrency)}
                    </div>
                </div>

                <div className={convertStyles.reviewRow} style={{ background: "#f2eeff" }}>
                    <div className={convertStyles.reviewRowLabel} style={{ fontWeight: 600, color: "#5926f0" }}>
                        {t("Recipient receives")}
                    </div>
                    <div
                        className={convertStyles.reviewRowValue}
                        style={{ fontWeight: 700, color: "#5926f0", fontSize: "16px" }}
                    >
                        {formatMoney(feeDetails?.recipient?.value, feeDetails?.recipient?.currency || totalCurrency)}
                    </div>
                </div>

                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("Beneficiary")}</div>
                    <div className={convertStyles.reviewRowValue}>{beneficiaryName}</div>
                </div>

                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("Network")}</div>
                    <div className={convertStyles.reviewRowValue}>
                        <span className={styles.networkStrong}>{networkLabel}</span>
                    </div>
                </div>

                <div className={convertStyles.reviewRow}>
                    <div className={convertStyles.reviewRowLabel}>{t("Destination address")}</div>
                    <div className={`${convertStyles.reviewRowValue} ${styles.monoValue}`}>
                        {boundaryAddress(address)}
                    </div>
                </div>
            </div>

            <div className={styles.dangerBox}>
                <DangerIcon />
                <span className={styles.dangerText}>
                    {t("Sending to the wrong network will result in permanent loss of funds. This cannot be reversed.")}
                </span>
            </div>

            <label className={styles.confirmRow}>
                <input
                    type="checkbox"
                    checked={confirmedNetwork}
                    onChange={(event) => setConfirmedNetwork(event.target.checked)}
                />
                <span>
                    {t("I confirm the recipient supports")} <strong>{cryptoCurrency}</strong> {t("on")}{" "}
                    <strong>{networkLabel}</strong>
                </span>
            </label>
        </div>
    )
}

export default ReviewStep
