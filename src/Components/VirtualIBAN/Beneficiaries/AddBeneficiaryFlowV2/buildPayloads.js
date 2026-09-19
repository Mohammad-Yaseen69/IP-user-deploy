import { CHANNEL_TYPE_BY_METHOD } from './constants';

/*
 * Maps the vendor-shaped form bags onto the two existing beneficiary endpoints.
 *
 *   POST /api/beneficiary/v2/add            the person or company
 *   POST /api/beneficiary/v2/:id/channel    where they get paid
 *
 * Anything the fixed columns cannot hold goes into `extras`, which both the
 * Mongo model and the channel schema already accept. That is also where the
 * vendor and payer identity live, so a later payment knows which rail and which
 * payer this channel belongs to.
 */

/* Fields that map onto real columns on the beneficiary document. */
const BENEFICIARY_COLUMN_MAP = {
    firstname: 'first_name',
    firstName: 'first_name',
    lastname: 'last_name',
    lastName: 'last_name',
    legalName: 'company_name',
    email: 'email',
    msisdn: 'phone',
    city: 'city',
    address: 'address',
    beneficiaryAddress: 'address',
    postal_code: 'zip_code',
    beneficiaryPostal: 'zip_code',
};

const clean = (value) => (typeof value === 'string' ? value.trim() : value);

/**
 * Seeds the beneficiary bag from a saved record, so adding a second channel does
 * not make the user retype what we already hold. Both the vendor's own key names
 * (kept in `extras`) and our columns are covered.
 */
export const prefillBeneficiaryBag = (beneficiary) => {
    if (!beneficiary) return {};

    const bag = { ...(beneficiary.extras || {}) };

    const seed = (key, value) => {
        if (value && !bag[key]) bag[key] = value;
    };

    seed('firstname', beneficiary.first_name);
    seed('firstName', beneficiary.first_name);
    seed('lastname', beneficiary.last_name);
    seed('lastName', beneficiary.last_name);
    seed('legalName', beneficiary.company_name);
    seed('email', beneficiary.email);
    seed('msisdn', beneficiary.phone);
    seed('city', beneficiary.city);
    seed('address', beneficiary.address);
    seed('beneficiaryAddress', beneficiary.address);
    seed('postal_code', beneficiary.zip_code);
    seed('beneficiaryPostal', beneficiary.zip_code);
    seed('country_iso_code', beneficiary.country_iso_code);
    seed('beneficiaryCountry', beneficiary.country_iso_code);

    /* vendor/payer of the previous channel must not leak into the new one */
    delete bag.vendor;
    delete bag.payer_id;

    return bag;
};

export const buildBeneficiaryPayload = ({ form, countries }) => {
    const countryRecord = (countries || []).find((c) => c.country_iso_code === form.country);

    const payload = {
        beneficiary_type: form.recipient_type,
        country_iso_code: form.country,
        country_name: countryRecord?.country_name || '',
        country: countryRecord?._id,
    };

    const extras = {};

    Object.keys(form.beneficiary || {}).forEach((key) => {
        const value = clean(form.beneficiary[key]);
        if (value === undefined || value === null || value === '') return;

        const column = BENEFICIARY_COLUMN_MAP[key];
        if (column) {
            payload[column] = value;
        }
        /* Keep the vendor's own key too, so we can replay it on a payout. */
        extras[key] = value;
    });

    /* A business recipient may only have been asked for names. */
    if (form.recipient_type === 'business' && !payload.company_name) {
        payload.company_name = [payload.first_name, payload.last_name].filter(Boolean).join(' ');
    }

    payload.extras = {
        ...extras,
        vendor: form.vendor,
        ...(form.payer_id ? { payer_id: String(form.payer_id) } : {}),
    };

    return payload;
};

export const buildChannelPayload = ({ form, payer, transactionType }) => {
    const channelType = CHANNEL_TYPE_BY_METHOD[form.method] || 'bank';
    const channel = form.channel || {};

    const extras = {
        vendor: form.vendor,
        method: form.method,
        country_iso_code: form.country,
        ...(form.service_id ? { service_id: form.service_id } : {}),
        ...(payer ? { payer_id: String(payer.id), payer_name: payer.name } : {}),
        ...(transactionType ? { transaction_type: transactionType } : {}),
    };

    /* Every identifier the vendor gave us, under its own name. */
    Object.keys(channel).forEach((key) => {
        const value = clean(channel[key]);
        if (value === undefined || value === null || value === '') return;
        extras[key] = value;
    });

    const holderName =
        form.beneficiary?.bank_account_holder_name ||
        form.beneficiary?.legalName ||
        [form.beneficiary?.firstname || form.beneficiary?.firstName, form.beneficiary?.lastname || form.beneficiary?.lastName]
            .filter(Boolean)
            .join(' ');

    const payload = { channel_type: channelType };

    if (channelType === 'bank') {
        payload.bank_details = {
            iban: channel.iban || '',
            swift_code: channel.swift_bic_code || channel.swift_code || channel.bic || '',
            account_number:
                channel.bank_account_number || channel.account_number || channel.accountNumber || channel.iban || '',
            name: channel.bankName || payer?.name || '',
            city: channel.bankCity || '',
            branch_street: channel.bankAddress || '',
            postal_code: channel.bankPostal || '',
            account_holder_name: holderName,
            extras,
        };
    } else if (channelType === 'mobile_wallet') {
        payload.mobile_wallet = {
            money_provider: payer ? String(payer.id) : form.vendor,
            wallet_name: payer?.name || 'Mobile wallet',
            wallet_account_number: channel.msisdn || channel.account_number || '',
            extras,
        };
    } else if (channelType === 'crypto') {
        payload.crypto = {
            currency: channel.crypto_asset || 'USDC',
            wallet_address: channel.wallet_address || '',
            extras,
        };
    } else if (channelType === 'cash_pickup') {
        payload.cash_pickup = {
            document_type: form.beneficiary?.id_type || '',
            document_number: form.beneficiary?.id_number || '',
            extras,
        };
    } else if (channelType === 'card') {
        payload.card = {
            name: holderName,
            number: channel.card_number || '',
            expiry: channel.card_expiry || '',
            extras,
        };
    }

    return payload;
};
