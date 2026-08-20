export const getBeneficiaryName = (b) => {
    const first = b?.first_name
    const last = b?.last_name
    if (first || last) return [first, last].filter(Boolean).join(" ")
    return b?.company_name || b?.legalName || b?.name || "Beneficiary"
}

export const getBeneficiaryTypeLabel = (b) => {
    const type = b?.beneficiary_type || b?.type
    return type ? `${String(type).charAt(0).toUpperCase()}${String(type).slice(1)}` : "-"
}

export const getBeneficiaryCountry = (b) => b?.country_name || b?.country || "-"

export const getBeneficiaryBankDetail = (b) => (Array.isArray(b?.bank_details) && b.bank_details[0]) || null

export const getBeneficiaryBic = (b) =>
    getBeneficiaryBankDetail(b)?.swift_code || b?.swift_code || b?.bic || "-"

export const getBeneficiaryBankName = (b) => getBeneficiaryBankDetail(b)?.name || b?.bankName || "-"

export const getBeneficiaryIban = (b) => getBeneficiaryBankDetail(b)?.iban || b?.iban || "-"

export const getBeneficiaryAccountCount = (b) => b?.beneficiary_type || "bank"

export const getBeneficiarySubtitle = (b) =>
    [getBeneficiaryCountry(b), getBeneficiaryTypeLabel(b)].filter((v) => v && v !== "-").join(" - ")

export const getBeneficiaryInitial = (b) => (getBeneficiaryName(b).charAt(0) || "B").toUpperCase()

export const getBeneficiaryId = (b) => b?.id || b?._id

export const getRawSwiftCode = (b) => {
    const fromBank = b?.bank_details?.[0]?.swift_code
    if (fromBank && String(fromBank).trim()) return String(fromBank).trim()
    const direct = b?.swift_code || b?.bic || ""
    return String(direct).trim()
}

export const hasBeneficiarySwiftCode = (b) => getRawSwiftCode(b).length > 0

export const maskIban = (iban) => {
    if (!iban) return "-"
    const clean = String(iban).replace(/\s/g, "")
    if (clean.length < 8) return iban
    return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`
}
