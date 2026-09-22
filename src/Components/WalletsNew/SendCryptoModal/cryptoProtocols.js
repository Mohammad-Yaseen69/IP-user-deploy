const UNSUPPORTED_PROTOCOLS = ["STELLAR"]

export const CRYPTO_PAYOUT_PROTOCOLS = {
    USDT: ["TRC20", "ERC20", "BEP20", "POLYGON", "SOL"],
    USDC: ["SOL", "POLYGON", "ERC20", "TRC20", "BEP20"],
}

export const CRYPTO_PAYOUT_ASSETS = Object.keys(CRYPTO_PAYOUT_PROTOCOLS)

export const PROTOCOL_LABELS = {
    TRC20: "TRON (TRC20)",
    ERC20: "Ethereum (ERC20)",
    BEP20: "BNB Smart Chain (BEP20)",
    POLYGON: "Polygon",
    SOL: "Solana",
}

const NETWORK_ALIASES = {
    tron: "TRC20",
    trc20: "TRC20",
    "trc-20": "TRC20",
    ethereum: "ERC20",
    eth: "ERC20",
    erc20: "ERC20",
    "erc-20": "ERC20",
    bsc: "BEP20",
    bnb: "BEP20",
    binance: "BEP20",
    bep20: "BEP20",
    "bep-20": "BEP20",
    polygon: "POLYGON",
    matic: "POLYGON",
    solana: "SOL",
    sol: "SOL",
}

const EVM_PROTOCOLS = ["ERC20", "BEP20", "POLYGON"]
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/

export const getProtocolLabel = (protocol) =>
    PROTOCOL_LABELS[String(protocol || "").toUpperCase()] || protocol || ""

export const isSupportedProtocol = (protocol) =>
    !!protocol && !UNSUPPORTED_PROTOCOLS.includes(String(protocol).toUpperCase())

export const normalizeProtocol = (value) => {
    const key = String(value || "").trim().toLowerCase()
    if (!key) return ""
    const protocol = NETWORK_ALIASES[key] || (PROTOCOL_LABELS[key.toUpperCase()] ? key.toUpperCase() : "")
    return isSupportedProtocol(protocol) ? protocol : ""
}

export const getAssetProtocols = (asset) =>
    CRYPTO_PAYOUT_PROTOCOLS[String(asset || "").toUpperCase()] || CRYPTO_PAYOUT_PROTOCOLS.USDT

export const getAssetProtocolOptions = (asset) =>
    getAssetProtocols(asset).map((protocol) => ({ value: protocol, label: getProtocolLabel(protocol) }))

export const getProtocolsForAddress = (address) => {
    const value = String(address || "").trim()
    if (!value) return []
    if (/^0x[a-fA-F0-9]{40}$/.test(value)) return EVM_PROTOCOLS
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(value)) return ["TRC20"]
    if (value.length >= 32 && value.length <= 44 && BASE58.test(value)) return ["SOL"]
    return []
}

export const filterProtocolsForAddress = (protocols = [], address = "") => {
    const offered = (protocols || []).map((p) => String(p).toUpperCase()).filter(isSupportedProtocol)
    const possible = getProtocolsForAddress(address)
    if (!possible.length) return offered
    const narrowed = offered.filter((p) => possible.includes(p))
    return narrowed.length ? narrowed : offered
}

export const getChannelProtocol = (channel) => normalizeProtocol(
    channel?.extras?.crypto_network ||
    channel?.network ||
    channel?.protocol ||
    channel?.currency
)

export const getInitialProtocol = (channel) => {
    const stored = getChannelProtocol(channel)
    if (stored) return stored

    return getProtocolsForAddress(getChannelAddress(channel))[0] || ""
}

export const getChannelAddress = (channel) =>
    String(channel?.wallet_address || channel?.address || "").trim()

export const getChannelAsset = (channel) => {
    const asset = String(channel?.extras?.crypto_asset || channel?.asset || channel?.currency || "").trim().toUpperCase()
    return asset === "USDT" || asset === "USDC" ? asset : ""
}

export const getBeneficiaryCryptoChannels = (beneficiary) =>
    (Array.isArray(beneficiary?.crypto) ? beneficiary.crypto : []).filter((channel) => getChannelAddress(channel))

export const hasCryptoChannel = (beneficiary, cryptoCurrency = "") => {
    const channels = getBeneficiaryCryptoChannels(beneficiary)
    if (!channels.length) return false
    if (!cryptoCurrency) return true
    return channels.some((channel) => {
        const asset = getChannelAsset(channel)
        return !asset || asset === String(cryptoCurrency).toUpperCase()
    })
}

export const maskAddress = (address) => {
    const value = String(address || "").trim()
    if (value.length <= 12) return value
    return `${value.slice(0, 6)}...${value.slice(-6)}`
}
