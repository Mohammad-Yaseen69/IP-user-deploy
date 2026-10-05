import { apiWrapper } from "../../../utils/Functions/apiWrapper"
import {
    COPY_STATUS,
    FUNDING_STAGES,
    OP_STATUS,
    PAYOUT_STAGES,
    RELEASE_STAGES,
} from "../../../stateMachines/copyTrading"
import { emptySlot, getState, getStateFor, setState, setStateFor } from "../state/store"
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

const focused = () => getState().draft.strategyId

/* Status is re-read from the server, never inferred: a timeout keeps polling the same operation. */
const track = (kind, strategyId, id) => {
    const tick = async () => {
        try {
            const raw = await get(ENDPOINTS.operation(id))
            const op = toOperation(raw, OPS[kind].defs)
            setStateFor(strategyId, s => OPS[kind].put(s, op))
            if (TERMINAL.includes(op.status)) {
                if (kind === "funding" || kind === "release") await refreshCopyState(strategyId)
                return
            }
        } catch {
            /* network hiccup: try again on the next tick */
        }
        setTimeout(tick, POLL_INTERVAL_MS)
    }
    tick()
}

const toCopy = (raw, current) => ({
    ...current,
    status: raw.status ?? current.status,
    strategyId: raw.strategy_id ?? current.strategyId,
    capitalCents: raw.capital !== undefined ? Math.round(raw.capital * 100) : current.capitalCents,
    activatedAt: raw.activated_at ?? current.activatedAt,
    lastAckAt: raw.acknowledged_at ?? current.lastAckAt,
    pending: raw.pending_operation ?? null,
})

const refreshCopyState = async (strategyId) => {
    const raw = await get(ENDPOINTS.copyState(strategyId))
    setStateFor(strategyId, s => ({
        ...s,
        broker: raw.broker ? toBrokerSnapshot(raw.broker) : s.broker,
        copy: toCopy(raw, s.copy),
    }))
    return getStateFor(strategyId).copy
}

const trackCopy = (strategyId) => {
    const tick = async () => {
        const copy = await refreshCopyState(strategyId).catch(() => getStateFor(strategyId).copy)
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

    /* Every copy the customer has, one per strategy, each with its own broker figures. */
    const copies = await get(ENDPOINTS.copies).catch(() => [])
    setState(s => ({
        ...s,
        copies: { ...s.copies, ...Object.fromEntries((copies || []).map(item => {
            const slot = s.copies[item.strategy_id] || emptySlot()
            return [item.strategy_id, { ...slot, copy: toCopy(item, slot.copy), broker: item.broker ? toBrokerSnapshot(item.broker) : slot.broker }]
        })) },
    }))
}

export const linkBrokerAccount = async () => {
    const res = await post(ENDPOINTS.brokerLink, {})
    if (res?.redirect_url) window.location.assign(res.redirect_url)
    setState(s => ({ ...s, profile: { ...s.profile, brokerLink: "pending" } }))
}

/* ------------------------------ funding ------------------------------ */

export const createFundingQuote = async () => {
    const strategyId = focused()
    const { draft } = getStateFor(strategyId)
    const quote = toFundingQuote(await post(ENDPOINTS.fundingQuote, {
        strategy_id: draft.strategyId,
        amount: draft.allocation,
        currency: draft.currency,
        method: draft.method,
    }))
    setStateFor(strategyId, s => ({ ...s, draft: { ...s.draft, quote } }))
    return quote
}

export const submitFunding = async ({ idempotencyKey }) => {
    const strategyId = focused()
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const { draft } = getStateFor(strategyId)
    const raw = await post(ENDPOINTS.fundingSubmit, { quote_id: draft.quote.id }, idempotencyKey)
    const op = toOperation(raw, FUNDING_STAGES)
    setStateFor(strategyId, s => remember({ ...s, funding: { ...op, family: draft.method.family, method: draft.method, quote: draft.quote }, draft: { ...s.draft, quote: null } }, idempotencyKey, op.id))
    track("funding", strategyId, op.id)
    return op.id
}

export const retryFunding = async () => setState(s => ({ ...s, funding: null, draft: { ...s.draft, quote: null } }))

/* ------------------------------ mandate + lifecycle ------------------------------ */

export const submitMandate = async ({ idempotencyKey }) => {
    const strategyId = focused()
    const { funding, draft, copy } = getStateFor(strategyId)
    const raw = await post(ENDPOINTS.mandate, {
        strategy_id: draft.strategyId,
        funding_operation_id: funding.id,
        amendment: draft.amendment && copy.status !== COPY_STATUS.NONE,
        accepted_at: now(),
    }, idempotencyKey)
    setStateFor(strategyId, s => remember(addActivity({ ...s, copy: { ...s.copy, mandateVersion: raw.mandate_version, consentedAt: now() } }, { kind: "copy", label: "Copy mandate submitted", status: "pending", ref: raw.operation_id }), idempotencyKey, raw.operation_id))
    trackCopy(strategyId)
    return raw.operation_id
}

export const submitCopyAction = async ({ type, closePositions = false, idempotencyKey }) => {
    const strategyId = focused()
    const raw = await post(ENDPOINTS.lifecycle(strategyId), { action: type, close_positions: closePositions }, idempotencyKey)
    trackCopy(strategyId)
    return raw.operation_id
}

/* ------------------------------ withdrawal + payout ------------------------------ */

export const requestRelease = async ({ amountCents, mode, idempotencyKey }) => {
    const strategyId = focused()
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const raw = await post(ENDPOINTS.release, { strategy_id: strategyId, amount: amountCents / 100, currency: "USD", mode }, idempotencyKey)
    const release = { ...toOperation(raw, RELEASE_STAGES), amountCents }
    setStateFor(strategyId, s => remember({ ...s, withdrawal: { id: raw.withdrawal_id, amountCents, mode, release, destination: null, purpose: null, quote: null, payout: null } }, idempotencyKey, release.id))
    track("release", strategyId, release.id)
    return release.id
}

export const createPayoutQuote = async () => {
    const strategyId = focused()
    const { withdrawal } = getStateFor(strategyId)
    const quote = toPayoutQuote(await post(ENDPOINTS.payoutQuote, {
        withdrawal_id: withdrawal.id,
        receiving_account_id: withdrawal.destination.id,
        mode: withdrawal.mode,
        purpose: withdrawal.purpose,
    }))
    setStateFor(strategyId, s => ({ ...s, withdrawal: { ...s.withdrawal, quote } }))
    return quote
}

export const submitPayout = async ({ idempotencyKey }) => {
    const strategyId = focused()
    const existing = replayed(idempotencyKey)
    if (existing) return existing
    const { withdrawal } = getStateFor(strategyId)
    const raw = await post(ENDPOINTS.payoutSubmit, { quote_id: withdrawal.quote.id }, idempotencyKey)
    const payout = { ...toOperation(raw, PAYOUT_STAGES), quote: withdrawal.quote, destination: withdrawal.destination, purpose: withdrawal.purpose }
    setStateFor(strategyId, s => remember({ ...s, withdrawal: { ...s.withdrawal, payout } }, idempotencyKey, payout.id))
    track("payout", strategyId, payout.id)
    return payout.id
}

export const retryPayout = async () => setState(s => ({ ...s, withdrawal: { ...s.withdrawal, payout: null, quote: null, destination: null } }))

export const resumePendingWork = () => {
    Object.entries(getState().copies).forEach(([strategyId, { funding, withdrawal, copy }]) => {
        if (funding?.status === OP_STATUS.PROCESSING) track("funding", strategyId, funding.id)
        if (withdrawal?.release?.status === OP_STATUS.PROCESSING) track("release", strategyId, withdrawal.release.id)
        if (withdrawal?.payout?.status === OP_STATUS.PROCESSING) track("payout", strategyId, withdrawal.payout.id)
        if (copy.pending) trackCopy(strategyId)
    })
}
