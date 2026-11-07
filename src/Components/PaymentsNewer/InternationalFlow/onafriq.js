export const ONAFRIQ = "onafriq";

export const isOnafriq = (vendor) => String(vendor ?? "").toLowerCase() === ONAFRIQ;

// matches usePayoutChannel
const CHANNEL_BY_LABEL = {
  "bank account": "bank",
  "mobile wallet": "mobile",
  "mobile money": "mobile",
  "cash pickup": "cash",
};

export const onafriqChannel = (payoutChannel) => {
  if (payoutChannel?.value) return payoutChannel.value;
  const label = String(payoutChannel?.name ?? payoutChannel?.method ?? "")
    .split(" - ")[0]
    ?.trim()
    ?.toLowerCase();
  return CHANNEL_BY_LABEL[label] ?? "";
};

// id 1 shared
const SERVICE_IDS = { mobile: 1, bank: 2, cash: 1 };

const SERVICE_NAMES = {
  mobile: "international_mobile_wallet",
  bank: "international_bank_transfer",
  cash: "international_cash_pickup",
};

// case-sensitive
export const PAYER_SERVICE_LABELS = {
  mobile: "Mobile Wallet",
  bank: "Bank Account",
  cash: "Cash Pickup",
};

export const onafriqServiceId = (payoutChannel) => SERVICE_IDS[onafriqChannel(payoutChannel)];

export const onafriqServiceName = (payoutChannel) =>
  SERVICE_NAMES[onafriqChannel(payoutChannel)] ?? "";

const QUOTE_ERRORS = [
  [/less than the minimum value/i, "min payer"],
  [/greater than the maximum value/i, "max payer"],
  [/unable to reach onafriq/i, "vendor unreachable"],
];

// StepOne token
export const onafriqQuoteError = (message) => {
  if (typeof message !== "string" || !message) return false;
  return QUOTE_ERRORS.find(([pattern]) => pattern.test(message))?.[1] ?? false;
};

const CONFIRM_ERRORS = [
  [/jwt expired/i, "This transfer quote has expired. Please go back and request a new quote."],
  [
    /insufficient_funds/i,
    "You don't have enough funds for this transaction. Please top up your wallet.",
  ],
  [/limit check failed/i, "This amount exceeds your transfer limit. Please try a lower amount."],
];

// unknown passes through
export const onafriqConfirmError = (message) => {
  if (typeof message !== "string" || !message) return false;
  return CONFIRM_ERRORS.find(([pattern]) => pattern.test(message))?.[1] ?? message;
};
