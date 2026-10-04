/*
 * Flip to false once the backend exposes the CopyX endpoints below. Screens never call these
 * directly; they go through api/index.js, so nothing else changes when the switch is made.
 */
export const USE_MOCK_API = true

/* Proposed contracts from the handoff (§8). Paths are placeholders until the backend confirms them. */
export const ENDPOINTS = {
    strategies: "/api/copy-trading/strategies",
    brokerAccount: "/api/copy-trading/broker-account",
    brokerLink: "/api/copy-trading/broker-account/link",
    capabilities: "/api/copy-trading/capabilities",
    fundingQuote: "/api/copy-trading/funding/quote",
    fundingSubmit: "/api/copy-trading/funding",
    mandate: "/api/copy-trading/mandate",
    /* one copy per strategy: strategies run in parallel with separate funds */
    copies: "/api/copy-trading/copies",
    copyState: (strategyId) => `/api/copy-trading/copies/${strategyId}`,
    lifecycle: (strategyId) => `/api/copy-trading/copies/${strategyId}/action`,
    release: "/api/copy-trading/withdrawals/release",
    payoutQuote: "/api/copy-trading/payouts/quote",
    payoutSubmit: "/api/copy-trading/payouts",
    operation: (id) => `/api/copy-trading/operations/${id}`,
}

/* How often a pending operation is re-read from the server. */
export const POLL_INTERVAL_MS = 3000
