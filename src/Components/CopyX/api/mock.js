import {
    COPY_STATUS,
    FUNDING_STAGES,
    OP_STATUS,
    PAYOUT_STAGES,
    RELEASE_STAGES,
    STAGE,
} from "../../../stateMachines/copyTrading"
import { getState, setState } from "../state/store"
import { addActivity, ensureRate, isQuoteExpired, newId, now, remember, replayed } from "./draft"
import {
    BROKER_ACCOUNT_ID,
    BROKER_SNAPSHOT,
    MANDATE_VERSION,
    PAYMENT_METHODS,
    PAYOUT_FEE_USD_CENTS,
    QUOTE_TTL_SECONDS,
    STRATEGIES,
} from "./fixtures"

/* In-browser stand-in for the CopyX backend. Same function names and results as api/http.js. */

export class ApiError extends Error {
    constructor(code, message) {
        super(message)
        this.code = code
    }
}

const stepMs = () => (getState().demoSpeed === "fast" ? 600 : 1800)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const latency = () => wait(500)
const expiry = () => new Date(Date.now() + QUOTE_TTL_SECONDS * 1000).toISOString()

const buildStages = (defs) => defs.map((def, index) => ({ ...def, state: index === 0 ? STAGE.PENDING : STAGE.UPCOMING, at: null }))

/* ------------------------------ staged operations ------------------------------ */

const OPS = {
    funding: { get: s => s.funding, put: (s, op) => ({ ...s, funding: op }) },
    release: { get: s => s.withdrawal?.release, put: (s, op) => ({ ...s, withdrawal: { ...s.withdrawal, release: op } }) },
    payout: { get: s => s.withdrawal?.payout, put: (s, op) => ({ ...s, withdrawal: { ...s.withdrawal, payout: op } }) },
}

/* A newly added receiving account is the one case where the provider asks for verification. */
const stageOutcome = (kind, op, stage) => {
    if (kind === "payout" && stage.key === "delivered" && op.destination?.newlyAdded) return OP_STATUS.ACTION_REQUIRED
    return null
}

/* The wallet debit itself happens in the real InstaPay ledger, so the mock never alters balances. */
const settleSideEffects = (kind, state, op, stage, completed) => {
    let next = state
    if (kind === "funding" && completed) {
        next = addActivity(next, { kind: "funding", label: "Broker credit confirmed", amountCents: op.quote.creditCents, status: "done", ref: op.id })
    }
    if (kind === "release" && completed) {
        next = { ...next, broker: { ...next.broker, withdrawableCents: Math.max(0, next.broker.withdrawableCents - op.amountCents) } }
        next = addActivity(next, { kind: "withdrawal", label: "Funds released to InstaPay", amountCents: op.amountCents, status: "done", ref: op.id })
    }
    if (kind === "payout" && completed) {
        next = addActivity(next, { kind: "payout", label: "Payout delivered", amount: op.quote.net, currency: op.quote.currency, status: "done", ref: op.id })
    }
    return next
}

const advance = (kind, opId, index) => {
    let keepGoing = false
    setState(state => {
        const op = OPS[kind].get(state)
        if (!op || op.id !== opId || op.status !== OP_STATUS.PROCESSING) return state
        if (op.stages[index]?.state !== STAGE.PENDING) return state

        const outcome = stageOutcome(kind, op, op.stages[index])
        if (outcome) {
            const stages = op.stages.map((stage, i) => (i === index ? { ...stage, label: "Action required", hint: "Provider requests verified receiving details", at: now() } : stage))
            return addActivity(OPS[kind].put(state, { ...op, stages, status: outcome }), { kind, label: "Payout needs your action", status: "pending", ref: op.id })
        }

        const stages = op.stages.map((stage, i) => {
            if (i === index) return { ...stage, state: STAGE.DONE, at: now() }
            if (i === index + 1) return { ...stage, state: STAGE.PENDING }
            return stage
        })
        const completed = index === stages.length - 1
        keepGoing = !completed
        const next = OPS[kind].put(state, { ...op, stages, status: completed ? OP_STATUS.COMPLETED : OP_STATUS.PROCESSING, completedAt: completed ? now() : null })
        return settleSideEffects(kind, next, op, op.stages[index], completed)
    })
    if (keepGoing) schedule(kind)
}

const schedule = (kind) => {
    const op = OPS[kind].get(getState())
    if (!op || op.status !== OP_STATUS.PROCESSING) return
    const index = op.stages.findIndex(stage => stage.state === STAGE.PENDING)
    if (index >= 0) setTimeout(() => advance(kind, op.id, index), stepMs())
}

/* ------------------------------ catalog ------------------------------ */

export const loadCatalog = async () => {
    setState(s => ({
        ...s,
        strategies: STRATEGIES,
        paymentMethods: PAYMENT_METHODS,
    }))
}

export const linkBrokerAccount = async () => {
    setState(s => ({ ...s, profile: { ...s.profile, brokerLink: "pending" } }))
    await latency()
    scheduleLinkReview()
}

const scheduleLinkReview = () => setTimeout(() => setState(s => (
    s.profile.brokerLink !== "pending"
        ? s
        : addActivity({ ...s, profile: { brokerLink: "linked", brokerAccountId: BROKER_ACCOUNT_ID } }, { kind: "account", label: "Tag Markets account linked", status: "done" })
)), stepMs() * 1.5)

/* ------------------------------ funding ------------------------------ */

export const createFundingQuote = async () => {
    await latency()
    const { draft, paymentMethods } = getState()
    const method = paymentMethods.find(item => item.id === draft.method?.family)
    if (!method) throw new ApiError("method_required", "Choose a payment method first.")
    const rate = await ensureRate(draft.currency)
    const fee = Math.round(draft.allocation * method.feeRate * 100) / 100
    const quote = {
        id: newId("QTE"),
        version: (draft.quote?.version || 0) + 1,
        currency: draft.currency,
        amount: draft.allocation,
        fee,
        debit: draft.allocation + fee,
        creditCents: Math.round((draft.allocation / rate) * 100),
        rate,
        expiresAt: expiry(),
    }
    setState(s => ({ ...s, draft: { ...s.draft, quote } }))
    return quote
}

/* walletBalance: the live balance of the funding wallet, checked the way the ledger would. */
export const submitFunding = async ({ idempotencyKey, walletBalance }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing

    const { draft } = getState()
    if (isQuoteExpired(draft.quote)) throw new ApiError("quote_expired", "This quote expired. Review the new quote before you authorize.")
    if (draft.method.family === "instapay_wallet" && walletBalance !== undefined && draft.quote.debit > walletBalance) {
        throw new ApiError("insufficient_balance", "Your wallet balance is lower than the total debit.")
    }

    await latency()
    const id = newId("FUND")
    setState(s => {
        const op = {
            id,
            family: draft.method.family,
            method: draft.method,
            quote: draft.quote,
            stages: buildStages(FUNDING_STAGES),
            status: OP_STATUS.PROCESSING,
            createdAt: now(),
        }
        const next = remember({ ...s, funding: op, draft: { ...s.draft, quote: null } }, idempotencyKey, id)
        return addActivity(next, { kind: "funding", label: "Funding submitted", amount: draft.quote.debit, currency: draft.quote.currency, status: "pending", ref: id })
    })
    schedule("funding")
    return id
}

export const retryFunding = async () => setState(s => ({ ...s, funding: null, draft: { ...s.draft, quote: null } }))

/* ------------------------------ mandate + lifecycle ------------------------------ */

const COPY_FLOW = {
    activate: { pending: COPY_STATUS.ACTIVATION_PENDING, final: COPY_STATUS.ACTIVE, label: "Copying activated" },
    amend: { pending: null, final: COPY_STATUS.ACTIVE, label: "Allocation added" },
    pause: { pending: COPY_STATUS.PAUSE_PENDING, final: COPY_STATUS.PAUSED, label: "Copying paused" },
    resume: { pending: COPY_STATUS.RESUME_PENDING, final: COPY_STATUS.ACTIVE, label: "Copying resumed" },
    stop: { pending: COPY_STATUS.STOP_PENDING, final: COPY_STATUS.STOPPED, label: "Copying stopped" },
}

const resolveCopyAction = (pendingId) => setState(state => {
    const { pending } = state.copy
    if (!pending || pending.id !== pendingId) return state
    const flow = COPY_FLOW[pending.type]
    let copy = { ...state.copy, status: flow.final, pending: null, lastAckAt: now(), lastAction: { id: pending.id, type: pending.type, closePositions: pending.closePositions } }
    let broker = state.broker

    if (pending.type === "activate") {
        copy = { ...copy, activatedAt: now(), capitalCents: pending.creditCents }
        broker = { ...BROKER_SNAPSHOT, refreshedAt: now() }
    }
    if (pending.type === "amend") copy = { ...copy, capitalCents: copy.capitalCents + pending.creditCents }
    if (pending.type === "stop" && pending.closePositions) {
        const unrealized = (broker?.positions || []).reduce((sum, p) => sum + p.pnlCents, 0)
        broker = { ...broker, positions: [], realizedCents: (broker?.realizedCents || 0) + unrealized, withdrawableCents: copy.capitalCents + unrealized }
        copy = { ...copy, capitalCents: copy.capitalCents + unrealized }
    }

    const next = { ...state, copy, broker, draft: { ...state.draft, amendment: false } }
    return addActivity(next, { kind: "copy", label: flow.label, status: "done", ref: pending.id })
})

const requestCopyAction = (type, payload, idempotencyKey) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing

    const id = newId("COPY")
    setState(state => {
        const flow = COPY_FLOW[type]
        const copy = { ...state.copy, status: flow.pending || state.copy.status, pending: { id, type, requestedAt: now(), ...payload } }
        return remember(addActivity({ ...state, copy }, { kind: "copy", label: `${flow.label} - requested`, status: "pending", ref: id }), idempotencyKey, id)
    })
    setTimeout(() => resolveCopyAction(id), stepMs() * 1.6)
    return id
}

export const submitMandate = async ({ idempotencyKey }) => {
    const { funding, draft, copy } = getState()
    if (funding?.status !== OP_STATUS.COMPLETED) throw new ApiError("not_credited", "Broker credit is not confirmed yet.")
    await latency()
    setState(s => ({ ...s, copy: { ...s.copy, strategyId: draft.strategyId, mandateVersion: MANDATE_VERSION, consentedAt: now() } }))
    const amending = draft.amendment && copy.status !== COPY_STATUS.NONE
    return requestCopyAction(amending ? "amend" : "activate", { creditCents: funding.quote.creditCents }, idempotencyKey)
}

export const submitCopyAction = async ({ type, closePositions = false, idempotencyKey }) => {
    await latency()
    return requestCopyAction(type, { closePositions }, idempotencyKey)
}

/* ------------------------------ withdrawal + payout ------------------------------ */

export const requestRelease = async ({ amountCents, mode, idempotencyKey }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing

    const { broker } = getState()
    if (amountCents <= 0) throw new ApiError("invalid_amount", "Enter an amount greater than zero.")
    if (amountCents > (broker?.withdrawableCents || 0)) {
        throw new ApiError("exceeds_cash", "This is more than your available cash. Open positions are never closed to cover it.")
    }

    await latency()
    const id = newId("REL")
    setState(s => {
        const withdrawal = {
            id: newId("WDL"),
            amountCents,
            mode,
            release: { id, amountCents, stages: buildStages(RELEASE_STAGES), status: OP_STATUS.PROCESSING, createdAt: now() },
            destination: null,
            purpose: null,
            quote: null,
            payout: null,
        }
        return remember(addActivity({ ...s, withdrawal }, { kind: "withdrawal", label: "Release requested", amountCents, status: "pending", ref: id }), idempotencyKey, id)
    })
    schedule("release")
    return id
}

export const createPayoutQuote = async () => {
    await latency()
    const { withdrawal } = getState()
    const { currency } = withdrawal.destination
    const rate = await ensureRate(currency)
    const converted = (withdrawal.amountCents / 100) * rate
    const fee = (PAYOUT_FEE_USD_CENTS / 100) * rate
    const quote = {
        id: newId("QTE"),
        version: (withdrawal.quote?.version || 0) + 1,
        mode: withdrawal.mode,
        currency,
        amountCents: withdrawal.amountCents,
        converted,
        fee,
        net: converted - fee,
        rate,
        eta: "Usually within minutes",
        expiresAt: expiry(),
    }
    setState(s => ({ ...s, withdrawal: { ...s.withdrawal, quote } }))
    return quote
}

export const submitPayout = async ({ idempotencyKey }) => {
    const existing = replayed(idempotencyKey)
    if (existing) return existing

    const { withdrawal } = getState()
    if (isQuoteExpired(withdrawal.quote)) throw new ApiError("quote_expired", "This quote expired. Review the new quote before you authorize.")

    await latency()
    const id = newId("PAYOUT")
    setState(s => {
        const stages = buildStages(PAYOUT_STAGES).map((stage, i) => (i === 0 ? { ...stage, state: STAGE.DONE, at: now() } : i === 1 ? { ...stage, state: STAGE.PENDING } : stage))
        const payout = { id, quote: s.withdrawal.quote, destination: s.withdrawal.destination, purpose: s.withdrawal.purpose, stages, status: OP_STATUS.PROCESSING, createdAt: now() }
        return remember(addActivity({ ...s, withdrawal: { ...s.withdrawal, payout } }, { kind: "payout", label: "Payout submitted", amount: payout.quote.net, currency: payout.quote.currency, status: "pending", ref: id }), idempotencyKey, id)
    })
    schedule("payout")
    return id
}

/* The release stays completed; only the payout is redone with a corrected destination. */
export const retryPayout = async () => setState(s => ({ ...s, withdrawal: { ...s.withdrawal, payout: null, quote: null, destination: null } }))

/* After a reload, pick every pending operation up where it stopped. */
export const resumePendingWork = () => {
    const state = getState()
    Object.keys(OPS).forEach(schedule)
    if (state.copy.pending) setTimeout(() => resolveCopyAction(state.copy.pending.id), stepMs())
    if (state.profile.brokerLink === "pending") scheduleLinkReview()
}
