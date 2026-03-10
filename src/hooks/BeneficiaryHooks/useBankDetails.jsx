import { useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { UserContext } from '../../Context/UserContext'
import { countries as CountriesList } from 'country-list-json'
import { useQuery } from '@tanstack/react-query'
import { apiWrapper } from '../../utils/Functions/apiWrapper'

const useBankDetails = ({ accNumType, setFormData, handleBankExtraChange, bankExtras, setError, alpha3, countryName, fieldKeyOverrides = {}, debounceMs = 1500 }) => {
    const { authHeader } = useContext(UserContext)
    const [bankCountry, setBankCountry] = useState("")
    const [bankDetailsError, setBankDetailsError] = useState("")
    const [bankCountryCode, setBankCountryCode] = useState("")
    const [isValidIban, setIsValidIban] = useState(true)
    const [ibanSwift, setIbanSwift] = useState("")
    const [debouncedValue, setDebouncedValue] = useState("")

    const [queryMetadata, setQueryMetadata] = useState({ isForEdit: false, account_number: "" })

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(ibanSwift)
        }, debounceMs)
        return () => clearTimeout(timer)
    }, [ibanSwift, debounceMs])

    const { data: rawData, error: queryError, isFetching } = useQuery({
        queryKey: ['bankDetails', accNumType, debouncedValue, alpha3, countryName],
        queryFn: () => {
            const endpoint = accNumType === "IBAN"
                ? `/api/beneficiary/get-details-by-iban/${debouncedValue}`
                : `/api/beneficiary/get-details-by-bic/${debouncedValue}/abc`
            return apiWrapper({ endpoint })
        },
        enabled: !!debouncedValue && (accNumType === "IBAN" ? debouncedValue.length > 13 : debouncedValue.length >= 7),
        retry: 2,
    })

    const bankNameKey = fieldKeyOverrides.bank_name || 'bank_name'
    const branchNameKey = fieldKeyOverrides.branch_name || 'branch_name'
    const bankBranchStreetKey = fieldKeyOverrides.bank_branch_street || 'bank_branch_street'
    const bankCityKey = fieldKeyOverrides.bank_city || 'bank_city'
    const bankProvinceKey = fieldKeyOverrides.bank_province || 'bank_province'
    const bankPostalCodeKey = fieldKeyOverrides.bank_postal_code || 'bank_postal_code'
    const bankAccountNumberKey = fieldKeyOverrides.bank_account_number || 'bank_account_number'

    useEffect(() => {
        const minLength = accNumType === "IBAN" ? 14 : 7
        if (debouncedValue.length < minLength) {
            setFormData(prev => ({
                ...prev,
                [bankNameKey]: "",
                [branchNameKey]: "",
                [bankBranchStreetKey]: "",
                [bankCityKey]: "",
                [bankProvinceKey]: "",
                [bankPostalCodeKey]: "",
                [bankAccountNumberKey]: ""
            }))
            if (!queryMetadata.isForEdit) {
                if (bankExtras && handleBankExtraChange) {
                    for (const key in bankExtras) {
                        handleBankExtraChange({ target: { name: key, value: "" } })
                    }
                }
            }
            setBankCountry("")
            setBankCountryCode("")
            setIsValidIban(true)
            setError ? setError("") : setBankDetailsError("")
        }
    }, [debouncedValue, accNumType, bankNameKey, branchNameKey, bankBranchStreetKey, bankCityKey, bankProvinceKey, bankPostalCodeKey, queryMetadata.isForEdit, setError])

    useEffect(() => {
        setIbanSwift("")
        setDebouncedValue("")
    }, [accNumType])

    useEffect(() => {
        if (rawData) {
            const decrypted = accNumType === "IBAN" ? rawData : rawData?.bicDetails
            if (!decrypted) return

            let isValidCountry = true
            try {
                const code = decrypted?.bicDetails?.structured_address?.country_code || decrypted?.structured_address?.country_code
                const name = decrypted?.structured_address?.country_name || decrypted?.bicDetails?.structured_address?.country_name

                if (alpha3 || countryName) {
                    isValidCountry = (
                        (alpha3 && code === alpha3) ||
                        (countryName && (countryName?.toLowerCase() === name?.toLowerCase())) ||
                        CountriesList?.some(item => item.code === code)
                    )
                }
            } catch (error) {
                console.error("[useBankDetails] Validation error:", error)
            }

            if (!isValidCountry) {
                const msg = accNumType === "IBAN" ? "IBAN must belong to your selected country!" : "Swift Code must belong to your selected country!"
                setError ? setError(msg) : setBankDetailsError(msg)
                setFormData(prev => ({
                    ...prev,
                    [bankNameKey]: "",
                    [branchNameKey]: "",
                    [bankBranchStreetKey]: "",
                    [bankCityKey]: "",
                    [bankProvinceKey]: "",
                    [bankPostalCodeKey]: "",
                    [bankAccountNumberKey]: ""
                }))
                setIsValidIban(false)
                return
            }

            setError ? setError("") : setBankDetailsError("")

            setFormData(prev => {
                const update = {
                    ...prev,
                    [bankNameKey]: decrypted?.name ?? decrypted?.bicDetails?.name ?? "",
                }

                if (accNumType === "IBAN") {
                    update[branchNameKey] = `${(decrypted?.ibanDetails?.branch_id ?? decrypted?.bicDetails?.structured_address?.building_number ?? decrypted?.bicDetails?.structured_address?.building_name) || "Main Branch"}`
                    update[bankBranchStreetKey] = decrypted?.bicDetails?.structured_address?.street_name ?? ""
                    update[bankCityKey] = decrypted?.bicDetails?.structured_address?.town_name ?? ""
                    update[bankProvinceKey] = decrypted?.bicDetails?.structured_address?.country_subdivision_name ?? ""
                    update[bankPostalCodeKey] = decrypted?.bicDetails?.structured_address?.post_code ?? ""
                    update[bankAccountNumberKey] = decrypted?.ibanDetails?.account_number ?? queryMetadata.account_number ?? ''
                } else {
                    update[branchNameKey] = decrypted?.structured_address?.country_subdivision_name || "Main Branch"
                    update[bankBranchStreetKey] = decrypted?.structured_address?.street_name ?? ""
                    update[bankCityKey] = decrypted?.structured_address?.town_name ?? ""
                    update[bankProvinceKey] = decrypted?.structured_address?.town_name ?? ""
                    update[bankPostalCodeKey] = decrypted?.structured_address?.post_code ?? ""
                    update[bankAccountNumberKey] = queryMetadata.account_number ?? ""
                }
                return update
            })

            if (!queryMetadata.isForEdit) {
                if (bankExtras && handleBankExtraChange) {
                    for (const key in bankExtras) {
                        handleBankExtraChange({ target: { name: key, value: "" } })
                    }
                }
            }

            const countryNameRaw = decrypted?.bicDetails?.structured_address?.country_name || decrypted?.structured_address?.country_name || ""
            if (countryNameRaw) {
                setBankCountry(countryNameRaw[0].toUpperCase() + countryNameRaw.slice(1).toLowerCase())
            }
            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code || decrypted?.structured_address?.country_code || "")
            setIsValidIban(true)
        }
    }, [rawData, accNumType, alpha3, countryName, setError, setFormData, queryMetadata, bankNameKey, branchNameKey, bankBranchStreetKey, bankCityKey, bankProvinceKey, bankPostalCodeKey])

    // Process query errors
    useEffect(() => {
        if (queryError) {
            if (queryError.response?.status === 401) {
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                window.location.pathname = "/login"
                return
            }

            setError ? setError("Invalid Details") : setBankDetailsError("Invalid Details")
            setFormData(prev => ({
                ...prev,
                [bankNameKey]: "",
                [branchNameKey]: "",
                [bankBranchStreetKey]: "",
                [bankCityKey]: "",
                [bankProvinceKey]: "",
                [bankPostalCodeKey]: "",
                [bankAccountNumberKey]: ""
            }))

            if (!queryMetadata.isForEdit) {
                if (bankExtras && handleBankExtraChange) {
                    for (const key in bankExtras) {
                        handleBankExtraChange({ target: { name: key, value: "" } })
                    }
                }
            }
            setBankCountry("")
            setBankCountryCode("")
            setIsValidIban(false)
        }
    }, [queryError, setError, setFormData, queryMetadata, bankNameKey, branchNameKey, bankBranchStreetKey, bankCityKey, bankProvinceKey, bankPostalCodeKey])

    const getBankDetails = useCallback((e, isForEdit = false, account_number = "") => {
        const value = e.target.value?.replace(/[^a-zA-Z0-9]/g, '')

        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }))
        setIbanSwift(value)
        setQueryMetadata({ isForEdit, account_number })
        setIsValidIban(false)

        if (value.length < (accNumType === "IBAN" ? 14 : 7)) {
            setError ? setError("") : setBankDetailsError("")
        }
    }, [accNumType, setError, setFormData])

    return {
        getBankDetails,
        bankCountry,
        bankCountryCode,
        bankDetailsError,
        isValidIban,
        ibanSwift,
        setIbanSwift,
        setBankDetailsError,
        setBankCountryCode,
        setBankCountry,
        isFetchingBank: isFetching
    }
}

export default useBankDetails
