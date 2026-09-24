export const unwrapVirtualIbanResponse = (res) => res?.data?.data ?? res?.data ?? res

export const getVirtualIbanId = (iban) => iban?._id || iban?.id || ""

export const INTL_DEPOSIT_ACCOUNTS = {
    usd: {
        currencyCode: "USD",
        currencyLabel: "USD (US Dollar)",
        beneficiaryName: "SYSTEM PAY SERVICES MALTA LTD",
        beneficiaryAddress: "Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT",
        accountNumber: "ES9601828510912010000487",
        bankCode: "BBVAESMMXXX",
        bankName: "BANCO BILBAO VIZCAYA ARGENTARIA S.A.",
        bankAddress: "Pz De San Nicolas 4, Bilbao, 48005, ES",
        reference: "PY9F4G3",
    },
    eur: {
        currencyCode: "EUR",
        currencyLabel: "EUR (Euro)",
        beneficiaryName: "System Pay Services (Malta) Limited",
        beneficiaryAddress: "Ruby Workspaces Office 3 Pendergardens Triq Gort, San Giljan, STJ 9023, MT",
        accountNumber: "ES8201828510940200010371",
        bankCode: "BBVAESMMXXX",
        bankName: "BANCO BILBAO VIZCAYA ARGENTARIA S.A.",
        bankAddress: "Pz De San Nicolas 4, Bilbao, 48005, ES",
        reference: "6JL69V3",
    },
}

export const getIntlDepositAccount = (currency) =>
    INTL_DEPOSIT_ACCOUNTS[String(currency || "").toLowerCase()] || null

export const getProviderReference = (currency) => getIntlDepositAccount(currency)?.reference || ""

export const getAccountReferenceCode = (iban, userDetails) => {
    const candidates = [
        iban?.virtualIbanId,
        userDetails?.username,
    ]

    const code = candidates.find((value) => String(value ?? "").trim())
    return String(code ?? "").trim().replace(/\s+/g, "")
}

export const getPaymentReference = (iban, userDetails, currency) => {
    const providerReference = getProviderReference(currency)
    const accountReference = getAccountReferenceCode(iban, userDetails)

    return ["Ref", providerReference, accountReference].filter(Boolean).join(" ")
}

export const getVirtualIbanCountry = (iban) => {
    const rawCountry = iban?.country || iban?.jurisdiction || iban?.bank?.address?.country
    const country = String(rawCountry || iban?.iban || "").slice(0, 2).toUpperCase()

    return country === "UK" ? "GB" : country
}

export const formatVirtualIbanBankAddress = (address) => {
    if (!address) return ""
    if (typeof address === "string") return address

    const { addressLine1, addressLine2, city, postCode, country } = address

    return [
        addressLine1,
        addressLine2,
        city,
        postCode,
        country === "MT" ? "Malta" : country,
    ].filter(Boolean).join(", ")
}

export const normalizeVirtualIban = (iban) => {
    if (!iban) return null
    if (typeof iban !== "object") return null

    const id = getVirtualIbanId(iban)
    const bank = iban?.bank || {}
    const bankAddressSource = bank?.address || iban?.bank_address || iban?.bankAddress
    const bankAddress = formatVirtualIbanBankAddress(bankAddressSource)

    return {
        ...iban,
        _id: id,
        id,
        account_holder_name: iban?.account_holder_name || iban?.accountHolderName || "",
        swift_code: iban?.swift_code || iban?.bic || bank?.bic || "",
        bank_name: iban?.bank_name || iban?.bankName || bank?.name || "",
        bank_address: bankAddress,
        bankAddress,
        bank: {
            ...bank,
            name: bank?.name || iban?.bank_name || iban?.bankName || "",
            bic: bank?.bic || iban?.swift_code || iban?.bic || "",
            address: bankAddressSource || "",
            formattedAddress: bankAddress,
        },
    }
}

export const asVirtualIbanArray = (value) => {
    const unwrapped = unwrapVirtualIbanResponse(value)
    const nestedIban = unwrapped?.iban
    const nestedVirtualIban = unwrapped?.virtualIban
    const data = Array.isArray(unwrapped)
        ? unwrapped
        : Array.isArray(unwrapped?.data)
            ? unwrapped.data
            : Array.isArray(unwrapped?.ibans)
                ? unwrapped.ibans
                : Array.isArray(unwrapped?.virtualIbans)
                    ? unwrapped.virtualIbans
                    : Array.isArray(unwrapped?.items)
                        ? unwrapped.items
                        : Array.isArray(unwrapped?.results)
                            ? unwrapped.results
                            : nestedIban && typeof nestedIban === "object"
                                ? [nestedIban]
                                : nestedVirtualIban && typeof nestedVirtualIban === "object"
                                    ? [nestedVirtualIban]
                                    : unwrapped?._id || typeof nestedIban === "string"
                                        ? [unwrapped]
                                        : []

    return data.map(normalizeVirtualIban).filter(Boolean)
}

export const isVirtualIbanInactive = (iban) => {
    if (!iban) return false

    return Boolean(iban?.adminBlocked) || String(iban?.status || "").toUpperCase() === "INACTIVE"
}

export const asVirtualIban = (value) => {
    const unwrapped = unwrapVirtualIbanResponse(value)
    const nestedIban = unwrapped?.iban
    const nestedVirtualIban = unwrapped?.virtualIban
    const iban = Array.isArray(unwrapped)
        ? unwrapped[0]
        : nestedIban && typeof nestedIban === "object"
            ? nestedIban
            : nestedVirtualIban && typeof nestedVirtualIban === "object"
                ? nestedVirtualIban
                : unwrapped?.item || unwrapped?.result || unwrapped

    return normalizeVirtualIban(iban)
}
