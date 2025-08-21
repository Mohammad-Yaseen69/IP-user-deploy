import { useCallback, useContext, useState } from 'react'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'

let debounceTimer;

const useBankDetails = ({ accNumType, setFormData, handleBankExtraChange, bankExtras }) => {
    const { authHeader } = useContext(UserContext)
    const [bankCountry, setBankCountry] = useState("")
    const [bankDetailsError, setBankDetailsError] = useState("")
    const [bankCountryCode, setBankCountryCode] = useState("")
    const [isValidIban, setIsValidIban] = useState(true)
    const [ibanSwift, setIbanSwift] = useState("")

    const getBankDetails = useCallback((e, isForEdit = false) => {
        setIbanSwift(e.target.value?.replace(/[^a-zA-Z0-9]/g, ''))
        setIsValidIban(false)
        console.log(e.target.value, accNumType)

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            if (accNumType === "IBAN") {
                console.log("shu")
                if (e.target.value.length > 13) {
                    axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-details-by-iban/${e.target.value}`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            console.log(decrypted)
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    bank_name: decrypted?.bicDetails?.name ?? "",
                                    // branch_name: decrypted?.bicDetails?.structured_address?.country_subdivision_name ?? "",
                                    branch_name: `${(decrypted?.ibanDetails?.branch_id ?? decrypted?.bicDetails?.structured_address?.building_number ?? decrypted?.bicDetails?.structured_address?.building_name) || "Main Branch"}`,
                                    bank_branch_street: decrypted?.bicDetails?.structured_address?.street_name ?? "",
                                    bank_city: decrypted?.bicDetails?.structured_address?.town_name ?? "",
                                    bank_province: decrypted?.bicDetails?.structured_address?.country_subdivision_name ?? "",
                                    bank_postal_code: decrypted?.bicDetails?.structured_address?.post_code ?? "",
                                    bank_account_number: decrypted?.ibanDetails?.account_number ?? '',

                                }
                            })
                            if (!isForEdit) {
                                for (const key in bankExtras) {
                                    handleBankExtraChange({ target: { name: key, value: "" } })
                                }
                            }
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setBankDetailsError("")
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
                            setBankDetailsError("Invalid Details")
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    bank_name: "",
                                    branch_name: "",
                                    bank_branch_street: "",
                                    bank_city: "",
                                    bank_province: "",
                                    bank_postal_code: "",
                                    bank_account_number: ""
                                }
                            })
                            if (!isForEdit) {
                                for (const key in bankExtras) {
                                    handleBankExtraChange({ target: { name: key, value: "" } })
                                }
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                        })
                } else {
                    setBankDetailsError("")
                    setFormData(prev => {
                        return {
                            ...prev,
                            bank_name: "",
                            branch_name: "",
                            bank_branch_street: "",
                            bank_city: "",
                            bank_province: "",
                            bank_postal_code: "",
                            bank_account_number: ""
                        }
                    })
                    if (!isForEdit) {
                        for (const key in bankExtras) {
                            handleBankExtraChange({ target: { name: key, value: "" } })
                        }
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                }
            } else {
                console.log(e.target.value.length >= 7)
                if (e.target.value.length >= 7) {
                    axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-details-by-bic/${e.target.value}/abc`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)?.bicDetails
                            // console.log(decrypted)
                            setBankDetailsError("")
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    bank_name: decrypted?.name ?? "",
                                    branch_name: decrypted?.structured_address?.country_subdivision_name || "Main Branch",
                                    bank_branch_street: decrypted?.structured_address?.street_name ?? "",
                                    bank_city: decrypted?.structured_address?.town_name ?? "",
                                    bank_province: decrypted?.structured_address?.town_name ?? "",
                                    bank_postal_code: decrypted?.structured_address?.post_code ?? "",
                                }
                            })
                            if (!isForEdit) {
                                for (const key in bankExtras) {
                                    handleBankExtraChange({ target: { name: key, value: "" } })
                                }
                            }
                            setBankCountry(decrypted?.structured_address?.country_name[0] + decrypted?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.structured_address?.country_code ?? "")
                            setBankDetailsError("")
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
                            setBankDetailsError("Invalid Details")
                            // console.log(decrypted)
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    bank_name: "",
                                    branch_name: "",
                                    bank_branch_street: "",
                                    bank_city: "",
                                    bank_province: "",
                                    bank_postal_code: "",
                                    bank_account_number: ""
                                }
                            })
                            if (!isForEdit) {
                                for (const key in bankExtras) {
                                    handleBankExtraChange({ target: { name: key, value: "" } })
                                }
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                        })
                } else {
                    setBankDetailsError("")
                    setFormData(prev => {
                        return {
                            ...prev,
                            bank_name: "",
                            branch_name: "",
                            bank_branch_street: "",
                            bank_city: "",
                            bank_province: "",
                            bank_postal_code: "",
                            bank_account_number: ""
                        }
                    })
                    if (!isForEdit) {
                        for (const key in bankExtras) {
                            handleBankExtraChange({ target: { name: key, value: "" } })
                        }
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                }
            }
        }, 1500);
    }, [accNumType])


    return { getBankDetails, bankCountry, bankCountryCode, bankDetailsError, isValidIban, ibanSwift, setIbanSwift, setBankDetailsError, setBankCountryCode, setBankCountry }
}

export default useBankDetails
