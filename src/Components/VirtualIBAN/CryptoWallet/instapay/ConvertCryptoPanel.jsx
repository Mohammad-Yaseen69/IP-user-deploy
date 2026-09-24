import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { Repeat } from "react-feather"
import styles from "../cryptoPage.module.scss"
import RailSelect from "./RailSelect"
import { formatWalletAmount, getWalletAvailable } from "./wallets"
import { getAssetSymbol, getWalletAccentColor } from "../utils/format"
import { useWalletConversion } from "../../../../hooks/Payments/useWalletConversion"
import {
    formatAmountValue,
    handleAmountInputBlur,
    handleAmountInputChange,
    handleAmountInputKeyUp,
} from "../../utils/amount"
import ConversionModal from "../../../HomeNewUpdated/ConversionModal"

const QUICK_PERCENTAGES = [25, 50, 75, 100]

const money = (value, currency, max = 8) => {
    const num = Number(value)
    return `${Number.isFinite(num) ? num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: max }) : "-"} ${currency || ""}`.trim()
}

/* A fiat wallet keeps its code in the circle; a crypto one gets its glyph. */
const walletOption = (wallet, t) => {
    const code = wallet?.currency?.code
    const crypto = wallet?.wallet_type === "crypto"
    return {
        value: wallet?._id,
        label: `${code} ${t("Wallet")}`,
        wallet,
        render: () => (
            <>
                <span
                    className={styles.railAvatar}
                    style={crypto ? { background: getWalletAccentColor(code), color: "#fff" } : undefined}
                >
                    {crypto ? getAssetSymbol(code) : code?.slice(0, 2)}
                </span>
                <span className={styles.railSelectMain}>{code} {t("Wallet")}</span>
                <span className={styles.railSelectValue}>{formatWalletAmount(getWalletAvailable(wallet))} {code}</span>
            </>
        ),
    }
}

/**
 * Convert drawn to the crypto hub design: amount on top, the wallet paid from, a swap,
 * the wallet paid into, and the live quote underneath. Confirming hands the quote to
 * the same ConversionModal My Wallets uses, so the money moves through one path.
 */
const ConvertCryptoPanel = ({ wallet }) => {
    const { t } = useTranslation()
    const fx = useWalletConversion(wallet)
    const queryClient = useQueryClient()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [converted, setConverted] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(0)

    useEffect(() => {
        if (!fx.quoteExpiresAt) {
            setSecondsLeft(0)
            return undefined
        }
        const tick = () => setSecondsLeft(Math.max(0, Math.round((fx.quoteExpiresAt - Date.now()) / 1000)))
        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [fx.quoteExpiresAt])

    /* An expired quote is fetched again on its own while nothing is being confirmed. */
    useEffect(() => {
        if (fx.isQuoteExpired && !confirmOpen) fx.refreshQuote()
    }, [fx.isQuoteExpired, confirmOpen])

    /* The receipt in the modal still reads the quote, so the panel clears once it closes. */
    const closeConfirm = () => {
        setConfirmOpen(false)
        if (converted) {
            setConverted(false)
            fx.reset()
        }
    }

    const onConverted = () => {
        setConverted(true)
        queryClient.invalidateQueries({ queryKey: ["crypto", "portfolio"] })
    }

    const fromCode = fx.senderWallet?.currency?.code || ""
    const toCode = fx.receiverWallet?.currency?.code || ""
    const quote = fx.quote

    const quickAmounts = QUICK_PERCENTAGES
        .map((percent) => ({ percent, value: Number(((fx.balance * percent) / 100).toFixed(2)) }))
        .filter(({ value }) => value > 0)

    const feeCurrency = quote?.fee?.currency || fromCode

    if (!fx.canConvert) {
        return (
            <div className={styles.railBody}>
                <div className={styles.placeholder}>
                    <h5 className={styles.placeholderTitle}>{t("Convert")}</h5>
                    <p className={styles.placeholderText}>
                        {t("You need one crypto wallet and one fiat wallet to convert here.")}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className={styles.railAmount}>
                <div className={styles.railAmountLabel}>{t("Enter amount")}</div>
                <div className={styles.railAmountRow}>
                    <input
                        className={styles.railAmountInput}
                        type="text"
                        inputMode="decimal"
                        value={fx.amount}
                        onChange={(event) => handleAmountInputChange(event, fx.setAmount)}
                        onKeyUp={(event) => handleAmountInputKeyUp(event, fx.setAmount)}
                        onBlur={(event) => handleAmountInputBlur(event, fx.setAmount)}
                        style={{ width: `${Math.max(String(fx.amount || "0.00").length, 1) + 0.5}ch` }}
                        placeholder="0.00"
                        maxLength={12}
                        disabled={!fx.senderWallet}
                    />
                </div>
                {fx.insufficient
                    ? <div className={styles.railAmountError}>{t("Insufficient Balance in PKR").replace("PKR", fromCode)}</div>
                    : (
                        <div className={styles.railAmountHint}>
                            {t("Available")}: <strong>{formatWalletAmount(fx.balance)} {fromCode}</strong>
                        </div>
                    )}
                {quickAmounts.length > 0 && (
                    <div className={styles.railQuick}>
                        {quickAmounts.map(({ percent, value }) => (
                            <button
                                key={percent}
                                type="button"
                                className={`${styles.railQuickBtn} ${fx.numericAmount === value ? styles.railQuickBtnActive : ""}`}
                                onClick={() => fx.setAmount(formatAmountValue(value))}
                            >
                                {percent}%
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.railBody}>
                <div>
                    <span className={styles.railLabel}>{t("Pay from wallet")}</span>
                    <RailSelect
                        value={fx.senderWallet?._id}
                        options={fx.wallets.map((item) => walletOption(item, t))}
                        onChange={(option) => fx.selectSender(option.value)}
                        placeholder={t("Choose a wallet")}
                    />
                </div>

                <div className={styles.railSwapRow}>
                    <span className={styles.railSwapLine} />
                    <button
                        type="button"
                        className={styles.railSwapBtn}
                        onClick={fx.swap}
                        disabled={!fx.receiverWallet}
                        aria-label={t("Swap wallets")}
                    >
                        <Repeat size={12} />
                    </button>
                    <span className={styles.railSwapLine} />
                </div>

                <div>
                    <span className={styles.railLabel}>{t("To")}</span>
                    <RailSelect
                        value={fx.receiverWallet?._id}
                        options={fx.receiverOptions.map((item) => walletOption(item, t))}
                        onChange={(option) => fx.selectReceiver(option.value)}
                        placeholder={t("Choose a wallet")}
                        emptyText={fx.senderWallet?.wallet_type === "crypto"
                            ? t("No fiat wallet to convert into.")
                            : t("No crypto wallet to convert into.")}
                    />
                </div>

                {fx.error && <p className={styles.railFieldError}>{t(fx.error)}</p>}

                <div className={styles.quoteCard}>
                    <div className={styles.quoteRow}>
                        <span>{t("Rate")}</span>
                        <strong>
                            {quote?.exchange_rate
                                ? `1 ${fromCode} = ${money(quote.exchange_rate, toCode, 6)}`
                                : fx.loading ? t("Fetching Rates...") : "-"}
                        </strong>
                    </div>
                    <div className={styles.quoteRow}>
                        <span>{t("You convert")}</span>
                        <strong>{fx.numericAmount > 0 ? money(fx.numericAmount, fromCode, 6) : "-"}</strong>
                    </div>
                    <div className={styles.quoteRow}>
                        <span>{t("Conversion fee")}</span>
                        <strong>{quote ? money(quote.fee?.amount, feeCurrency) : "-"}</strong>
                    </div>
                    <span className={styles.quoteDivider} />
                    <div className={`${styles.quoteRow} ${styles.quoteRowTotal}`}>
                        <span>{t("You receive")}</span>
                        <strong>{quote ? money(quote.receiver?.amount, quote.receiver?.currency || toCode) : "-"}</strong>
                    </div>
                    <div className={styles.quoteRow}>
                        <span>{t("Quote refreshes in")}</span>
                        <strong className={styles.quoteTimer}>
                            {fx.loading ? "…" : quote ? `${secondsLeft}s` : "-"}
                        </strong>
                    </div>
                </div>

                <button
                    type="button"
                    className={`${styles.railSubmit} ${styles.railSubmitGradient}`}
                    disabled={!fx.isReady}
                    onClick={() => setConfirmOpen(true)}
                >
                    {fx.loading ? t("Fetching Rates...") : <>{t("Convert")} {"›››"}</>}
                </button>
            </div>

            <ConversionModal
                isOpen={confirmOpen}
                toggleModal={() => (confirmOpen ? closeConfirm() : setConfirmOpen(true))}
                onSuccess={onConverted}
                amount={String(fx.numericAmount)}
                exchangeAmount={quote?.receiver?.amount}
                currency={fromCode}
                exchangeCurrency={toCode}
                exchangePrice={quote?.exchange_rate}
                exchangeFee={quote ? money(quote.fee?.amount, feeCurrency, 2) : ""}
                fxDet={quote || {}}
                senderWallet={fx.senderWallet}
                receiverWallet={fx.receiverWallet}
                quoteExpiresAt={fx.quoteExpiresAt}
                isQuoteExpired={fx.isQuoteExpired}
                onRefreshQuote={fx.refreshQuote}
                isRefreshing={fx.loading}
            />
        </>
    )
}

export default ConvertCryptoPanel
