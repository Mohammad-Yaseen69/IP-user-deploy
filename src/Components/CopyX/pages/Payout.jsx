import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useIdempotency } from "../../../hooks/Payments/useIdempotency"
import { PAGES } from "../../../stateMachines/copyTrading"
import { createPayoutQuote, isQuoteExpired, submitPayout } from "../api"
import bankIcon from "../assets/figma/fund-bank.svg"
import coinsIcon from "../assets/figma/coins.svg"
import lockIcon from "../assets/figma/lock-button.svg"
import mobileIcon from "../assets/figma/wd-mobile-18.svg"
import receiptIcon from "../assets/figma/wd-receipt.svg"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatAmount, formatUsd } from "../state/money"
import { activeStrategy } from "../state/selectors"
import { Intro, Split, SummaryPanel } from "../ui/layout"
import { Button, DetailRow, QuoteExpiry, Section } from "../ui/primitives"
import SecureAuthModal from "../ui/SecureAuthModal"
import { WithdrawFrame } from "./frames"
import local from "./Payout.module.css"

const LockIcon = () => <img src={lockIcon} alt="" />

/* WEB-12. Any change of destination or purpose creates a new quote and a new authorization. */
const Payout = () => {
    const { t } = useTranslation()
    const ctx = useCopyTrading()
    const { state, go, customer, openSupport } = ctx
    const strategy = activeStrategy(state)
    const { withdrawal } = state
    const { quote, destination } = withdrawal
    const { getKey, reset } = useIdempotency()
    const [authOpen, setAuthOpen] = useState(false)
    const [expired, setExpired] = useState(false)
    const [quoting, setQuoting] = useState(false)

    const requote = async () => {
        setQuoting(true)
        setExpired(false)
        reset()
        try {
            await createPayoutQuote()
        } finally {
            setQuoting(false)
        }
    }

    useEffect(() => {
        if (!quote) requote()
    }, [quote])

    const stale = expired || (quote && isQuoteExpired(quote))
    const amount = formatUsd(withdrawal.amountCents, { decimals: false })
    const account = `${destination.providerLabel} · ${t("ending {{last4}}", { last4: destination.last4 })}`

    return (
        <WithdrawFrame
            ctx={ctx}
            current={3}
            title={t("Review payout")}
            subtitle={t("Review the amount you will receive")}
            asideTitle={amount}
            asideMeta={t("From {{name}} available cash", { name: strategy?.name })}
            metas={{ 0: t("{{amount}} gross", { amount }), 1: t("Credited to InstaPay"), 2: account }}
        >
            <Split
                side={(
                    <SummaryPanel
                        title={t("Quote")}
                        badge={quote && !stale && <QuoteExpiry expiresAt={quote.expiresAt} onExpire={() => setExpired(true)} />}
                        amountLabel={t("Recipient receives")}
                        amount={quote ? formatAmount(quote.net, quote.currency) : "…"}
                        rows={quote ? [
                            { label: t("Broker cash withdrawn"), value: formatUsd(quote.amountCents, { decimals: false }) },
                            { label: t("Exchange rate"), value: `1 USD = ${formatAmount(quote.rate, quote.currency)}` },
                            { label: t("Converted amount"), value: formatAmount(quote.converted, quote.currency) },
                            { label: t("Payout fee deducted"), value: formatAmount(quote.fee, quote.currency) },
                            { label: t("Total debit"), value: formatUsd(quote.amountCents, { decimals: false }) },
                            { label: t("Estimated arrival"), value: t(quote.eta) },
                        ] : []}
                        note={t("Fees charged on top would require a different total-debit quote. No PIN, OTP or payment credentials in chat.")}
                        onSupport={openSupport}
                        actions={stale
                            ? <Button size="lg" block onClick={requote} loading={quoting}>{t("Get a new quote")}</Button>
                            : <Button size="lg" block icon={LockIcon} disabled={!quote} onClick={() => setAuthOpen(true)}>{t("Authorize payout")}</Button>}
                        caption={t("Next: track delivery")}
                    />
                )}
            >
                <div className={local.intro}>
                    <Intro eyebrow={t("Step {{n}} of {{total}}", { n: 4, total: 5 })} title={t("Review the amount you will receive")} lead={t("A changed amount or destination creates a new quote and requires new authorization.")} />
                </div>

                <Section title={t("Details")}>
                    <div className={local.details}>
                        <DetailRow
                            icon={destination.method === "bank_account" ? bankIcon : mobileIcon}
                            title={account}
                            subtitle={t("Owner · {{name}} · Verified", { name: customer.name })}
                            actionLabel={t("Change")}
                            onAction={() => go(PAGES.DESTINATION)}
                        />
                        <DetailRow icon={receiptIcon} title={t(withdrawal.purpose)} subtitle={t("Purpose of payment")} actionLabel={t("Change")} onAction={() => go(PAGES.DESTINATION)} />
                        <DetailRow icon={coinsIcon} title={amount} subtitle={t("Amount · gross, fees deducted")} />
                    </div>
                </Section>
            </Split>

            <SecureAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                title={t("Authorize payout")}
                confirmLabel={t("Authorize payout")}
                rows={quote ? [
                    { label: t("To"), value: account },
                    { label: t("Recipient receives"), value: formatAmount(quote.net, quote.currency) },
                    { label: t("Total debit"), value: formatUsd(quote.amountCents, { decimals: false }) },
                ] : []}
                onAuthorize={async () => {
                    await submitPayout({ idempotencyKey: getKey() })
                    setAuthOpen(false)
                    go(PAGES.PAYOUT_STATUS)
                }}
            />
        </WithdrawFrame>
    )
}

export default Payout
