import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { OP_STATUS, PAGES, STAGE } from "../../../stateMachines/copyTrading"
import { retryPayout } from "../api"
import checkCircleIcon from "../assets/figma/po-check-circle.svg"
import infoIcon from "../assets/figma/info.svg"
import receiptIcon from "../assets/figma/po-receipt.svg"
import warningIcon from "../assets/figma/po-warning.svg"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatAmount, formatDateTime, formatTime, formatUsd } from "../state/money"
import styles from "../styles/copyTrading.module.css"
import { Split, SummaryPanel } from "../ui/layout"
import { Modal } from "../ui/overlays"
import { Badge, Button, Rows, Section, Timeline } from "../ui/primitives"
import { WithdrawFrame } from "./frames"
import page from "./PayoutStatus.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

const VIEW = {
    [OP_STATUS.PROCESSING]: { tone: "processing", badgeTone: "neutral", badge: "Processing", status: "Processing", eyebrow: "Processing", title: "Payout is processing", lead: "Submission is not delivery. We keep tracking the existing operation." },
    [OP_STATUS.COMPLETED]: { tone: "success", badgeTone: "neutral", badge: "Receipt", status: "Delivered", eyebrow: "Complete", title: "Payout delivered", lead: "Trading balances must be refreshed from the broker after a withdrawal; positions continue to move." },
    [OP_STATUS.ACTION_REQUIRED]: { tone: "warning", badgeTone: "warning", badge: "Action required", status: "Awaiting your action", eyebrow: "Action required", title: "Receiving details require review", lead: "Delivery has not been confirmed yet." },
    [OP_STATUS.FAILED]: { tone: "error", badgeTone: "error", badge: "Failed", status: "Failed", eyebrow: "Failed", title: "Payout failed", lead: "The provider could not deliver the payout. Your released funds stay in InstaPay." },
    [OP_STATUS.REVERSED]: { tone: "error", badgeTone: "error", badge: "Reversed", status: "Reversed", eyebrow: "Reversed", title: "Payout reversed", lead: "The amount is back in your InstaPay account. Your release is kept, so only the payout is redone." },
}

const NOTICE = {
    [OP_STATUS.PROCESSING]: ["info", "Track the existing operation. A timeout must not cause a second payout."],
    [OP_STATUS.COMPLETED]: ["success", "Payout delivered and confirmed by the provider."],
    [OP_STATUS.ACTION_REQUIRED]: ["warning", "Provider requests verified receiving details. Resolve the existing operation before resubmitting."],
    [OP_STATUS.FAILED]: ["error", "The payout did not go through."],
    [OP_STATUS.REVERSED]: ["error", "The payout was reversed."],
}

const NOTICE_ICON = { info: infoIcon, success: checkCircleIcon, warning: warningIcon, error: warningIcon }

const ReceiptIcon = () => <img src={receiptIcon} alt="" />

const dateFormat = (lng, options) => new Intl.DateTimeFormat(lng?.startsWith("fr") ? "fr-FR" : "en-US", options)

/* Provider timestamps are shown in UTC so they match the operation record. */
const formatUtcTime = (iso, lng) => (iso ? dateFormat(lng, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(iso)) : "")
const formatFullDateTime = (iso, lng) => (iso ? dateFormat(lng, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "")

/* WEB-12b processing, WEB-13 delivered, WEB-13b action required. A receipt exists only after delivery. */
const PayoutStatus = () => {
    const { t, i18n } = useTranslation()
    const ctx = useCopyTrading()
    const { state, go, customer, openSupport } = ctx
    const { withdrawal } = state
    const { payout } = withdrawal
    const [receiptOpen, setReceiptOpen] = useState(false)
    const sectionsRef = useRef(null)

    const view = VIEW[payout.status] || VIEW[OP_STATUS.PROCESSING]
    const [noticeTone, noticeText] = NOTICE[payout.status] || NOTICE[OP_STATUS.PROCESSING]
    const delivered = payout.status === OP_STATUS.COMPLETED
    const processing = payout.status === OP_STATUS.PROCESSING || !VIEW[payout.status]
    const needsAction = [OP_STATUS.ACTION_REQUIRED, OP_STATUS.FAILED, OP_STATUS.REVERSED].includes(payout.status)
    const ending = t("ending {{last4}}", { last4: payout.destination.last4 })
    const destination = `${payout.destination.providerLabel} · ${ending}`
    const amount = formatUsd(withdrawal.amountCents, { decimals: false })
    const lastUpdate = payout.completedAt || payout.stages.reduce((latest, stage) => (stage.at && stage.at > latest ? stage.at : latest), payout.createdAt)
    const statusAside = processing
        ? `${t(view.status)} · ${formatDateTime(lastUpdate)}`
        : `${t(delivered ? "Delivered" : view.badge)} ${formatDateTime(lastUpdate)}`

    const receiptRows = [
        { label: t("Operation ID"), value: payout.id },
        { label: t("Provider"), value: payout.destination.providerLabel },
        { label: t("To"), value: `${customer.name} · ${ending}` },
        { label: t("Broker cash withdrawn"), value: formatUsd(payout.quote.amountCents, { decimals: false }) },
        { label: t("Payout fee"), value: formatAmount(payout.quote.fee, payout.quote.currency) },
        delivered
            ? { label: t("Completed"), value: formatFullDateTime(payout.completedAt, i18n.language) }
            : { label: t("Status"), value: t(view.status) },
    ]

    /* "Delivered" is only shown once the provider confirms it; until then the stage reads as pending. */
    const timeline = payout.stages.map((stage) => {
        const done = stage.state === STAGE.DONE
        const time = stage.at ? t("{{time}} UTC", { time: formatUtcTime(stage.at, i18n.language) }) : null
        const isDelivery = stage.key === "delivered"
        return {
            ...stage,
            label: isDelivery && !done && stage.label === "Delivered" ? "Delivery pending" : stage.label,
            hint: stage.hint
                ? t(stage.hint)
                : isDelivery && done && stage.at ? t("{{time}} UTC · provider acknowledgment", { time: formatUtcTime(stage.at, i18n.language) })
                    : time || (isDelivery ? t("Awaiting provider acknowledgment") : null),
        }
    })

    const changeDestination = async () => {
        await retryPayout()
        go(PAGES.DESTINATION)
    }

    const trackPayout = () => sectionsRef.current?.firstElementChild?.scrollIntoView({ behavior: "smooth", block: "start" })

    const primaryAction = delivered
        ? <Button size="lg" block icon={ReceiptIcon} onClick={() => setReceiptOpen(true)}>{t("View receipt")}</Button>
        : needsAction
            ? <Button size="lg" block icon={ReceiptIcon} onClick={changeDestination}>{t("Review receiving account")}</Button>
            : <Button size="lg" block icon={ReceiptIcon} onClick={trackPayout}>{t("Track payout")}</Button>

    return (
        <WithdrawFrame
            ctx={ctx}
            current={delivered ? 5 : 4}
            pendingLast={!delivered}
            title={t("Payout")}
            subtitle={payout.id}
            asideTitle={formatAmount(payout.quote.net, payout.quote.currency)}
            asideMeta={delivered ? t("Delivered to {{account}}", { account: destination }) : t("Not yet delivered")}
            metas={{ 0: t("{{amount}} gross", { amount }), 1: t("Credited to InstaPay"), 2: destination, 3: t("Authorized {{time}}", { time: formatTime(payout.createdAt) }), 4: delivered ? null : t(processing ? "Delivery pending" : view.badge) }}
        >
            <Split
                side={(
                    <SummaryPanel
                        title={t(delivered ? "Payout receipt" : "Payout status")}
                        badge={<Badge tone={view.badgeTone}>{t(view.badge)}</Badge>}
                        amountLabel={t(delivered ? "Recipient received" : processing ? "Net amount" : "Recipient will receive")}
                        amount={formatAmount(payout.quote.net, payout.quote.currency)}
                        rows={receiptRows}
                        onSupport={openSupport}
                        actions={(
                            <div className={page.actions}>
                                {primaryAction}
                                <Button size="lg" block variant="secondary" onClick={() => (needsAction ? openSupport() : go(PAGES.WORKSPACE))}>
                                    {t(needsAction ? "Contact support" : "Back to copying")}
                                </Button>
                            </div>
                        )}
                        caption={t("Questions about this payout? Talk to support.")}
                    />
                )}
            >
                <div className={cx(styles.notice, page[`notice_${noticeTone}`])} role={noticeTone === "error" ? "alert" : "status"}>
                    <img src={NOTICE_ICON[noticeTone]} alt="" />
                    <p className={page.noticeText}>{t(noticeText)}</p>
                </div>

                <div className={styles.introBlock}>
                    <p className={cx(styles.eyebrow, page[`eyebrow_${view.tone}`])}>{t(view.eyebrow)}</p>
                    <h2 className={styles.heading}>{t(view.title)}</h2>
                    <p className={styles.lead}>{t(view.lead)}</p>
                </div>

                <div ref={sectionsRef} className={page.sections}>
                    <Section title={t("Status")} aside={statusAside}>
                        <Timeline items={timeline} />
                    </Section>

                    <Section title={t("If something changes")}>
                        <p className={page.sectionText}>{t("You may also see these states. Reversals show refund progress and never appear as delivered.")}</p>
                        <div className={page.chips}>
                            <Badge tone="warning">{t("Action required")}</Badge>
                            <Badge tone="error">{t("Failed")}</Badge>
                            <Badge tone="neutral">{t("Reversed")}</Badge>
                        </div>
                    </Section>
                </div>
            </Split>

            <Modal
                open={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                title={t("Payout receipt")}
                subtitle={t("Delivered {{date}}", { date: formatDateTime(payout.completedAt) })}
                footer={<Button onClick={() => window.print()}>{t("Print or save as PDF")}</Button>}
            >
                <p className={page.receiptLabel}>{t("Recipient received")}</p>
                <p className={page.receiptAmount}>{formatAmount(payout.quote.net, payout.quote.currency)}</p>
                <Rows items={[
                    ...receiptRows,
                    { label: t("Exchange rate"), value: `1 USD = ${formatAmount(payout.quote.rate, payout.quote.currency)}` },
                    { label: t("Converted amount"), value: formatAmount(payout.quote.converted, payout.quote.currency) },
                    { label: t("Purpose"), value: t(payout.purpose) },
                ]} />
            </Modal>
        </WithdrawFrame>
    )
}

export default PayoutStatus
