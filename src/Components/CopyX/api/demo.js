import { COPY_STATUS, FUNDING_STAGES, OP_STATUS, RELEASE_STAGES, STAGE } from "../../../stateMachines/copyTrading"
import { createInitialState, emptySlot, getState, replaceState, setState } from "../state/store"
import { addActivity, newId, now } from "./draft"
import {
    BROKER_ACCOUNT_ID,
    CATALOG_VERSION,
    MANDATE_VERSION,
    PAYMENT_METHODS,
    STRATEGIES,
    brokerSnapshotFor,
} from "./fixtures"

/*
 * Presenter shortcuts for the mock API: put the Tag Markets side of the journey in a known state.
 * Wallets, IBAN and receiving accounts stay the customer's real InstaPay data.
 * Presets build the stored shape directly: shared fields plus one slot per strategy in `copies`.
 */

const done = (defs) => defs.map(def => ({ ...def, state: STAGE.DONE, at: now() }))

/* Catalog data and fetched rates are kept so the pages do not need to reload them. */
const fresh = () => {
    const current = getState()
    return {
        ...createInitialState(),
        demoSpeed: current.demoSpeed,
        rates: current.rates,
        strategies: STRATEGIES,
        paymentMethods: PAYMENT_METHODS,
        resetAt: Date.now(),
    }
}

const withWallet = (state, wallet) => (wallet
    ? { ...state, draft: { ...state.draft, walletId: wallet.id, currency: wallet.currency } }
    : state)

const linked = (state) => addActivity(
    { ...state, profile: { brokerLink: "linked", brokerAccountId: BROKER_ACCOUNT_ID } },
    { kind: "account", label: "Tag Markets account linked", status: "done", strategyId: null },
)

const focus = (state, strategyId) => ({ ...state, draft: { ...state.draft, strategyId, catalogVersion: CATALOG_VERSION, allocation: 0, amendment: false } })

/* A strategy funded from the customer's real wallet currency and copying; the real balance is untouched. */
const running = (state, wallet, strategyId, capitalCents) => {
    const currency = wallet?.currency || "USD"
    const rate = state.rates[currency] || 1
    const amount = Math.round((capitalCents / 100) * rate * 100) / 100
    const method = { family: "instapay_wallet", label: "InstaPay Wallet", icon: "wallet", walletId: wallet?.id }
    const quote = { id: newId("QTE"), version: 1, currency, amount, fee: 0, debit: amount, creditCents: capitalCents, rate, expiresAt: now() }
    const funding = {
        id: newId("FUND"), family: method.family, method, quote,
        stages: done(FUNDING_STAGES), status: OP_STATUS.COMPLETED, createdAt: now(), completedAt: now(),
    }
    const slot = emptySlot()
    let next = {
        ...state,
        draft: { ...state.draft, method },
        copies: {
            ...state.copies,
            [strategyId]: {
                ...slot,
                funding,
                copy: {
                    ...slot.copy, status: COPY_STATUS.ACTIVE, strategyId, mandateVersion: MANDATE_VERSION,
                    consentedAt: now(), activatedAt: now(), lastAckAt: now(), capitalCents,
                },
                broker: { ...brokerSnapshotFor(strategyId, capitalCents), refreshedAt: now() },
            },
        },
    }
    next = addActivity(next, { kind: "funding", label: "Broker credit confirmed", amountCents: capitalCents, status: "done", ref: funding.id, strategyId })
    return addActivity(next, { kind: "copy", label: "Copying activated", status: "done", strategyId })
}

const released = (state, strategyId, amountCents) => {
    const slot = state.copies[strategyId]
    const release = { id: newId("REL"), amountCents, stages: done(RELEASE_STAGES), status: OP_STATUS.COMPLETED, createdAt: now(), completedAt: now() }
    return addActivity({
        ...state,
        copies: {
            ...state.copies,
            [strategyId]: {
                ...slot,
                broker: { ...slot.broker, withdrawableCents: slot.broker.withdrawableCents - amountCents },
                withdrawal: { id: newId("WDL"), amountCents, mode: "gross", release, destination: null, purpose: null, quote: null, payout: null },
            },
        },
    }, { kind: "withdrawal", label: "Funds released to InstaPay", amountCents, status: "done", ref: release.id, strategyId })
}

const base = (wallet) => linked(withWallet(fresh(), wallet))

/* Each preset returns the stored state and the page the walkthrough continues from. */
export const DEMO_PRESETS = [
    { id: "reset", label: "Start over (not connected)", page: "dashboard", build: () => fresh() },
    { id: "selected", label: "Strategy chosen, account not connected", page: "accounts", build: () => focus(fresh(), "atlas-fx") },
    { id: "linked", label: "Account connected, no strategy yet", page: "dashboard", build: (wallet) => base(wallet) },
    { id: "fund", label: "Connected, ready to fund Atlas FX", page: "allocation", build: (wallet) => focus(base(wallet), "atlas-fx") },
    { id: "active", label: "Copying Atlas FX", page: "workspace", build: (wallet) => focus(running(base(wallet), wallet, "atlas-fx", 50000), "atlas-fx") },
    {
        id: "parallel",
        label: "Two strategies copying in parallel",
        page: "dashboard",
        build: (wallet) => focus(running(running(base(wallet), wallet, "atlas-fx", 50000), wallet, "meridian-gold", 30000), "atlas-fx"),
    },
    {
        id: "released",
        label: "100 USD released from Atlas FX, choose payout",
        page: "destination",
        build: (wallet) => focus(released(running(base(wallet), wallet, "atlas-fx", 50000), "atlas-fx", 10000), "atlas-fx"),
    },
]

export const applyDemoPreset = (id, wallet) => {
    const preset = DEMO_PRESETS.find(item => item.id === id)
    replaceState(preset.build(wallet))
    return preset.page
}

export const setDemoSpeed = (demoSpeed) => setState(s => ({ ...s, demoSpeed }))
