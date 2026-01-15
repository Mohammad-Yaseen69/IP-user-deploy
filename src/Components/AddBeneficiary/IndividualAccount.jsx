import { Button, CardBody, CardFooter, FormGroup, Input, Label, Form } from "reactstrap";
import 'react-phone-input-2/lib/style.css'
import "./req_star.css"
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import CountryDropDown from "./CountryDropDown";
import CitiesDropDown from "../CitiesDropDown";
import { useTranslation } from "react-i18next";
import NestedDropdown from "../NestedDropdown";
import InstaPayLoader from "../Loader";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import PhoneInput from "../PhoneInput";
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import useChannels from "../../hooks/BeneficiaryHooks/useChannels";
import useBankDetails from "../../hooks/BeneficiaryHooks/useBankDetails";
import useAddress from "../../hooks/BeneficiaryHooks/useAddress";
import { serviceFieldInfoValidate } from "../../utils/Functions";
import useBenCreateFunc from "../../hooks/BeneficiaryHooks/useBenCreateFunc";
import { BeneficiaryRelation, friendsAndFamily, gendersData, idTypeData, occupations, beneficiaryInitialFormData, bankExtrasInitial, basicExtrasInitial } from "../../utils/Data";
import PaymentChannelUI from "./PaymentChannelUI";
import NeemaBenExtrasFields from "./NeemaBenExtrasFields";
import citiesData from "../CitiesDropDown/CitiesData.json"



const IndividualAccount = ({ mobileView, handleChangeNumber, toggleSuccess, filteringCountries }) => {
    const { t } = useTranslation()
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

    const [walletError, setWalletError] = useState("")
    // instapay wallet
    const [instapayWalletsLength] = useState(1)
    const [instapayWallets, setInstapayWallets] = useState(Array(instapayWalletsLength).fill(''))
    const [walletIds, setWalletIds] = useState([])
    const [cashPickupType, setCashPickupType] = useState("")
    const [cashPickupNumber, setCashPickupNumber] = useState("")
    const [cashPickupCompleted, setCashPickupCompleted] = useState("")
    const [duplicateWallet, setDuplicateWallet] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isAddressRequired,] = useState(true)



    const [formData, setFormData] = useState(beneficiaryInitialFormData)





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


    const { authHeader } = useContext(UserContext)

    // basic extra fields
    const [basicExtras, setBasicExtras] = useState(basicExtrasInitial)

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

    const [bankExtras, setBankExtras] = useState(bankExtrasInitial)

    const handleBankExtraChange = (e) => {
        const { value, name } = e.target;
        setBankExtras(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }



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
    const { getBankDetails, bankCountry, bankCountryCode, bankDetailsError, isValidIban, ibanSwift, } = useBankDetails({ accNumType, setFormData, handleBankExtraChange, bankExtras })
    const { fieldsInfo, services, mobileProviders, selectedCountryDetails, getCountryFields } = useChannels({ setLoading, setActive, countryIsoCode, countryId })


    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            account_holder_name: `${firstName} ${lastName}`,
            mobile_wallet_name: `${firstName} ${lastName}`
        }))
    }, [firstName, lastName])





    const inputChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    useEffect(() => {
        if (bankCountryCode) {
            setBankExtras(prev => ({
                ...prev,
                country_iso_code: bankCountryCode
            }));
        }
    }, [bankCountryCode]);



    // bank details
    const isAfricanBank = useMemo(() => {
        if (country) {
            return citiesData.find(item => item.iso3 === bankCountryCode).region === "Africa"
        }
    }, [bankCountryCode])
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
        if (formData.bank_name && formData.branch_name && formData.bank_account_number && (isAfricanBank ? true : formData.bank_postal_code) && formData.bank_branch_street && formData.bank_city && formData.bank_province && resultKeys?.every(item => bankExtras?.[item]?.length > 0)) {
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
        if (formData.mobile_wallet_name && formData.mobile_wallet_account_number?.length > 8 && formData.mobile_wallet_provider) {
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
        if (formData.crypto_currency && formData.crypto_wallet_address) {
            setCompletedCrypto(true)
        } else {
            setCompletedCrypto(false)
        }
    }, [formData])



    useEffect(() => {
        if (bankCountryCode !== countryIsoCode) {
            getCountryFields(countryIsoCode, services.find(service => service.method?.toLowerCase()?.includes("bank")), bankCountryCode)
        }
    }, [bankCountryCode])

    const {
        setIsCountryInFocus,
        addresses,
        addressInFocus,
        setAddressInFocus,
    } = useAddress({ countryIsoCode, formData })

    const { addBeneficiaryHandler, benLoading, mobileError, walletMobileError, setMobileError } = useBenCreateFunc({
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
    })
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
                        <InstaPayLoader fallback={true} />
                    </div>
                    :
                    <>
                        <MuiPickersUtilsProvider utils={DateMomentUtils}>
                            <Form onSubmit={e => e.preventDefault()}>
                                <CardBody>
                                    <FormGroup onSubmit={(e) => e.preventDefault()} className="mb-3">
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
                                                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="id_number" id="id_number" type="text" placeholder={t('ID Number')} value={basicExtras.id_number} onChange={handleBasicExtraChange} />
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
                                                <CountryDropDown
                                                    onSelect={(selectedCountry) => {
                                                        if (selectedCountry?.name?.toLowerCase()?.includes("bolivia")) {
                                                            selectedCountry.name = "Bolivia, Plurinational State of bolivia"
                                                        }
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
                                                        {t("Select Country First")}
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
                                        <Input
                                            className="form-control"
                                            style={{ flex: 1, minWidth: "250px" }}
                                            name="address"
                                            id="address"
                                            type="textarea"
                                            placeholder={t('Address Line')}
                                            disabled={!country}
                                            readOnly={!country}
                                            value={formData.address}
                                            onChange={inputChangeHandler}
                                            onFocus={() => setAddressInFocus(true)}
                                            onBlur={() => {
                                                setTimeout(() => {
                                                    setAddressInFocus(false)
                                                }, 100)
                                            }}
                                        />
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
                                                {t("Select Country First")}
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
                                                                onMouseDown={(e) => {
                                                                    // Prevent blur event from firing before click
                                                                    e.preventDefault();
                                                                    inputChangeHandler({
                                                                        target: {
                                                                            name: "address",
                                                                            value: item
                                                                        }
                                                                    });
                                                                    setAddressInFocus(false);
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
                                    <NeemaBenExtrasFields
                                        basicExtras={basicExtras}
                                        country={country}
                                        countryIsoCode={countryIsoCode}
                                        fieldInfoValidate={fieldInfoValidate}
                                        handleBasicExtraChange={handleBasicExtraChange}
                                        setBasicExtras={setBasicExtras}
                                    />
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
                                                    setError={setMobileError}
                                                    error={mobileError}
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
                                            Object.keys(additionFields).map((item, key) => (
                                                item === "gender"
                                                    ?
                                                    <FormGroup key={key} FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                        <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                        <Input type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
                                                            <option value="">--{t("Select Gender")}--</option>
                                                            {
                                                                Object.keys(gendersData).map((item, idx) => (
                                                                    <option key={`${key}-${idx}`} value={item}>{t(item)}</option>
                                                                ))
                                                            }
                                                        </Input>
                                                    </FormGroup>
                                                    :
                                                    item === "date_of_birth"
                                                        ?
                                                        <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                            <Label className="col-form-label">{t(service_name_formatter(item))}</Label>

                                                            <DatePicker
                                                                format="DD/MM/YYYY"
                                                                className="form-control custom-datepicker"
                                                                style={{ flex: 1, minWidth: "250px", background: "#fff", border: "1px solid #e9e9e9", borderRadius: "6px", boxShadow: "none", padding: "0px", display: 'flex', justifyContent: "center", position: "static" }}
                                                                value={additionFields[item] || null}
                                                                onChange={e => handleAddtionalFieldChange({ target: { name: item, value: e ? e.format("YYYY-MM-DD") : "" } })}
                                                                placeholder="DD/MM/YYYY"
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    style: {
                                                                        background: '#fff',
                                                                        border: 'none',
                                                                        boxShadow: 'none',
                                                                        padding: '0 10px',
                                                                        minHeight: '40px',
                                                                        fontWeight: 500
                                                                    }
                                                                }}
                                                                inputProps={{
                                                                    style: {
                                                                        background: '#fff',
                                                                        border: 'none',
                                                                        boxShadow: 'none',
                                                                        padding: '2px 0px',
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
                                                                }} country={additionFields[item]} filteringList={filteringCountries} />
                                                            </FormGroup>
                                                            :
                                                            <FormGroup FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                                <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="select" value={additionFields[item]} name={item} onChange={handleAddtionalFieldChange}>
                                                                    <option value="">--{t("Select Occupation")}--</option>
                                                                    {
                                                                        Object.keys(occupations).map((item, key) => (
                                                                            <option key={key} value={item}>{t(item)}</option>
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
                                        walletMobileError,
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
                                        completedCrypto,
                                        isAfricanBank
                                    }}
                                    />
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
                                            benLoading || duplicateWallet || walletError || !firstName || !lastName || !country || !city || mobileNumber.length < 9 || (!completedBank && !completedCard && !completedCrypto && !completedWallet && !cashPickupCompleted && instapayWallets.some(item => item.length < 8 || item.length > 8)) || !formData.relation || (isAddressRequired ? !formData.address : false)
                                        }
                                        onClick={addBeneficiaryHandler}
                                    >
                                        {benLoading ? t("Adding") + "..." : t("Add Beneficiary")} {/* Add loading state text */}
                                    </Button>
                                    {/* <ConfirmationModal isOpen={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} onConfirm={changeUserDetailsAsPerBankDetails} onCancel={onCancelHandler} /> */}
                                </CardFooter>
                            </Form>
                        </MuiPickersUtilsProvider>
                    </>
            }
        </>
    )
}

export default IndividualAccount;