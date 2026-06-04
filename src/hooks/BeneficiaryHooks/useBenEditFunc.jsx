import { useContext, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { requiredFields } from '../../Components/AddBeneficiary/requiredFields'
import { trimObjectValues } from '../../utils/Data'

const useBenEditFunc = ({
    services,
    completedCrypto,
    instapayWallets,
    completedBank,
    completedCard,
    completedWallet,
    cashPickupCompleted,
    formData,
    firstName,
    lastName,
    mobileNumber,
    city,
    country,
    countryId,
    countryIsoCode,
    walletIds,
    basicExtras,
    additionFields,
    bankExtras,
    cardExtras,
    cashExtras,
    accNumType,
    ibanSwift,
    cashPickupType,
    cashPickupNumber,
    walletError,
    toggleSuccess,
    mobileExtras,
    inBusiness,
    setClicked,
    setMissingFields,
    user,
    companyName,
    representativeFields
}) => {
    const [mobileNumberError, setMobileNumberError] = useState("")
    const [walletNumberError, setWalletNumberError] = useState("")
    const { userDetails, authHeader } = useContext(UserContext)
    const [saveloading, setsaveloading] = useState(false)
    const isIndividualToBusiness = inBusiness && userDetails?.account_type === "individual"


    let extras = { ...basicExtras, ...additionFields }

    for (const key in extras) {
        if (extras[key]) {
            extras[key] = extras[key]?.toString()?.trim()
        }
    }

    const editBenFun = () => {
        const account_types = [
            services.some(item => item?.method?.toLowerCase()?.includes("bank")) && completedBank ? "bank" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("card")) && completedCard ? "card" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("mobile")) && completedWallet ? "mobile" : null,
            completedCrypto ? "crypto" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? "cash" : null,
            instapayWallets.every(item => item?.wallet_id ? item?.wallet_id.length !== 8 : item?.length !== 8) || walletError ? null : "wallet"
        ]

        const data = {
            first_name: firstName ?? "",
            last_name: lastName ?? "",
            company_name: inBusiness ? companyName : "",
            email: formData.email ?? "",
            postal_code: formData.postal_code ?? "",
            phone: mobileNumber ?? "",
            address: formData.address ?? "",
            city: city ?? "",
            country_name: country ?? "",
            country: countryId ?? "",
            country_iso_code: countryIsoCode,
            relation: isIndividualToBusiness ? "OTHER" : formData.relation ?? "",
            relationC2B: isIndividualToBusiness ? formData.relationC2B ?? "" : undefined,
            account: userDetails._id ?? "",
            representativeDetails: representativeFields || {},
            beneficiary_type: inBusiness ? "business" : "individual",
            account_type: account_types.filter(item => item !== null) ?? "",
            isUsaBank: false,
            wallet: walletIds ?? "",
            extras: extras,
            bank_details: services.some(item => item?.method?.toLowerCase()?.includes("bank")) && completedBank ? [
                {
                    swift_code: accNumType === "Swift" ? ibanSwift : "",
                    iban: accNumType === "IBAN" ? ibanSwift : "",
                    account_number: formData.bank_account_number ?? "",
                    name: formData.bank_name ?? "",
                    branch_name: formData.branch_name ?? "",
                    branch_street: formData.bank_branch_street ?? "",
                    city: formData.bank_city ?? "",
                    province: formData.bank_province ?? "",
                    postal_code: formData.bank_postal_code ?? "",
                    account_holder_name: formData.account_holder_name ?? "",
                    extras: bankExtras
                }
            ] : [],
            mobile_wallet: services.some(item => item?.method?.toLowerCase()?.includes("mobile")) && completedWallet ? [
                {
                    money_provider: formData.mobile_wallet_provider ?? "",
                    wallet_name: formData.mobile_wallet_name ?? "",
                    wallet_account_number: formData.mobile_wallet_account_number ?? "",
                    extras: mobileExtras
                }
            ] : [],
            crypto: completedCrypto ? [
                {
                    currency: completedCrypto ? formData.crypto_currency : "",
                    wallet_address: formData.crypto_wallet_address ?? "",
                }
            ] : [],
            cash_pickup: services.some(item => item?.method?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? [
                {
                    document_type: cashPickupType,
                    document_number: cashPickupNumber,
                    extras: cashExtras
                }
            ] : [],
            card: services.some(item => item?.method?.toLowerCase()?.includes("card")) && completedCard ? [
                {
                    card_name: formData.card_holder_one ?? "",
                    card_number: formData.card_number_one ?? "",
                    card_expiry: formData.card_expiry_one ?? "",
                    extras: cardExtras
                },
                {
                    card_name: formData.card_holder_two ?? "",
                    card_number: formData.card_number_two ?? "",
                    card_expiry: formData.card_expiry_two ?? ""
                },
                {
                    card_name: formData.card_holder_three ?? "",
                    card_number: formData.card_number_three ?? "",
                    card_expiry: formData.card_expiry_three ?? ""
                },
            ] : []
        }

        console.log(data)
        if (completedBank) {
            if (accNumType === "IBAN") {
                data.bank_details[0].swift_code = ""
            } else {
                data.bank_details[0].iban = ""
            }
        }

        const trimObj = trimObjectValues(data)
        const encrypted = encryptData(trimObj)

        axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/update-beneficiary/${user._id}`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                toggleSuccess()
            })
            .catch(err => {
                // console.log(decryptData(err.response.data.data))
            })
    }

    const editBeneficiaryHandler = async () => {
        setMobileNumberError("")
        setWalletNumberError("")
        setClicked(true)


        let missing = []



        console.log(firstName, lastName, mobileNumber, city)
        requiredFields.basic.forEach(field => {
            if (!firstName?.trim() && field === "first_name" && !inBusiness) missing.push(field)
            if (!lastName?.trim() && field === "last_name" && !inBusiness) missing.push(field)
            if (!companyName?.trim() && field === "company_name" && inBusiness) missing.push(field)
            if (!mobileNumber?.trim() && field === "phone") missing.push(field)
            if (!formData[field]?.trim() && !country?.trim() && field === "country") missing.push(field)
            if (!formData[field]?.trim() && !city?.trim() && field === "city") missing.push(field)
            if (field === "relation" && isIndividualToBusiness && !formData.relationC2B?.trim()) missing.push(field)
            if (field === "relation" && isIndividualToBusiness) return
            if (!formData[field]?.trim() && field !== 'city' && field !== 'phone' && field !== 'country' && field !== 'first_name' && field !== 'last_name') missing.push(field)
        })

        // switch (active) {
        //     case 1: // Bank
        //         requiredFields.bank.forEach(field => {
        //             if (!formData[field]) missing.push(field)
        //         })
        //         break;
        //     case 2: // Mobile
        //         requiredFields.mobile.forEach(field => {
        //             if (!formData[field]) missing.push(field)
        //         })
        //         break;
        //     case 3: // Card
        //         requiredFields.card.forEach(field => {
        //             if (!formData[field]) missing.push(field)
        //         })
        //         break;
        //     case 4: // Crypto
        //         requiredFields.crypto.forEach(field => {
        //             if (!formData[field]) missing.push(field)
        //         })
        //         break;
        //     case 6: // Cash
        //         if (!cashPickupType) missing.push("document_type")
        //         if (!cashPickupNumber) missing.push("document_number")
        //         break;
        //     default:
        //         break;
        // }


        setMissingFields(missing)

        // Focus on first missing field
        if (missing.length > 0) {
            const firstField = document.querySelector(`[name="${missing[0]}"]`)
            if (firstField) {
                firstField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                firstField?.focus()
            }
            return
        }

        setsaveloading(true)
        try {
            if (formData.mobile_wallet_account_number) {
                await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-public`, {
                    data: encryptData({ number: `+${formData.mobile_wallet_account_number}` })
                })
            }


            await editBenFun()
        } catch (error) {
            console.log(error)
            const decrypt = decryptData(error.response?.data?.data)

            if (decrypt.includes("phone") && formData.mobile_wallet_account_number) {
                setWalletNumberError("Incorrect phone number, please enter a valid number")
            }
            else if (decrypt.includes("phone")) {
                setMobileNumberError("Incorrect phone number, please enter a valid number")
            }
            console.log(decrypt)
        }
        setsaveloading(false)
    }

    return { editBeneficiaryHandler, editBenFun, mobileNumberError, walletNumberError, saveloading }
}

export default useBenEditFunc
