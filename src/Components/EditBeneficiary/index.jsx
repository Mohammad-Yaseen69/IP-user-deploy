import { Circle, CheckCircle, Plus } from "react-feather";
import { CardBody, CardHeader, Form, FormGroup, Input, Label } from "reactstrap";
import { countries } from "country-list-json";
// import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import WalletDetails from "../AddBeneficiary/WalletDetails";
import { useLocation, useNavigate } from "react-router";
import CountryDropDown from "../AddBeneficiary/CountryDropDown";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import CitiesDropDown from "../CitiesDropDown";
import ConfirmationModal from "../AddBeneficiary/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { AccountTypeData, BeneficiaryRelation, friendsAndFamily, gendersData, idTypeData, iso2Toiso3Convert, occupations } from "../AddBeneficiary/IndividualAccount";
import NestedDropdown from "../NestedDropdown";
import InstaPayLoader from "../Loader";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import PhoneInput from "../PhoneInput";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { minDate } from "../Settings/Basic";
import { requiredFields } from "../AddBeneficiary/requiredFields";
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

let debounceTimer;

const EditBeneficiary = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const user_id = queryParams.get("user_id")
    const edit = queryParams.get("edit")
    const view = queryParams.get("view")
    const [user, setUser] = useState(null)
    const [isValidIban, setIsValidIban] = useState(false)
    const [fieldsInfo, setFieldsInfo] = useState(null)

    const navigate = useNavigate()
    const [mobileView, setMobileView] = useState(window?.innerWidth < 600)
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
    const [isEditMode, setIsEditMode] = useState(false)

    // instapay wallet
    const [instapayWallets, setInstapayWallets] = useState([])
    const [apiWallets, setApiWallets] = useState([])
    const [walletIds, setWalletIds] = useState([])
    const [cashPickupType, setCashPickupType] = useState("")
    const [cashPickupNumber, setCashPickupNumber] = useState("")
    const [cashPickupCompleted, setCashPickupCompleted] = useState("")

    const [walletError, setWalletError] = useState("")

    const [duplicateWallet, setDuplicateWallet] = useState(false)
    const [bankDetailsError, setBankDetailsError] = useState("")
    const [firstTime, setFirstTime] = useState(true)

    // api bank details
    const [bankCountry, setBankCountry] = useState("")
    const [bankCity, setBankCity] = useState("")
    const [bankCountryCode, setBankCountryCode] = useState("")

    // const show confirmation
    const [showConfirmation, setShowConfirmation] = useState(false)


    const [services, setServices] = useState([])
    const [mobileProviders, setMobileProviders] = useState([])
    const [loading, setLoading] = useState(false)
    const [isAddressRequired,] = useState(true)
    const [clicked, setClicked] = useState(false)

    const fieldInfoValidate = (field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;
        for (const service in fieldsInfo) {
            if (fieldsInfo[service]?.[field_name]?.some(item => item === sub_field_name)) {
                isInThere = true
                break
            }
        }

        return isInThere;
    }

    const serviceFieldInfoValidate = (service, field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;

        if (fieldsInfo?.[service?.name]?.[field_name]?.some(item => item === sub_field_name)) {
            isInThere = true
        }

        return isInThere;
    }

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

    const handleAddtionalFieldChange = (e) => {
        const { value, name } = e.target;
        setAdditionalFields(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const handleBasicExtraChange = (e) => {
        const { value, name } = e.target;
        setBasicExtras(prev => {
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
        bank_account_number: "",
        bsb_number: "",
        branch_number: "",
        routing_code: "",
        entity_tt_id: "",
        ifs_code: "",
        clabe: "",
        msisdn: "",
        sort_code: "",
        iban: "",
        swift_bic_code: ""
    })

    const handleBankExtraChange = (e) => {
        const { value, name } = e.target;
        setBankExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
        if (value.length >= 3) {
            setMissingFields(prev => prev.filter(field => field !== name))
        }
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
        if (value.length >= 3) {
            setMissingFields(prev => prev.filter(field => field !== name))
        }
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
        if (value.length >= 3) {
            setMissingFields(prev => prev.filter(field => field !== name))
        }
    }
    // cash extra fields

    const setWidth = () => {
        setMobileView(window.innerWidth < 600)
    }

    useEffect(() => {
        window.addEventListener("resize", setWidth)

        return () => window.removeEventListener("resize", setWidth)
    }, [])


    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }

    const handleInputChange = (index, value) => {
        const newOTPValues = [...instapayWallets];
        newOTPValues[index] = value;
        setInstapayWallets(newOTPValues);
    };


    const { authHeader, beneficiaries, userDetails, allowedCountries, getUserBeneficiaries } = useContext(UserContext)

    useEffect(() => {
        if (userDetails) {
            getUserBeneficiaries()
        }
    }, [userDetails])

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
        mobile_wallet_provider: "orange",
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

    const inputChangeHandler = (e) => {
        setClicked(false)
        const { name, value } = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })

        // Remove border if field has at least 3 characters
        if (value.length >= 3) {
            setMissingFields(prev => prev.filter(field => field !== name))
        }
    }

    const changeUserDetailsAsPerBankDetails = () => {
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
        for (const key in bankExtras) {
            handleBankExtraChange({ target: { name: key, value: "" } })
        }
        setBankCountry("")
        setBankCountryCode("")
        setBankCity("")
        setShowConfirmation(false)
    }

    useEffect(() => {
        if (bankCountry && country && bankCountryCode && countryIsoCode && bankCountry.toLowerCase() !== country.toLowerCase() && bankCountryCode !== countryIsoCode) {
            setShowConfirmation(true)
        }
    }, [bankCountry, country, bankCountryCode, countryIsoCode])

    useEffect(() => {
        if (bankCountryCode && countryCode && bankCountryCode !== countryCode) {
            setShowConfirmation(true)
        }
    }, [bankCountryCode, countryCode])



    const getBankDetails = (e) => {
        setIbanSwift(e.target.value?.split(" ")?.join(""))
        setIsValidIban(false)

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {

            if (accNumType === "IBAN") {
                if (e.target.value.length >= 14) {
                    axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-details-by-iban/${e.target.value}`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            setFormData(prev => {
                                return {
                                    ...prev,
                                    bank_name: decrypted?.bicDetails?.name ?? "",
                                    // branch_name: decrypted?.bicDetails?.structured_address?.country_subdivision_name ?? "",
                                    branch_name: `${decrypted?.ibanDetails?.branch_id ?? ""} ${decrypted?.bicDetails?.structured_address?.building_number ?? decrypted?.bicDetails?.structured_address?.building_name ?? ""}`,
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
                                    branch_name: decrypted?.structured_address?.country_subdivision_name ?? "",
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
        }, 2000);
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
        if (formData.mobile_wallet_name && formData.mobile_wallet_account_number && formData.mobile_wallet_provider) {
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
        if (formData?.crypto_currency && formData?.crypto_wallet_address) {
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

    useEffect(() => {
        const filtered = beneficiaries.filter(ben => ben._id === user_id)[0]
        // console.log(filtered)
        setUser(filtered)
    }, [beneficiaries])

    useEffect(() => {
        if (user) {
            setFirstName(user?.first_name)
            setLastName(user?.last_name)
            setFormData({
                postal_code: user?.zip_code ?? user?.postal_code,
                country: user?.country ?? "",
                city: user?.city ?? "",
                city: user?.postal_code ?? "",
                address: user?.address ?? "",
                email: user?.email ?? "",
                relation: user?.relation ?? "",
                account_type: user?.account_type ?? "",
                account_holder_name: user?.bank_details?.[0]?.account_holder_name ?? "",
                bank_name: user?.bank_details?.[0]?.name ?? "",
                branch_name: user?.bank_details?.[0]?.branch_name ?? "",
                bank_account_number: user?.bank_details?.[0]?.account_number ?? "",
                bank_branch_street: user?.bank_details?.[0]?.branch_street ?? "",
                bank_city: user?.bank_details?.[0]?.city ?? "",
                bank_province: user?.bank_details?.[0]?.province ?? "",
                bank_postal_code: user?.bank_details?.[0]?.postal_code ?? "",
                mobile_wallet_provider: user?.mobile_wallet?.[0]?.money_provider ?? "",
                mobile_wallet_number: user?.mobile_wallet?.[0]?.wallet_number ?? "",
                mobile_wallet_name: user?.mobile_wallet?.[0]?.wallet_name ?? "",
                mobile_wallet_account_number: user?.mobile_wallet?.[0]?.wallet_account_number ?? "",
                crypto_currency: user?.crypto?.[0]?.currency ?? "Bitcoin",
                crypto_wallet_address: user?.crypto?.[0]?.wallet_address ?? "",
                card_holder_one: user?.card[0]?.card_name ?? "",
                card_number_one: user?.card[0]?.card_number ?? "",
                card_expiry_one: user?.card[0]?.card_expiry ?? "",
                card_holder_two: user?.card[1]?.card_name ?? "",
                card_number_two: user?.card[1]?.card_number ?? "",
                card_expiry_two: user?.card[1]?.card_expiry ?? "",
                card_holder_three: user?.card[2]?.card_name ?? "",
                card_number_three: user?.card[2]?.card_number ?? "",
                card_expiry_three: user?.card[2]?.card_expiry ?? "",
            })
            // const wallet_ids = user.wallet.map(item => item._id)
            // setInstapayWallets(user?.wallet.length > 0 ? wallet_ids : [""])

            setInstapayWallets(user?.wallet?.length > 0 ? user?.wallet : [""])
            setApiWallets(user?.wallet?.length > 0 ? user?.wallet : [""])
            setIbanSwift((user?.bank_details?.[0]?.iban || user?.bank_details?.[0]?.swift_code) ?? "")
            setMobileNumber(user?.phone)
            setCountryId(user?.country?._id ?? "")

            setCountry(user?.country_name)
            setCountryIsoCode(user?.country_iso_code)
            setCountryId(user?.country)
            setCity(user?.city)
            setCashPickupType(user?.cash_pickup?.[0]?.document_type)
            setCashPickupNumber(user?.cash_pickup?.[0]?.document_number)

            setAccNumType(user?.bank_details?.[0]?.account_number?.length > 11 ? "IBAN" : "Swift")

            setBasicExtras(prev => user?.extras ?? prev)
            setAdditionalFields({
                gender: user?.extras?.gender,
                date_of_birth: user?.extras?.date_of_birth,
                nationality: user?.extras?.nationality,
                occupation: user?.extras?.occupation,
            })
            setBankExtras(prev => user?.bank_details?.[0]?.extras ?? prev)
            setMobileExtras(prev => user?.mobile_wallet?.[0]?.extras ?? prev)
            setCashxtras(prev => user?.cash_pickup?.[0]?.extras ?? prev)
            setCardExtras(prev => user?.card?.[0]?.extras ?? prev)
            setAccNumType(user?.bank_details?.[0]?.iban ? "IBAN" : "Swift")
        }
    }, [user, isEditMode])


    useEffect(() => {
        if (edit) {
            setIsEditMode(true)
        }
    }, [edit])

    const [showSuccess, setShowSuccess] = useState(false)

    const toggleSuccess = () => showSuccess ? navigate("/beneficiaries") : setShowSuccess(true)


    const [mobileNumberError, setMobileNumberError] = useState("")
    const [walletNumberError, setWalletNumberError] = useState("")

    const [missingFields, setMissingFields] = useState([])

    const editBenFun = () => {
        const account_types = [
            services.some(item => item?.name?.toLowerCase()?.includes("bank")) && completedBank ? "bank" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("card")) && completedCard ? "card" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("mobile")) && completedWallet ? "mobile" : null,
            completedCrypto ? "crypto" : null,
            services.some(item => item?.name?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? "cash" : null,
            instapayWallets.every(item => item.length !== 8) || walletError ? null : "wallet"
        ]
        const data = {
            first_name: firstName ?? "",
            last_name: lastName ?? "",
            company_name: "" ?? "",
            email: formData.email ?? "",
            postal_code: formData.postal_code ?? "",
            phone: mobileNumber ?? "",
            address: formData.address ?? "",
            city: city ?? "",
            country_name: country ?? "",
            country: countryId ?? "",
            country_iso_code: countryIsoCode,
            relation: formData.relation ?? "",
            account: userDetails._id ?? "",
            beneficiary_type: "individual" ?? "",
            account_type: account_types.filter(item => item !== null) ?? "",
            isUsaBank: false ?? "",
            wallet: walletIds ?? "",
            extras: { ...basicExtras, ...additionFields },
            bank_details: services.some(item => item?.name?.toLowerCase()?.includes("bank")) && completedBank ? [
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
            mobile_wallet: services.some(item => item?.name?.toLowerCase()?.includes("mobile")) && completedWallet ? [
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
            cash_pickup: services.some(item => item?.name?.toLowerCase()?.includes("cash")) && cashPickupCompleted ? [
                {
                    document_type: cashPickupType,
                    document_number: cashPickupNumber,
                    extras: cashExtras
                }
            ] : [],
            card: services.some(item => item?.name?.toLowerCase()?.includes("card")) && completedCard ? [
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
        const encrypted = encryptData(data)

        axios.put(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/update-beneficiary/${user._id}`, {
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



    const [saveloading, setsaveloading] = useState(false)
    const editBeneficiaryHandler = async () => {
        setMobileNumberError("")
        setWalletNumberError("")
        setClicked(true)


        let missing = []



        console.log(firstName, lastName, mobileNumber, city)
        requiredFields.basic.forEach(field => {
            if (!firstName?.trim() && field === "first_name") missing.push(field)
            if (!lastName?.trim() && field === "last_name") missing.push(field)
            if (!mobileNumber?.trim() && field === "phone") missing.push(field)
            if (!formData[field]?.trim() && !country?.trim() && field === "country") missing.push(field)
            if (!formData[field]?.trim() && !city?.trim() && field === "city") missing.push(field)
            if (!formData[field]?.trim() && field !== 'city' && field !== 'phone' && field !== 'country' && field !== 'first_name' && field !== 'last_name') missing.push(field)
        })

        switch (active) {
            case 1: // Bank
                requiredFields.bank.forEach(field => {
                    if (!formData[field]) missing.push(field)
                })
                break;
            case 2: // Mobile
                requiredFields.mobile.forEach(field => {
                    if (!formData[field]) missing.push(field)
                })
                break;
            case 3: // Card
                requiredFields.card.forEach(field => {
                    if (!formData[field]) missing.push(field)
                })
                break;
            case 4: // Crypto
                requiredFields.crypto.forEach(field => {
                    if (!formData[field]) missing.push(field)
                })
                break;
            case 6: // Cash
                if (!cashPickupType) missing.push("document_type")
                if (!cashPickupNumber) missing.push("document_number")
                break;
            default:
                break;
        }

        setMissingFields(missing)

        // Focus on first missing field
        if (missing.length > 0) {
            const firstField = document.querySelector(`[name="${missing[0]}"]`)
            if (firstField) {
                firstField.scrollIntoView({ behavior: 'smooth', block: 'center' })
                firstField.focus()
            }
            return
        }

        setsaveloading(true)
        try {
            if (formData.mobile_wallet_account_number) {
                await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
                    data: encryptData({ number: `+${formData.mobile_wallet_account_number}` })
                })
            }

            await editBenFun() // This will now be called if all validations pass
        } catch (error) {
            const decrypt = decryptData(error.response.data.data)

            if (decrypt.includes("`mobile_number`")) {
                setWalletNumberError("Incorrect phone number, please enter a valid number")
            }
            else if (decrypt.includes("mobile number")) {
                setMobileNumberError("Incorrect phone number, please enter a valid number")
            }
            console.log(decrypt)
        }
        setsaveloading(false)
    }


    const [selectedCountryDetails, setSelectedCountryDetails] = useState(null)

    useEffect(() => {
        if (countryId) {
            const getChannels = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/country/get-specific-country-details/${countryId}`, {
                        headers: authHeader
                    })
                    const decrypted = decryptData(res.data.data)
                    setSelectedCountryDetails(decrypted?.data)
                } catch (error) {
                    // console.log(decryptData(error.response.data.data))
                }
            }

            getChannels()
        }
    }, [countryId])

    const [filteringCountries, setFilteringCountries] = useState([])

    // useEffect(() => {
    //     const getReceivingCountries = async () => {
    //         try {
    //             const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/country/get-all-receiving-country`, {
    //                 headers: authHeader
    //             })

    //             const decrypted = decryptData(res.data.data)
    //             setFilteringCountries(decrypted?.Countries)
    //         } catch (error) {
    //             // console.log(decryptData(error.response.data.data))
    //         }
    //     }

    //     getReceivingCountries()
    // }, [])
    useEffect(() => {
        setFilteringCountries(allowedCountries)
    }, [allowedCountries])

    useEffect(() => {
        if (countryIsoCode) {
            setActive(5)
            // if (!countryChangedFromModal) {
            //     getBankDetails({ target: { value: "" } })
            //     setBankDetailsError("")
            // }
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
                    console.log(dec)
                }
            }

            const getChannels = async () => {
                setFieldsInfo(null)
                // setIsAddressRequired(false)
                axios.get(`${process.env.REACT_APP_THUNES_API}/services/${countryIsoCode}`, { headers: authHeader })
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
                            }, { headers: authHeader })
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
                    .finally(() => setLoading(false))
            }

            getChannels()
        }
    }, [countryIsoCode])
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ margin: "1rem 0 1rem 1rem" }}>
                <SuccessModal isOpen={showSuccess} toggle={toggleSuccess} message={"Beneficiary has been updated added."} subMessage={"Beneficiary Updated."} />
                {
                    user
                    &&
                    <>

                        <MuiPickersUtilsProvider utils={DateMomentUtils}>
                            <Form className="card" style={{
                                minHeight: `calc(${100}vh - ${2}rem)`,
                                marginBottom: "0"
                            }} onSubmit={e => e.preventDefault()}>
                                <div style={{}}>
                                    <button onClick={() => navigate(-1)} style={{
                                        all: "unset",
                                        color: "var(--theme-default)",
                                        fontSize: "1rem",
                                        marginTop: "1rem",
                                        marginLeft: "1rem",
                                        paddingLeft: ".5rem",
                                        cursor: "pointer"
                                    }}>&larr; &nbsp;</button>
                                    <CardHeader className="pb-0 pt-0" style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem"
                                    }}>
                                        <h4 className="card-title mb-0">{t("Details")}</h4>
                                        {!view &&
                                            <button type="button" onClick={() => {
                                                setIsEditMode(!isEditMode)
                                            }}
                                                style={{
                                                    all: "unset",
                                                    padding: "1rem",
                                                    boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    type: "button",
                                                    borderRadius: "10px",
                                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                    color: "white",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1rem",
                                                    justifyContent: "center",
                                                    transition: "250ms",
                                                    opacity: isEditMode ? 0 : 1,
                                                    pointerEvents: isEditMode ? "none" : "all",
                                                }}
                                            >Edit</button>
                                        }
                                    </CardHeader>
                                </div>
                                {
                                    loading
                                        ?
                                        <div style={{ height: "60vh", width: "100%", opacity: 1 }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <CardBody>
                                            <FormGroup className="mb-3">
                                                <div style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "1rem"
                                                }}>
                                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                                        <Label className="col-form-label" htmlFor="first-name">{t("First Name")} <span className="req_star">*</span></Label>
                                                        <Input name="first_name" readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("first_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} id="first-name" type="text" placeholder={t("First Name")} required pattern="[A-Za-z]+" title="(A to Z | a to z)" value={firstName}
                                                            onChange={e => {
                                                                setFirstName(e.target.value)
                                                                if (e.target.value.length >= 3) {
                                                                    setMissingFields(prev => prev.filter(field => field !== "first_name"))
                                                                }
                                                            }} />
                                                    </FormGroup>
                                                    {
                                                        fieldInfoValidate("required_receiving_entity_fields", "middlename")
                                                        &&
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" htmlFor="middlename">{t("Middle Name")} <span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="middlename" id="middlename" type="text" placeholder={t('Middle Name')} value={basicExtras.middlename} onChange={handleBasicExtraChange} readOnly={!isEditMode} disabled={!isEditMode} />
                                                        </FormGroup>
                                                    }
                                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                                        <Label className="col-form-label" htmlFor="last-name">{t("Last Name")} <span className="req_star">*</span></Label>
                                                        <Input name="last_name" readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("last_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} id="last-name" type="text" placeholder={t('Last Name')} required pattern="[A-Za-z]+" title="(A to Z | a to z)" value={lastName} onChange={e => {
                                                            setLastName(e.target.value)
                                                            if (e.target.value.length >= 3) {
                                                                setMissingFields(prev => prev.filter(field => field !== "last_name"))
                                                            }
                                                        }} />
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
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_type" id="id_type" type="select" placeholder='ID Type' value={basicExtras.id_type} onChange={handleBasicExtraChange}>
                                                                        <option value="">{t("Select Document")}</option>
                                                                        {
                                                                            Object.keys(idTypeData).map(item => (
                                                                                <option key={item} value={item}>{t(idTypeData?.[item])}</option>
                                                                            ))
                                                                        }
                                                                    </Input>
                                                                </FormGroup>
                                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                    <Label className="col-form-label" htmlFor="id_number">{t("ID Number")} <span className="req_star">*</span></Label>
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_number" id="id_number" type="text" placeholder='ID Number' value={basicExtras.id_number} onChange={handleBasicExtraChange} />
                                                                </FormGroup>
                                                            </>
                                                            : ""
                                                    }
                                                    {
                                                        fieldInfoValidate("required_receiving_entity_fields", "province_state")
                                                        &&
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" htmlFor="province_state">{t("Province/State")} <span className="req_star">*</span></Label>
                                                            <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="province_state" id="province_state" type="text" placeholder='Province/State' value={basicExtras.province_state} onChange={handleBasicExtraChange} />
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
                                                        <CountryDropDown onSelect={(selectedCountry) => {
                                                            if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
                                                                selectedCountry.name = "Bolivia, Plurinational State of bolivia"
                                                            }
                                                            const filtered = countries.filter(item => selectedCountry?.name?.toLowerCase()?.includes(item?.name?.toLowerCase()))?.[0]
                                                            setCountryCode(filtered?.code)
                                                            setCountry(selectedCountry?.name)
                                                            setCountryIsoCode(selectedCountry?.alpha3)
                                                            const country_id = filteringCountries.find(item => item?.country_iso_code === selectedCountry.alpha3)?._id
                                                            setCountryId(country_id)
                                                        }} country={countryIsoCode} disabled={!isEditMode} />
                                                    </FormGroup>
                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label" htmlFor="city">{t("City")} <span className="req_star">*</span></Label>
                                                        {/* <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} id="city" type="text" placeholder='City/Town' onKeyPress={handleChangeAlpha} required name="city" value={formData?.city} onChange={inputChangeHandler} /> */}
                                                        <CitiesDropDown country={country} userCity={city} setUserCity={(selectedCity) => {
                                                            setCity(selectedCity)
                                                            if (selectedCity) {
                                                                setMissingFields(prev => prev.filter(field => field !== "city"))
                                                            }
                                                        }} styles={{ flex: 1, minWidth: "250px", border: missingFields.includes("city") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} disabled={!isEditMode} iso_3={countryCode} />
                                                    </FormGroup>
                                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                                        <Label className="col-form-label" htmlFor="postal_code">{t("Postal Code")}</Label>
                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="postal_code" id="postal_code" type="text" placeholder={t('Postal Code')} value={formData.postal_code} onChange={inputChangeHandler} disabled={!isEditMode} />
                                                    </FormGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                <Label className="col-form-label" htmlFor="address">{t("Address Line")} {isAddressRequired && <span className="req_star">*</span>}</Label>
                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: !formData.address && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="address" id="address" type="textarea" placeholder={t('Address line')} value={formData.address} onChange={inputChangeHandler} disabled={!isEditMode} />
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <div style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "1rem"
                                                }}>
                                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                                        <Label className="col-form-label" htmlFor="email">{t("Email Address")}</Label>
                                                        <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} id="email" name="email" type="email" placeholder={t('Email Address')} title="abc@xyz.com" value={formData?.email} onChange={inputChangeHandler} />
                                                    </FormGroup>
                                                    <FormGroup style={{ flex: 1, margin: 0, transform: "translateY(-4px)" }}>
                                                        <Label className="col-form-label" htmlFor="mobile_number">{t("Mobile Number")} <span className="req_star">*</span></Label>
                                                        <PhoneInput
                                                            customStyles={{
                                                                boxShadow: "none",
                                                                border: "1px solid #e9e9e9",
                                                                padding: "12px",
                                                                borderRadius: "0.375rem",
                                                                border: missingFields.includes("phone") && clicked ? "1px solid red" : "1px solid #e9e9e9"
                                                            }}
                                                            phone={mobileNumber}
                                                            country={countryIsoCode}
                                                            setPhone={(e) => {
                                                                setMobileNumber(e)
                                                                if (e.length >= 3) {
                                                                    setMissingFields(prev => prev.filter(field => field !== "phone"))
                                                                }
                                                            }}
                                                            disabled={!isEditMode}
                                                            required
                                                            error={mobileNumberError}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                                        <label className="col-form-label" htmlFor="relation">{t("Relationship With Beneficiary")}<span className="req_star">*</span></label>
                                                        <NestedDropdown
                                                            child={friendsAndFamily}
                                                            parent={BeneficiaryRelation}
                                                            value={formData.relation}
                                                            setter={(val) => {
                                                                inputChangeHandler({ target: { name: "relation", value: val } })
                                                            }}
                                                            subKey="Friends & Family"
                                                            disabled={!isEditMode}
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
                                                    Object.keys(additionFields).map(item => {
                                                        return (
                                                            item === "gender"
                                                                ?
                                                                <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                                    <Input disabled={!isEditMode} type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
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
                                                                    <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px", display: "flex", flexDirection: "column" }}>
                                                                        <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                                        <DatePicker
                                                                            format="DD/MM/YYYY"
                                                                            className="form-control custom-datepicker"
                                                                            style={{ flex: 1, minWidth: "250px", background: "#fff", border: "1px solid #e9e9e9", borderRadius: "6px", boxShadow: "none", padding: "0px", display: 'flex', justifyContent: "center", position: 'static' }}
                                                                            value={additionFields[item] || null}
                                                                            onChange={e => handleAddtionalFieldChange({ target: { name: item, value: e ? e.format("YYYY-MM-DD") : "" } })}
                                                                            placeholder="DD/MM/YYYY"
                                                                            disabled={!isEditMode}
                                                                            InputProps={{
                                                                                disableUnderline: true,
                                                                                style: {
                                                                                    background: '#fff',
                                                                                    border: 'none',
                                                                                    boxShadow: 'none',
                                                                                    padding: '0 12px',
                                                                                    minHeight: '40px',
                                                                                    fontWeight: 500
                                                                                }
                                                                            }}
                                                                            inputProps={{
                                                                                style: {
                                                                                    background: '#fff',
                                                                                    border: 'none',
                                                                                    boxShadow: 'none',
                                                                                    padding: '0px 0px',
                                                                                    minHeight: '40px',
                                                                                }
                                                                            }}
                                                                            clearable
                                                                            autoOk
                                                                        />


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
                                                                            }} country={additionFields[item]} filteringList={filteringCountries} disabled={!isEditMode} />
                                                                        </FormGroup>
                                                                        :
                                                                        <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                            <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                                            <Input disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
                                                                                <option value="">--Select-Occupation--</option>
                                                                                {
                                                                                    Object.keys(occupations).map(item => (
                                                                                        <option value={item}>{t(item)}</option>
                                                                                    ))
                                                                                }
                                                                            </Input>
                                                                        </FormGroup>
                                                        )
                                                    })
                                                }
                                                {
                                                    !fieldInfoValidate("required_receiving_entity_fields", "id_type") && !fieldInfoValidate("required_receiving_entity_fields", "id_number")
                                                        ?
                                                        <>
                                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                <Label className="col-form-label" htmlFor="id_type">{t("ID Type")}</Label>
                                                                <Input disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_type" id="id_type" type="select" placeholder='ID Type' value={basicExtras.id_type} onChange={handleBasicExtraChange}>
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
                                                                <Input disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_number" id="id_number" type="text" placeholder='ID Number' value={basicExtras.id_number} onChange={handleBasicExtraChange} />
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
                                                            selectedCountryDetails?.[`${user?.beneficiary_type}_receiving_channels`]?.bank_account
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
                                                            selectedCountryDetails?.[`${user?.beneficiary_type}_receiving_channels`]?.mobile_money
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
                                                            selectedCountryDetails?.[`${user?.beneficiary_type}_receiving_channels`]?.card_payment
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
                                                                    {!instapayWallets.every(item => item?.wallet_id ?? item.length === 8) || walletError ? <Circle /> : <CheckCircle />}
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
                                                            selectedCountryDetails?.[`${user?.beneficiary_type}_receiving_channels`]?.cash_pickup
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
                                                            }} readOnly={!isEditMode} disabled={!isEditMode}>
                                                                <option value="IBAN">IBAN</option>
                                                                <option value="Swift">Swift/BIC Code</option>
                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                                            <Label className="col-form-label" htmlFor="bank_account_number">{accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, width: "100%", minWidth: "250px", border: missingFields.includes("bank_account_number") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} placeholder={accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")} required name="bank_account_number" id="bank_account_number" value={ibanSwift} onChange={getBankDetails} maxLength={34} min={8} readOnly={!isEditMode} disabled={!isEditMode} />
                                                            {
                                                                bankDetailsError && <span style={{ color: "red", position: "absolute", bottom: "-25px", left: "10px" }} > {bankDetailsError}</span>
                                                            }
                                                        </FormGroup>
                                                        {/* {
                                                country?.toLowerCase() === "united states"
                                                &&
                                                <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label" >{t("Routing/ABA Number")}<span className="req_star">*</span></Label>
                                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required  />
                                                </FormGroup>
                                            } */}
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Account Number")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_account_number") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" required /*readOnly={accNumType === "IBAN"}*/ value={formData.bank_account_number} name="bank_account_number" onChange={inputChangeHandler} disabled={!isValidIban || !isEditMode} />
                                                        </FormGroup>
                                                        {
                                                            accNumType === "IBAN"
                                                            &&
                                                            <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                <Label className="col-form-label" >{t("Account Holder Name")}<span className="req_star">*</span></Label>
                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("account_holder_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="account_holder_name" type="text" value={formData.account_holder_name} onChange={inputChangeHandler} required disabled={!isValidIban || !isEditMode} />
                                                            </FormGroup>
                                                        }
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Bank Name")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="bank_name" type="text" required disabled={!isValidIban || !isEditMode} value={formData.bank_name} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Branch Name")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("branch_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="branch_name" type="text" required disabled={!isValidIban || !isEditMode} value={formData.branch_name} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Branch Street")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_branch_street") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" name="bank_branch_street" required disabled={!isValidIban || !isEditMode} value={formData.bank_branch_street} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("City")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_city") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" name="bank_city" required disabled={!isValidIban || !isEditMode} value={formData.bank_city} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Province")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_province") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" required disabled={!isValidIban || !isEditMode} name="bank_province" value={formData.bank_province} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label" >{t("Postal Code")}<span className="req_star">*</span></Label>
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("bank_postal_code") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" required disabled={!isValidIban || !isEditMode} value={formData.bank_postal_code} name="bank_postal_code" onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        {
                                                            Object.keys(bankExtras).map(item => {
                                                                return (
                                                                    serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("bank")), "credit_party_identifiers_accepted", item)
                                                                    &&
                                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                        {((item !== 'iban' && item !== "swift_bic_code") || (item === "iban" && accNumType === "Swift") || (item === "swift_bic_code" && accNumType === "IBAN")) && <Label className="col-form-label">{t(service_name_formatter(item))}<span className="req_star">*</span></Label>}
                                                                        {
                                                                            item?.toString()?.toLowerCase() === "account_type"
                                                                                ?
                                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes(item) && clicked ? "1px solid red" : "1px solid #e9e9e9" }} disabled={!isValidIban || !isEditMode} type="select" value={bankExtras[item]} name={item} onChange={handleBankExtraChange}>
                                                                                    <option value="">Select Account Type</option>
                                                                                    {
                                                                                        Object.keys(AccountTypeData).map(item => (
                                                                                            <option value={item}>{AccountTypeData?.[item]}</option>
                                                                                        ))
                                                                                    }
                                                                                </Input>
                                                                                :
                                                                                <>
                                                                                    {((item !== 'iban' && item !== "swift_bic_code") || (item === "iban" && accNumType === "Swift") || (item === "swift_bic_code" && accNumType === "IBAN")) && <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes(item) && clicked ? "1px solid red" : "1px solid #e9e9e9" }} disabled={!isValidIban || !isEditMode} type="text" value={bankExtras[item]} name={item} onChange={handleBankExtraChange} />}                                                                                </>
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
                                                            <Label className="col-form-label">{t("Mobile Money Provider")} <span className="req_star">*</span></Label>
                                                            <Input readOnly={!isEditMode} disabled={!isEditMode} type="select" className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("mobile_wallet_provider") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} value={formData?.mobile_wallet_provider} onChange={inputChangeHandler} name="mobile_wallet_provider">
                                                                <option value="" disabled>Select Provider</option>
                                                                {
                                                                    mobileProviders.map(item => (
                                                                        <option value={item?.id}>{item?.name}</option>
                                                                    ))
                                                                }
                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" >{t("Wallet Name")} <span className="req_star">*</span></Label>
                                                            <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("mobile_wallet_name") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" placeholder='Wallet Name' required id="account_holder_name" name="mobile_wallet_name" value={formData?.mobile_wallet_name} onChange={inputChangeHandler} />
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" htmlFor="mobile_wallet_account_number">{t("Wallet Number")} <span className="req_star">*</span></Label>
                                                            {/* <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder='Account Number' required onKeyPress={handleChangeNumber} name="mobile_wallet_account_number" value={formData?.mobile_wallet_account_number} onChange={inputChangeHandler} /> */}
                                                            <PhoneInput
                                                                customStyles={{
                                                                    boxShadow: "none",
                                                                    border: "1px solid #e9e9e9",
                                                                    border: missingFields.includes("mobile_wallet_account_number") && clicked ? "1px solid red" : "1px solid #e9e9e9",
                                                                    padding: "12px",
                                                                    borderRadius: "0.375rem",
                                                                }}
                                                                phone={formData.mobile_wallet_account_number}
                                                                country={countryIsoCode}
                                                                setPhone={(e) => inputChangeHandler({ target: { value: e, name: "mobile_wallet_account_number" } })}
                                                                disabled={!country || !isEditMode}
                                                                disabledDropdown={true}
                                                                error={walletNumberError}
                                                            />
                                                        </FormGroup>
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
                                                                <Label className="col-form-label" htmlFor="card-holder-name">Card Holder Name <span className="req_star">*</span></Label>
                                                                <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_holder_one") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" placeholder="Card holder name" name="card_holder_one" value={formData?.card_holder_one} onChange={inputChangeHandler} />
                                                            </FormGroup>
                                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                <Label className="col-form-label" htmlFor="card-number">Card Number <span className="req_star">*</span></Label>
                                                                <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_number_one") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="card_number_one" value={formData?.card_number_one} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                                            </FormGroup>
                                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                <Label className="col-form-label" htmlFor="card-expiry">
                                                                    Expiry Date <span className="req_star">*</span>
                                                                </Label>
                                                                <div className="d-flex">
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                        className="form-control"
                                                                        style={{ flex: 1, minWidth: "125px", marginRight: "10px", border: missingFields.includes("card_expiry_one") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
                                                                        onKeyPress={handleMonthKeyPress}
                                                                        type="text"
                                                                        placeholder="MM"
                                                                        required
                                                                    />
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                        className="form-control"
                                                                        style={{ flex: 1, minWidth: "125px", border: missingFields.includes("card_expiry_one") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
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
                                                                        <Label className="col-form-label">{t(service_name_formatter(item))}<span className="req_star">*</span></Label>
                                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes(item) && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" value={cardExtras[item]} name={item} onChange={handleCardExtraChange} />
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
                                                                    <Label className="col-form-label" htmlFor="card-holder-name">Card Holder Name <span className="req_star">*</span></Label>
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_holder_two") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" placeholder="Card holder name" name="card_holder_two" value={formData?.card_holder_two} onChange={inputChangeHandler} />
                                                                </FormGroup>
                                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                    <Label className="col-form-label" htmlFor="card-number">Card Number <span className="req_star">*</span></Label>
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_number_two") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="card_number_two" value={formData?.card_number_two} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                                                </FormGroup>
                                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                    <Label className="col-form-label" htmlFor="card-expiry">
                                                                        Expiry Date <span className="req_star">*</span>
                                                                    </Label>
                                                                    <div className="d-flex">
                                                                        <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                            className="form-control"
                                                                            style={{ flex: 1, minWidth: "125px", marginRight: "10px", border: missingFields.includes("card_expiry_two") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
                                                                            onKeyPress={handleMonthKeyPress}
                                                                            type="text"
                                                                            placeholder="MM"
                                                                            required
                                                                        />
                                                                        <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                            className="form-control"
                                                                            style={{ flex: 1, minWidth: "125px", border: missingFields.includes("card_expiry_two") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
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
                                                                    <Label className="col-form-label" htmlFor="card-holder-name">Card Holder Name <span className="req_star">*</span></Label>
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_holder_three") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" placeholder="Card holder name" name="card_holder_three" value={formData?.card_holder_three} onChange={inputChangeHandler} />
                                                                </FormGroup>
                                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                    <Label className="col-form-label" htmlFor="card-number">Card Number <span className="req_star">*</span></Label>
                                                                    <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("card_number_three") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} name="card_number_three" value={formData?.card_number_three} onChange={inputChangeHandler} placeholder='Card Number' required onKeyPress={handleChangeNumber} />
                                                                </FormGroup>
                                                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                    <Label className="col-form-label" htmlFor="card-expiry">
                                                                        Expiry Date <span className="req_star">*</span>
                                                                    </Label>
                                                                    <div className="d-flex">
                                                                        <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                            className="form-control"
                                                                            style={{ flex: 1, minWidth: "125px", marginRight: "10px", border: missingFields.includes("card_expiry_three") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
                                                                            onKeyPress={handleMonthKeyPress}
                                                                            type="text"
                                                                            placeholder="MM"
                                                                            required
                                                                        />
                                                                        <Input readOnly={!isEditMode} disabled={!isEditMode}
                                                                            className="form-control"
                                                                            style={{ flex: 1, minWidth: "125px", border: missingFields.includes("card_expiry_three") && clicked ? "1px solid red" : "1px solid #e9e9e9" }}
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
                                                            totalCards < 3 && isEditMode
                                                            &&
                                                            <div style={{ display: "flex", cursor: "pointer", alignItems: "center", gap: ".25rem", color: "var(--theme-default)" }}
                                                                onClick={_ => setTotalCards(prev => prev + 1)}
                                                            >
                                                                <Plus size={20} />
                                                                <p style={{ marginBottom: 0 }}>Add another card</p>
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
                                                            <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("crypto_currency") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="select" value={formData?.crypto_currency} onChange={inputChangeHandler} name="crypto_currency">
                                                                <option value="Bitcoin">{t("Bitcoin")}</option>
                                                                <option value="Ethereum">{t("Ethereum")}</option>
                                                                <option value="Other">{t("Other")}</option>
                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup style={{ flex: 1, margin: 0 }}>
                                                            <Label className="col-form-label" htmlFor="card-number">{t("Wallet Address")} <span className="req_star">*</span></Label>
                                                            <Input readOnly={!isEditMode} disabled={!isEditMode} className="form-control" value={formData?.crypto_wallet_address} onChange={inputChangeHandler} name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("crypto_wallet_address") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} placeholder="ABCD12345WAD2" />
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
                                                                            <Input
                                                                                readOnly={!isEditMode}
                                                                                disabled={!isEditMode}
                                                                                className="form-control"
                                                                                style={{
                                                                                    flex: 1,
                                                                                    minWidth: "250px",
                                                                                    border: missingFields.includes("wallet_id") && clicked ? "1px solid red" : "1px solid #e9e9e9"
                                                                                }}
                                                                                value={value.wallet_id || value}
                                                                                onChange={(e) => {
                                                                                    setFirstTime(false)
                                                                                    handleInputChange(index, e.target.value)
                                                                                }}
                                                                                minLength={8}
                                                                                maxLength={8}
                                                                            />
                                                                        </FormGroup>
                                                                        <WalletDetails wallet={value} authHeader={authHeader} setWalletError={setWalletError} setWalletIds={setWalletIds} walletIds={walletIds} setDuplicateWallet={setDuplicateWallet} activeTab={active} firstTime={firstTime} />
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
                                                        {
                                                            isEditMode
                                                            &&
                                                            <div style={{
                                                                display: "flex",
                                                                cursor: instapayWallets.every(item => typeof item === "string" ? item.length === 8 : item) && !walletError ? "pointer" : "not-allowed",
                                                                alignItems: "center",
                                                                gap: ".25rem",
                                                                color: instapayWallets.every(item => typeof item === "string" ? item.length === 8 : item) && !walletError ? "var(--theme-default)" : "grey",
                                                                marginTop: "1rem"
                                                            }}
                                                                onClick={_ => instapayWallets.every(item => typeof item === "string" ? item.length === 8 : item) && !walletError ? setInstapayWallets(prev => [...prev, ""]) : setInstapayWallets(instapayWallets)}
                                                            >
                                                                <Plus size={20} />
                                                                <p style={{ marginBottom: 0 }}>{t("Add another wallet")}</p>
                                                            </div>
                                                        }
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
                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("document_type") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="select" value={cashPickupType} onChange={e => setCashPickupType(e.target.value)} name="crypto_currency" disabled={!mobileNumber || mobileNumber.length < 9 || !isEditMode} readOnly={!mobileNumber || mobileNumber.length < 9}>
                                                                    <option value="PASSPORT">{t("Passport")}</option>
                                                                    <option value="NATIONAL_ID">{t("National Identity Card")}</option>
                                                                    <option value="DRIVING_LICENSE">{t("Driving License")}</option>
                                                                    <option value="SOCIAL_SECURITY">{t("Social Security Card/Number")}</option>
                                                                    <option value="SENIOR_CITIZEN_ID">{t("Senior Citizen Identification Card")}</option>
                                                                    <option value="RESIDENT_CARD">{t("Permanent Residency Identification Card")}</option>
                                                                    <option value="PAN_CARD">{t("PAN Card")}</option>
                                                                    <option value="HEALTH_CARD">{t("Health Insurance Card/Number")}</option>
                                                                    <option value="EMPLOYER_ID">{t("Employer Identification Card")}</option>
                                                                </Input>
                                                            </FormGroup>
                                                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                                                <Label className="col-form-label" htmlFor="card-number">{t("Enter Document Number")} <span className="req_star">*</span></Label>
                                                                <Input className="form-control" value={cashPickupNumber} onChange={e => setCashPickupNumber(e.target.value)} name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px", border: missingFields.includes("document_number") && clicked ? "1px solid red" : "1px solid #e9e9e9" }} placeholder="ABCD12345WAD2" disabled={!mobileNumber || mobileNumber.length < 9} readOnly={!mobileNumber || mobileNumber.length < 9 || !isEditMode} />
                                                            </FormGroup>
                                                            {
                                                                Object.keys(cashExtras)?.map(item => (
                                                                    serviceFieldInfoValidate(services?.find(item => item?.name?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item)
                                                                    &&
                                                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                        <Label className="col-form-label">{t(service_name_formatter(item))}<span className="req_star">*</span></Label>
                                                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px", border: missingFields.includes(item) && clicked ? "1px solid red" : "1px solid #e9e9e9" }} type="text" value={cashExtras?.[item]} name={item} onChange={handleCashxtraChange} />
                                                                    </FormGroup>
                                                                ))
                                                            }
                                                        </div>
                                                        {
                                                            (!mobileNumber || mobileNumber.length < 9
                                                            ) &&
                                                            <span>Must add phone number to enable these fields.</span>
                                                        }
                                                    </>
                                                }
                                            </FormGroup>

                                            {
                                                isEditMode ? (
                                                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "2rem", gap: "2rem", alignItems: "center" }}>
                                                        <button onClick={() => {
                                                            setIsEditMode(false)
                                                            console.log(apiWallets, instapayWallets)
                                                            setInstapayWallets([...apiWallets])
                                                        }} style={{ all: "unset", cursor: "pointer" }}>
                                                            {t("Cancel")}
                                                        </button>
                                                        {!saveloading &&
                                                            <button type="button" onClick={editBeneficiaryHandler}
                                                                style={{
                                                                    all: "unset",
                                                                    padding: "1rem",
                                                                    boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                                                    textAlign: "center",
                                                                    cursor: "pointer",
                                                                    borderRadius: "10px",
                                                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "1rem",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                {t("Save")}
                                                            </button>}

                                                        {saveloading && <div class="d-flex justify-content-center">
                                                            <div class="spinner-border" color='primary' role="status">
                                                                <span class="sr-only">Loading...</span>
                                                            </div>
                                                        </div>}
                                                    </div>
                                                ) : null
                                            }

                                            <ConfirmationModal isOpen={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} onConfirm={changeUserDetailsAsPerBankDetails} onCancel={onCancelHandler} />
                                        </CardBody>
                                }
                            </Form>
                        </MuiPickersUtilsProvider>
                    </>
                }
            </div >
        </LocalizationProvider>
    )
}

export default EditBeneficiary;