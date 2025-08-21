import CountryBasedPhone from "../../Components/PhoneInput/PhoneNumberBasedOnCountry.json"
export const handleMonthKeyPress = (event) => {
    const { key } = event;
    const monthValue = event.target.value + key;

    // Prevent typing non-numeric values, negative values, and values more than 12
    if (!/^\d$/.test(key) || monthValue.startsWith("-") || monthValue === "0" || Number(monthValue) > 12) {
        event.preventDefault();
    } else if (monthValue.length === 1 && Number(monthValue) < 1) {
        event.target.value = "0" + monthValue;
    }
};

export const handleYearKeyPress = (event) => {
    const { key } = event;
    const yearValue = event.target.value + key;

    if (!/^\d+$/.test(yearValue) || yearValue.length > 4) {
        event.preventDefault();
    }
};

export const serviceFieldInfoValidate = (service, field_name, sub_field_name, fieldsInfo) => {
    if (fieldsInfo === null) return false;
    let isInThere = false;

    if (fieldsInfo?.[service?.method?.split(" ")[0]]?.[field_name]?.some(item => item.name === sub_field_name)) {
        isInThere = true
    }

    return isInThere;
}


export const getExtractedPhone = (formData, countryIsoCode) => {
    const dialCode = CountryBasedPhone[countryIsoCode]?.dial_code?.replace("+", "") ?? ""
    const extractWalletNum = formData.mobile_wallet_account_number?.slice(dialCode.length)

    return extractWalletNum
}