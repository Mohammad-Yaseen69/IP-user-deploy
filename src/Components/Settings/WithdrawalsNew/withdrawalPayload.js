import {
  bankExtrasInitial,
  basicExtrasInitial,
  buildBankExtrasPayload,
  normalizeBankExtras,
} from "../../../utils/Data";

/* Each withdrawal record holds one country; each method lives in its own array on it. */
export const CHANNEL_KEY_BY_METHOD = {
  bank_account: "bank_details",
  mobile_wallet: "mobile_wallet",
  cash_pickup: "cash_pickup",
  card_payment: "card",
};

export const METHOD_BY_CHANNEL_KEY = {
  bank_details: "bank_account",
  mobile_wallet: "mobile_wallet",
  cash_pickup: "cash_pickup",
  card: "card_payment",
};

/* The legacy `account_type` values the backend keys channels by. */
const ACCOUNT_TYPE_BY_CHANNEL_KEY = {
  bank_details: "bank",
  card: "card",
  mobile_wallet: "mobile",
  crypto: "crypto",
  cash_pickup: "cash",
};

/* Same ids the old channel tiles sent as `service_id`. */
const SERVICE_ID_BY_CHANNEL_KEY = {
  bank_details: 2,
  mobile_wallet: 1,
  cash_pickup: 3,
  card: 4,
};

export const FIAT_CHANNEL_KEYS = ["bank_details", "mobile_wallet", "cash_pickup", "card"];

/* The money-transfer methods a new withdrawal can use, in the order the design lists them. */
export const TRANSFER_METHODS = ["bank_account", "mobile_wallet", "cash_pickup"];

export const MAX_COUNTRIES = 3;
export const MAX_CRYPTO_WALLETS = 3;

export const DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "NATIONAL_ID", label: "National Identity Card" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "SOCIAL_SECURITY", label: "Social Security Card/Number" },
  { value: "SENIOR_CITIZEN_ID", label: "Senior Citizen Identification Card" },
  { value: "RESIDENT_CARD", label: "Permanent Residency Identification Card" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "HEALTH_CARD", label: "Health Insurance Card/Number" },
  { value: "EMPLOYER_ID", label: "Employer Identification Card" },
];

/* Sent as the mobile channel's extras, exactly as the old form did. */
const MOBILE_EXTRAS_INITIAL = {
  msisdn: "",
  account_number: "",
  email: "",
  bank_account_number: "",
  account_type: "",
  iban: "",
};

export const CRYPTO_NETWORKS = [
  {
    value: "TRC-20 (TRON)",
    aliases: ["TRC-20", "TRC20", "TRON"],
    hint: "Exactly 34 characters and starts with T.",
    validate: (address) => /^T[a-zA-Z0-9]{33}$/.test(address),
  },
  {
    value: "ERC-20 (Ethereum)",
    aliases: ["ERC-20", "ERC20", "Ethereum"],
    hint: "Exactly 42 characters and starts with 0x.",
    validate: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),
  },
  {
    value: "BEP-20 (BNB Smart Chain)",
    aliases: ["BEP-20", "BEP20", "BNB Smart Chain", "BNB Chain"],
    hint: "Exactly 42 characters and starts with 0x.",
    validate: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),
  },
];

export const DEFAULT_CRYPTO_NETWORK = CRYPTO_NETWORKS[0].value;

export const normalizeNetwork = (network, address = "") => {
  const value = network || "";
  const found = CRYPTO_NETWORKS.find(
    (item) =>
      item.value === value ||
      item.aliases.some((alias) => alias.toLowerCase() === value.toLowerCase()),
  );

  if (found) return found.value;
  if (address?.startsWith("T")) return "TRC-20 (TRON)";
  if (address?.startsWith("0x")) return "ERC-20 (Ethereum)";

  return DEFAULT_CRYPTO_NETWORK;
};

export const getCryptoList = (withdrawal) => {
  if (Array.isArray(withdrawal?.crypto) && withdrawal.crypto.length > 0) return withdrawal.crypto;
  if (Array.isArray(withdrawal?.crypto_wallet) && withdrawal.crypto_wallet.length > 0)
    return withdrawal.crypto_wallet;
  return [];
};

export const hasOtherWithdrawalChannels = (withdrawal) => {
  return ["bank_details", "mobile_wallet", "cash_pickup", "card", "payment_card"].some(
    (key) => Array.isArray(withdrawal?.[key]) && withdrawal[key].length > 0,
  );
};

export const getHolderName = (userDetails) =>
  `${userDetails?.user?.first_name ?? userDetails?.company_name ?? ""} ${userDetails?.user?.last_name ?? ""}`.trim();

export const getDialCode = (dialCodes, iso3) =>
  (dialCodes?.[iso3]?.dial_code ?? "").replace("+", "");

/* Address fields asked on the details step, in the order the design shows them. */
export const ADDRESS_FIELDS = ["address", "province_state", "city", "postal_code"];

/* A country other than the user's own always needs an address there. */
export const CROSS_BORDER_ADDRESS_FIELDS = ["address", "city", "postal_code"];

export const addressFromRecord = (record) => ({
  address: record?.address ?? "",
  city: record?.city ?? "",
  postal_code: record?.postal_code ?? record?.postalCode ?? "",
  province_state: record?.extras?.province_state ?? "",
  state_name: record?.extras?.state_name ?? "",
});

/* Blank form for a method, or the saved channel ready to edit. */
export const prefillChannel = ({ method, record, userDetails }) => {
  const entry = record?.[CHANNEL_KEY_BY_METHOD[method]]?.[0];

  switch (method) {
    case "bank_account": {
      const accNumType = entry && !entry?.iban && entry?.swift_code ? "Swift" : "IBAN";
      return {
        payer_id: entry?.payer_id ?? "",
        accNumType,
        bank_iban: entry?.iban || entry?.swift_code || "",
        bank_account_number: entry?.account_number ?? "",
        bank_name: entry?.name ?? "",
        bank_branch_name: entry?.branch_name ?? "",
        bank_branch_street: entry?.branch_street ?? "",
        bank_city: entry?.city ?? "",
        bank_province: entry?.province ?? "",
        bank_postal_code: entry?.postal_code ?? "",
        account_holder_name: entry?.account_holder_name ?? getHolderName(userDetails),
        extras: {
          ...bankExtrasInitial,
          ...(entry?.extras ? normalizeBankExtras(entry.extras) : {}),
        },
      };
    }
    case "mobile_wallet":
      return {
        payer_id: entry?.payer_id ?? entry?.money_provider ?? "",
        wallet_name: entry?.wallet_name ?? "",
        wallet_account_number: entry?.wallet_account_number ?? "",
        extras: entry?.extras ?? MOBILE_EXTRAS_INITIAL,
      };
    case "cash_pickup":
      return {
        payer_id: entry?.payer_id ?? "",
        document_type: entry?.document_type ?? "",
        document_number: entry?.document_number ?? "",
        extras: entry?.extras ?? { msisdn: "" },
      };
    case "crypto_wallet":
      return {
        network: DEFAULT_CRYPTO_NETWORK,
        wallet_address: "",
      };
    default:
      return {};
  }
};

/* One channel entry, in the exact shape the old form posted for that method. */
const buildChannelEntry = ({ method, channel, vendor, existing }) => {
  const base = existing?._id ? { _id: existing._id } : {};

  switch (method) {
    case "bank_account":
      return {
        ...base,
        service_id: SERVICE_ID_BY_CHANNEL_KEY.bank_details,
        payer_id: channel.payer_id,
        swift_code: channel.accNumType === "Swift" ? channel.bank_iban : "",
        iban: channel.accNumType === "IBAN" ? channel.bank_iban : "",
        account_number: channel.bank_account_number,
        name: channel.bank_name,
        branch_name: channel.bank_branch_name,
        branch_street: channel.bank_branch_street,
        city: channel.bank_city,
        province: channel.bank_province,
        postal_code: channel.bank_postal_code,
        account_holder_name: channel.account_holder_name,
        extras: buildBankExtrasPayload(channel.extras),
        vendor,
      };
    case "mobile_wallet":
      return {
        ...base,
        service_id: SERVICE_ID_BY_CHANNEL_KEY.mobile_wallet,
        payer_id: channel.payer_id,
        money_provider: channel.payer_id,
        wallet_name: channel.wallet_name,
        wallet_account_number: channel.wallet_account_number,
        extras: channel.extras,
        vendor,
      };
    case "cash_pickup":
      return {
        ...base,
        service_id: SERVICE_ID_BY_CHANNEL_KEY.cash_pickup,
        payer_id: channel.payer_id,
        document_type: channel.document_type,
        document_number: channel.document_number,
        extras: channel.extras,
        vendor,
      };
    default:
      return null;
  }
};

const accountTypesOf = (payload) =>
  Object.entries(ACCOUNT_TYPE_BY_CHANNEL_KEY)
    .filter(([key]) => Array.isArray(payload[key]) && payload[key].length > 0)
    .map(([, type]) => type);

/*
 * Body for create-withdrawal / update-withdrawal on a country record. Channels other
 * than the one being saved are sent back untouched, so adding or editing one method
 * never drops another. `channel` null removes that method instead.
 */
export const buildWithdrawalPayload = ({
  userDetails,
  record,
  country,
  method,
  channel,
  vendor,
  address: typed = {},
}) => {
  const channelKey = CHANNEL_KEY_BY_METHOD[method];
  const existing = record?.[channelKey]?.[0];
  const entry = channel ? buildChannelEntry({ method, channel, vendor, existing }) : null;

  /* An address typed for this country wins; otherwise the record's, then the profile's. */
  const address = typed.address || record?.address || userDetails?.address || "";
  const city =
    typed.city ||
    (method === "bank_account" && channel?.bank_city
      ? channel.bank_city
      : record?.city || userDetails?.city || "");
  const postal_code =
    typed.postal_code ||
    (method === "bank_account" && channel?.bank_postal_code
      ? channel.bank_postal_code
      : record?.postal_code || record?.postalCode || userDetails?.postal_code || "");
  const stateExtras = typed.province_state
    ? {
        province_state: typed.province_state,
        state_name: typed.state_name || "",
      }
    : {};

  const payload = {
    first_name: userDetails?.user?.first_name ?? "",
    last_name: userDetails?.user?.last_name ?? "",
    company_name: userDetails?.company_name ?? "",
    email: userDetails?.email ?? "",
    phone: userDetails?.phone ?? "",
    address,
    city,
    postal_code,
    country: country?.id ?? record?.country?._id ?? record?.country ?? "",
    iso_code: country?.alpha3 ?? record?.iso_code,
    account: userDetails?._id,
    withdrawal_type: userDetails?.account_type,
    account_type: [],
    extras: { ...(record?.extras ?? basicExtrasInitial), ...stateExtras },
    isUsaBank: record?.isUsaBank ?? false,
    relation: record?.relation ?? "xyz",
    wallet: record?.wallet ?? [],
    vendor: vendor ?? record?.vendor,
    bank_details: record?.bank_details ?? [],
    mobile_wallet: record?.mobile_wallet ?? [],
    crypto: record?.crypto ?? [],
    cash_pickup: record?.cash_pickup ?? [],
    card: record?.card ?? record?.payment_card ?? [],
  };

  if (channelKey) {
    payload[channelKey] = entry ? [entry] : [];
  }
  payload.account_type = accountTypesOf(payload);

  return payload;
};

/* Crypto wallets live on their own records, flagged isCrypto, one wallet each. */
export const buildCryptoPayload = (channel, existingCrypto = {}) => ({
  ...existingCrypto,
  currency: "USDT",
  network: channel.network,
  wallet_address: channel.wallet_address.trim(),
});

export const buildCryptoWithdrawalPayload = ({ userDetails, cryptoList, record = null }) => {
  const existingAccountTypes = Array.isArray(record?.account_type) ? record.account_type : [];
  const accountTypes =
    cryptoList.length > 0
      ? [...new Set([...existingAccountTypes, "crypto"])]
      : existingAccountTypes.filter((item) => item !== "crypto");

  return {
    first_name: userDetails?.user?.first_name ?? record?.first_name ?? "",
    last_name: userDetails?.user?.last_name ?? record?.last_name ?? "",
    company_name: userDetails?.company_name ?? record?.company_name ?? "",
    email: userDetails?.email ?? record?.email ?? "",
    phone: userDetails?.phone ?? record?.phone ?? "",
    address: userDetails?.address ?? record?.address ?? "",
    city: userDetails?.city ?? record?.city ?? "",
    country:
      record?.country ??
      userDetails?.country?._id ??
      userDetails?.country?.id ??
      userDetails?.country_name ??
      "",
    iso_code:
      record?.iso_code ??
      userDetails?.country?.country_iso_code ??
      userDetails?.country_iso_code ??
      "",
    account: userDetails?._id,
    withdrawal_type: userDetails?.account_type,
    account_type: accountTypes,
    extras: record?.extras ?? {},
    isUsaBank: record?.isUsaBank ?? false,
    relation: record?.relation ?? "xyz",
    wallet: record?.wallet ?? [],
    vendor: record?.vendor ?? "crypto",
    isCrypto: true,
    bank_details: record?.bank_details ?? [],
    mobile_wallet: record?.mobile_wallet ?? [],
    crypto: cryptoList,
    cash_pickup: record?.cash_pickup ?? [],
    card: record?.card ?? record?.payment_card ?? [],
  };
};
