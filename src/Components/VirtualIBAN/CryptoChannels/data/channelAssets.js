// Currency catalogue for the "Add crypto channel" flow.
// The backend only takes a pay currency + the vIBAN's display currency;
// every network the asset supports is provisioned automatically as the
// channel's primary address plus its alternatives.
export const CHANNEL_ASSETS = [
    {
        id: "usdt",
        code: "USDT",
        symbol: "USDT",
        name: "Tether",
        description: "Ethereum, Tron, Solana, BNB Smart Chain and Polygon",
        color: "#26A17B",
    },
    {
        id: "usdc",
        code: "USDC",
        symbol: "USDC",
        name: "USD Coin",
        description: "Ethereum, Tron, Solana, BNB Smart Chain and Polygon",
        color: "#2775CA",
    },
    {
        id: "eth",
        code: "ETH",
        symbol: "ETH",
        name: "Ethereum",
        description: "Ethereum network",
        color: "#627EEA",
    },
    {
        id: "btc",
        code: "BTC",
        symbol: "BTC",
        name: "Bitcoin",
        description: "Bitcoin network",
        color: "#F7931A",
    },
]
