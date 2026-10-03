import { COPY_STATUS, FUNDING_STAGES, OP_STATUS, RELEASE_STAGES, STAGE } from "../../../stateMachines/copyTrading"
import { createInitialState, getState, setState } from "../state/store"
import { addActivity, newId, now } from "./draft"
import {
    BROKER_ACCOUNT_ID,
    BROKER_SNAPSHOT,
    CATALOG_VERSION,
    MANDATE_VERSION,
    PAYMENT_METHODS,
    STRATEGIES,
} from "./fixtures"

/*
 * Presenter shortcuts for the mock API: put the Tag Markets side of the journey in a known state.
 * Wallets, IBAN and receiving accounts stay the customer's real InstaPay data.
 */

const STRATEGY_ID = "atlas-fx"
const CAPITAL_CENTS = 50000

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
    { kind: "account", label: "Tag Markets account linked", status: "done" },
)

const selected = (state) => ({ ...state, draft: { ...state.draft, strategyId: STRATEGY_ID, catalogVersion: CATALOG_VERSION } })

/* Funded from the customer's real wallet currency; the debit is shown, the real balance is untouched. */
const active = (state, wallet) => {
    const currency = wallet?.currency || "USD"
    const rate = state.rates[currency] || 1
    const amount = Math.round((CAPITAL_CENTS / 100) * rate * 100) / 100
    const method = { family: "instapay_wallet", label: "InstaPay Wallet", icon: "wallet", walletId: wallet?.id }
    const quote = { id: newId("QTE"), version: 1, currency, amount, fee: 0, debit: amount, creditCents: CAPITAL_CENTS, rate, expiresAt: now() }
    const funding = {
        id: newId("FUND"), family: method.family, method, quote,
        stages: done(FUNDING_STAGES), status: OP_STATUS.COMPLETED, createdAt: now(), completedAt: now(),
    }
    const base = selected(linked(withWallet(state, wallet)))
    let next = {
        ...base,
        draft: { ...base.draft, allocation: amount, method },
        funding,
        copy: {
            ...state.copy, status: COPY_STATUS.ACTIVE, strategyId: STRATEGY_ID, mandateVersion: MANDATE_VERSION,
            consentedAt: now(), activatedAt: now(), lastAckAt: now(), capitalCents: CAPITAL_CENTS, pending: null,
        },
        broker: { ...BROKER_SNAPSHOT, refreshedAt: now() },
    }
    next = addActivity(next, { kind: "funding", label: "Broker credit confirmed", amountCents: CAPITAL_CENTS, status: "done", ref: funding.id })
    return addActivity(next, { kind: "copy", label: "Copying activated", status: "done" })
}

const released = (state, wallet) => {
    const next = active(state, wallet)
    const release = { id: newId("REL"), amountCents: 10000, stages: done(RELEASE_STAGES), status: OP_STATUS.COMPLETED, createdAt: now(), completedAt: now() }
    return addActivity({
        ...next,
        broker: { ...next.broker, withdrawableCents: next.broker.withdrawableCents - 10000 },
        withdrawal: { id: newId("WDL"), amountCents: 10000, mode: "gross", release, destination: null, purpose: null, quote: null, payout: null },
    }, { kind: "withdrawal", label: "Funds released to InstaPay", amountCents: 10000, status: "done", ref: release.id })
}

/* Each preset returns the page the walkthrough should continue from. */
export const DEMO_PRESETS = [
    { id: "reset", label: "Start over (not connected)", page: "dashboard", build: (s) => s },
    { id: "selected", label: "Strategy chosen, account not connected", page: "accounts", build: selected },
    { id: "linked", label: "Account connected, no strategy yet", page: "dashboard", build: linked },
    { id: "fund", label: "Connected, ready to fund Atlas FX", page: "allocation", build: (s, wallet) => selected(linked(withWallet(s, wallet))) },
    { id: "active", label: "Copying active", page: "workspace", build: active },
    { id: "released", label: "100 USD released, choose payout", page: "destination", build: released },
]

export const applyDemoPreset = (id, wallet) => {
    const preset = DEMO_PRESETS.find(item => item.id === id)
    setState(preset.build(fresh(), wallet))
    return preset.page
}

export const setDemoSpeed = (demoSpeed) => setState(s => ({ ...s, demoSpeed }))
