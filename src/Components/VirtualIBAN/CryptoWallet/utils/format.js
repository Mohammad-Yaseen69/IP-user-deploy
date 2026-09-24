const CRYPTO_COLORS = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    USDT: "#26A17B",
    USDC: "#2775CA",
}

const ASSET_NAMES = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    USDT: "Tether",
    USDC: "USD Coin",
}

const ASSET_SYMBOLS = {
    BTC: "₿",
    ETH: "Ξ",
    USDT: "₮",
    USDC: "$",
}

/* One glyph, for the circles too small to spell the code out. */
export const getAssetSymbol = (code) =>
    ASSET_SYMBOLS[String(code || "").toUpperCase()] || String(code || "").charAt(0)

export const getWalletAccentColor = (code) =>
    CRYPTO_COLORS[String(code || "").toUpperCase()] || "#5926F0"

export const getAssetFullName = (code) =>
    ASSET_NAMES[String(code || "").toUpperCase()] || ""

export const formatCryptoAmount = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num.toFixed(6) : "0.000000"
}
