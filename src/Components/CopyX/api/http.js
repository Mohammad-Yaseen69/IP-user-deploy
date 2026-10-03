import { apiWrapper } from "../../../utils/Functions/apiWrapper"
import {
    COPY_STATUS,
    FUNDING_STAGES,
    OP_STATUS,
    PAYOUT_STAGES,
    RELEASE_STAGES,
} from "../../../stateMachines/copyTrading"
import { getState, setState } from "../state/store"
import {
    toBrokerSnapshot,
    toFundingQuote,
    toOperation,
    toPaymentMethod,
    toPayoutQuote,
    toStrategy,
} from "./adapters"
import { ENDPOINTS, POLL_INTERVAL_MS } from "./config"
import { addActivity, now, remember, replayed } from "./draft"

/* Real backend implementation. Same exported names as api/mock.js; enable it in api/config.js. */

const get = (endpoint) => apiWrapper({ endpoint, method: "GET" })
const post = (endpoint, payload, idempotencyKey) =>
    apiWrapper({ endpoint, method: "POST", payload, isEncrypted: true, idempotencyKey })

const TERMINAL = [OP_STATUS.COMPLETED, OP_STATUS.FAILED, OP_STATUS.REVERSED, OP_STATUS.ACTION_REQUIRED]

const OPS = {
    funding: { defs: FUNDING_STAGES, put: (s, op) => ({ ...s, funding: { ...s.funding, ...op } }) },
    release: { defs: RELEASE_STAGES, put: (s, op) => ({ ...s, withdrawal: { ...s.withdrawal, release: { ...s.withdrawal.release, ...op } } }) },
    payout: { defs: PAYOUT_STAGES, put: (s, op) => ({ ...s, withdrawal: { ...s.withdrawal, payout: { ...s.withdrawal.payout, ...op } } }) },
}

/* Status is re-read from the server, never inferred: a timeout keeps polling the same operation. */
const track = (kind, id) => {
    const tick = async () => {
        try {
            const raw = await get(ENDPOINTS.operation(id))
            const op = toOperation(raw, OPS[kind].defs)
            setState(s => OPS[kind].put(s, op))
            if (TERMINAL.includes(op.status)) {
                if (kind === "funding" || kind === "release") await refreshCopyState()
                return
            }
        } catch {
            /* network hiccup: try again on the next tick */
        }
        setTimeout(tick, POLL_INTERVAL_MS)
    }
    tick()
}

const refreshCopyState = async () => {
    const raw = await get(ENDPOINTS.copyState)
    setState(s => ({
        ...s,
        broker: raw.broker ? toBrokerSnapshot(raw.broker) : s.broker,
        copy: {
            ...s.copy,
            status: raw.status ?? s.copy.status,
            strategyId: raw.strategy_id ?? s.copy.strategyId,
            capitalCents: raw.capital !== undefined ? Math.round(raw.capital * 100) : s.copy.capitalCents,
            activatedAt: raw.activated_at ?? s.copy.activatedAt,
            lastAckAt: raw.acknowledged_at ?? s.copy.lastAckAt,
            pending: raw.pending_operation ?? null,
        },
    }))
    return getState().copy
}

const trackCopy = () => {
    const tick = async () => {
        const copy = await refreshCopyState().catch(() => getState().copy)
        if (copy.pending) setTimeout(tick, POLL_INTERVAL_MS)
    }
    tick()
}

/* ------------------------------ catalog ------------------------------ */

export const loadCatalog = async () => {
    const { draft } = getState()
    const [strategies, methods] = await Promise.all([
        get(ENDPOINTS.strategies),
        get(`${ENDPOINTS.capabilities}?operation=broker_funding&currency=${draft.currency || ""}&amount=${draft.allocation}`),
    ])
    setState(s => ({
        ...s,
        strategies: (strategies || []).map(toStrategy),
        paymentMethods: (methods || []).map(toPaymentMethod),
    }))
    const broker = await get(ENDPOINTS.brokerAccount).catch(() => null)
    if (broker) setState(s => ({ ...s, profile: { brokerLink: broker.status, brokerAccountId: broker.account_id } }))
}

export const linkBrokerAccount = async () => {
    const res = await post(ENDPOINTS.brokerLink, {})
    if (res?.redirect_url) window.location.assign(res.redirect_url)
    setState(s => ({ ...s, profile: { ...s.profile, brokerLink: "pending" } }))
}

/* ------------------------------ funding ------------------------------ */

export const createFundingQuote = async () => {
    const { draft } = getState()
    const quote = toFundingQuote(await post(ENDPOINTS.fundingQuote, {
        strategy_id: draft.strategyId,
        amount: draft.allocation,
        currency: "XOF",
        method: draft.method,
    }))
    setState(s => ({ ...s, draft: { ...s.draft, quote } }))
    return quote
}

export const submitFunding = async ({ idempotencyKey }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const { draft } = getState()
    const raw = await post(ENDPOINTS.fundingSubmit, { quote_id: draft.quote.id }, idempotencyKey)
    const op = toOperation(raw, FUNDING_STAGES)
    setState(s => remember({ ...s, funding: { ...op, family: draft.method.family, method: draft.method, quote: draft.quote }, draft: { ...s.draft, quote: null } }, idempotencyKey, op.id))
    track("funding", op.id)
    return op.id
}

export const retryFunding = async () => setState(s => ({ ...s, funding: null, draft: { ...s.draft, quote: null } }))

/* ------------------------------ mandate + lifecycle ------------------------------ */

export const submitMandate = async ({ idempotencyKey }) => {
    const { funding, draft, copy } = getState()
    const raw = await post(ENDPOINTS.mandate, {
        strategy_id: draft.strategyId,
        funding_operation_id: funding.id,
        amendment: draft.amendment && copy.status !== COPY_STATUS.NONE,
        accepted_at: now(),
    }, idempotencyKey)
    setState(s => remember(addActivity({ ...s, copy: { ...s.copy, mandateVersion: raw.mandate_version, consentedAt: now() } }, { kind: "copy", label: "Copy mandate submitted", status: "pending", ref: raw.operation_id }), idempotencyKey, raw.operation_id))
    trackCopy()
    return raw.operation_id
}

export const submitCopyAction = async ({ type, closePositions = false, idempotencyKey }) => {
    const raw = await post(ENDPOINTS.lifecycle, { action: type, close_positions: closePositions }, idempotencyKey)
    trackCopy()
    return raw.operation_id
}

/* ------------------------------ withdrawal + payout ------------------------------ */

export const requestRelease = async ({ amountCents, mode, idempotencyKey }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const raw = await post(ENDPOINTS.release, { amount: amountCents / 100, currency: "USD", mode }, idempotencyKey)
    const release = { ...toOperation(raw, RELEASE_STAGES), amountCents }
    setState(s => remember({ ...s, withdrawal: { id: raw.withdrawal_id, amountCents, mode, release, destination: null, purpose: null, quote: null, payout: null } }, idempotencyKey, release.id))
    track("release", release.id)
    return release.id
}

export const createPayoutQuote = async () => {
    const { withdrawal } = getState()
    const quote = toPayoutQuote(await post(ENDPOINTS.payoutQuote, {
        withdrawal_id: withdrawal.id,
        receiving_account_id: withdrawal.destination.id,
        mode: withdrawal.mode,
        purpose: withdrawal.purpose,
    }))
    setState(s => ({ ...s, withdrawal: { ...s.withdrawal, quote } }))
    return quote
}

export const submitPayout = async ({ idempotencyKey }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const { withdrawal } = getState()
    const raw = await post(ENDPOINTS.payoutSubmit, { quote_id: withdrawal.quote.id }, idempotencyKey)
    const payout = { ...toOperation(raw, PAYOUT_STAGES), quote: withdrawal.quote, destination: withdrawal.destination, purpose: withdrawal.purpose }
    setState(s => remember({ ...s, withdrawal: { ...s.withdrawal, payout } }, idempotencyKey, payout.id))
    track("payout", payout.id)
    return payout.id
}

export const retryPayout = async () => setState(s => ({ ...s, withdrawal: { ...s.withdrawal, payout: null, quote: null, destination: null } }))

export const resumePendingWork = () => {
    const { funding, withdrawal, copy } = getState()
    if (funding?.status === OP_STATUS.PROCESSING) track("funding", funding.id)
    if (withdrawal?.release?.status === OP_STATUS.PROCESSING) track("release", withdrawal.release.id)
    if (withdrawal?.payout?.status === OP_STATUS.PROCESSING) track("payout", withdrawal.payout.id)
    if (copy.pending) trackCopy()
}
