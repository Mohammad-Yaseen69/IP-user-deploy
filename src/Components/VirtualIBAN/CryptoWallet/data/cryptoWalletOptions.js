// Catalogue for the "Add crypto wallet" flow.
// The backend only takes a currency code; the rest is display copy.
// Every supported network for an asset is provisioned automatically.

// Wallet activation is currently free. Flip this back to a price string if
// activation is ever charged again.
export const ACTIVATION_FEE = "Free";
export const ACTIVATION_IS_FREE = true;

export const ACCOUNT_TYPES = [
  {
    id: "fiat",
    icon: "bank",
    title: "Fiat / IBAN account",
    description:
      "EUR, GBP, CHF and more. Receive by SEPA, SWIFT and local rails.",
    price: "No fee",
    priceNote: "Subject to eligibility",
  },
  {
    id: "crypto",
    icon: "wallet",
    title: "Crypto wallet",
    description:
      "USDT, USDC, ETH and BTC. Hold, receive and convert to any balance.",
    price: ACTIVATION_FEE,
    priceNote: "No activation fee",
  },
];

// `code` is what /api/crypto-wallets/initiate expects.
// `networks` is display-only: all of them are enabled on activation.
// `comingSoon` assets are listed but cannot be selected yet.
export const ASSETS = [
  {
    id: "usdt",
    code: "USDT",
    symbol: "USDT",
    name: "Tether",
    description: "Tron, Ethereum, Solana and BNB Smart Chain",
    networks:
      "Tron (TRC-20) · Ethereum (ERC-20) · Solana (SPL) · BNB Smart Chain (BEP-20)",
    price: ACTIVATION_FEE,
    priceNote: "No activation fee",
    color: "#26A17B",
    // BVNK does not offer USDT in the EEA.
    restrictedInEurope: true,
  },
  {
    id: "usdc",
    code: "USDC",
    symbol: "USDC",
    name: "USD Coin",
    description: "Ethereum, Solana and BNB Smart Chain",
    networks: "Ethereum (ERC-20) · Solana (SPL) · BNB Smart Chain (BEP-20)",
    price: ACTIVATION_FEE,
    priceNote: "No activation fee",
    color: "#2775CA",
  },
  {
    id: "eth",
    code: "ETH",
    symbol: "ETH",
    name: "Ethereum",
    description: "Ethereum network",
    networks: "Ethereum (ERC-20)",
    price: ACTIVATION_FEE,
    priceNote: "No activation fee",
    color: "#627EEA",
    comingSoon: true,
  },
  {
    id: "btc",
    code: "BTC",
    symbol: "BTC",
    name: "Bitcoin",
    description: "Bitcoin network",
    networks: "Bitcoin",
    price: ACTIVATION_FEE,
    priceNote: "No activation fee",
    color: "#F7931A",
    comingSoon: true,
  },
];

export const ACTIVATION_INCLUDES = [
  "A dedicated receiving address on every supported network",
  "Unlimited holding with no custody or storage charge",
  "Convert to any InstaPay fiat or crypto balance at live FX",
  "Send to saved beneficiaries and external wallet addresses",
  "Full transaction history and downloadable statements",
];
