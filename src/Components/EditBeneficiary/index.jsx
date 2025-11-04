import { CardBody, CardHeader, Form, FormGroup, Input, Label } from "reactstrap";
import { countries } from "country-list-json";
// import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { useLocation, useNavigate } from "react-router";
import CountryDropDown from "../AddBeneficiary/CountryDropDown";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import CitiesDropDown from "../CitiesDropDown";
import { useTranslation } from "react-i18next";
import { bankExtrasInitial, beneficiaryInitialFormData, BeneficiaryRelation, friendsAndFamily, gendersData, idTypeData, occupations } from "../../utils/Data";
import NestedDropdown from "../NestedDropdown";
import InstaPayLoader from "../Loader";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import PhoneInput from "../PhoneInput";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import PaymentChannelUI from "../AddBeneficiary/PaymentChannelUI";
import useBankDetails from "../../hooks/BeneficiaryHooks/useBankDetails";
import useChannels from "../../hooks/BeneficiaryHooks/useChannels";
import { getExtractedPhone, serviceFieldInfoValidate } from "../../utils/Functions";
import useBenEditFunc from "../../hooks/BeneficiaryHooks/useBenEditFunc";
import NeemaBenExtrasFields from "../AddBeneficiary/NeemaBenExtrasFields";




const EditBeneficiary = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const user_id = queryParams.get("user_id")
    const edit = queryParams.get("edit")
    const view = queryParams.get("view")
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const [mobileView, setMobileView] = useState(window?.innerWidth < 600)
    const [active, setActive] = useState(5)
    const [totalCards, setTotalCards] = useState(1)
    const [completedBank, setCompletedBank] = useState(false)
    const [completedWallet, setCompletedWallet] = useState(false)
    const [completedCard, setCompletedCard] = useState(false)
    const [completedCrypto, setCompletedCrypto] = useState(false)
    const [accNumType, setAccNumType] = useState("IBAN")
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

    // api bank details

    // const show confirmation
    const [loading, setLoading] = useState(false)
    const [isAddressRequired,] = useState(true)
    const [clicked, setClicked] = useState(false)
    const [formData, setFormData] = useState(beneficiaryInitialFormData)
    const [bankExtras, setBankExtras] = useState(bankExtrasInitial)



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

    const { getBankDetails, bankCountry, bankCountryCode, bankDetailsError, isValidIban, ibanSwift, setBankCountryCode } = useBankDetails({ accNumType, setFormData, handleBankExtraChange, bankExtras })
    const { fieldsInfo, services, mobileProviders, selectedCountryDetails, getCountryFields } = useChannels({ setLoading, setActive, countryIsoCode, countryId })



    const fieldInfoValidate = (field_name, sub_field_name) => {
        if (fieldsInfo === null) return false;
        let isInThere = false;
        for (const service in fieldsInfo) {
            if (fieldsInfo[service]?.[field_name]?.some(item => item.name === sub_field_name)) {
                isInThere = true
                break
            }
        }

        return isInThere;
    }



    // basic extra fields
    const [basicExtras, setBasicExtras] = useState({
        middlename: "",
        id_type: "NATIONAL_ID",
        id_number: "",
        province_state: "",
        houseNumber: "",
        street: "",
        state_name: ""
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

    const { authHeader, beneficiaries, userDetails, allowedCountries, getUserBeneficiaries } = useContext(UserContext)

    useEffect(() => {
        if (userDetails) {
            getUserBeneficiaries()
        }
    }, [userDetails])


    const inputChangeHandler = (e) => {
        setClicked(false)
        const { name, value } = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })

        if (value.length >= 3) {
            setMissingFields(prev => prev.filter(field => field !== name))
        }
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




    // bank details
    useEffect(() => {
        const fields = services?.find(item =>
            item?.method?.toLowerCase()?.includes("bank")
        )

        const bankCountryFields = fieldsInfo?.bank_country_fields


        const resultKeys = Object.keys(bankExtras)
            .filter(item =>
                serviceFieldInfoValidate(fields, "credit_party_identifiers_accepted", item, fieldsInfo) ||
                    bankCountryFields ? serviceFieldInfoValidate("bank_country_fields", "credit_party_identifiers_accepted", item, fieldsInfo) : false
            )
            .filter(item => {
                if (item === "iban" && accNumType === "IBAN") return false
                if (item === "swift_bic_code" && accNumType === "Swift") return false
                return true
            })
        if (formData.bank_name && formData.branch_name && formData.bank_account_number && formData.bank_postal_code && formData.bank_branch_street && formData.bank_city && formData.bank_province && resultKeys.every(item => bankExtras?.[item]?.length > 0)) {
            setCompletedBank(true)
        } else {
            setCompletedBank(false)
        }
    }, [formData, bankExtras, services])

    useEffect(() => {
        if (cashPickupType && cashPickupNumber && Object.keys(cashExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.method?.toLowerCase()?.includes("cash")), "credit_party_identifiers_accepted", item, fieldsInfo)).every(item => cashExtras?.[item]?.length > 0)) {
            setCashPickupCompleted(true)
        } else {
            setCashPickupCompleted(false)
        }
    }, [cashPickupType, cashPickupNumber, cashExtras, services])

    // mobile wallet details
    useEffect(() => {
        const extractWalletNum = getExtractedPhone(formData, countryIsoCode)

        if (formData.mobile_wallet_name && extractWalletNum && formData.mobile_wallet_provider) {
            setCompletedWallet(true)
        } else {
            setCompletedWallet(false)
        }
    }, [formData])

    // card details
    useEffect(() => {
        if (formData.card_holder_one && formData.card_number_one && Object.keys(cardExtras).filter(item => serviceFieldInfoValidate(services?.find(item => item?.method?.toLowerCase()?.includes("card")), "credit_party_identifiers_accepted", item, fieldsInfo)).every(item => cardExtras?.[item]?.length > 0)) {
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
                mobile_wallet_name: user?.mobile_wallet?.[0]?.wallet_name ?? `${user?.first_name ?? ""} ${user?.last_name ?? ""} `,
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
            if ((user?.bank_details?.[0]?.iban || user?.bank_details?.[0]?.swift_code)) {
                getBankDetails({ target: { value: (user?.bank_details?.[0]?.iban || user?.bank_details?.[0]?.swift_code) } }, true, user?.bank_details?.[0]?.account_number)
            }
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
            setCashxtras(prev => user?.cash_pickup?.[0]?.extras ?? prev)
            setBankCountryCode(user?.bank_details?.[0]?.extras?.country_iso_code && "")
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


    const [missingFields, setMissingFields] = useState([])


    const [filteringCountries, setFilteringCountries] = useState([])

    useEffect(() => {
        setFilteringCountries(allowedCountries)
    }, [allowedCountries])



    const { editBeneficiaryHandler, mobileNumberError, walletNumberError, saveloading } = useBenEditFunc({
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
        active,
        setClicked,
        setMissingFields,
        user
    })

    useEffect(() => {
        if (bankCountryCode) {
            setBankExtras(prev => ({
                ...prev,
                country_iso_code: bankCountryCode
            }));
        }
    }, [bankCountryCode]);

    useEffect(() => {
        if (bankCountryCode !== countryIsoCode) {
            getCountryFields(countryIsoCode, services.find(service => service.method?.toLowerCase()?.includes("bank")), bankCountryCode)
        }
    }, [bankCountryCode])


    const handleDisable = () => {
        const extractWalletNum = getExtractedPhone(formData, countryIsoCode)
        if (ibanSwift && !completedBank) {
            return true
        }

        if ((extractWalletNum || formData.mobile_wallet_provider) && !completedWallet) {
            return true
        }

        if (!completedWallet && !completedBank && !completedCard && !completedCrypto && (!instapayWallets.filter(w => w !== "").length || walletError)) {
            return true
        }
        return false
    }

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
                                            >{t("Edit")}</button>
                                        }
                                    </CardHeader>
                                </div>
                                {
                                    loading
                                        ?
                                        <div style={{ height: "60vh", width: "100%", opacity: 1 }}>
                                            <InstaPayLoader fallback fullHeight/>
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
                                            <NeemaBenExtrasFields
                                                basicExtras={basicExtras}
                                                country={country}
                                                countryIsoCode={countryIsoCode}
                                                fieldInfoValidate={fieldInfoValidate}
                                                setBasicExtras={setBasicExtras}
                                                handleBasicExtraChange={handleBasicExtraChange}
                                            />
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
                                                                                <option value="">--{t("Select Occupation")}--</option>
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

                                            <PaymentChannelUI {...{
                                                services,
                                                selectedCountryDetails,
                                                country,
                                                countryIsoCode,
                                                active,
                                                setActive,
                                                completedBank,
                                                completedWallet,
                                                completedCard,
                                                cashPickupCompleted,
                                                mobileView,
                                                accNumType,
                                                setAccNumType,
                                                ibanSwift,
                                                getBankDetails,
                                                bankDetailsError,
                                                isValidIban,
                                                formData,
                                                inputChangeHandler,
                                                bankCountry,
                                                bankExtras,
                                                handleBankExtraChange,
                                                fieldsInfo,
                                                mobileProviders,
                                                totalCards,
                                                setTotalCards,
                                                handleChangeNumber,
                                                cardExtras,
                                                handleCardExtraChange,
                                                instapayWallets,
                                                setInstapayWallets,
                                                walletError,
                                                setWalletError,
                                                duplicateWallet,
                                                setDuplicateWallet,
                                                firstName,
                                                setFirstName,
                                                lastName,
                                                setLastName,
                                                authHeader,
                                                walletIds,
                                                setWalletIds,
                                                mobileNumber,
                                                cashPickupType,
                                                setCashPickupType,
                                                cashPickupNumber,
                                                setCashPickupNumber,
                                                cashExtras,
                                                handleCashxtraChange,
                                                isEdit: true,
                                                walletNumberError,
                                                isEditMode
                                            }}
                                            />

                                            {
                                                isEditMode ? (
                                                    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "2rem", gap: "2rem", alignItems: "center" }}>
                                                        <button onClick={() => {
                                                            setIsEditMode(false)
                                                            setInstapayWallets([...apiWallets])
                                                        }} style={{ all: "unset", cursor: "pointer" }}>
                                                            {t("Cancel")}
                                                        </button>
                                                        {!saveloading &&
                                                            <button disabled={handleDisable()} type="button" onClick={editBeneficiaryHandler}
                                                                style={{
                                                                    all: "unset",
                                                                    padding: "1rem",
                                                                    boxShadow: "0 0 3px rgba(128,128,128,0.4)",
                                                                    textAlign: "center",
                                                                    cursor: handleDisable() ? "not-allowed" : "pointer",
                                                                    borderRadius: "10px",
                                                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "1rem",
                                                                    justifyContent: "center",
                                                                    opacity: handleDisable() && .5
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