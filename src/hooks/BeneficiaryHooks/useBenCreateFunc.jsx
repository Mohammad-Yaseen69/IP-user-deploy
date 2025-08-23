import { useContext, useState } from 'react'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { UserContext } from '../../Context/UserContext'
import { getExtractedPhone } from '../../utils/Functions'
import { trimObjectValues } from '../../utils/Data'

const useBenCreateFunc = ({
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
    toggleSuccess
}) => {
    const [mobileExtras] = useState({
        msisdn: "",
        account_number: "",
        email: "",
        bank_account_number: "",
        account_type: "",
        iban: ""
    })
    const [walletMobileError, setWalletMobileError] = useState("")
    const [mobileError, setMobileError] = useState("")
    const [benLoading, setBenLoading] = useState(false)
    const { userDetails, authHeader } = useContext(UserContext)

    const addBenFunc = () => {
        const account_types = [
            services.some(item => item?.method?.toLowerCase()?.includes("bank")) && completedBank ? "bank" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("card")) && completedCard ? "card" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("mobile")) && completedWallet ? "mobile" : null,
            completedCrypto ? "crypto" : null,
            services.some(item => item?.method?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? "cash" : null,
            instapayWallets.every(item => item.length !== 8) || walletError ? null : "wallet"
        ]

        let extras = { ...basicExtras, ...additionFields }

        for (const key in extras) {
            if (extras[key]) {
                extras[key] = extras[key]?.toString()?.trim()
            }
        }


        const data = {
            first_name: firstName,
            last_name: lastName,
            company_name: "",
            email: formData.email,
            phone: mobileNumber,
            address: formData.address,
            city: city,
            postal_code: formData.postal_code,
            country_name: country,
            country: countryId,
            country_iso_code: countryIsoCode,
            relation: formData.relation,
            account: userDetails._id,
            beneficiary_type: "individual",
            account_type: account_types.filter(item => item !== null),
            isUsaBank: false,
            wallet: walletIds,
            extras: extras,
            bank_details: services.some(item => item?.method?.toLowerCase()?.includes("bank")) && completedBank ? [
                {
                    swift_code: accNumType === "Swift" ? ibanSwift : "",
                    iban: accNumType === "IBAN" ? ibanSwift : "",
                    account_number: formData.bank_account_number,
                    name: formData.bank_name,
                    branch_name: formData.branch_name,
                    branch_street: formData.bank_branch_street,
                    city: formData.bank_city,
                    province: formData.bank_province,
                    postal_code: formData.bank_postal_code,
                    account_holder_name: formData.account_holder_name,
                    extras: bankExtras
                }
            ] : [],
            mobile_wallet: services.some(item => item?.method?.toLowerCase()?.includes("mobile")) && completedWallet ? [
                {
                    money_provider: formData.mobile_wallet_provider,
                    wallet_name: formData.mobile_wallet_name,
                    wallet_account_number: formData.mobile_wallet_account_number,
                    extras: mobileExtras
                }
            ] : [],
            crypto: completedCrypto ? [
                {
                    currency: formData.crypto_currency,
                    wallet_address: formData.crypto_wallet_address,
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
                    card_name: formData.card_holder_one,
                    card_number: formData.card_number_one,
                    card_expiry: formData.card_expiry_one,
                    extras: cardExtras
                },
                {
                    card_name: formData.card_holder_two,
                    card_number: formData.card_number_two,
                    card_expiry: formData.card_expiry_two
                },
                {
                    card_name: formData.card_holder_three,
                    card_number: formData.card_number_three,
                    card_expiry: formData.card_expiry_three
                },
            ] : []
        }

        if (completedBank) {
            if (accNumType === "IBAN") {
                data.bank_details[0].swift_code = ""
            } else {
                data.bank_details[0].iban = ""
            }
        }

        const trimObj = trimObjectValues(data)

        const encrypted = encryptData(trimObj)
        setBenLoading(true)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
            data: encryptData({ number: `+${mobileNumber}` })
        }).then(() => {
            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/add-beneficiary`, {
                data: encrypted
            }, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted)
                    toggleSuccess()
                })
                .catch(err => {
                    const dec = decryptData(err.response.data.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                })
                .finally(() => {
                    setBenLoading(false)
                })
        }).catch(err => {
            const dec = decryptData(err.response.data.data)
            setMobileError("Incorrect phone number, please enter a valid number.")
            console.log(dec)
            setBenLoading(false)
        })
    }

    const addBeneficiaryHandler = async (e) => {
        setMobileError("")
        setWalletMobileError("")
        e.preventDefault()

        const extractWalletNum = getExtractedPhone(formData, countryIsoCode)
        if (extractWalletNum) {
            try {
                setBenLoading(true)
                await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
                    data: encryptData({ number: `+${formData.mobile_wallet_account_number}` })
                });
                addBenFunc();
            } catch {
                setWalletMobileError("Incorrect phone number, please enter a valid number.");
            }
            finally {
                setBenLoading(false)
            }
        } else {
            addBenFunc();
        }
    };

    return {
        mobileExtras,
        walletMobileError,
        mobileError,
        benLoading,
        addBenFunc,
        addBeneficiaryHandler,
        setMobileError
    }
}

export default useBenCreateFunc