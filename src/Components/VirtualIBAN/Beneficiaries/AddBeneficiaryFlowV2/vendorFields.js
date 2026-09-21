import { gendersData, idTypeData, occupations } from '../../../../utils/Data';

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
    nationality_country_iso_code: { label: 'Nationality', type: 'country' },
    code: { label: 'Recipient code', type: 'text' },
    date_of_birth: { label: 'Date of birth', type: 'date', disableFuture: true },
    country_of_birth_iso_code: { label: 'Country of birth', type: 'country' },
    gender: { label: 'Gender', type: 'select', options: GENDER_OPTIONS },
    address: { label: 'Address', type: 'text', placeholder: '3 Norfolk Road' },
    postal_code: { label: 'Postal code', type: 'text' },
    city: { label: 'City', type: 'text' },
    country_iso_code: { label: 'Country', type: 'country' },
    province_state: { label: 'Province or state', type: 'text' },
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
    msisdn: { label: 'Mobile number', type: 'tel', placeholder: '+234 801 234 5678' },
    bank_account_number: { label: 'Account number', type: 'text', alphanumeric: true },
    account_number: { label: 'Account number', type: 'text', alphanumeric: true },
    iban: { label: 'IBAN', type: 'text', alphanumeric: true, uppercase: true },
    swift_bic_code: { label: 'SWIFT / BIC', type: 'text', alphanumeric: true, uppercase: true },
    clabe: { label: 'CLABE', type: 'text', alphanumeric: true },
    cbu: { label: 'CBU', type: 'text', alphanumeric: true },
    cbu_alias: { label: 'CBU alias', type: 'text' },
    bik_code: { label: 'BIK code', type: 'text', alphanumeric: true },
    ifs_code: { label: 'IFSC code', type: 'text', alphanumeric: true, uppercase: true },
    sort_code: { label: 'Sort code', type: 'text', alphanumeric: true },
    aba_routing_number: { label: 'ABA routing number', type: 'text', alphanumeric: true },
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

    iban: { label: 'IBAN', type: 'text', alphanumeric: true, uppercase: true, required: true },
    accountNumber: { label: 'Account number', type: 'text', alphanumeric: true, required: true },
    bic: { label: 'BIC / SWIFT', type: 'text', alphanumeric: true, uppercase: true },
    swift_code: { label: 'SWIFT / BIC', type: 'text', alphanumeric: true, uppercase: true, required: true },
    intermediaryBic: { label: 'Intermediary BIC', type: 'text', alphanumeric: true, uppercase: true },

    bankName: { label: 'Bank name', type: 'text' },
    bankCountry: { label: 'Bank country', type: 'country' },
    bankAddress: { label: 'Bank address', type: 'text' },
    bankCity: { label: 'Bank city', type: 'text' },
    bankPostal: { label: 'Bank postal code', type: 'text' },

    beneficiaryAddress: { label: 'Address', type: 'text' },
    beneficiaryCity: { label: 'City', type: 'text' },
    beneficiaryPostal: { label: 'Postal code', type: 'text' },
    beneficiaryCountry: { label: 'Country', type: 'country' },

    crypto_asset: { label: 'Asset', type: 'select', required: true, options: [
        { value: 'USDC', label: 'USDC' },
        { value: 'USDT', label: 'USDT' },
    ] },
    crypto_network: { label: 'Network', type: 'select', required: true, options: [
        { value: 'ethereum', label: 'Ethereum (ERC-20)' },
        { value: 'tron', label: 'Tron (TRC-20)' },
        { value: 'polygon', label: 'Polygon' },
        { value: 'solana', label: 'Solana' },
    ] },
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
    individual: ['firstname', 'lastname', 'date_of_birth', 'email', 'msisdn', 'address', 'city', 'postal_code'],
    business: ['legalName', 'email', 'msisdn', 'address', 'city', 'postal_code'],
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

export const getBvnkRequirements = (method, recipientType) => {
    const rail = BVNK_RAILS[method];
    if (!rail) return null;

    const entity = BVNK_ENTITY_FIELDS[recipientType === 'business' ? 'business' : 'individual'];

    return {
        vendor: 'bvnk',
        beneficiaryFields: [...entity, ...rail.beneficiary],
        channelFields: rail.channel,
        requiredBeneficiary: entity,
        requiredChannel: rail.requiredChannel,
        defs: BVNK_FIELD_DEFS,
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

export const getThunesRequirements = (fields) => {
    if (!fields) return null;

    const beneficiaryFields = flattenFieldSets(fields.required_receiving_entity_fields)
        .filter((name) => THUNES_ENTITY_FIELDS[name]);

    const channelFields = flattenFieldSets(fields.credit_party_identifiers_accepted)
        .filter((name) => THUNES_IDENTIFIER_FIELDS[name]);

    return {
        vendor: 'thunes',
        beneficiaryFields,
        channelFields,
        requiredBeneficiary: beneficiaryFields,
        requiredChannel: channelFields,
        defs: { ...THUNES_ENTITY_FIELDS, ...THUNES_IDENTIFIER_FIELDS },
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
