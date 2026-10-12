import { v4 as uuid } from "uuid"
import { CATALOG_VERSION } from "./fixtures"
import { getRate } from "./fx"
import { getState, setState } from "../state/store"

/* Client-side draft edits. They are the same for the mock and the real API: nothing is submitted here. */

export const newId = (prefix) => `${prefix}-${uuid().slice(0, 8).toUpperCase()}`
export const now = () => new Date().toISOString()

export const addActivity = (state, entry) => ({
    ...state,
    activity: [{ id: newId("ACT"), at: now(), strategyId: state.draft?.strategyId ?? null, ...entry }, ...state.activity].slice(0, 40),
})

export const remember = (state, key, opId) => (key ? { ...state, idempotency: { ...state.idempotency, [key]: opId } } : state)
export const replayed = (key) => (key ? getState().idempotency[key] : null)

/* Focuses a strategy. Each strategy keeps its own copy and funds, so picking another one starts its own allocation. */
export const selectStrategy = (strategyId) => setState(s => (s.draft.strategyId === strategyId
    ? { ...s, draft: { ...s.draft, catalogVersion: CATALOG_VERSION, quote: null } }
    : { ...s, draft: { ...s.draft, strategyId, catalogVersion: CATALOG_VERSION, quote: null, amendment: false, allocation: 0 } }))

export const setAllocation = (allocation) => setState(s => ({ ...s, draft: { ...s.draft, allocation, quote: null } }))

/* Any change of source invalidates the quote and the authorization built on it. */
export const setFundingMethod = (method) => setState(s => ({ ...s, draft: { ...s.draft, method, quote: null } }))

export const startAmendment = () => setState(s => ({
    ...s,
    funding: null,
    draft: { ...s.draft, strategyId: s.copy.strategyId, amendment: true, method: null, quote: null, allocation: 0 },
}))

export const setWithdrawDraft = (patch) => setState(s => ({
    ...s,
    withdrawDraft: { ...s.withdrawDraft, ...patch },
}))

export const setPayoutDestination = (destination, purpose) => setState(s => ({
    ...s,
    withdrawal: { ...s.withdrawal, destination, purpose, quote: null },
}))

export const clearWithdrawal = () => setState(s => ({ ...s, withdrawal: null }))

export const isQuoteExpired = (quote) => !quote || new Date(quote.expiresAt).getTime() <= Date.now()

/* The allocation is entered in the funding wallet's currency, so changing wallet restarts the amount. */
export const setFundingWallet = (wallet, allocation = 0) => setState(s => ({
    ...s,
    draft: { ...s.draft, walletId: wallet.id, currency: wallet.currency, allocation, quote: null },
}))

export const ensureRate = async (currency) => {
    if (!currency || getState().rates[currency]) return getState().rates[currency]
    const rate = await getRate("USD", currency)
    setState(s => ({ ...s, rates: { ...s.rates, [currency]: rate } }))
    return rate
}
