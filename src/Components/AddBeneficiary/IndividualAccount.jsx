import { Circle, CheckCircle, Plus } from "react-feather";
import { Button, CardBody, CardFooter, FormGroup, Input, Label } from "reactstrap";
// import GradientButton from "../User/UserSettings/GradientButton";
// import ReactFlagsSelect from "react-flags-select";
import { countries } from "country-list-json";
// import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import "./req_star.css"
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import WalletDetails from "./WalletDetails";
import CountryDropDown from "./CountryDropDown";
import CitiesDropDown from "../CitiesDropDown";
import ConfirmationModal from "./ConfirmationModal";
import { useTranslation } from "react-i18next";
import NestedDropdown from "../NestedDropdown";
import InstaPayLoader from "../Loader";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import countriesjson from "../PaymentsNewer/CountriesData.json"
import PhoneInput from "../PhoneInput";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { minDate } from "../Settings/Basic";
import africanCountries from "../../Data/AfricanCountries.json"

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
    "VOTERS_ID": "Voter’s Identification Card",
    "HEALTH_CARD": "Health Insurance Card/Number",
    "EMPLOYER_ID": "Employer Identification Card",
    "OTHER": "Others not listed"
}

// export const AccountTypeData = {
//     "CASH": "Cash",
//     "BUSINESS": "Business",
//     "GIFT": "Gift",
//     "SALARY": "Salary",
//     "LOTTERY": "Lottery",
//     "SAVINGS": "Savings",
//     "OTHER": "Others not listed"
// }
export const AccountTypeData = {
    CHECKING: "Checking Account",
    SAVINGS: "Savings Account",
    DEPOSIT: "Deposit Account",
    OTHERS: "Other type of account",
}

export const iso2Toiso3Convert = (iso2 = "") => {
    const country = countries.find(item => item.code.toLowerCase() == iso2?.toLowerCase())
    const alpha3 = countriesjson.find(item => item.name.toLowerCase() == country?.name?.toLowerCase() || item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.alpha3
    return alpha3
}

let debounceTimer;

const IndividualAccount = ({ mobileView, handleChangeAlpha, handleChangeNumber, toggleSuccess, filteringCountries }) => {
    const { t } = useTranslation()
    const [isValidIban, setIsValidIban] = useState(false)
    const [fieldsInfo, setFieldsInfo] = useState(null)
    const [active, setActive] = useState(5)
    const [totalCards, setTotalCards] = useState(1)
    const [completedBank, setCompletedBank] = useState(false)
    const [completedWallet, setCompletedWallet] = useState(false)
    const [completedCard, setCompletedCard] = useState(false)
    const [completedCrypto, setCompletedCrypto] = useState(false)
    const [accNumType, setAccNumType] = useState("IBAN")
    const [ibanSwift, setIbanSwift] = useState("")

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [country, setCountry] = useState("")
    const [countryIsoCode, setCountryIsoCode] = useState("")
    const [countryId, setCountryId] = useState("")
    const [city, setCity] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [countryCode, setCountryCode] = useState("")

    const [walletError, setWalletError] = useState("")
    // instapay wallet
    const [instapayWalletsLength, setInstapayWalletsLength] = useState(1)
    const [instapayWallets, setInstapayWallets] = useState(Array(instapayWalletsLength).fill(''))
    const [walletIds, setWalletIds] = useState([])
    const [cashPickupType, setCashPickupType] = useState("")
    const [cashPickupNumber, setCashPickupNumber] = useState("")
    const [cashPickupCompleted, setCashPickupCompleted] = useState("")

    const [duplicateWallet, setDuplicateWallet] = useState(false)
    const [bankDetailsError, setBankDetailsError] = useState("")

    // api bank details
    const [bankCountry, setBankCountry] = useState("")
    const [bankCity, setBankCity] = useState("")
    const [bankCountryCode, setBankCountryCode] = useState("")

    // const show confirmation
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [countryChangedFromModal, setCountryChangedFromModal] = useState(false)


    const [services, setServices] = useState([])
    const [mobileProviders, setMobileProviders] = useState([])
    const [loading, setLoading] = useState(false)
    const [isAddressRequired, setIsAddressRequired] = useState(true)

    const handleInputChange = (index, value) => {
        const newOTPValues = [...instapayWallets];
        newOTPValues[index] = value;
        setInstapayWallets(newOTPValues);
    };

    const fieldInfoValidate = (field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;
        for (const service in fieldsInfo) {
            if (fieldsInfo[service]?.[field_name]?.some(item => item == sub_field_name)) {
                isInThere = true
                break
            }
        }

        return isInThere;
    }

    const serviceFieldInfoValidate = (service, field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;

        if (fieldsInfo?.[service?.name]?.[field_name]?.some(item => item == sub_field_name)) {
            isInThere = true
        }

        return isInThere;
    }

    const { userDetails, authHeader } = useContext(UserContext)

    const [formData, setFormData] = useState({
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
    })

    // basic extra fields
    const [basicExtras, setBasicExtras] = useState({
        middlename: "",
        id_type: "NATIONAL_ID",
        id_number: "",
        province_state: ""
    })

    const [showAdditional, setShowAdditional] = useState(false)
    const [additionFields, setAdditionalFields] = useState({
        gender: "",
        date_of_birth: "",
        nationality: "",
        occupation: "",
    })

    const handleBasicExtraChange = (e) => {
        const { value, name } = e.target;
        setBasicExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const handleAddtionalFieldChange = (e) => {
        const { value, name } = e.target;
        setAdditionalFields(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // basic extra fields


    // bank extra fields
    const [bankExtras, setBankExtras] = useState({
        cbu: "",
        account_type: "",
        bsb_number: "",
        branch_number: "",
        swift_bic_code: "",
        routing_code: "",
        entity_tt_id: "",
        ifs_code: "",
        clabe: "",
        msisdn: "",
        sort_code: ""
    })

    const handleBankExtraChange = (e) => {
        const { value, name } = e.target;
        setBankExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // bank extra fields


    // mobile extra fields
    const [mobileExtras, setMobileExtras] = useState({
        msisdn: "",
        account_number: "",
        email: "",
        bank_account_number: "",
        account_type: "",
        iban: ""
    })

    const handleMobileExtraChange = (e) => {
        const { value, name } = e.target;
        setMobileExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // mobile extra fields


    // card extra fields
    const [cardExtras, setCardExtras] = useState({
        bank_account_number: ""
    })

    const handleCardExtraChange = (e) => {
        const { value, name } = e.target;
        setCardExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // card extra fields


    // cash extra fields
    const [cashExtras, setCashxtras] = useState({
        msisdn: ""
    })

    const handleCashxtraChange = (e) => {
        const { value, name } = e.target;
        setCashxtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    // cash extra fields

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            account_holder_name: `${firstName} ${lastName}`,
            mobile_wallet_name: `${firstName} ${lastName}`
        }))
    }, [firstName, lastName])

    // useEffect(() => {
    //     setFormData(prev => ({
    //         ...prev,
    //         mobile_wallet_account_number: mobileNumber
    //     }))
    // }, [mobileNumber])

    const addBeneficiaryHandler = (e) => {
        e.preventDefault()
        const account_types = [
            services.some(item => item?.name?.toLowerCase()?.includes("bank")) && completedBank ? "bank" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("card")) && completedCard ? "card" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("mobile")) && completedWallet ? "mobile" : null,
            completedCrypto ? "crypto" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? "cash" : null,
            instapayWallets.every(item => item.length !== 8) || walletError ? null : "wallet"
        ]

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
            extras: { ...basicExtras, ...additionFields },
            bank_details: services.some(item => item?.name?.toLowerCase()?.includes("bank")) && completedBank ? [
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
            mobile_wallet: services.some(item => item?.name?.toLowerCase()?.includes("mobile")) && completedWallet ? [
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
            cash_pickup: services.some(item => item?.name?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? [
                {
                    document_type: cashPickupType,
                    document_number: cashPickupNumber,
                    extras: cashExtras
                }
            ] : [],
            card: services.some(item => item?.name?.toLowerCase()?.includes("card")) && completedCard ? [
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
        const encrypted = encryptData(data)
        // console.log(encrypted)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/add-beneficiary`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                toggleSuccess()
            })
            .catch(err => {
                const dec = decryptData(err.response.data.data)
                if (dec?.message === "Unauthorize to access this route") {
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    window.location.pathname = "/auth/login";
                }
                // console.log(decryptData(err.response.data.data))
            })
    }

    const inputChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const changeUserDetailsAsPerBankDetails = () => {
        setCountryChangedFromModal(true)
        setFormData((prev) => {
            return {
                ...prev,
                card_holder_one: "",
                card_number_one: "",
                card_expiry_one: "",
                card_holder_two: "",
                card_number_two: "",
                card_expiry_two: "",
                card_holder_three: "",
                card_number_three: "",
                card_expiry_three: "",
                mobile_wallet_provider: "",
                mobile_wallet_name: "",
                mobile_wallet_account_number: ""
            }
        })
        setCountry(bankCountry)
        setCountryCode(bankCountryCode)
        setCity(bankCity)
        setShowConfirmation(false)
        setMobileNumber("")
        setCountryIsoCode(iso2Toiso3Convert(bankCountryCode))
    }

    const onCancelHandler = () => {
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
        setBankCountry("")
        setBankCountryCode("")
        setBankCity("")
        setShowConfirmation(false)
    }

    useEffect(() => {
        console.log(bankCountryCode, countryIsoCode)
        if (bankCountryCode && countryIsoCode && bankCountryCode !== countryIsoCode) {
            setShowConfirmation(true)
        }
    }, [bankCountryCode, countryIsoCode])



    const getBankDetails = (e) => {
        setIbanSwift(e.target.value?.replace(/[^a-zA-Z0-9]/g, ''))
        setIsValidIban(false)

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {

            if (accNumType === "IBAN") {
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
                                    bank_account_number: decrypted?.ibanDetails?.account_number ?? ''
                                }
                            })
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setBankCity(decrypted?.bicDetails?.structured_address?.town_name[0] + decrypted?.bicDetails?.structured_address?.town_name.slice(1).toLowerCase() ?? "")
                            setBankDetailsError("")
                            setIsValidIban(true)
                        })
                        .catch(err => {
                            const decrypted = decryptData(err.response.data.data)
                            if (decrypted?.message === "Unauthorize to access this route") {
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                window.location.pathname = "/auth/login";
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
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                            setBankCity("")
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
                    for (const key in bankExtras) {
                        handleBankExtraChange({ target: { name: key, value: "" } })
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                    setBankCity("")
                }
            } else {
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
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setBankCity(decrypted?.bicDetails?.structured_address?.town_name[0] + decrypted?.bicDetails?.structured_address?.town_name.slice(1).toLowerCase() ?? "")
                            setBankDetailsError("")
                            setIsValidIban(true)
                        })
                        .catch(err => {
                            const decrypted = decryptData(err.response.data.data)
                            if (decrypted?.message === "Unauthorize to access this route") {
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                window.location.pathname = "/auth/login";
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
                            for (const key in bankExtras) {
                                handleBankExtraChange({ target: { name: key, value: "" } })
                            }
                            setBankCountry("")
                            setBankCountryCode("")
                            setBankCity("")
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
                    for (const key in bankExtras) {
                        handleBankExtraChange({ target: { name: key, value: "" } })
                    }
                    setBankCountry("")
                    setBankCountryCode("")
                    setBankCity("")
                }
            }
        }, 1500);
    }

    // bank details
    useEffect(() => {
        if (formData.bank_name && formData.branch_name && formData.bank_account_number && formData.bank_postal_code && formData.bank_branch_street && formData.bank_city && formData.bank_province && Object.keys(bankExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("bank")), "credit_party_identifiers_accepted", item)).every(item => bankExtras?.[item]?.length > 0)) {
            setCompletedBank(true)
        } else {
            setCompletedBank(false)
        }
    }, [formData, bankExtras, services])

    useEffect(() => {
        if (cashPickupType && cashPickupNumber && Object.keys(cashExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item)).every(item => cashExtras?.[item]?.length > 0)) {
            setCashPickupCompleted(true)
        } else {
            setCashPickupCompleted(false)
        }
    }, [cashPickupType, cashPickupNumber, cashExtras, services])

    // mobile wallet details
    useEffect(() => {
        if (formData.mobile_wallet_name && formData.mobile_wallet_account_number?.length > 8 && formData.mobile_wallet_provider) {
            setCompletedWallet(true)
        } else {
            setCompletedWallet(false)
        }
    }, [formData])

    // card details
    useEffect(() => {
        if (formData.card_holder_one && formData.card_number_one && Object.keys(cardExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("card")), "credit_party_identifiers_accepted", item)).every(item => cardExtras?.[item]?.length > 0)) {
            setCompletedCard(true)
        } else {
            setCompletedCard(false)
        }
    }, [formData, cardExtras, services])

    useEffect(() => {
        if (formData.crypto_currency && formData.crypto_wallet_address) {
            setCompletedCrypto(true)
        } else {
            setCompletedCrypto(false)
        }
    }, [formData])

    const handleMonthKeyPress = (event) => {
        const { key } = event;
        const monthValue = event.target.value + key;

        // Prevent typing non-numeric values, negative values, and values more than 12
        if (!/^\d$/.test(key) || monthValue.startsWith("-") || monthValue === "0" || Number(monthValue) > 12) {
            event.preventDefault();
        } else if (monthValue.length === 1 && Number(monthValue) < 1) {
            event.target.value = "0" + monthValue;
        }
    };

    const handleYearKeyPress = (event) => {
        const { key } = event;
        const yearValue = event.target.value + key;

        // Prevent typing non-numeric values or values less than the current year
        if (!/^\d+$/.test(yearValue) || yearValue.length > 4) {
            event.preventDefault();
        }
    };


    // const coutry filtering
    const [selectedCountryDetails, setSelectedCountryDetails] = useState(null)

    useEffect(() => {
        if (countryId) {
            const getChannels = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/country/get-specific-country-details/${countryId}`, {
                        headers: authHeader
                    })
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)

                    setSelectedCountryDetails(decrypted?.data)
                } catch (error) {
                    const dec = decryptData(error.response.data.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/auth/login";
                    }
                    // console.log(decryptData(error.response.data.data))
                }
            }

            getChannels()
        }
    }, [countryId])

    useEffect(() => {
        if (countryIsoCode) {
            setActive(5)
            if (!countryChangedFromModal) {
                getBankDetails({ target: { value: "" } })
                setBankDetailsError("")
            }
            setLoading(true)
            const getCountryFields = async (alpha3, service) => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/thunes/get-required-fields-by-country/${alpha3}/${service?.id}/C2C`, {
                        headers: authHeader
                    });

                    const dec = decryptData(res.data.data);
                    setFieldsInfo(prev => ({ ...prev, [service?.name?.split(" ")?.[0]]: dec?.data }))
                    // const isAddReq = dec?.data?.required_sending_entity_fields?.find(item => item === "address")
                    // if (isAddReq) {
                    //     setIsAddressRequired(true)
                    // }
                } catch (error) {
                    const dec = decryptData(error.response.data.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/auth/login";
                    }
                    console.log(dec)
                }
            }

            const getChannels = async () => {
                setFieldsInfo(null)
                axios.get(`${process.env.REACT_APP_THUNES_API}/services/${countryIsoCode}`)
                    .then(res => {
                        // console.log(decryptData(res.data.data))
                        const decrypted = decryptData(res.data.data)
                        setServices(decrypted)
                        if (decrypted?.length > 0) {
                            for (const ser of decrypted) {
                                getCountryFields(countryIsoCode, ser)
                            }
                        }

                        const mobile = decrypted?.find(item => item?.name?.toLowerCase()?.includes("mobile"))
                        if (mobile) {
                            const data = { country: countryIsoCode, id: mobile.id }
                            const encrypted = encryptData(data)
                            axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                                data: encrypted
                            })
                                .then(res => {
                                    const dec = decryptData(res.data.data)
                                    setMobileProviders(dec)
                                })
                                .catch(err => {
                                    // console.log(err)
                                })
                        }
                    })
                    .catch(err => {
                        // console.log(decryptData(err?.response?.data?.data))
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }

            getChannels()
        }
    }, [countryIsoCode])


    // address suggestions
    const [isCountryInFocus, setIsCountryInFocus] = useState(false)
    const [position, setPosition] = useState({ lat: "", lng: "" })
    const [coordApiCountry, setCoordApiCountry] = useState("")
    const [addresses, setAddresses] = useState([])
    const [addressInFocus, setAddressInFocus] = useState(false)
    const [debouncedAddress, setDebouncedAddress] = useState(formData.address);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        const newTimer = setTimeout(() => {
            setDebouncedAddress(formData.address);
        }, 500);

        setTimer(newTimer);

        return () => clearTimeout(newTimer);
    }, [formData.address]);

    useEffect(() => {
        const getPosition = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-coordinates/${countryIsoCode}`, { headers: authHeader })
                const dec = decryptData(res.data.data)
                setPosition(dec?.position)
                setCoordApiCountry(dec?.country?.name)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
            }
        }
        if (countryIsoCode && !isCountryInFocus) {
            if (countryIsoCode in africanCountries) return;
            getPosition()
        }
    }, [countryIsoCode, isCountryInFocus])

    useEffect(() => {
        const getAddresses = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-autocomplete-address?lat=${position.lat}&long=${position.lng}&countryIso=${countryIsoCode}&query=${debouncedAddress}&countryName=${coordApiCountry}`, { headers: authHeader });
                const dec = decryptData(res.data.data);
                console.log(dec);
                setAddresses(dec?.addresses ?? []);
            } catch (error) {
                const dec = decryptData(error.response.data.data);
                console.log(dec);
                setAddresses([]);
            }
        };

        if (debouncedAddress.length >= 5 && position.lat && position.lng && addressInFocus) {
            getAddresses();
        }

        if (debouncedAddress.length < 5) {
            setAddresses([]);
        }
    }, [debouncedAddress, position, addressInFocus]);


    const [hoverErrors, setHoverErrors] = useState({
        city: false,
        postal_code: false,
        address: false
    })

    return (
        <>
            {
                loading
                    ?
                    <div style={{ height: "60vh", width: "100%", opacity: 1 }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <>
                        <CardBody>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="first-name">{t("First Name")} <span className="req_star">*</span></Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="first-name" type="text" placeholder={t("First Name")} required pattern="[A-Za-z]+" title="(A to Z | a to z)" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </FormGroup>
                                    {
                                        fieldInfoValidate("required_receiving_entity_fields", "middlename")
                                        &&
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" htmlFor="middlename">{t("Middle Name")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="middlename" id="middlename" type="text" placeholder={t('Middle Name')} value={basicExtras.middlename} onChange={handleBasicExtraChange} />
                                        </FormGroup>
                                    }
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="last-name">{t("Last Name")} <span className="req_star">*</span></Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="last-name" type="text" placeholder={t('Last Name')} required pattern="[A-Za-z]+" title="(A to Z | a to z)" value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </FormGroup>
                                </div>
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    {
                                        fieldInfoValidate("required_receiving_entity_fields", "id_type") || fieldInfoValidate("required_receiving_entity_fields", "id_number")
                                            ?
                                            <>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="id_type">{t("ID Type")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_type" id="id_type" type="select" placeholder='ID Type' value={basicExtras.id_type} onChange={handleBasicExtraChange}>
                                                        <option value="">{t("Select Document")}</option>
                                                        {
                                                            Object.keys(idTypeData).map(item => (
                                                                <option key={item} value={item}>{idTypeData?.[item]}</option>
                                                            ))
                                                        }
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="id_number">{t("ID Number")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_number" id="id_number" type="text" placeholder='ID Number' value={basicExtras.id_number} onChange={handleBasicExtraChange} />
                                                </FormGroup>
                                            </>
                                            : ""
                                    }
                                    {
                                        fieldInfoValidate("required_receiving_entity_fields", "province_state")
                                        &&
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" htmlFor="province_state">{t("Province/State")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="province_state" id="province_state" type="text" placeholder='Province/State' value={basicExtras.province_state} onChange={handleBasicExtraChange} />
                                        </FormGroup>
                                    }
                                </div>
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                        <Label className="col-form-label" htmlFor="country">{t("Country")} <span className="req_star">*</span></Label>
                                        <CountryDropDown
                                            onSelect={(selectedCountry) => {
                                                if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
                                                    selectedCountry.name = "Bolivia, Plurinational State of bolivia"
                                                }
                                                const filtered = countries.filter(item => {
                                                    return selectedCountry?.name?.toLowerCase()?.includes(item?.name?.toLowerCase())
                                                })?.[0]
                                                setCountryChangedFromModal(false)
                                                setCountryCode(filtered?.code)
                                                setCountry(selectedCountry?.name)
                                                setCountryIsoCode(selectedCountry?.alpha3)
                                                const country_id = filteringCountries.find(item => item?.country_iso_code === selectedCountry.alpha3)?._id
                                                setCountryId(country_id)
                                                setCity("")
                                                setMobileNumber("")
                                            }}
                                            country={countryIsoCode}
                                            filteringList={filteringCountries}
                                            setIsCountryInFocus={setIsCountryInFocus}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        style={{
                                            flex: 1,
                                            margin: 0,
                                            minWidth: "250px",
                                            position: "relative"
                                        }}
                                        onMouseEnter={() => country ? console.log("") : setHoverErrors(prev => ({
                                            ...prev, city: true
                                        }))}
                                        onMouseLeave={() => country ? console.log("") : setHoverErrors(prev => ({
                                            ...prev, city: false
                                        }))}
                                    >
                                        <Label className="col-form-label" htmlFor="city">{t("City")} <span className="req_star">*</span></Label>
                                        {/* <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="city" type="text" placeholder='City/Town' onKeyPress={handleChangeAlpha} required name="city" value={formData.city} onChange={inputChangeHandler} /> */}
                                        <CitiesDropDown disabled={!country} country={country} userCity={city} setUserCity={setCity} styles={{ flex: 1, minWidth: "250px" }} iso_3={countryIsoCode} />
                                        {
                                            hoverErrors.city
                                            &&
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    color: "red",
                                                    padding: ".75rem",
                                                    background: "rgba(255,255,255,0.2)",
                                                    backdropFilter: "blur(10px)",
                                                    borderRadius: "10px",
                                                    border: "1px solid red"
                                                }}
                                            >
                                                {t("Select Country First")}
                                            </div>
                                        }
                                    </FormGroup>
                                    <FormGroup
                                        style={{
                                            flex: 1,
                                            margin: 0,
                                            position: "relative"
                                        }}
                                        onMouseEnter={() => country ? console.log("") : setHoverErrors(prev => ({
                                            ...prev, postal_code: true
                                        }))}
                                        onMouseLeave={() => country ? console.log("") : setHoverErrors(prev => ({
                                            ...prev, postal_code: false
                                        }))}
                                    >
                                        <Label className="col-form-label" htmlFor="postal_code">{t("Postal Code")}</Label>
                                        <Input disabled={!country} readOnly={!country} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="postal_code" id="postal_code" type="text" placeholder={t('Postal Code')} value={formData.postal_code} onChange={e => {
                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                            inputChangeHandler({ target: { name: e.target.name, value } })
                                        }} />
                                        {
                                            hoverErrors.postal_code
                                            &&
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    color: "red",
                                                    padding: ".75rem",
                                                    background: "rgba(255,255,255,0.2)",
                                                    backdropFilter: "blur(10px)",
                                                    borderRadius: "10px",
                                                    border: "1px solid red"
                                                }}
                                            >
                                                {t("Select country first")}
                                            </div>
                                        }
                                    </FormGroup>
                                </div>
                            </FormGroup>
                            <FormGroup
                                style={{
                                    flex: 1,
                                    margin: 0,
                                    position: "relative",
                                    zIndex: 100
                                }}
                                onMouseEnter={() => country ? console.log("") : setHoverErrors(prev => ({
                                    ...prev, address: true
                                }))}
                                onMouseLeave={() => country ? console.log("") : setHoverErrors(prev => ({
                                    ...prev, address: false
                                }))}
                            >
                                <Label className="col-form-label" htmlFor="address">{t("Address Line")} {isAddressRequired && <span className="req_star">*</span>}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="address" id="address" type="textarea" placeholder={t('Address Line')} disabled={!country} readOnly={!country} value={formData.address} onChange={inputChangeHandler} onFocus={() => setAddressInFocus(true)} onBlur={() => {
                                    setTimeout(() => {
                                        setAddressInFocus(false)
                                    }, 100)
                                }} />
                                {
                                    hoverErrors.address
                                    &&
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            width: "100%",
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            color: "red",
                                            padding: "1.3rem",
                                            background: "rgba(255,255,255,0.2)",
                                            backdropFilter: "blur(10px)",
                                            borderRadius: "10px",
                                            border: "1px solid red"
                                        }}
                                    >
                                        {t("Select country first")}
                                    </div>
                                }
                                {
                                    addressInFocus && addresses.length > 0
                                        ?
                                        <div style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            background: "white",
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: ".5rem",
                                            maxHeight: "40vh",
                                            overflowY: "auto",
                                            border: "1px solid #eee",
                                            width: "100%"
                                        }}>
                                            {
                                                addresses.map(item => (
                                                    <div
                                                        key={item}
                                                        onClick={() => {
                                                            inputChangeHandler({ target: { name: "address", value: item } })
                                                            setTimeout(() => {
                                                                setAddressInFocus(false)
                                                            }, 100)
                                                        }}
                                                        style={{
                                                            padding: "1rem",
                                                            cursor: "pointer",
                                                            fontSize: ".8rem",
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        :
                                        ""
                                }
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="email">{t("Email Address")}</Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="email" name="email" type="email" placeholder={t('Email Address')} title="abc@xyz.com" value={formData.email} onChange={inputChangeHandler} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0, transform: "translateY(-4px)" }}>
                                        <Label className="col-form-label" htmlFor="mobile_number">{t("Mobile Number")} <span className="req_star">*</span></Label>
                                        <PhoneInput
                                            customStyles={{
                                                boxShadow: "none",
                                                border: "1px solid #e9e9e9"
                                            }}
                                            country={countryIsoCode}
                                            setPhone={e => setMobileNumber(e)}
                                            disabled={!country}
                                            setCountry={() => { }}
                                            phone={mobileNumber}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <label className="col-form-label" htmlFor="relation">{t("Relationship With Beneficiary")} <span className="req_star">*</span></label>
                                        <NestedDropdown
                                            child={friendsAndFamily}
                                            parent={BeneficiaryRelation}
                                            value={formData.relation}
                                            setter={(val) => {
                                                inputChangeHandler({ target: { name: "relation", value: val } })
                                            }}
                                            subKey="Friends & Family"
                                        />
                                    </FormGroup>
                                </div>
                            </FormGroup>
                            <div onClick={() => setShowAdditional(!showAdditional)} style={{ color: "red", fontSize: ".8rem", fontWeight: "500", margin: ".75rem 0 1.5rem", cursor: "pointer" }}>{showAdditional ? "-" : "+"} {t("Additional Information")}</div>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "1rem",
                                opacity: showAdditional ? 1 : 0,
                                position: showAdditional ? "static" : "absolute",
                                pointerEvents: showAdditional ? "all" : "none"
                            }}>
                                {
                                    Object.keys(additionFields).map(item => (
                                        item === "gender"
                                            ?
                                            <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                <Input type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
                                                    <option value="">--{t("Select Gender")}--</option>
                                                    {
                                                        Object.keys(gendersData).map(item => (
                                                            <option value={item}>{t(item)}</option>
                                                        ))
                                                    }
                                                </Input>
                                            </FormGroup>
                                            :
                                            item === "date_of_birth"
                                                ?
                                                <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                    <Input type="date" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange} />
                                                    {/* <MobileDatePicker
                                                            minDate={minDate}
                                                            style={{ flex: 1, minWidth: "250px" }}
                                                            id="datepicker"
                                                            name={item}
                                                            value={additionFields[item]}
                                                            onChange={(e) => handleAddtionalFieldChange({ target: { name: item, value: e } })}
                                                        /> */}
                                                </FormGroup>
                                                :
                                                item === "nationality"
                                                    ?
                                                    <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                        <CountryDropDown onSelect={(selectedCountry) => {
                                                            if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
                                                                selectedCountry.name = "Bolivia, Plurinational State of bolivia"
                                                            }
                                                            handleAddtionalFieldChange({ target: { name: item, value: selectedCountry?.alpha3 } })
                                                        }} country={additionFields[item]} filteringList={filteringCountries} />
                                                    </FormGroup>
                                                    :
                                                    <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
                                                            <option value="">--{t("Select Occupation")}--</option>
                                                            {
                                                                Object.keys(occupations).map(item => (
                                                                    <option value={item}>{t(item)}</option>
                                                                ))
                                                            }
                                                        </Input>
                                                    </FormGroup>
                                    ))
                                }
                                {
                                    !fieldInfoValidate("required_receiving_entity_fields", "id_type") && !fieldInfoValidate("required_receiving_entity_fields", "id_number")
                                        ?
                                        <>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="id_type">{t("ID Type")}</Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_type" id="id_type" type="select" placeholder='ID Type' value={basicExtras.id_type} onChange={handleBasicExtraChange}>
                                                    <option value="">{t("Select Document")}</option>
                                                    {
                                                        Object.keys(idTypeData).map(item => (
                                                            <option key={item} value={item}>{t(idTypeData?.[item])}</option>
                                                        ))
                                                    }
                                                </Input>
                                            </FormGroup>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="id_number">{t("ID Number")}</Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_number" id="id_number" type="text" placeholder={t('ID Number')} value={basicExtras.id_number} onChange={handleBasicExtraChange} />
                                            </FormGroup>
                                        </>
                                        : ""
                                }
                            </div>
                            <FormGroup className="mb-3">
                                <h5>{t("Select Beneficiary Payment Channels")}: </h5>
                                <div style={{
                                    display: "flex",
                                    marginBottom: ".75rem",
                                    gap: "1rem",
                                    overflowX: "auto",
                                    paddingBottom: ".5rem",
                                    width: "100%"
                                }}>
                                    {
                                        (
                                            services?.some(item => item?.name?.toLowerCase()?.includes("bank"))
                                            &&
                                            userDetails?.level?.international_transfer?.bank
                                            &&
                                            selectedCountryDetails?.individual_receiving_channels?.bank_account
                                        )
                                        &&
                                        <button style={{
                                            border: "none",
                                            outline: "none",
                                            padding: "1rem",
                                            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                            flex: 1,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            type: "button",
                                            borderRadius: "10px",
                                            background: active === 1 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                            color: active === 1 ? "white" : "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "center"
                                        }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActive(1)
                                            }}>
                                            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Bank Account")}</p>
                                            {
                                                !mobileView
                                                &&
                                                <>
                                                    {!completedBank ? <Circle /> : <CheckCircle />}
                                                </>
                                            }
                                        </button>
                                    }
                                    {
                                        (
                                            services?.some(item => item?.name?.toLowerCase()?.includes("mobile"))
                                            &&
                                            userDetails?.level?.international_transfer?.mobile_money
                                            &&
                                            selectedCountryDetails?.individual_receiving_channels?.mobile_money
                                        )
                                        &&
                                        <button style={{
                                            border: "none",
                                            outline: "none",
                                            padding: "1rem",
                                            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                            flex: 1,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            type: "button",
                                            borderRadius: "10px",
                                            background: active === 2 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                            color: active === 2 ? "white" : "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "center"
                                        }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActive(2)
                                            }}>
                                            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Mobile Money/Mobile Wallet")}</p>
                                            {
                                                !mobileView
                                                &&
                                                <>
                                                    {!completedWallet ? <Circle /> : <CheckCircle />}
                                                </>
                                            }
                                        </button>
                                    }
                                    {
                                        (
                                            services?.some(item => item?.name?.toLowerCase()?.includes("card"))
                                            &&
                                            userDetails?.level?.international_transfer?.card_payment
                                            &&
                                            selectedCountryDetails?.individual_receiving_channels?.card_payment
                                        )
                                        &&
                                        <button style={{
                                            border: "none",
                                            outline: "none",
                                            padding: "1rem",
                                            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                            flex: 1,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            type: "button",
                                            borderRadius: "10px",
                                            background: active === 3 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                            color: active === 3 ? "white" : "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "center"
                                        }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActive(3)
                                            }}>
                                            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Payment Card")}</p>
                                            {
                                                !mobileView
                                                &&
                                                <>
                                                    {!completedCard ? <Circle /> : <CheckCircle />}
                                                </>
                                            }
                                        </button>
                                    }
                                    <button style={{
                                        all: "unset",
                                        padding: mobileView ? ".25rem" : "1rem",
                                        boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                        flex: 1,
                                        textAlign: "center",
                                        cursor: "pointer",
                                        type: "button",
                                        borderRadius: "10px",
                                        background: active === 4 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                        color: active === 4 ? "white" : "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        justifyContent: "center",
                                        padding: "1rem"
                                    }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setActive(4)
                                        }}>
                                        <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Crypto Wallet")}</p>
                                        {
                                            !mobileView
                                            &&
                                            <>
                                                {!completedCrypto ? <Circle /> : <CheckCircle />}
                                            </>
                                        }
                                    </button>
                                    {
                                        userDetails?.level?.wallet_to_wallet?.send
                                        &&
                                        <button style={{
                                            all: "unset",
                                            padding: mobileView ? ".25rem" : "1rem",
                                            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                            flex: 1,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            type: "button",
                                            borderRadius: "10px",
                                            background: active === 5 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                            color: active === 5 ? "white" : "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "center",
                                            padding: "1rem"
                                        }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActive(5)
                                            }}>
                                            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("InstaPay Account")}</p>
                                            {
                                                !mobileView
                                                &&
                                                <>
                                                    {!instapayWallets.every(item => item.length === 8) || walletError ? <Circle /> : <CheckCircle />}
                                                </>
                                            }
                                        </button>
                                    }
                                    {
                                        (
                                            services?.some(item => item?.name?.toLowerCase()?.includes("cash"))
                                            &&
                                            userDetails?.level?.international_transfer?.cash_pickup
                                            &&
                                            selectedCountryDetails?.individual_receiving_channels?.cash_pickup
                                        )
                                        &&
                                        <button style={{
                                            border: "none",
                                            outline: "none",
                                            padding: "1rem",
                                            boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                            flex: 1,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            type: "button",
                                            borderRadius: "10px",
                                            background: active === 6 ? "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" : "transparent",
                                            color: active === 6 ? "white" : "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "center"
                                        }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setActive(6)
                                            }}>
                                            <p style={{ padding: 0, margin: 0, whiteSpace: "nowrap" }}>{t("Cash Pickup")}</p>
                                            {
                                                !mobileView
                                                &&
                                                <>
                                                    {!cashPickupCompleted ? <Circle /> : <CheckCircle />}
                                                </>
                                            }
                                        </button>
                                    }
                                </div>
                                {
                                    active === 1
                                    &&
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "1rem"
                                    }}>
                                        <FormGroup style={{ flex: 1, margin: 0, maxWidth: "180px" }}>
                                            <Label className="col-form-label" htmlFor="bank_account_number">{t("IBAN / SWIFT Code")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ minWidth: "150px" }} type="select" value={accNumType} onChange={e => {
                                                setAccNumType(e.target.value)
                                                getBankDetails({ target: { value: "" } })
                                            }}>
                                                <option value="IBAN">IBAN</option>
                                                <option value="Swift">Swift/BIC Code</option>
                                            </Input>
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                            <Label className="col-form-label" htmlFor="bank_account_number">{accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, width: "100%", minWidth: "250px" }} placeholder={accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")} required name="bank_account_number" id="bank_account_number" value={ibanSwift} onChange={getBankDetails} maxLength={34} min={8} />
                                            {
                                                bankDetailsError && <span style={{ color: "red", position: "absolute", bottom: "-25px", left: "10px" }} > {bankDetailsError}</span>
                                            }
                                        </FormGroup>
                                        {/* {
                                            country?.toLowerCase() === "united states"
                                            &&
                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label" >{t("Routing/ABA Number")}<span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required/>
                                            </FormGroup>
                                        } */}
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Account Number")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required /*readOnly={accNumType === "IBAN"}*/ value={formData.bank_account_number} name="bank_account_number" onChange={e => {
                                                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                                inputChangeHandler({ target: { name: e.target.name, value } })
                                            }} disabled={!isValidIban} />
                                        </FormGroup>
                                        {
                                            accNumType === "IBAN"
                                            &&
                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label" >{t("Account Holder Name")}<span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="account_holder_name" type="text" value={formData.account_holder_name} onChange={inputChangeHandler} required disabled={!isValidIban} />
                                            </FormGroup>
                                        }
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Bank Name")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="bank_name" type="text" required disabled={!isValidIban} value={formData.bank_name} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Branch Name")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="branch_name" type="text" required disabled={!isValidIban} value={formData.branch_name} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Branch Street")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_branch_street" required disabled={!isValidIban} value={formData.bank_branch_street} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("City")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_city" required disabled={!isValidIban} value={formData.bank_city} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Province")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required disabled={!isValidIban} name="bank_province" value={formData.bank_province} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                            <Label className="col-form-label" >{t("Postal Code")}<span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required disabled={!isValidIban} value={formData.bank_postal_code} name="bank_postal_code" onChange={e => {
                                                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                                inputChangeHandler({ target: { name: e.target.name, value } })
                                            }} />
                                        </FormGroup>
                                        {
                                            Object.keys(bankExtras).map(item => {
                                                return (
                                                    serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("bank")), "credit_party_identifiers_accepted", item)
                                                    &&
                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))}<span className="req_star">*</span></Label>
                                                        {
                                                            item?.toString()?.toLowerCase() == "account_type"
                                                                ?
                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} disabled={!isValidIban} type="select" value={bankExtras[item]} name={item} onChange={handleBankExtraChange}>
                                                                    <option value="">Select Account Type</option>
                                                                    {
                                                                        Object.keys(AccountTypeData).map(item => (
                                                                            <option value={item}>{AccountTypeData?.[item]}</option>
                                                                        ))
                                                                    }
                                                                </Input>
                                                                :
                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} disabled={!isValidIban} type="text" value={bankExtras[item]} name={item} onChange={handleBankExtraChange} />
                                                        }
                                                    </FormGroup>
                                                )
                                            })
                                        }
                                    </div>
                                }
                                {
                                    active === 2
                                    &&
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "1rem"
                                    }}>
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label">{t("Mobile Money Provider")}<span className="req_star">*</span></Label>
                                            <Input type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={formData.mobile_wallet_provider} onChange={inputChangeHandler} name="mobile_wallet_provider">
                                                <option value="">{t("Select Provider")}</option>
                                                {
                                                    mobileProviders.map(item => (
                                                        <option value={item?.id}>{item?.name}</option>
                                                    ))
                                                }
                                            </Input>
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" >{t("Wallet Name")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder='Wallet Name' required id="account_holder_name" name="mobile_wallet_name" value={formData.mobile_wallet_name} onChange={inputChangeHandler} />
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" htmlFor="mobile_wallet_account_number">{t("Wallet Number")} <span className="req_star">*</span></Label>
                                            {/* <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder='Account Number' required onKeyPress={handleChangeNumber} name="mobile_wallet_account_number" value={formData.mobile_wallet_account_number} onChange={inputChangeHandler} /> */}
                                            <PhoneInput
                                                customStyles={{
                                                    boxShadow: "none",
                                                    border: "1px solid #e9e9e9"
                                                }}
                                                country={countryIsoCode}
                                                setPhone={e => inputChangeHandler({ target: { value: e, name: "mobile_wallet_account_number" } })}
                                                disabled={!country}
                                                disabledDropdown={true}
                                                setCountry={() => { }}
                                                phone={formData.mobile_wallet_account_number}
                                            />
                                        </FormGroup>

                                        {/* {
                                            Object.keys(mobileExtras).map(item => (
                                                serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("mobile")), "credit_party_identifiers_accepted", item)
                                                &&
                                                <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={mobileExtras[item]} name={item} onChange={handleMobileExtraChange} />
                                                </FormGroup>
                                            ))
                                        } */}
                                    </div>
                                }
                                {
                                    active === 3
                                    &&
                                    <>
                                        <div style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "1rem"
                                        }}>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="card-holder-name">{t("Card Holder Name")} <span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder="Card holder name" name="card_holder_one" value={formData.card_holder_one} onChange={inputChangeHandler} />
                                            </FormGroup>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="card-number">{t("Card Number")} <span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_one" value={formData.card_number_one} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                            </FormGroup>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="card-expiry">
                                                    {t("Expiry Date")} <span className="req_star">*</span>
                                                </Label>
                                                <div className="d-flex">
                                                    <Input
                                                        className="form-control"
                                                        style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                                                        onKeyPress={handleMonthKeyPress}
                                                        type="text"
                                                        placeholder="MM"
                                                        required
                                                    />
                                                    <Input
                                                        className="form-control"
                                                        style={{ flex: 1, minWidth: "125px" }}
                                                        onKeyPress={handleYearKeyPress}
                                                        type="text"
                                                        placeholder="YYYY"
                                                        required
                                                    />
                                                </div>
                                            </FormGroup>
                                            {
                                                Object.keys(cardExtras).map(item => (
                                                    serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("card")), "credit_party_identifiers_accepted", item)
                                                    &&
                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={cardExtras[item]} name={item} onChange={handleCardExtraChange} />
                                                    </FormGroup>
                                                ))
                                            }
                                        </div>

                                        {
                                            totalCards > 1
                                            &&
                                            <div style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "1rem"
                                            }}>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-holder-name">{t("Card Holder Name")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder="Card holder name" name="card_holder_two" value={formData.card_holder_two} onChange={inputChangeHandler} />
                                                </FormGroup>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-number">{t("Card Number")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_two" value={formData.card_number_two} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                                </FormGroup>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-expiry">
                                                        {t("Expiry Date")} <span className="req_star">*</span>
                                                    </Label>
                                                    <div className="d-flex">
                                                        <Input
                                                            className="form-control"
                                                            style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                                                            onKeyPress={handleMonthKeyPress}
                                                            type="text"
                                                            placeholder="MM"
                                                            required
                                                        />
                                                        <Input
                                                            className="form-control"
                                                            style={{ flex: 1, minWidth: "125px" }}
                                                            onKeyPress={handleYearKeyPress}
                                                            type="text"
                                                            placeholder="YYYY"
                                                            required
                                                        />
                                                    </div>
                                                </FormGroup>
                                            </div>
                                        }
                                        {
                                            totalCards > 2
                                            &&
                                            <div style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "1rem"
                                            }}>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-holder-name">{t("Card Holder Name")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder="Card holder name" name="card_holder_three" value={formData.card_holder_three} onChange={inputChangeHandler} />
                                                </FormGroup>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-number">{t("Card Number")} <span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="card_number_three" value={formData.card_number_three} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                                </FormGroup>
                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                    <Label className="col-form-label" htmlFor="card-expiry">
                                                        {t("Expiry Date")} <span className="req_star">*</span>
                                                    </Label>
                                                    <div className="d-flex">
                                                        <Input
                                                            className="form-control"
                                                            style={{ flex: 1, minWidth: "125px", marginRight: "10px" }}
                                                            onKeyPress={handleMonthKeyPress}
                                                            type="text"
                                                            placeholder="MM"
                                                            required
                                                        />
                                                        <Input
                                                            className="form-control"
                                                            style={{ flex: 1, minWidth: "125px" }}
                                                            onKeyPress={handleYearKeyPress}
                                                            type="text"
                                                            placeholder="YYYY"
                                                            required
                                                        />
                                                    </div>
                                                </FormGroup>
                                            </div>
                                        }

                                        {
                                            totalCards < 3
                                            &&
                                            <div style={{ display: "flex", cursor: "pointer", alignItems: "center", gap: ".25rem", color: "var(--theme-default)" }}
                                                onClick={_ => setTotalCards(prev => prev + 1)}
                                            >
                                                <Plus size={20} />
                                                <p style={{ marginBottom: 0 }}>{t("Add another card")}</p>
                                            </div>
                                        }
                                    </>
                                }
                                {
                                    active === 4
                                    &&
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "1rem"
                                    }}>
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" htmlFor="card-holder-name">{t("Crypto Currency")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" value={formData.crypto_currency} onChange={inputChangeHandler} name="crypto_currency">
                                                <option value="Bitcoin">{t("Bitcoin")}</option>
                                                <option value="Ethereum">{t("Ethereum")}</option>
                                                <option value="Other">{t("Other")}</option>
                                            </Input>
                                        </FormGroup>
                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                            <Label className="col-form-label" htmlFor="card-number">{t("Wallet Address")} <span className="req_star">*</span></Label>
                                            <Input className="form-control" value={formData.crypto_wallet_address} onChange={inputChangeHandler} name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" />
                                        </FormGroup>
                                    </div>
                                }
                                {
                                    active === 5
                                    &&
                                    <>
                                        {
                                            instapayWallets.map((value, index) => {
                                                return (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" htmlFor="card-holder-name">{t("Wallet ID")} <span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} value={value} onChange={(e) => handleInputChange(index, e.target.value)} maxLength={8} />
                                                        </FormGroup>
                                                        <WalletDetails wallet={value} authHeader={authHeader} setWalletError={setWalletError} setWalletIds={setWalletIds} walletIds={walletIds} setDuplicateWallet={setDuplicateWallet} />
                                                    </div>
                                                )
                                            })
                                        }
                                        {
                                            walletError
                                            &&
                                            <span style={{ color: "red" }}>{walletError}</span>
                                        }
                                        {
                                            duplicateWallet
                                            &&
                                            <span style={{ color: "red" }}>Wallet ID is already added.</span>
                                        }
                                        <div style={{
                                            display: "flex",
                                            cursor: instapayWallets.every(item => item.length === 8) && !walletError ? "pointer" : "not-allowed",
                                            alignItems: "center",
                                            gap: ".25rem",
                                            color: instapayWallets.every(item => item.length === 8) && !walletError ? "var(--theme-default)" : "grey",
                                            marginTop: "1rem"
                                        }}
                                            onClick={_ => instapayWallets.every(item => item.length === 8) && !walletError ? setInstapayWallets(prev => [...prev, ""]) : setInstapayWallets(instapayWallets)}
                                        >
                                            <Plus size={20} />
                                            <p style={{ marginBottom: 0 }}>{t("Add another wallet")}</p>
                                        </div>
                                    </>
                                }
                                {
                                    active === 6
                                    &&
                                    <>
                                        <div style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "1rem"
                                        }}>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="card-holder-name">{t("Select Document Type")} <span className="req_star">*</span></Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" value={cashPickupType} onChange={e => setCashPickupType(e.target.value)} name="crypto_currency" disabled={!mobileNumber || mobileNumber.length < 9} readOnly={!mobileNumber || mobileNumber.length < 9}>
                                                    <option value="PASSPORT">Passport</option>
                                                    <option value="NATIONAL_ID">National Identity Card</option>
                                                    <option value="DRIVING_LICENSE">Driving License</option>
                                                    <option value="SOCIAL_SECURITY">Social Security Card/Number</option>
                                                    <option value="SENIOR_CITIZEN_ID">Senior Citizen Identification Card</option>
                                                    <option value="RESIDENT_CARD">Permanent Residency Identification Card</option>
                                                    <option value="PAN_CARD">PAN Card</option>
                                                    <option value="HEALTH_CARD">Health Insurance Card/Number</option>
                                                    <option value="EMPLOYER_ID">Employer Identification Card</option>
                                                </Input>
                                            </FormGroup>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="card-number">{t("Enter Document Number")} <span className="req_star">*</span></Label>
                                                <Input className="form-control" value={cashPickupNumber} onChange={e => setCashPickupNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" disabled={!mobileNumber || mobileNumber.length < 9} readOnly={!mobileNumber || mobileNumber.length < 9} />
                                            </FormGroup>
                                            {
                                                Object.keys(cashExtras)?.map(item => (
                                                    serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item)
                                                    &&
                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" value={cashExtras?.[item]} name={item} onChange={handleCashxtraChange} />
                                                    </FormGroup>
                                                ))
                                            }
                                        </div>
                                        {
                                            !mobileNumber || mobileNumber.length < 9
                                            &&
                                            <span>Must add phone number to enable these fields.</span>
                                        }
                                    </>
                                }
                            </FormGroup>
                        </CardBody >
                        <CardFooter style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "40px",
                                display: "flex",
                                alignItems: "center",
                                padding: ".6rem 2rem"
                            }}
                                className="i_t_button"
                                disabled={
                                    duplicateWallet || walletError || !firstName || !lastName || !country || !city || mobileNumber.length < 9 || (!completedBank && !completedCard && !completedCrypto && !completedWallet && !cashPickupCompleted && instapayWallets.some(item => item.length < 8 || item.length > 8)) || !formData.relation || (isAddressRequired ? !formData.address : false)
                                }
                                onClick={addBeneficiaryHandler}
                            >
                                {t("Add Beneficiary")}
                            </Button>
                            <ConfirmationModal isOpen={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} onConfirm={changeUserDetailsAsPerBankDetails} onCancel={onCancelHandler} />
                        </CardFooter>
                    </>
            }
        </>
    )
}

export default IndividualAccount;