import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { PAGES } from "../../../stateMachines/copyTrading"
import AddAccountFlow from "../../Settings/WithdrawalsNew/AddAccountFlow"
import { createPayoutQuote, setPayoutDestination } from "../api"
import checkCircleIcon from "../assets/figma/wd-check-circle-success.svg"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatUsd } from "../state/money"
import { activeStrategy } from "../state/selectors"
import styles from "../styles/copyTrading.module.css"
import DestinationDialog from "../ui/DestinationDialog"
import { Intro, Split, SummaryPanel } from "../ui/layout"
import { Button, Rows, Section } from "../ui/primitives"
import { WithdrawFrame } from "./frames"
import local from "./Destination.module.css"

const METHOD_LABELS = { mobile_wallet: "Mobile Wallet", bank_account: "Bank Account", cash_pickup: "Cash Pickup" }

/* Step 3 of the withdrawal: pick an own, verified receiving account (WEB-11 dialog). */
const Destination = () => {
    const { t } = useTranslation()
    const ctx = useCopyTrading()
    const { state, go, customer, receiving, openSupport } = ctx
    const strategy = activeStrategy(state)
    const { withdrawal } = state
    const destination = withdrawal?.destination
    const [dialogOpen, setDialogOpen] = useState(!destination)
    const [adding, setAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!destination) setDialogOpen(true)
    }, [destination])

    const reviewPayout = async () => {
        setLoading(true)
        try {
            await createPayoutQuote()
            go(PAGES.PAYOUT)
        } finally {
            setLoading(false)
        }
    }

    const amount = formatUsd(withdrawal?.amountCents || 0, { decimals: false })

    return (
        <WithdrawFrame
            ctx={ctx}
            current={2}
            title={t("Withdraw")}
            subtitle={t("Withdraw available cash from {{name}}", { name: strategy?.name })}
            asideTitle={amount}
            asideMeta={t("From {{name}} available cash", { name: strategy?.name })}
            metas={{ 0: t("{{amount}} gross", { amount }), 1: t("Credited to InstaPay") }}
        >
            <Split
                side={(
                    <SummaryPanel
                        title={t("Summary")}
                        amountLabel={t("Payout draft")}
                        amount={amount}
                        rows={[
                            { label: t("Released funds"), value: t("Confirmed") },
                            { label: t("Receiving country"), value: destination?.countryName || t("Not chosen yet") },
                            { label: t("Owner"), value: customer.name },
                        ]}
                        note={t("Payouts go only to receiving accounts saved in your own name under Settings → Withdrawals.")}
                        onSupport={openSupport}
                        actions={<Button size="lg" block disabled={!destination} loading={loading} onClick={reviewPayout}>{t("Review payout")}</Button>}
                        caption={t("Next: review payout")}
                    />
                )}
            >
                <div className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
                    <img src={checkCircleIcon} alt="" />
                    <div className={local.noticeText}>{t("Release and transfer to InstaPay completed.")}</div>
                </div>

                <div className={local.intro}>
                    <Intro eyebrow={t("Step {{n}} of {{total}}", { n: 3, total: 5 })} title={t("Choose where to send it")} lead={t("Pick one of your InstaPay receiving accounts.")} />
                </div>

                <Section title={t("Destination")}>
                    <Rows items={[
                        { label: t("Country"), value: destination?.countryName || t("Not chosen yet") },
                        { label: t("Method"), value: destination ? t(METHOD_LABELS[destination.method] || destination.method) : t("Not chosen yet") },
                        { label: t("Receiving account"), value: destination ? `${destination.providerLabel}${destination.last4 ? ` · ${t("ending {{last4}}", { last4: destination.last4 })}` : ""}` : t("Not chosen yet") },
                        destination && { label: t("Payout currency"), value: destination.currency },
                        withdrawal?.purpose && { label: t("Purpose"), value: t(withdrawal.purpose) },
                    ]} />
                    <div>
                        <Button variant="secondary" onClick={() => setDialogOpen(true)}>{t(destination ? "Change destination" : "Choose destination")}</Button>
                    </div>
                </Section>
            </Split>

            <DestinationDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                accounts={receiving.accounts}
                loaded={receiving.loaded}
                canAdd={receiving.canAdd}
                ownerName={customer.name}
                initial={destination ? { ...destination, purpose: withdrawal?.purpose } : null}
                onAddAccount={() => { setDialogOpen(false); setAdding(true) }}
                onConfirm={(account, purpose) => setPayoutDestination(account, purpose)}
            />
            {/* The same flow as Settings → Withdrawals; the new account appears in the dialog once saved. */}
            <AddAccountFlow
                open={adding}
                onClose={() => { setAdding(false); setDialogOpen(true) }}
                mode="create"
                countries={receiving.countries}
                groups={receiving.groups}
                cryptoRows={receiving.cryptoRows}
            />
        </WithdrawFrame>
    )
}

export default Destination
