// Catalogue for the "Add crypto wallet" flow.
// Pricing copy is presentational; the backend only takes a currency code.
// Every supported network for an asset is provisioned automatically.

export const ACTIVATION_FEE = "EUR 25.00"

export const ACCOUNT_TYPES = [
    {
        id: "fiat",
        icon: "bank",
        title: "Fiat / IBAN account",
        description: "EUR, GBP, CHF and more. Receive by SEPA, SWIFT and local rails.",
        price: "No fee",
        priceNote: "Subject to eligibility",
    },
    {
        id: "crypto",
        icon: "wallet",
        title: "Crypto wallet",
        description: "USDT, USDC, ETH and BTC. Hold, receive and convert to any balance.",
        price: ACTIVATION_FEE,
        priceNote: "One-time activation",
    },
]

// `code` is what /api/crypto-wallets/initiate expects.
// `networks` is display-only: all of them are enabled on activation.
export const ASSETS = [
    {
        id: "usdt",
        code: "USDT",
        symbol: "USDT",
        name: "Tether",
        description: "Tron, Ethereum, Solana and BNB Smart Chain",
        networks: "Tron (TRC-20) · Ethereum (ERC-20) · Solana (SPL) · BNB Smart Chain (BEP-20)",
        price: ACTIVATION_FEE,
        priceNote: "One-time activation",
        color: "#26A17B",
        // BVNK does not offer USDT in the EEA.
        restrictedInEurope: true,
    },
    {
        id: "eth",
        code: "ETH",
        symbol: "ETH",
        name: "Ethereum",
        description: "Ethereum network",
        networks: "Ethereum (ERC-20)",
        price: ACTIVATION_FEE,
        priceNote: "One-time activation",
        color: "#627EEA",
    },
    {
        id: "btc",
        code: "BTC",
        symbol: "BTC",
        name: "Bitcoin",
        description: "Bitcoin network",
        networks: "Bitcoin",
        price: ACTIVATION_FEE,
        priceNote: "One-time activation",
        color: "#F7931A",
    },
]

export const ACTIVATION_INCLUDES = [
    "A dedicated receiving address on every supported network",
    "Unlimited holding with no custody or storage charge",
    "Convert to any InstaPay fiat or crypto balance at live FX",
    "Send to saved beneficiaries and external wallet addresses",
    "Full transaction history and downloadable statements",
]

// Hardcoded pricing rule: the first crypto wallet is free.
export const FIRST_WALLET_FREE = true

export const PROMO_CODES = {
    WALLETFREE: { label: "First wallet free", total: "EUR 0.00" },
}
