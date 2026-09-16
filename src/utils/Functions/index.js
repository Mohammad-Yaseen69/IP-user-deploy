import CountryBasedPhone from "../../Components/PhoneInput/PhoneNumberBasedOnCountry.json"
import CitiesData from "../../Components/CitiesDropDown/CitiesData.json"

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


export function isInIframe() {
    if (window.frameElement) return true;
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}

export const serviceFieldInfoValidate = (service, field_name, sub_field_name, fieldsInfo) => {
    if (fieldsInfo === null) return false;
    let isInThere = false;

    const matches = (item) => item.name === sub_field_name || (sub_field_name === "aba_routing_number" && item.name === "routing_code")
    if (fieldsInfo?.[service === "bank_country_fields" ? "bank_country_fields" : service?.method?.split(" ")[0]]?.[field_name]?.some(matches)) {
        isInThere = true
    }
    return isInThere;
}


export const getExtractedPhone = (formData, countryIsoCode, phoneNumber) => {
    if (!formData.mobile_wallet_account_number && !phoneNumber) return ""
    const dialCode = CountryBasedPhone[countryIsoCode]?.dial_code?.replace("+", "") ?? ""
    const cleanNumber = (formData.mobile_wallet_account_number || phoneNumber).replace("+", "")
    const extractWalletNum = cleanNumber?.slice(dialCode.length)

    return extractWalletNum
}

export const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

export const flagCheck = (destination = "", details = {}, type) => {
    console.log(details, "flags ")
    const parts = destination.split(".");

    let cursor = type === "invoice" ? details?.invoiceFlags : details?.paymentAddressFlags;

    for (let i = 0; i < parts.length - 1; i++) {
        cursor = cursor?.[parts[i]];
        if (!cursor) return true;
    }

    const lastKey = parts[parts.length - 1];
    return !(typeof cursor?.[lastKey] === "boolean" && cursor[lastKey] === false);
};

export const localCurrency = (userDetails) => {
    const cont = CitiesData.find(item => item.iso3?.toUpperCase() === userDetails?.country_iso_code?.toUpperCase())
    return cont.currency
}