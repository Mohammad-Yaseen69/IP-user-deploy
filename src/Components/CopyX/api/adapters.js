import { OP_STATUS, STAGE } from "../../../stateMachines/copyTrading"

/*
 * The only place that knows the backend field names. When the real API lands, adjust the
 * right-hand side of these mappings; screens keep reading the UI shapes returned here.
 */

const cents = (value) => (value === undefined || value === null ? 0 : Math.round(Number(value) * 100))

export const toStrategy = (raw) => ({
    id: raw.id ?? raw._id ?? raw.strategy_id,
    code: raw.code ?? raw.strategy_code,
    name: raw.name,
    category: (raw.category ?? raw.asset_class ?? "").toLowerCase(),
    focus: raw.focus ?? raw.description,
    instruments: raw.instruments ?? [],
    trackRecord: raw.trackRecord ?? raw.track_record,
    maxDrawdown: raw.maxDrawdown ?? raw.max_drawdown,
    feeSchedule: raw.feeSchedule ?? raw.fee_schedule,
    leverage: raw.leverage,
    historyAsOf: raw.historyAsOf ?? raw.metrics_as_of,
    copyMode: raw.copyMode ?? raw.copy_mode,
    available: raw.available ?? raw.is_available ?? true,
})

export const toPaymentMethod = (raw) => ({
    id: raw.id ?? raw.family,
    label: raw.label ?? raw.name,
    description: raw.description ?? "",
    icon: raw.icon ?? raw.family,
    available: raw.available ?? raw.eligible ?? false,
    reason: raw.reason ?? raw.reason_code ?? "",
    feeRate: raw.feeRate ?? raw.fee_rate ?? 0,
    tag: raw.tag,
    providers: raw.providers,
    requiresIban: raw.requiresIban ?? raw.requires_iban,
})

export const toFundingQuote = (raw) => ({
    id: raw.id ?? raw.quote_id,
    version: raw.version ?? 1,
    currency: raw.currency,
    amount: raw.amount,
    fee: raw.fee ?? 0,
    debit: raw.debit ?? raw.total_debit,
    creditCents: raw.creditCents ?? cents(raw.broker_credit),
    rate: raw.rate ?? raw.fx_rate,
    expiresAt: raw.expiresAt ?? raw.expires_at,
})

export const toPayoutQuote = (raw) => ({
    id: raw.id ?? raw.quote_id,
    version: raw.version ?? 1,
    mode: raw.mode,
    amountCents: raw.amountCents ?? cents(raw.broker_amount),
    currency: raw.currency,
    converted: raw.converted ?? raw.converted_amount,
    fee: raw.fee,
    net: raw.net ?? raw.net_amount,
    rate: raw.rate ?? raw.fx_rate,
    eta: raw.eta ?? "Usually within minutes",
    expiresAt: raw.expiresAt ?? raw.expires_at,
})

const STATUS_MAP = {
    pending: OP_STATUS.PROCESSING,
    processing: OP_STATUS.PROCESSING,
    completed: OP_STATUS.COMPLETED,
    delivered: OP_STATUS.COMPLETED,
    action_required: OP_STATUS.ACTION_REQUIRED,
    failed: OP_STATUS.FAILED,
    reversed: OP_STATUS.REVERSED,
}

/* Operations arrive as { id, status, stages: [{ key, status, at }] } and merge into the local stage list. */
export const toOperation = (raw, stageDefs) => ({
    id: raw.id ?? raw.operation_id,
    status: STATUS_MAP[raw.status] ?? raw.status,
    failure: raw.failure ?? raw.reason ?? null,
    stages: stageDefs.map(def => {
        const match = (raw.stages || []).find(stage => stage.key === def.key)
        return { ...def, state: match ? (STAGE[String(match.status).toUpperCase()] ?? match.status) : STAGE.UPCOMING, at: match?.at ?? null }
    }),
    createdAt: raw.createdAt ?? raw.created_at,
    completedAt: raw.completedAt ?? raw.completed_at ?? null,
})

export const toBrokerSnapshot = (raw) => ({
    withdrawableCents: raw.withdrawableCents ?? cents(raw.withdrawable),
    realizedCents: raw.realizedCents ?? cents(raw.realized_pnl),
    positions: (raw.positions || []).map(position => ({
        symbol: position.symbol,
        side: position.side,
        lots: String(position.lots ?? position.volume),
        open: String(position.open ?? position.open_price),
        current: String(position.current ?? position.current_price),
        pnlCents: position.pnlCents ?? cents(position.unrealized_pnl),
    })),
    refreshedAt: raw.refreshedAt ?? raw.as_of ?? new Date().toISOString(),
})
