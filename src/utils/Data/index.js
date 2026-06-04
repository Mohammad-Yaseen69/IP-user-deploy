import { countries } from "country-list-json"
import countriesjson from "../../Components/PaymentsNewer/CountriesData.json"


export const BeneficiaryRelation = {
    SELF: "My own account",
    FRIENDS_AND_FAMILY: "Friends & Family",
    OTHER: "Merchant",
    other: "No relationship",
}

export const gendersData = {
    "Male": "Male",
    "Female": "Female",
    "Non-Binary": "Non-Binary",
    "Prefer Not to Say": "Prefer Not to Say",
}


export const occupations = {
    "Accountant": "Accountant",
    "Architect": "Architect",
    "Artist": "Artist",
    "Banker": "Banker",
    "Business Owner": "Business Owner",
    "Consultant": "Consultant",
    "Doctor": "Doctor",
    "Engineer": "Engineer",
    "Farmer": "Farmer",
    "Government Employee": "Government Employee",
    "IT Professional": "IT Professional",
    "Lawyer": "Lawyer",
    "Nurse": "Nurse",
    "Retailer": "Retailer",
    "Salesperson": "Salesperson",
    "Student": "Student",
    "Teacher": "Teacher",
    "Unemployed": "Unemployed",
    "Prefer Not to Say": "Prefer Not to Say",
    "Other": "Other"
}


export const friendsAndFamily = {
    AUNT: "Aunt",
    BROTHER: "Brother",
    BROTHER_IN_LAW: "Brother-in-law",
    COUSIN: "Cousin",
    DAUGHTER: "Daughter",
    FATHER: "Father",
    FATHER_IN_LAW: "Father-in-law",
    FRIEND: "Friend",
    GRAND_FATHER: "Grandfather",
    GRAND_MOTHER: "Grandmother",
    HUSBAND: "Husband",
    MOTHER: "Mother",
    MOTHER_IN_LAW: "Mother-in-law",
    NEPHEW: "Nephew",
    NIECE: "Niece",
    SISTER: "Sister",
    SISTER_IN_LAW: "Sister-in-law",
    SON: "Son",
    UNCLE: "Uncle",
    WIFE: "Wife",
    OTHER: "Others not listed"
}

export const idTypeData = {
    "PASSPORT": "Passport",
    "NATIONAL_ID": "National Identification Card",
    "DRIVING_LICENSE": "Driving License",
    "SOCIAL_SECURITY": "Social Security Card/Number",
    "TAX_ID": "Tax Payer Identification Card/Number",
    "SENIOR_CITIZEN_ID": "Senior Citizen Identification Card",
    "BIRTH_CERTIFICATE": "Birth Certificate",
    "VILLAGE_ELDER_ID": "Village Elder Identification Card",
    "RESIDENT_CARD": "Permanent Residency Identification Card",
    "ALIEN_REGISTRATION": "Alien Registration Certificate/Card",
    "PAN_CARD": "PAN Card",
    "VOTERS_ID": "Voters Identification Card",
    "HEALTH_CARD": "Health Insurance Card/Number",
    "EMPLOYER_ID": "Employer Identification Card",
    "OTHER": "Others not listed"
}


export const AccountTypeData = {
    CHECKING: "Checking Account",
    SAVINGS: "Savings Account",
    DEPOSIT: "Deposit Account",
    OTHERS: "Other type of account",
}

export const beneficiaryInitialFormData = {
    country: "",
    city: "",
    postal_code: "",
    address: "",
    email: "",
    relation: "",
    account_type: "Bank",
    account_holder_name: "",
    bank_name: "",
    branch_name: "",
    bank_account_number: "",
    bank_branch_street: "",
    bank_city: "",
    bank_province: "",
    bank_postal_code: "",
    mobile_wallet_provider: "",
    mobile_wallet_number: "",
    mobile_wallet_name: "",
    mobile_wallet_account_number: "",
    crypto_currency: "Bitcoin",
    crypto_wallet_address: "",
    card_holder_one: "",
    card_number_one: "",
    card_expiry_one: "",
    card_holder_two: "",
    card_number_two: "",
    card_expiry_two: "",
    card_holder_three: "",
    card_number_three: "",
    card_expiry_three: "",
}


export const bankExtrasInitial = {
    cbu: "",
    swift_bic_code: "",
    account_type: "",
    bsb_number: "",
    branch_number: "",
    routing_code: "",
    entity_tt_id: "",
    ifs_code: "",
    clabe: "",
    msisdn: "",
    sort_code: "",
    country_iso_code: "",
    iban: "",
    swift_bic_code: "",
}


export const basicExtrasInitial = {
    middlename: "",
    id_type: "NATIONAL_ID",
    id_number: "",
    province_state: "",
    houseNumber: "",
    street: "",
    state_name: ""
}


export const withdrawlsFields = {
    bank_iban: "",
    bank_account_number: "",
    bank_name: "",
    bank_branch_name: "",
    bank_branch_street: "",
    bank_city: "",
    bank_province: "",
    bank_postal_code: "",
    bank_payer: "",
    mobile_money_provider: "",
    mobile_wallet_name: "",
    mobile_wallet_account_number: "",
    mobile_payer: "",
    crypto_currency: "",
    crypto_wallet_address: "",
    crypto_payer: "",
    document_type: "",
    document_number: "",
    cash_payer: "",
}

export const BUSINESS_RELATIONSHIPS = {
    EMPLOYEE: "Employee",
    CUSTOMER: "Customer",
    VENDOR_SERVICE: "Vendor Service",
    PROVIDER: "Provider",
    BUSINESS_PARTNER: "Business Partner",
    INVESTOR: "Investor",
    THIRD_PARTY: "Third Party",
    AFFILIATED_ENTITY: "Affiliated Entity",
    AFFILIATED_BUSINESS: "Affiliated Business"
};

export const C2B_RELATIONSHIPS = {
    SUPPLIER_VENDOR: "Supplier / Vendor",
    MERCHANT: "Merchant",
    CORPORATE_CLIENT_CUSTOMER: "Corporate Client / Customer",
    BUSINESS_PARTNER: "Business Partner",
    SERVICE_PROVIDER: "Service Provider",
    AFFILIATE_SUBSIDIARY: "Affiliate / Subsidiary",
    EMPLOYER_CONTRACTOR: "Employer / Contractor",
    OWN_BUSINESS_ACCOUNT: "Own Business Account",
    OTHER_BUSINESS_RELATIONSHIP: "Other Business Relationship",
}


export const iso2Toiso3Convert = (iso2 = "") => {
    const country = countries.find(item => item.code.toLowerCase() === iso2?.toLowerCase())
    const alpha3 = countriesjson.find(item => item.name.toLowerCase() === country?.name?.toLowerCase() || item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.alpha3
    return alpha3
}


export const trimObjectValues = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => trimObjectValues(item));
    } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, trimObjectValues(value)])
        );
    } else if (typeof obj === 'string') {
        return obj.trim();
    }
    return obj;
};
