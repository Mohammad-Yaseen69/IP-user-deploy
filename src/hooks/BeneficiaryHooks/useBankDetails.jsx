import { useCallback, useContext, useState } from 'react'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { countries as CountriesList } from 'country-list-json'

let debounceTimer;

const useBankDetails = ({ accNumType, setFormData, handleBankExtraChange, bankExtras, setError, alpha3, countryName, fieldKeyOverrides = {}, debounceMs = 1500 }) => {
    const { authHeader } = useContext(UserContext)
    const [bankCountry, setBankCountry] = useState("")
    const [bankDetailsError, setBankDetailsError] = useState("")
    const [bankCountryCode, setBankCountryCode] = useState("")
    const [isValidIban, setIsValidIban] = useState(true)
    const [ibanSwift, setIbanSwift] = useState("")

    const getBankDetails = useCallback((e, isForEdit = false) => {
        // keep the input state in sync and sanitize
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value?.replace(/[^a-zA-Z0-9]/g, '')
        }))
        setIbanSwift(e.target.value?.replace(/[^a-zA-Z0-9]/g, ''))
        setIsValidIban(false)
        console.log(e.target.value, accNumType)

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            // determine field keys based on consumer needs
            const branchNameKey = fieldKeyOverrides.branch_name || 'branch_name'
            const bankNameKey = fieldKeyOverrides.bank_name || 'bank_name'
            const bankBranchStreetKey = fieldKeyOverrides.bank_branch_street || 'bank_branch_street'
            const bankCityKey = fieldKeyOverrides.bank_city || 'bank_city'
            const bankProvinceKey = fieldKeyOverrides.bank_province || 'bank_province'
            const bankPostalCodeKey = fieldKeyOverrides.bank_postal_code || 'bank_postal_code'
            const bankAccountNumberKey = fieldKeyOverrides.bank_account_number || 'bank_account_number'

            if (accNumType === "IBAN") {
                console.log("shu")
                if (e.target.value.length > 13) {
                    axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-details-by-iban/${e.target.value}`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            console.log(decrypted)
                            // Optional country validation support for withdrawals flow
                            let isValidCountry = true
                            try {
                                const code = decrypted?.bicDetails?.structured_address?.country_code
                                const name = decrypted?.structured_address?.country_name || decrypted?.bicDetails?.structured_address?.country_name
                                if (alpha3 || countryName) {
                                    isValidCountry = (
                                        (alpha3 && code === alpha3) ||
                                        (countryName && (countryName?.toLowerCase() === name?.toLowerCase())) ||
                                        CountriesList?.some(item => item.code === code)
                                    )
                                }
                            } catch (error) {
                                console.log(error)
                            }

                            if (!isValidCountry) {
                                const msg = "IBAN must belong to your selected country!"
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
                                return
                            } else {
                                setError ? setError("") : setBankDetailsError("")
                            }
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    [bankNameKey]: decrypted?.bicDetails?.name ?? "",
                                    [branchNameKey]: `${(decrypted?.ibanDetails?.branch_id ?? decrypted?.bicDetails?.structured_address?.building_number ?? decrypted?.bicDetails?.structured_address?.building_name) || "Main Branch"}`,
                                    [bankBranchStreetKey]: decrypted?.bicDetails?.structured_address?.street_name ?? "",
                                    [bankCityKey]: decrypted?.bicDetails?.structured_address?.town_name ?? "",
                                    [bankProvinceKey]: decrypted?.bicDetails?.structured_address?.country_subdivision_name ?? "",
                                    [bankPostalCodeKey]: decrypted?.bicDetails?.structured_address?.post_code ?? "",
                                    [bankAccountNumberKey]: decrypted?.ibanDetails?.account_number ?? '',

                                }
                            })
                            if (!isForEdit) {
                                if (bankExtras && handleBankExtraChange) {
                                    for (const key in bankExtras) {
                                        handleBankExtraChange({ target: { name: key, value: "" } })
                                    }
                                }
                            }
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() || "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setError ? setError("") : setBankDetailsError("")
                            setIsValidIban(true)
                        })
                        .catch(err => {
                            const decrypted = decryptData(err.response.data.data)
                            if (decrypted?.message === "Unauthorize to access this route") {
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                window.location.pathname = "/login";
                            }
                            // console.log(decrypted)
                            setError ? setError("Invalid Details") : setBankDetailsError("Invalid Details")
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    [bankNameKey]: "",
                                    [branchNameKey]: "",
                                    [bankBranchStreetKey]: "",
                                    [bankCityKey]: "",
                                    [bankProvinceKey]: "",
                                    [bankPostalCodeKey]: "",
                                    [bankAccountNumberKey]: ""
                                }
                            })
                            if (!isForEdit) {
                                if (bankExtras && handleBankExtraChange) {
                                    for (const key in bankExtras) {
                                        handleBankExtraChange({ target: { name: key, value: "" } })
                                    }
                                }
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                        })
                } else {
                    setError ? setError("") : setBankDetailsError("")
                    setFormData(prev => {
                        return {
                            ...prev,
                            [bankNameKey]: "",
                            [branchNameKey]: "",
                            [bankBranchStreetKey]: "",
                            [bankCityKey]: "",
                            [bankProvinceKey]: "",
                            [bankPostalCodeKey]: "",
                            [bankAccountNumberKey]: ""
                        }
                    })
                    if (!isForEdit) {
                        if (bankExtras && handleBankExtraChange) {
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                        }
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                }
            } else {
                console.log(e.target.value.length >= 7)
                if (e.target.value.length >= 7) {
                    axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/get-details-by-bic/${e.target.value}/abc`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)?.bicDetails
                            // Optional country validation support for withdrawals flow
                            let isValidCountry = true
                            try {
                                const code = decrypted?.structured_address?.country_code
                                const name = decrypted?.structured_address?.country_name
                                if (alpha3 || countryName) {
                                    isValidCountry = (
                                        (alpha3 && code === alpha3) ||
                                        (countryName && (countryName?.toLowerCase() === name?.toLowerCase())) ||
                                        CountriesList?.some(item => item.code === code)
                                    )
                                }
                            } catch (error) {
                                console.log(error)
                            }

                            if (!isValidCountry) {
                                const msg = "Swift Code must belong to your selected country!"
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
                                return
                            }

                            setError ? setError("") : setBankDetailsError("")
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    [bankNameKey]: decrypted?.name ?? "",
                                    [branchNameKey]: decrypted?.structured_address?.country_subdivision_name || "Main Branch",
                                    [bankBranchStreetKey]: decrypted?.structured_address?.street_name ?? "",
                                    [bankCityKey]: decrypted?.structured_address?.town_name ?? "",
                                    [bankProvinceKey]: decrypted?.structured_address?.town_name ?? "",
                                    [bankPostalCodeKey]: decrypted?.structured_address?.post_code ?? "",
                                    [bankAccountNumberKey]: ""
                                }
                            })
                            if (!isForEdit) {
                                if (bankExtras && handleBankExtraChange) {
                                    for (const key in bankExtras) {
                                        handleBankExtraChange({ target: { name: key, value: "" } })
                                    }
                                }
                            }
                            setBankCountry(decrypted?.structured_address?.country_name[0] + decrypted?.structured_address?.country_name.slice(1).toLowerCase() || "")
                            setBankCountryCode(decrypted?.structured_address?.country_code ?? "")
                            setError ? setError("") : setBankDetailsError("")
                            setIsValidIban(true)
                        })
                        .catch(err => {
                            const decrypted = decryptData(err.response.data.data)
                            if (decrypted?.message === "Unauthorize to access this route") {
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                window.location.pathname = "/login";
                            }
                            setError ? setError("Invalid Details") : setBankDetailsError("Invalid Details")
                            // console.log(decrypted)
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    [bankNameKey]: "",
                                    [branchNameKey]: "",
                                    [bankBranchStreetKey]: "",
                                    [bankCityKey]: "",
                                    [bankProvinceKey]: "",
                                    [bankPostalCodeKey]: "",
                                    [bankAccountNumberKey]: ""
                                }
                            })
                            if (!isForEdit) {
                                if (bankExtras && handleBankExtraChange) {
                                    for (const key in bankExtras) {
                                        handleBankExtraChange({ target: { name: key, value: "" } })
                                    }
                                }
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                        })
                } else {
                    setError ? setError("") : setBankDetailsError("")
                    setFormData(prev => {
                        return {
                            ...prev,
                            [bankNameKey]: "",
                            [branchNameKey]: "",
                            [bankBranchStreetKey]: "",
                            [bankCityKey]: "",
                            [bankProvinceKey]: "",
                            [bankPostalCodeKey]: "",
                            [bankAccountNumberKey]: ""
                        }
                    })
                    if (!isForEdit) {
                        if (bankExtras && handleBankExtraChange) {
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                        }
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                }
            }
        }, debounceMs);
    }, [accNumType, alpha3, countryName, debounceMs, fieldKeyOverrides, setError, setFormData, handleBankExtraChange, bankExtras])


    return { getBankDetails, bankCountry, bankCountryCode, bankDetailsError, isValidIban, ibanSwift, setIbanSwift, setBankDetailsError, setBankCountryCode, setBankCountry }
}

export default useBankDetails
