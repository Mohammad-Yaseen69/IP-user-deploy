import { useSyncExternalStore } from "react"
import { COPY_STATUS } from "../../../stateMachines/copyTrading"

const STORAGE_KEY = "copy-trading-journey-v3"
const CHANNEL_NAME = "copy-trading"

/*
 * Client copy of the server-side journey. With the mock API it is the source of truth; with the
 * real API every response is written here through the adapters, so screens read one shape either way.
 */
export const createInitialState = () => ({
    v: 3,
    profile: { brokerLink: "not_linked", brokerAccountId: null },
    strategies: [],
    paymentMethods: [],
    /* walletId/currency: the real InstaPay wallet funding the allocation, which is entered in its currency. */
    draft: { strategyId: null, walletId: null, currency: null, allocation: 0, method: null, quote: null, amendment: false },
    funding: null,
    copy: {
        status: COPY_STATUS.NONE,
        strategyId: null,
        mandateVersion: null,
        consentedAt: null,
        activatedAt: null,
        lastAckAt: null,
        capitalCents: 0,
        pending: null,
        lastAction: null,
    },
    broker: null,
    withdrawDraft: { amountCents: 10000, mode: "gross", netAmount: 0 },
    withdrawal: null,
    activity: [],
    idempotency: {},
    /* units of each currency per 1 USD, filled from the InstaPay rate service */
    rates: { USD: 1 },
    resetAt: Date.now(),
})

const read = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
        return parsed?.v === 3 ? { ...createInitialState(), ...parsed } : createInitialState()
    } catch {
        return createInitialState()
    }
}

let state = read()
const listeners = new Set()
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null

const emit = () => listeners.forEach(listener => listener())

channel?.addEventListener("message", (event) => {
    if (!event.data?.state) return
    state = event.data.state
    emit()
})

export const getState = () => state

export const setState = (updater) => {
    const next = typeof updater === "function" ? updater(state) : updater
    if (!next || next === state) return
    state = next
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        /* storage blocked: this tab keeps working */
    }
    channel?.postMessage({ state })
    emit()
}

const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export const useCopyTradingState = () => useSyncExternalStore(subscribe, getState)
