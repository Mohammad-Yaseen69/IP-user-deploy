import { Circle, CheckCircle, Plus } from "react-feather";
import { Button, CardBody, CardFooter, FormGroup, Input, Label } from "reactstrap";
import { countries } from "country-list-json";
import PhoneInput from "../PhoneInput";
import 'react-phone-input-2/lib/style.css'
import "./req_star.css"
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import WalletDetails from "./WalletDetails";
import CountryDropDown from "./CountryDropDown";
import CitiesDropDown from "../CitiesDropDown";
import ConfirmationModal from "./ConfirmationModal";
import { useTranslation } from "react-i18next";
import PaymentChannelUI from "./PaymentChannelUI";
import useBankDetails from "../../hooks/BeneficiaryHooks/useBankDetails";
import useChannels from "../../hooks/BeneficiaryHooks/useChannels";
import DateMomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { bankExtrasInitial, BUSINESS_RELATIONSHIPS, idTypeData } from "../../utils/Data";
import useAddress from "../../hooks/BeneficiaryHooks/useAddress";
import useBenCreateFunc from "../../hooks/BeneficiaryHooks/useBenCreateFunc";
import citiesData from "../CitiesDropDown/CitiesData.json"
import InstaPayLoader from "../Loader";


const BusinessAccount = ({ mobileView, handleChangeAlpha, handleChangeNumber, toggleSuccess, filteringCountries }) => {
    const { t } = useTranslation()
    const [active, setActive] = useState(1)
    const [totalCards, setTotalCards] = useState(1)
    const [completedBank, setCompletedBank] = useState(false)
    const [completedWallet, setCompletedWallet] = useState(false)
    const [completedCard, setCompletedCard] = useState(false)
    const [completedCrypto, setCompletedCrypto] = useState(false)
    const [accNumType, setAccNumType] = useState("Swift")
    const [companyName, setCompanyName] = useState("")
    const [country, setCountry] = useState("")
    const [countryId, setCountryId] = useState("")
    const [countryIsoCode, setCountryIsoCode] = useState("")
    const [city, setCity] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [countryCode, setCountryCode] = useState("")

    const [walletError, setWalletError] = useState("")

    const [instapayWalletsLength, setInstapayWalletsLength] = useState(1)
    const [instapayWallets, setInstapayWallets] = useState(Array(instapayWalletsLength).fill(''))
    const [walletIds, setWalletIds] = useState([])
    const [cashPickupType, setCashPickupType] = useState("")
    const [cashPickupNumber, setCashPickupNumber] = useState("")
    const [cashPickupCompleted, setCashPickupCompleted] = useState("")

    const [duplicateWallet, setDuplicateWallet] = useState(false)

    const [bankCity, setBankCity] = useState("")

    const [showConfirmation, setShowConfirmation] = useState(false)

    const handleInputChange = (index, value) => {
        const newOTPValues = [...instapayWallets];
        newOTPValues[index] = value;
        setInstapayWallets(newOTPValues);
    };

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

    const [cashExtras] = useState({
        msisdn: ""
    })

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

    const [loading, setLoading] = useState(false)
    const { userDetails, authHeader } = useContext(UserContext)
    const { getBankDetails, bankCountry, bankCountryCode, bankDetailsError, isValidIban, ibanSwift, } = useBankDetails({ accNumType, setFormData, handleBankExtraChange, bankExtras })
    const { fieldsInfo, services, mobileProviders, selectedCountryDetails, getCountryFields } = useChannels({ setLoading, setActive, countryIsoCode, countryId, isBusiness: true })

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            account_holder_name: companyName,
            mobile_wallet_name: companyName
        }))
    }, [companyName])



    const [representativeFields, setRepresentativeFields] = useState({
        first_name: "",
        last_name: "",
        id_type: "",
        id_number: "",
        id_delivery_date: "",
        id_expiration_date: ""
    })

    const [additionFields, setAdditionFields] = useState({
        registration_number: "",
        date_of_incorporation: "",
        tax_id: ""
    })

    const handleRepresentativeFieldChange = (e) => {
        const { value, name } = e.target;
        setRepresentativeFields(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAdditionalFieldChange = (e) => {
        const { value, name } = e.target;
        setAdditionFields(prev => ({
            ...prev,
            [name]: value
        }))
    }

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
        companyName,
        mobileNumber,
        city,
        country,
        countryId,
        countryIsoCode,
        walletIds,
        representativeFields,
        additionFields,
        bankExtras,
        cashExtras,
        accNumType,
        ibanSwift,
        cashPickupType,
        cashPickupNumber,
        walletError,
        toggleSuccess,
        inBusiness: true
    })

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
        setCity(bankCity)
        setShowConfirmation(false)
        setMobileNumber("")
    }

    const onCancelHandler = () => {
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
        setBankCity("")
        setShowConfirmation(false)
    }


    useEffect(() => {
        if (bankCountry && country && bankCountry.toLowerCase() !== country.toLowerCase()) {
            setShowConfirmation(true)
        }
    }, [bankCountry, country])

    useEffect(() => {
        if (formData.bank_name && formData.branch_name && formData.bank_account_number) {
            setCompletedBank(true)
        } else {
            setCompletedBank(false)
        }
    }, [formData])

    useEffect(() => {
        if (formData.mobile_wallet_name && formData.mobile_wallet_account_number) {
            setCompletedWallet(true)
        } else {
            setCompletedWallet(false)
        }
    }, [formData])

    useEffect(() => {
        if (formData.card_holder_one && formData.card_number_one) {
            setCompletedCard(true)
        } else {
            setCompletedCard(false)
        }
    }, [formData])

    useEffect(() => {
        if (formData.crypto_currency && formData.crypto_wallet_address) {
            setCompletedCrypto(true)
        } else {
            setCompletedCrypto(false)
        }
    }, [formData])

    const isAfricanBank = useMemo(() => {
        if (country) {
            return citiesData.find(item => item.iso3 === bankCountryCode).region === "Africa"
        }
    }, [bankCountryCode])

    const [hoverErrors, setHoverErrors] = useState({
        city: false,
        postal_code: false,
        address: false
    })

    return (
        <>
            {loading
                ?
                <div style={{ height: "60vh", width: "100%", opacity: 1 }}>
                    <InstaPayLoader fallback={true} />
                </div>
                : <MuiPickersUtilsProvider utils={DateMomentUtils}>
                    <>
                        <CardBody>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="last-name">{t("Company Name")}<span className="req_star">*</span></Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="last-name" type="text" placeholder='Enter the company name' required pattern="[A-Za-z]+" title="(A to Z | a to z)" /*onKeyPress={handleChangeAlpha}*/ value={companyName} onChange={e => setCompanyName(e.target.value)} />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1, margin: 0 }}>
                                        <Label className="col-form-label" htmlFor="email">{t("Company Email")}</Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="email" name="email" type="email" placeholder='Email Address' title="abc@xyz.com" value={formData.email} onChange={inputChangeHandler} />
                                    </FormGroup>

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
                                            const country_id = filteringCountries.filter(item => item?.country_name?.toLowerCase()?.includes(filtered?.name?.toLowerCase()))?.[0]?._id
                                            setCountryId(country_id)
                                        }} country={countryIsoCode} filteringList={filteringCountries} />
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
                                    <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                        <Label className="col-form-label" htmlFor="postal_code">{t("Postal Code")}</Label>
                                        <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="postal_code" id="postal_code" type="text" placeholder='Address line' value={formData.postal_code} onChange={inputChangeHandler} />
                                    </FormGroup>
                                </div>
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "1rem"
                                }}>
                                    <FormGroup style={{ flex: 1, margin: 0, transform: "translateY(-4px)" }}>
                                        <Label className="col-form-label" htmlFor="mobile_number">{t("Mobile Number")} <span className="req_star">*</span></Label>
                                        <PhoneInput
                                            customStyles={{
                                                boxShadow: "none",
                                                border: "1px solid #e9e9e9",
                                                padding: "0.75rem"
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
                                        <label className="col-form-label" htmlFor="relation">{t("Relationship With Beneficiary")}</label>
                                        <Input type="select" name="relation" value={formData.relation} onChange={inputChangeHandler}>
                                            <option value="">{t("Select Relationship")}</option>
                                            {Object.keys(BUSINESS_RELATIONSHIPS).map((option, idx) => (
                                                <option key={idx} value={option}> {BUSINESS_RELATIONSHIPS[option]} </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </div>
                            </FormGroup>

                            <div style={{ fontSize: ".95rem", fontWeight: 700, margin: "0.5rem 0 1rem" }}>
                                {t("Representative Details")}
                            </div>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "1rem",
                            }}>
                                {
                                    Object.keys(representativeFields).map((item, key) => (
                                        item === "id_type"
                                            ?
                                            <FormGroup key={key} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                <Input
                                                    className="form-control"
                                                    style={{ flex: 1, minWidth: "250px" }}
                                                    type="select"
                                                    value={representativeFields[item]}
                                                    name={item}
                                                    onChange={handleRepresentativeFieldChange}
                                                >
                                                    <option value="">{t("Select Document")}</option>
                                                    {
                                                        Object.keys(idTypeData).map((idKey) => (
                                                            <option key={idKey} value={idKey}>{t(idTypeData?.[idKey])}</option>
                                                        ))
                                                    }
                                                </Input>
                                            </FormGroup>
                                            :
                                            item?.toLowerCase()?.includes("date")
                                                ?
                                                <FormGroup key={key} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                    <DatePicker
                                                        format="DD/MM/YYYY"
                                                        className="form-control custom-datepicker"
                                                        style={{ flex: 1, minWidth: "250px", background: "#fff", border: "1px solid #e9e9e9", borderRadius: "6px", boxShadow: "none", padding: "0px", display: 'flex', justifyContent: "center", position: "static" }}
                                                        value={representativeFields[item] || null}
                                                        onChange={e => handleRepresentativeFieldChange({ target: { name: item, value: e ? e.format("YYYY-MM-DD") : "" } })}
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
                                                <FormGroup key={key} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                    <Label className="col-form-label">{t(service_name_formatter(item))}</Label>
                                                    <Input
                                                        className="form-control"
                                                        style={{ flex: 1, minWidth: "250px" }}
                                                        type="text"
                                                        value={representativeFields[item]}
                                                        name={item}
                                                        onChange={handleRepresentativeFieldChange}
                                                    />
                                                </FormGroup>
                                    ))
                                }
                            </div>

                            <div style={{ fontSize: ".95rem", fontWeight: 700, margin: "1.25rem 0 1rem" }}>
                                {t("Additional Details")} <span className="req_star">*</span>
                            </div>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "1rem",
                            }}>
                                {
                                    Object.keys(additionFields).map((item, key) => (
                                        item?.toLowerCase()?.includes("date")
                                            ?
                                            <FormGroup key={key} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                <DatePicker
                                                    format="DD/MM/YYYY"
                                                    className="form-control custom-datepicker"
                                                    style={{ flex: 1, minWidth: "250px", background: "#fff", border: "1px solid #e9e9e9", borderRadius: "6px", boxShadow: "none", padding: "0px", display: 'flex', justifyContent: "center", position: "static" }}
                                                    value={additionFields[item] || null}
                                                    onChange={e => handleAdditionalFieldChange({ target: { name: item, value: e ? e.format("YYYY-MM-DD") : "" } })}
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
                                                        required: true,
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
                                            <FormGroup key={key} style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                                                <Label className="col-form-label">{t(service_name_formatter(item))} <span className="req_star">*</span></Label>
                                                <Input
                                                    className="form-control"
                                                    style={{ flex: 1, minWidth: "250px" }}
                                                    type="text"
                                                    value={additionFields[item]}
                                                    name={item}
                                                    required
                                                    onChange={handleAdditionalFieldChange}
                                                />
                                            </FormGroup>
                                    ))
                                }
                            </div>
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
                                <Label className="col-form-label" htmlFor="address">{t("Address Line")}  <span className="req_star">*</span></Label>
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
                                companyName,
                                setCompanyName,
                                authHeader,
                                walletIds,
                                setWalletIds,
                                mobileNumber,
                                cashPickupType,
                                setCashPickupType,
                                cashPickupNumber,
                                setCashPickupNumber,
                                completedCrypto,
                                isAfricanBank
                            }} />
                        </CardBody>
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
                                    benLoading ||
                                    duplicateWallet ||
                                    walletError ||
                                    !companyName ||
                                    !country ||
                                    !city ||
                                    mobileNumber.length < 9 ||
                                    !formData.address ||
                                    !formData.relation ||
                                    (!completedBank && !completedCard && !completedCrypto && !completedWallet && !cashPickupCompleted && instapayWallets.some(item => item.length < 8 || item.length > 8))
                                }
                                onClick={addBeneficiaryHandler}
                            >
                                {benLoading ? t("Adding") + "..." : t("Add Company")}
                            </Button>
                            <ConfirmationModal isOpen={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} onConfirm={changeUserDetailsAsPerBankDetails} onCancel={onCancelHandler} />
                        </CardFooter>
                    </>
                </MuiPickersUtilsProvider>
            }
        </>
    )
}

export default BusinessAccount;