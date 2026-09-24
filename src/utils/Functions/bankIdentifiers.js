import ibanLib from 'iban';
import { isValidBic } from '../../Components/VirtualIBAN/utils/swiftValidation';

/* ISO 13616 describes a BBAN as typed segments, e.g. GB is U04F06F08: four letters of
   bank code, a six digit sort code, then the eight digit account number. */
const STRUCTURE_SEGMENT = /([ABCFLUW])(\d{2})/g;

export const toElectronicIban = (value) => ibanLib.electronicFormat(String(value || ''));

export const isValidIban = (value) => ibanLib.isValid(toElectronicIban(value));

export const formatIban = (value) => ibanLib.printFormat(toElectronicIban(value), ' ');

const splitBban = (countryCode, bban) => {
    const structure = ibanLib.countries[countryCode]?.structure || '';
    const segments = [];
    let cursor = 0;

    for (const match of structure.matchAll(STRUCTURE_SEGMENT)) {
        const length = Number(match[2]);
        segments.push({ type: match[1], value: bban.slice(cursor, cursor + length) });
        cursor += length;
    }

    return segments;
};

/* The account identifier is the longest run in every layout we care about, which beats
   slicing per country: a national check digit sits last in France and Belgium, so simply
   taking the final segment would hand back two digits. */
const accountSegment = (segments) => segments.reduce(
    (longest, segment) => (!longest || segment.value.length >= longest.value.length ? segment : longest),
    null,
);

export const parseIban = (value) => {
    const electronic = toElectronicIban(value);
    if (!ibanLib.isValid(electronic)) return null;

    const countryCode = electronic.slice(0, 2);
    const bban = ibanLib.toBBAN(electronic, '');
    const segments = splitBban(countryCode, bban);

    return {
        countryCode,
        bban,
        bankCode: segments[0]?.value || '',
        accountNumber: accountSegment(segments)?.value || bban,
    };
};

/* US ABA routing numbers carry a weighted modulo 10 check digit. */
export const isValidRoutingNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length !== 9) return false;

    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    const sum = digits
        .split('')
        .reduce((total, digit, index) => total + (Number(digit) * weights[index]), 0);

    return sum % 10 === 0;
};

export const isValidSwiftCode = (value) => isValidBic(value);

const CHECKS = {
    iban: {
        isValid: isValidIban,
        error: 'This IBAN is not valid. Check it for a typo.',
    },
    routing: {
        isValid: isValidRoutingNumber,
        error: 'A routing number is 9 digits and must pass its checksum.',
    },
    bic: {
        isValid: isValidSwiftCode,
        error: 'A SWIFT / BIC code is 8 or 11 characters.',
    },
};

export const isCheckedIdentifier = (kind) => !!CHECKS[kind];

/* Whatever the provider asked for, an identifier that fails its own checksum is a typo
   the sender can fix now rather than a payout that bounces later. */
export const collectIdentifierErrors = (names, values, getType) => names.reduce((errors, name) => {
    const check = CHECKS[getType(name)];
    const value = String(values?.[name] || '').trim();

    if (!check || !value || check.isValid(value)) return errors;

    return { ...errors, [name]: check.error };
}, {});

/* Nothing typed yet is not wrong yet, so an empty value never reports an error. */
export const checkIdentifier = (kind, value) => {
    const check = CHECKS[kind];
    const text = String(value || '').trim();

    if (!check || !text) return { state: '', message: '' };
    if (!check.isValid(text)) return { state: 'invalid', message: check.error };

    if (kind === 'iban') {
        const parsed = parseIban(text);
        return {
            state: 'valid',
            message: parsed?.accountNumber
                ? `Valid IBAN · account number ${parsed.accountNumber} (read from the IBAN, edit it if the bank quotes another)`
                : 'Valid IBAN',
        };
    }

    return { state: 'valid', message: kind === 'bic' ? 'Valid SWIFT / BIC' : 'Valid routing number' };
};
