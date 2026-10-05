import i18n from "../../../i18n"

const locale = () => (i18n.language?.startsWith("fr") ? "fr-FR" : "en-US")
const number = (value, digits = 0) =>
    new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value || 0)

/* Currencies without a minor unit; everything else shows 2 decimals. USD amounts are stored in integer cents. */
const ZERO_DECIMAL = ["XOF", "XAF", "JPY", "KRW", "UGX", "RWF", "GNF", "VND"]
const decimalsFor = (currency) => (ZERO_DECIMAL.includes(currency) ? 0 : 2)

export const formatAmountNumber = (amount, currency) => number(amount, decimalsFor(currency))
export const formatAmount = (amount, currency) => `${formatAmountNumber(amount, currency)} ${currency || ""}`.trim()

export const formatUsd = (cents, { decimals = true } = {}) => `${number((cents || 0) / 100, decimals ? 2 : 0)} USD`

export const formatUsdNumber = (cents) => number((cents || 0) / 100, 2)

export const formatSignedUsd = (cents) => `${cents > 0 ? "+" : cents < 0 ? "-" : ""}${formatUsd(Math.abs(cents))}`

const parseWhole = (value) => {
    const digits = String(value ?? "").replace(/[^\d]/g, "")
    return digits ? Number(digits) : 0
}

/* Accepts decimals for currencies that have a minor unit. */
export const parseAmount = (value, currency) => {
    if (ZERO_DECIMAL.includes(currency)) return parseWhole(value)
    const clean = String(value ?? "").replace(/[^\d.]/g, "")
    const amount = Number(clean)
    return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0
}

export const parseDecimalToCents = (value) => {
    const clean = String(value ?? "").replace(/[^\d.]/g, "")
    const amount = Number(clean)
    return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

export const formatTime = (iso) =>
    iso ? new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : ""

export const formatDateTime = (iso) =>
    iso ? new Intl.DateTimeFormat(locale(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : ""
