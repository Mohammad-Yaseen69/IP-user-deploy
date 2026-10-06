import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PAGES } from "../../../stateMachines/copyTrading"
import { clearWithdrawal, ensureRate, setWithdrawDraft } from "../api"
import { PAYOUT_FEE_USD_CENTS } from "../api/fixtures"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatAmount, formatAmountNumber, formatTime, formatUsd, parseAmount, parseDecimalToCents } from "../state/money"
import {
    activeStrategy,
    equityCents,
    estimatedNet,
    grossCentsForNet,
    openPositionsCount,
    unitsPerUsd,
    withdrawableCents,
    withdrawalInProgress,
} from "../state/selectors"
import styles from "../styles/copyTrading.module.css"
import { Intro, Split, SummaryPanel } from "../ui/layout"
import { Button, Rows, Section, Segmented, Timeline } from "../ui/primitives"
import { WithdrawFrame } from "./frames"
import { moneyMoves } from "./helpers"
import local from "./Withdraw.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

/* WEB-10. Only broker-reported available cash can be withdrawn; net requests become a new gross amount. */
const Withdraw = () => {
    const { t } = useTranslation()
    const ctx = useCopyTrading()
    const { state, go, receiving, openSupport } = ctx
    const strategy = activeStrategy(state)
    const { amountCents, mode, netAmount } = state.withdrawDraft
    /* Net amounts are quoted in the currency of the customer's first receiving account. */
    const payoutCurrency = receiving.accounts[0]?.currency || null
    const rate = unitsPerUsd(state, payoutCurrency)
    const netMode = mode === "net" && !!payoutCurrency
    const [netText, setNetText] = useState(() => (netAmount ? String(netAmount) : ""))
    const available = withdrawableCents(state)
    const [grossText, setGrossText] = useState(() => (amountCents / 100).toFixed(2))

    useEffect(() => {
        if (withdrawalInProgress(state)) go(PAGES.RELEASE)
    }, [])

    useEffect(() => {
        if (payoutCurrency) ensureRate(payoutCurrency)
    }, [payoutCurrency])

    const grossCents = netMode ? (netAmount ? grossCentsForNet(state, netAmount, payoutCurrency) : 0) : amountCents
    const net = payoutCurrency ? estimatedNet(state, grossCents, payoutCurrency) : null
    const tooMuch = grossCents > available
    const invalid = !grossCents || tooMuch
    const equity = equityCents(state)
    const cashShare = equity > 0 ? Math.min(100, (available / equity) * 100) : 0

    const changeGross = (value) => {
        const raw = value.replace(/[^\d.]/g, "")
        setGrossText(raw)
        setWithdrawDraft({ amountCents: parseDecimalToCents(raw) })
    }

    return (
        <WithdrawFrame
            ctx={ctx}
            current={0}
            title={t("Withdraw")}
            subtitle={t("Withdraw available cash, not total equity.")}
            asideTitle={formatUsd(grossCents, { decimals: false })}
            asideMeta={t("From {{name}} available cash", { name: strategy?.name })}
        >
            <Split
                side={(
                    <SummaryPanel
                        title={t("Summary")}
                        amountLabel={t("Withdraw")}
                        amount={formatUsd(grossCents, { decimals: false })}
                        rows={[
                            { label: t("Mode"), value: t(netMode ? "Exact amount received" : "Gross withdrawal") },
                            { label: t("Net recipient estimate"), value: net === null ? (payoutCurrency ? "…" : t("Add a receiving account")) : formatAmount(net, payoutCurrency) },
                            { label: t("Open positions"), value: t("Not affected") },
                        ]}
                        note={t("The maximum is checked against the broker's current withdrawable cash.")}
                        onSupport={openSupport}
                        actions={<Button size="lg" block disabled={invalid} onClick={() => { if (state.withdrawal) clearWithdrawal(); setWithdrawDraft({ amountCents: grossCents }); go(PAGES.RELEASE) }}>{t("Review release")}</Button>}
                        caption={t("Next: release and transfer to InstaPay")}
                    />
                )}
            >
                <div className={local.intro}>
                    <Intro eyebrow={t("Step {{n}} of {{total}}", { n: 1, total: 5 })} title={t("Withdraw available cash")} lead={t("Equity and margin figures are separate from the available withdrawal limit.")} />
                </div>

                <Section title={t("What you can withdraw")} aside={t("As of {{time}}", { time: formatTime(state.broker?.refreshedAt) })}>
                    <div
                        className={local.cashBar}
                        role="img"
                        aria-label={t("Available cash as a share of equity")}
                    >
                        <span className={local.cashFill} style={{ width: `${cashShare}%` }} />
                    </div>
                    <Rows items={[
                        { label: t("Available to withdraw"), value: formatUsd(available), tone: "success" },
                        { label: t("Open positions"), value: t("{{count}} · unchanged by this request", { count: openPositionsCount(state) }) },
                    ]} />
                </Section>

                <Section title={t("Amount")}>
                    <div className={local.amountBody}>
                        <Segmented
                            label={t("Amount mode")}
                            value={netMode ? "net" : "gross"}
                            onChange={(value) => {
                                if (value !== "net") return setWithdrawDraft({ mode: value })
                                const estimate = Math.floor(estimatedNet(state, amountCents, payoutCurrency) || 0)
                                setNetText(estimate ? String(estimate) : "")
                                setWithdrawDraft({ mode: value, netAmount: estimate })
                            }}
                            options={[
                                { value: "gross", label: t("Gross USD") },
                                ...(payoutCurrency ? [{ value: "net", label: t("Net {{currency}}", { currency: payoutCurrency }) }] : []),
                            ]}
                        />
                        <label className={styles.fieldLabel} htmlFor="ct-withdraw">
                            {netMode ? t("Amount you want to receive · {{currency}}", { currency: payoutCurrency }) : t("Broker cash to withdraw · USD")}
                        </label>
                        {netMode ? (
                            <input
                                id="ct-withdraw"
                                className={cx(styles.input, tooMuch && styles.inputError)}
                                inputMode="decimal"
                                value={netText ? `${netText} ${payoutCurrency}` : ""}
                                onChange={e => {
                                    const raw = e.target.value.replace(/[^d.]/g, "")
                                    setNetText(raw)
                                    setWithdrawDraft({ netAmount: parseAmount(raw, payoutCurrency) })
                                }}
                                aria-invalid={tooMuch}
                            />
                        ) : (
                            <input
                                id="ct-withdraw"
                                className={cx(styles.input, tooMuch && styles.inputError)}
                                inputMode="decimal"
                                value={grossText ? `${grossText} USD` : ""}
                                onChange={e => changeGross(e.target.value)}
                                aria-invalid={tooMuch}
                            />
                        )}
                        <p className={cx(styles.hint, tooMuch && styles.hintError)}>
                            {tooMuch
                                ? t("This is more than your available cash ({{amount}}). Open positions are never closed to cover it.", { amount: formatUsd(available) })
                                : payoutCurrency && rate && payoutCurrency !== "USD"
                                    ? t("Conversion: {{rate}} {{currency}} per USD. Payout fee: {{fee}} deducted. Net requests are converted into a new gross debit.", { rate: formatAmountNumber(rate, payoutCurrency), currency: payoutCurrency, fee: formatUsd(PAYOUT_FEE_USD_CENTS) })
                                    : t("Payout fee: {{fee}} deducted. Net requests are converted into a new gross debit.", { fee: formatUsd(PAYOUT_FEE_USD_CENTS) })}
                        </p>
                    </div>
                </Section>

                <Section title={t("How your money moves")} aside={t("Each step is tracked")}>
                    <Timeline items={moneyMoves(t)} />
                </Section>
            </Split>
        </WithdrawFrame>
    )
}

export default Withdraw
