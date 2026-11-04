/*
 * Static Tag Markets responses used while USE_MOCK_API is on. Wallets, IBAN and receiving accounts are
 * never mocked: they always come from the customer's real InstaPay account.
 */

export const QUOTE_TTL_SECONDS = 600;
/* Broker limits are set in USD and shown in the funding wallet's currency. */
export const ALLOCATION_LIMITS_USD = { min: 50, max: 850 };
export const ALLOCATION_PRESETS_USD = [50, 250, 500];
export const PAYOUT_FEE_USD_CENTS = 200;
export const MANDATE_VERSION = "v2";
export const CATALOG_VERSION = "TM-CAT-2026.10";
export const BROKER_ACCOUNT_ID = "TM-55021084";

export const STRATEGY_CATEGORIES = ["forex", "metals", "indices", "energy"];

export const STRATEGIES = [
  {
    id: "atlas-fx",
    code: "ATL-FX-01",
    name: "Atlas FX",
    category: "forex",
    focus: "FX majors",
    instruments: ["EUR/USD", "GBP/USD", "USD/JPY"],
    trackRecord: "38 months",
    maxDrawdown: "-9.4%",
    feeSchedule: "20% performance fee",
    leverage: "Up to 1:30",
    historyAsOf: "30 Sep 2026",
    copyMode: "New trades, proportional",
    available: true,
  },
  {
    id: "meridian-gold",
    code: "MRD-AU-02",
    name: "Meridian Gold",
    category: "metals",
    focus: "Gold / Silver",
    instruments: ["XAU/USD", "XAG/USD"],
    trackRecord: "29 months",
    maxDrawdown: "-12.1%",
    feeSchedule: "15% performance fee",
    leverage: "Up to 1:20",
    historyAsOf: "30 Sep 2026",
    copyMode: "New trades, proportional",
    available: true,
  },
  {
    id: "baobab-indices",
    code: "BBB-IX-03",
    name: "Baobab Indices",
    category: "indices",
    focus: "US / EU indices",
    instruments: ["US500", "GER40", "EU50"],
    trackRecord: "26 months",
    maxDrawdown: "-14.6%",
    feeSchedule: "1.5% yearly management fee",
    leverage: "Up to 1:20",
    historyAsOf: "30 Sep 2026",
    copyMode: "New trades, proportional",
    available: true,
  },
  {
    id: "sahel-energy",
    code: "SHL-EN-04",
    name: "Sahel Energy",
    category: "energy",
    focus: "Brent, WTI",
    instruments: ["UKOIL", "USOIL"],
    trackRecord: "19 months",
    maxDrawdown: "-18.3%",
    feeSchedule: "20% performance fee",
    leverage: "Up to 1:10",
    historyAsOf: "30 Sep 2026",
    copyMode: "New trades, proportional",
    available: true,
  },
];

/* Capability service response for the broker_funding operation. */
export const PAYMENT_METHODS = [
  {
    id: "instapay_wallet",
    label: "InstaPay Wallet",
    description: "Pay from your wallet balance",
    icon: "wallet",
    available: true,
    feeRate: 0,
    tag: "Pay directly",
  },
  {
    id: "mobile_money",
    label: "Mobile Money - Africa",
    description: "Orange, Free Money when eligible",
    icon: "phone",
    available: true,
    feeRate: 0.004,
    providers: ["Orange", "Free Money"],
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Secure checkout, may need 3-D Secure",
    icon: "card",
    available: true,
    feeRate: 0.004,
  },
  {
    id: "crypto",
    label: "Crypto incl. stablecoins",
    description: "14 assets · choose asset, then network",
    icon: "crypto",
    available: true,
    feeRate: 0.002,
  },
  {
    id: "instapay_iban",
    label: "Bank transfer to your IBAN",
    description: "Send from any bank to your InstaPay IBAN",
    icon: "bank",
    available: true,
    feeRate: 0,
    requiresIban: true,
  },
  {
    id: "open_banking",
    label: "Open Banking - EU",
    description: "Available for eligible EU bank accounts",
    icon: "globe",
    available: false,
  },
  {
    id: "asia_wallet",
    label: "Mobile Wallet - Asia",
    description: "Not supported by providers for this transaction",
    icon: "phone",
    available: false,
  },
];

export const CRYPTO_ASSETS = [
  { id: "usdt", label: "Tether", networks: ["Tron", "Ethereum"] },
  { id: "usdc", label: "USDC", networks: ["Ethereum", "Solana"] },
  { id: "btc", label: "Bitcoin", networks: ["Bitcoin"] },
  { id: "eth", label: "Ethereum", networks: ["Ethereum"] },
  { id: "eurc", label: "EURC", networks: ["Ethereum", "Solana"] },
  { id: "pyusd", label: "PayPal USD", networks: ["Ethereum"] },
  { id: "bnb", label: "Binance Coin", networks: ["BNB Smart Chain"] },
  { id: "sol", label: "Solana", networks: ["Solana"] },
  { id: "xrp", label: "Ripple", networks: ["XRP Ledger"] },
  { id: "ltc", label: "Litecoin", networks: ["Litecoin"] },
  { id: "trx", label: "Tronix", networks: ["Tron"] },
  { id: "polygon", label: "Polygon", networks: [] },
  { id: "openusd", label: "OpenUSD", networks: [] },
  { id: "usdg", label: "USDG", networks: [] },
];

export const PAYOUT_PURPOSES = [
  "Personal savings",
  "Family support",
  "Living expenses",
  "Investment proceeds",
];

/* Broker-reported figures per strategy once copying is live (USD cents). Each strategy has its own funds. */
const POSITIONS = {
  "atlas-fx": [
    {
      symbol: "EUR/USD",
      side: "Buy",
      lots: "0.04",
      open: "1.0842",
      current: "1.0865",
      pnlCents: 920,
    },
    {
      symbol: "GBP/USD",
      side: "Buy",
      lots: "0.03",
      open: "1.2710",
      current: "1.2727",
      pnlCents: 510,
    },
    {
      symbol: "USD/JPY",
      side: "Sell",
      lots: "0.02",
      open: "148.32",
      current: "148.46",
      pnlCents: -190,
    },
  ],
  "meridian-gold": [
    {
      symbol: "XAU/USD",
      side: "Buy",
      lots: "0.01",
      open: "2368.40",
      current: "2381.10",
      pnlCents: 1270,
    },
    {
      symbol: "XAG/USD",
      side: "Buy",
      lots: "0.05",
      open: "29.12",
      current: "29.05",
      pnlCents: -350,
    },
  ],
  "baobab-indices": [
    {
      symbol: "US500",
      side: "Buy",
      lots: "0.10",
      open: "5432.1",
      current: "5451.8",
      pnlCents: 1970,
    },
    {
      symbol: "GER40",
      side: "Sell",
      lots: "0.05",
      open: "18710",
      current: "18742",
      pnlCents: -160,
    },
  ],
  "sahel-energy": [
    { symbol: "UKOIL", side: "Buy", lots: "0.10", open: "79.40", current: "80.12", pnlCents: 720 },
  ],
};

export const brokerSnapshotFor = (strategyId, capitalCents) => ({
  withdrawableCents: Math.round(capitalCents * 0.2372),
  positions: POSITIONS[strategyId] || [],
  realizedCents: 0,
});
