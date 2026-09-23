import { gendersData, idTypeData, occupations } from '../../../../utils/Data';
import { CRYPTO_PAYOUT_ASSETS, getAssetProtocolOptions } from '../../../WalletsNew/SendCryptoModal/cryptoProtocols';

const toOptions = (record) =>
    Object.keys(record).map((value) => ({ value, label: record[value] }));

export const GENDER_OPTIONS = toOptions(gendersData);
export const ID_TYPE_OPTIONS = toOptions(idTypeData);
export const OCCUPATION_OPTIONS = toOptions(occupations);

export const THUNES_ENTITY_FIELDS = {
    firstname: { label: 'First name', type: 'text', placeholder: 'Jane' },
    lastname: { label: 'Last name', type: 'text', placeholder: 'Doe' },
    lastname2: { label: 'Second last name', type: 'text' },
    middlename: { label: 'Middle name', type: 'text' },
    nativename: { label: 'Name in local script', type: 'text' },
    company_name: { label: 'Company name', type: 'text', placeholder: 'Nour Trading LLC' },
    nationality_country_iso_code: { label: 'Nationality', type: 'country' },
    code: { label: 'Recipient code', type: 'text' },
    date_of_birth: { label: 'Date of birth', type: 'date', disableFuture: true },
    country_of_birth_iso_code: { label: 'Country of birth', type: 'country' },
    gender: { label: 'Gender', type: 'select', options: GENDER_OPTIONS },
    address: { label: 'Address', type: 'text', placeholder: '3 Norfolk Road' },
    postal_code: { label: 'Postal code', type: 'text' },
    city: { label: 'City', type: 'city' },
    country_iso_code: { label: 'Country', type: 'country' },
    province_state: { label: 'Province or state', type: 'state' },
    msisdn: { label: 'Mobile number', type: 'tel', placeholder: '+234 801 234 5678' },
    email: { label: 'Email address', type: 'email', placeholder: 'name@example.com' },
    id_type: { label: 'ID type', type: 'select', options: ID_TYPE_OPTIONS },
    id_country_iso_code: { label: 'ID issuing country', type: 'country' },
    id_number: { label: 'ID number', type: 'text' },
    id_delivery_date: { label: 'ID issue date', type: 'date', disableFuture: true },
    id_expiration_date: { label: 'ID expiry date', type: 'date' },
    occupation: { label: 'Occupation', type: 'select', options: OCCUPATION_OPTIONS },
    bank_account_holder_name: { label: 'Account holder name', type: 'text' },
    beneficiary_relationship: { label: 'Relationship to you', type: 'text' },
};

export const THUNES_IDENTIFIER_FIELDS = {
    mobile_wallet_provider: { label: 'Mobile money provider', type: 'payer' },
    msisdn: { label: 'Mobile number', type: 'tel', placeholder: '+234 801 234 5678' },
    bank_account_number: { label: 'Account number', type: 'text', alphanumeric: true },
    account_number: { label: 'Account number', type: 'text', alphanumeric: true },
    iban: { label: 'IBAN', type: 'iban', alphanumeric: true, uppercase: true },
    swift_bic_code: { label: 'SWIFT / BIC', type: 'bic', alphanumeric: true, uppercase: true },
    clabe: { label: 'CLABE', type: 'text', alphanumeric: true },
    cbu: { label: 'CBU', type: 'text', alphanumeric: true },
    cbu_alias: { label: 'CBU alias', type: 'text' },
    bik_code: { label: 'BIK code', type: 'text', alphanumeric: true },
    ifs_code: { label: 'IFSC code', type: 'text', alphanumeric: true, uppercase: true },
    sort_code: { label: 'Sort code', type: 'text', alphanumeric: true },
    aba_routing_number: { label: 'ABA routing number', type: 'routing', alphanumeric: true },
    routing_code: { label: 'Routing code', type: 'text', alphanumeric: true },
    bsb_number: { label: 'BSB number', type: 'text', alphanumeric: true },
    branch_number: { label: 'Branch number', type: 'text', alphanumeric: true },
    entity_tt_id: { label: 'Entity ID', type: 'text' },
    account_type: { label: 'Account type', type: 'select', options: [
        { value: 'CHECKING', label: 'Checking' },
        { value: 'SAVINGS', label: 'Savings' },
    ] },
    email: { label: 'Email address', type: 'email' },
    card_number: { label: 'Card number', type: 'text', alphanumeric: true },
    qr_code: { label: 'QR code', type: 'text' },
};

const BVNK_ENTITY_FIELDS = {
    individual: ['firstName', 'lastName', 'date_of_birth'],
    business: ['legalName'],
};

export const BVNK_FIELD_DEFS = {
    firstName: { label: 'First name', type: 'text', placeholder: 'Jane', required: true },
    lastName: { label: 'Last name', type: 'text', placeholder: 'Doe', required: true },
    legalName: { label: 'Legal name', type: 'text', placeholder: 'Nour Trading LLC', required: true },
    date_of_birth: {
        label: 'Date of birth',
        type: 'date',
        required: true,
        disableFuture: true,
        hint: 'Required by the payout provider to verify the recipient.',
    },

    iban: { label: 'IBAN', type: 'iban', alphanumeric: true, uppercase: true, required: true },
    accountNumber: { label: 'Account number', type: 'text', alphanumeric: true, required: true },
    bic: { label: 'BIC / SWIFT', type: 'bic', alphanumeric: true, uppercase: true },
    swift_code: { label: 'SWIFT / BIC', type: 'bic', alphanumeric: true, uppercase: true, required: true },
    intermediaryBic: { label: 'Intermediary BIC', type: 'bic', alphanumeric: true, uppercase: true },

    bankName: { label: 'Bank name', type: 'text' },
    bankCountry: { label: 'Bank country', type: 'country' },
    bankAddress: { label: 'Bank address', type: 'text' },
    bankCity: { label: 'Bank city', type: 'text' },
    bankPostal: { label: 'Bank postal code', type: 'text' },

    beneficiaryAddress: { label: 'Address', type: 'text' },
    beneficiaryCity: { label: 'City', type: 'city' },
    beneficiaryPostal: { label: 'Postal code', type: 'text' },
    beneficiaryCountry: { label: 'Country', type: 'country' },

    crypto_asset: {
        label: 'Asset',
        type: 'select',
        required: true,
        options: CRYPTO_PAYOUT_ASSETS.map((asset) => ({ value: asset, label: asset })),
    },
    crypto_network: {
        label: 'Network',
        type: 'select',
        required: true,
        options: getAssetProtocolOptions('USDT'),
        hint: 'The payout always uses this network, so it must be one the recipient supports.',
    },
    wallet_address: {
        label: 'Wallet address',
        type: 'text',
        required: true,
        placeholder: '0x8f3A...c21E',
        hint: 'Sending on the wrong network loses the funds.',
    },
};

const BVNK_SEPA = {
    beneficiary: [],
    channel: ['iban', 'bic', 'bankName', 'bankCountry'],
    requiredChannel: ['iban'],
};

const BVNK_SWIFT = {
    beneficiary: ['beneficiaryAddress', 'beneficiaryCity', 'beneficiaryPostal', 'beneficiaryCountry'],
    channel: [
        'swift_code',
        'accountNumber',
        'bankName',
        'bankAddress',
        'bankCity',
        'bankPostal',
        'bankCountry',
        'intermediaryBic',
    ],
    requiredChannel: ['swift_code', 'accountNumber'],
};

const BVNK_CRYPTO = {
    beneficiary: [],
    channel: ['crypto_asset', 'crypto_network', 'wallet_address'],
    requiredChannel: ['crypto_asset', 'crypto_network', 'wallet_address'],
};

export const BVNK_RAILS = {
    local_bank: BVNK_SEPA,
    swift: BVNK_SWIFT,
    crypto_wallet: BVNK_CRYPTO,
};

const EDIT_BENEFICIARY_FIELDS = {
    individual: ['firstname', 'lastname', 'date_of_birth', 'email', 'msisdn', 'address', 'province_state', 'city', 'postal_code'],
    business: ['legalName', 'email', 'msisdn', 'address', 'province_state', 'city', 'postal_code'],
};

const EDIT_REQUIRED_FIELDS = {
    individual: ['firstname', 'lastname'],
    business: ['legalName'],
};

export const getEditRequirements = (recipientType) => {
    const key = recipientType === 'business' ? 'business' : 'individual';
    const fields = EDIT_BENEFICIARY_FIELDS[key];
    const required = EDIT_REQUIRED_FIELDS[key];
    const baseDefs = { ...THUNES_ENTITY_FIELDS, ...BVNK_FIELD_DEFS };

    const defs = fields.reduce((acc, name) => {
        acc[name] = { ...getFieldDef(name, baseDefs), required: required.includes(name) };
        return acc;
    }, {});

    return {
        vendor: '',
        beneficiaryFields: fields,
        channelFields: [],
        requiredBeneficiary: required,
        requiredChannel: [],
        defs,
    };
};

export const getBvnkRequirements = (method, recipientType, channel = {}) => {
    const rail = BVNK_RAILS[method];
    if (!rail) return null;

    const entity = BVNK_ENTITY_FIELDS[recipientType === 'business' ? 'business' : 'individual'];

    const defs = method === 'crypto_wallet'
        ? {
            ...BVNK_FIELD_DEFS,
            crypto_network: {
                ...BVNK_FIELD_DEFS.crypto_network,
                options: getAssetProtocolOptions(channel?.crypto_asset),
            },
        }
        : BVNK_FIELD_DEFS;

    return {
        vendor: 'bvnk',
        beneficiaryFields: [...entity, ...rail.beneficiary],
        channelFields: rail.channel,
        requiredBeneficiary: entity,
        requiredChannel: rail.requiredChannel,
        defs,
    };
};

export const flattenFieldSets = (setsOrNames) => {
    if (!Array.isArray(setsOrNames)) return [];

    const names = new Set();
    setsOrNames.forEach((entry) => {
        if (Array.isArray(entry)) {
            entry.forEach((name) => name && names.add(String(name).toLowerCase()));
        } else if (typeof entry === 'string') {
            names.add(entry.toLowerCase());
        } else if (entry && typeof entry === 'object' && entry.name) {
            names.add(String(entry.name).toLowerCase());
        }
    });
    return [...names];
};

/* Asked on every recipient, whatever the provider says it needs. */
export const ALWAYS_ASKED_FIELDS = {
    individual: ['firstname', 'lastname'],
    business: ['company_name'],
};

const MOBILE_WALLET_CHANNEL_FIELDS = ['mobile_wallet_provider', 'msisdn'];

export const getThunesRequirements = (fields, recipientType, method) => {
    if (!fields) return null;

    const alwaysAsked = ALWAYS_ASKED_FIELDS[recipientType === 'business' ? 'business' : 'individual'];

    const providerFields = flattenFieldSets(fields.required_receiving_entity_fields)
        .filter((name) => THUNES_ENTITY_FIELDS[name]);

    const beneficiaryFields = [
        ...alwaysAsked,
        ...providerFields.filter((name) => !alwaysAsked.includes(name)),
    ];

    const identifierFields = flattenFieldSets(fields.credit_party_identifiers_accepted)
        .filter((name) => THUNES_IDENTIFIER_FIELDS[name]);

    /* A mobile wallet is only ever a provider and the number it is held on, whatever
       else the provider lists as an accepted identifier. */
    const channelFields = method === 'mobile_wallet'
        ? MOBILE_WALLET_CHANNEL_FIELDS
        : identifierFields;

    const defs = { ...THUNES_ENTITY_FIELDS, ...THUNES_IDENTIFIER_FIELDS };

    return {
        vendor: 'thunes',
        beneficiaryFields,
        channelFields,
        requiredBeneficiary: beneficiaryFields,
        requiredChannel: channelFields,
        /* The recipient's own mobile number is asked separately, so name this one for
           what it is rather than showing "Mobile number" twice. */
        defs: method === 'mobile_wallet'
            ? { ...defs, msisdn: { ...defs.msisdn, label: 'Wallet number' } }
            : defs,
        limits: {
            min: fields.minimum_transaction_amount,
            max: fields.maximum_transaction_amount,
        },
    };
};

export const resolveTransactionType = (senderAccountType, recipientType) => {
    const sender = senderAccountType === 'individual' ? 'C' : 'B';
    const receiver = recipientType === 'business' ? 'B' : 'C';
    return `${sender}2${receiver}`;
};

export const getFieldDef = (name, defs) =>
    defs?.[name] || THUNES_ENTITY_FIELDS[name] || THUNES_IDENTIFIER_FIELDS[name] || BVNK_FIELD_DEFS[name] || {
        label: name,
        type: 'text',
    };
