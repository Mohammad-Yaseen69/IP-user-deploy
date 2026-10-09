export const BIC_REGEX = /^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;
export const DESCRIPTION_REGEX = /^[a-zA-Z0-9\s,.-]{5,34}$/;
export const ISO3_REGEX = /^[A-Za-z]{3}$/;
export const NON_EMPTY_REGEX = /^(?!\s*$).+/;

export const isValidBic = (bic) => {
    if (!bic) return false;
    const trimmed = String(bic).trim().toUpperCase();
    return BIC_REGEX.test(trimmed);
};

export const isValidDescription = (desc) => {
    if (!desc) return false;
    return DESCRIPTION_REGEX.test(String(desc).trim());
};

export const validateSwiftBeneficiary = (beneficiary) => {
    const errors = [];
    if (!beneficiary) {
        errors.push("Beneficiary is required");
        return { isValid: false, errors };
    }

    const type = String(beneficiary.beneficiary_type || beneficiary.type || "individual").toLowerCase();
    if (type === "business") {
        if (!beneficiary.company_name || !beneficiary.company_name.trim()) {
            errors.push("Company name is required for business beneficiaries");
        }
    } else {
        if (!beneficiary.first_name || !beneficiary.first_name.trim()) {
            errors.push("First name is required");
        }
        if (!beneficiary.last_name || !beneficiary.last_name.trim()) {
            errors.push("Last name is required");
        }
    }

    // if (!beneficiary.address || !beneficiary.address.trim()) {
    //     errors.push("Address is required");
    // }
    // if (!beneficiary.city || !beneficiary.city.trim()) {
    //     errors.push("City is required");
    // }
    // const zip = beneficiary.zip_code || beneficiary.postal_code;
    // if (!zip || !String(zip).trim()) {
    //     errors.push("Postal code is required");
    // }

    const bank = beneficiary.bank_details?.[0] || beneficiary.bank || beneficiary?.bank_details || {};
    const accountOrIban = bank.iban || bank.extras?.iban || bank.account_number;
    if (!accountOrIban || !String(accountOrIban).trim()) {
        errors.push("Bank account number / IBAN is required");
    }
    const swift = bank.swift_code || bank.bic || beneficiary.swift_code;
    if (!isValidBic(swift)) {
        errors.push("Valid 8 or 11 character BIC / SWIFT code is required");
    }
    // if (!bank.name && !bank.bank_name) {
    //     errors.push("Bank name is required");
    // }
    // if (!bank.branch_street && !bank.bank_branch_street) {
    //     errors.push("Branch street address is required");
    // }
    // if (!bank.city && !bank.bank_city) {
    //     errors.push("Bank city is required");
    // }
    // if (!bank.postal_code && !bank.bank_postal_code) {
    //     errors.push("Bank postal code is required");
    // }
    // const bankCountry = bank.extras?.country_iso_code || bank.country_iso_code;
    // if (!bankCountry || !ISO3_REGEX.test(String(bankCountry).trim())) {
    //     errors.push("Bank country (3-letter ISO code) is required");
    // }

    return {
        isValid: errors.length === 0,
        errors
    };
};
