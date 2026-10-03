import { COPY_STATUS, OP_STATUS } from "../../../stateMachines/copyTrading"
import { ALLOCATION_LIMITS_USD, ALLOCATION_PRESETS_USD, PAYOUT_FEE_USD_CENTS } from "../api/fixtures"
import { formatAmount } from "./money"

const getStrategyById = (state, id) => state.strategies.find(item => item.id === id) || null

export const activeStrategy = (state) => getStrategyById(state, state.copy.strategyId || state.draft.strategyId)

const methodById = (state, id) => state.paymentMethods.find(item => item.id === id) || null

/* Units of `currency` per 1 USD; null until the rate service has answered. */
export const unitsPerUsd = (state, currency) => (currency ? state.rates[currency] ?? null : null)

/* Rounds a converted amount to 2 significant digits so presets read like real choices (e.g. 150,000). */
const niceRound = (value) => {
    if (!value) return 0
    const step = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1)
    return Math.round(value / step) * step
}

export const allocationLimits = (state) => {
    const rate = unitsPerUsd(state, state.draft.currency)
    if (!rate) return null
    return { min: niceRound(ALLOCATION_LIMITS_USD.min * rate), max: niceRound(ALLOCATION_LIMITS_USD.max * rate) }
}

export const allocationPresets = (state) => {
    const rate = unitsPerUsd(state, state.draft.currency)
    return rate ? ALLOCATION_PRESETS_USD.map(usd => niceRound(usd * rate)) : []
}

export const estimateFee = (state) => Math.round(state.draft.allocation * (methodById(state, state.draft.method?.family)?.feeRate || 0) * 100) / 100

export const expectedCreditCents = (state) => {
    const rate = unitsPerUsd(state, state.draft.currency)
    return rate ? Math.round((state.draft.allocation / rate) * 100) : 0
}

export const walletAfterDebit = (state, wallet) => (wallet ? wallet.balance - state.draft.allocation - estimateFee(state) : 0)

export const walletShortfall = (state, wallet) => {
    if (state.draft.method?.family !== "instapay_wallet" || !wallet) return 0
    return Math.max(0, -walletAfterDebit(state, wallet))
}

export const allocationError = (state, t) => {
    const { allocation, currency } = state.draft
    const limits = allocationLimits(state)
    if (!allocation) return t("Enter an amount to allocate.")
    if (!limits) return ""
    if (allocation < limits.min) return t("The minimum allocation is {{amount}}.", { amount: formatAmount(limits.min, currency) })
    if (allocation > limits.max) return t("The maximum allocation is {{amount}}.", { amount: formatAmount(limits.max, currency) })
    return ""
}

/* Broker figures: equity includes open positions, only withdrawable cash can leave the broker. */
export const unrealizedCents = (state) => (state.broker?.positions || []).reduce((sum, p) => sum + p.pnlCents, 0)
export const equityCents = (state) => (state.broker ? state.copy.capitalCents + unrealizedCents(state) : state.copy.capitalCents)
export const withdrawableCents = (state) => state.broker?.withdrawableCents || 0
export const openPositionsCount = (state) => state.broker?.positions?.length || 0

export const copyIsLive = (state) => ![COPY_STATUS.NONE, COPY_STATUS.ACTIVATION_PENDING].includes(state.copy.status)

export const withdrawalInProgress = (state) => {
    const w = state.withdrawal
    if (!w) return false
    return ![OP_STATUS.COMPLETED, OP_STATUS.REVERSED].includes(w.payout?.status)
}

/* What a payout of `amountCents` USD would deliver in `currency` after the payout fee. */
export const estimatedNet = (state, amountCents, currency) => {
    const rate = unitsPerUsd(state, currency)
    if (!rate) return null
    return Math.max(0, ((amountCents - PAYOUT_FEE_USD_CENTS) / 100) * rate)
}

/* Gross USD cents needed so the recipient gets exactly `netAmount` in `currency`. */
export const grossCentsForNet = (state, netAmount, currency) => {
    const rate = unitsPerUsd(state, currency)
    if (!rate) return 0
    return Math.round((netAmount / rate) * 100) + PAYOUT_FEE_USD_CENTS
}
