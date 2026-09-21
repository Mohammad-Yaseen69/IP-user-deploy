/*
 * Catalogue for the Add beneficiary (DS 2.0) flow.
 *
 * Which methods appear is decided at runtime by /api/payment/services for the
 * chosen country; this file only supplies the presentation metadata for each
 * one, plus the mapping between our method keys and the vendors' service names.
 */

export const RECIPIENT_TYPES = [
    {
        value: 'individual',
        title: 'Individual',
        subtitle: 'A person, like family or a freelancer',
        icon: 'user',
    },
    {
        value: 'business',
        title: 'Business',
        subtitle: 'A company, supplier or partner',
        icon: 'buildings',
    },
];

/* Presentation metadata, keyed by our internal method value. */
export const METHOD_META = {
    mobile_wallet: {
        icon: 'device-mobile',
        title: 'Mobile wallet',
        subtitle: 'Paid into a mobile money account',
        timing: 'Minutes',
    },
    bank_account: {
        icon: 'bank',
        title: 'Bank account',
        subtitle: 'Local banks in {country}',
        timing: '1 to 3 days',
    },
    cash_pickup: {
        icon: 'money',
        title: 'Cash pickup',
        subtitle: 'They collect cash at an agent',
        timing: 'Minutes',
    },
    card_payment: {
        icon: 'coins',
        title: 'Payment card',
        subtitle: 'Paid onto a debit or credit card',
        timing: 'Minutes',
    },
    local_bank: {
        icon: 'bank',
        title: 'Local bank (SEPA)',
        subtitle: 'Euro transfer from your IBAN balance',
        timing: 'Same day',
    },
    swift: {
        icon: 'globe',
        title: 'International bank (SWIFT)',
        subtitle: 'Sends in EUR or USD',
        timing: '2 to 4 days',
    },
    crypto_wallet: {
        icon: 'coins',
        title: 'Crypto wallet',
        subtitle: 'USDT, USDC on supported networks',
        timing: 'Minutes',
    },
};

/* Our method value -> the service name the payers API expects. */
export const THUNES_SERVICE_BY_METHOD = {
    mobile_wallet: 'Mobile Wallet',
    bank_account: 'Bank Account',
    cash_pickup: 'Cash Pickup',
    card_payment: 'Cards',
};

const SERVICE_NAME_TO_METHOD = {
    'mobile wallet': 'mobile_wallet',
    'bank account': 'bank_account',
    'cash pickup': 'cash_pickup',
    cards: 'card_payment',
    'card payment': 'card_payment',
};

export const methodFromServiceName = (name) =>
    SERVICE_NAME_TO_METHOD[String(name || '').trim().toLowerCase()] || null;

/* Rails paid from the user's own Virtual IBAN balance (BVNK). */
export const BVNK_METHODS = [
    { value: 'local_bank', vendor: 'bvnk' },
    { value: 'swift', vendor: 'bvnk' },
    { value: 'crypto_wallet', vendor: 'bvnk' },
];

export const GROUPS = {
    transfer: {
        key: 'money_transfer',
        icon: 'globe-group',
        title: 'Money transfer (international)',
        subtitle: 'Send in local currency to a bank, wallet or cash point',
    },
    virtualIban: {
        key: 'virtual_iban',
        icon: 'bank-group',
        title: 'Bank transfer (via your Virtual IBAN)',
        subtitle: 'Pay from your IBAN balance',
    },
};

/* Label used under the recipient name on the context card. */
export const METHOD_CONTEXT_LABEL = Object.keys(METHOD_META).reduce((acc, key) => {
    acc[key] = METHOD_META[key].title;
    return acc;
}, {});

/* Which glyph represents a method once it is chosen. */
export const METHOD_AVATAR_ICON = {
    mobile_wallet: 'device-mobile',
    bank_account: 'bank-avatar',
    cash_pickup: 'money',
    card_payment: 'coins',
    swift: 'globe',
    crypto_wallet: 'coins',
    local_bank: 'bank-avatar',
};

/* The channel_type the beneficiary API expects, per method. */
export const CHANNEL_TYPE_BY_METHOD = {
    mobile_wallet: 'mobile_wallet',
    bank_account: 'bank',
    cash_pickup: 'cash_pickup',
    card_payment: 'card',
    local_bank: 'bank',
    swift: 'bank',
    crypto_wallet: 'crypto',
};

export const CRYPTO_ASSETS = [
    { value: 'USDC', label: 'USDC' },
    { value: 'USDT', label: 'USDT' },
];

export const CRYPTO_NETWORKS = [
    { value: 'ethereum', label: 'Ethereum (ERC-20)' },
    { value: 'tron', label: 'Tron (TRC-20)' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'solana', label: 'Solana' },
];

export const INITIAL_FORM = {
    recipient_type: 'individual',
    country: '',

    method: '',
    vendor: '',
    service_id: null,
    payer_id: '',

    /* Dynamic bags, keyed by the vendor's own field names. */
    beneficiary: {},
    channel: {},
};
