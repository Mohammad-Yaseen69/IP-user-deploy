import { Circle, CheckCircle, Plus } from "react-feather";
import { Button, CardBody, CardFooter, FormGroup, Input, Label } from "reactstrap";
import { countries } from "country-list-json";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import "./req_star.css"
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import WalletDetails from "./WalletDetails";
import CountryDropDown from "./CountryDropDown";
import CitiesDropDown from "../CitiesDropDown";
import ConfirmationModal from "./ConfirmationModal";
import { useTranslation } from "react-i18next";

const BusinessAccount = ({ mobileView, handleChangeAlpha, handleChangeNumber, toggleSuccess, filteringCountries }) => {
    const { t } = useTranslation()
    const [active, setActive] = useState(1)
    const [totalCards, setTotalCards] = useState(1)
    const [completedBank, setCompletedBank] = useState(false)
    const [completedWallet, setCompletedWallet] = useState(false)
    const [completedCard, setCompletedCard] = useState(false)
    const [completedCrypto, setCompletedCrypto] = useState(false)
    const [accNumType, setAccNumType] = useState("Swift")
    const [ibanSwift, setIbanSwift] = useState("")

    // const [firstName, setFirstName] = useState("")
    // const [lastName, setLastName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [country, setCountry] = useState("")
    const [countryId, setCountryId] = useState("")
    const [countryIsoCode, setCountryIsoCode] = useState("")
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

    const handleInputChange = (index, value) => {
        const newOTPValues = [...instapayWallets];
        newOTPValues[index] = value;
        setInstapayWallets(newOTPValues);
    };

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

    const addBeneficiaryHandler = (e) => {
        e.preventDefault()
        const account_types = [
            completedBank ? "bank" : null,
            completedCard ? "card" : null,
            completedWallet ? "mobile" : null,
            completedCrypto ? "crypto" : null,
            cashPickupCompleted ? "cash" : null,
            instapayWallets.every(item => item.length !== 8) || walletError ? null : "wallet"
        ]

        const data = {
            first_name: "",
            last_name: "",
            company_name: companyName,
            email: formData.email,
            phone: mobileNumber,
            address: formData.address,
            postal_code: formData.postal_code,
            city: city,
            country_name: country,
            country: countryId,
            country_iso_code: countryIsoCode,
            relation: formData.relation,
            account: userDetails._id,
            beneficiary_type: "business",
            account_type: account_types.filter(item => item !== null),
            isUsaBank: false,
            wallet: walletIds,
            bank_details: completedBank ? [
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
                }
            ] : [],
            mobile_wallet: completedWallet ? [
                {
                    money_provider: formData.mobile_wallet_provider,
                    wallet_name: formData.mobile_wallet_name,
                    wallet_account_number: formData.mobile_wallet_account_number,
                }
            ] : [],
            crypto: completedCrypto ? [
                {
                    currency: formData.crypto_currency,
                    wallet_address: formData.crypto_wallet_address,
                }
            ] : [],
            cash_pickup: cashPickupCompleted ? [
                {
                    document_type: cashPickupType,
                    document_number: cashPickupNumber,

                }
            ] : [],
            card: completedCard ? [
                {
                    card_name: formData.card_holder_one,
                    card_number: formData.card_number_one,
                    card_expiry: formData.card_expiry_one
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

        const encrypted = encryptData(data)

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
                    window.location.pathname = "/login";
                }
                // console.log(err)
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
        if (bankCountry && country && bankCountry.toLowerCase() !== country.toLowerCase()) {
            setShowConfirmation(true)
        }
    }, [bankCountry, country])


    let debounceTimer;

    const getBankDetails = (e) => {
        setIbanSwift(e.target.value)

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {

            if (e.target.value.length > 11) {
                setAccNumType("IBAN")
                if (e.target.value.length > 15) {
                    axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/beneficiary/get-details-by-iban/${e.target.value}`, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            // console.log(decrypted)
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
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setBankCity(decrypted?.bicDetails?.structured_address?.town_name[0] + decrypted?.bicDetails?.structured_address?.town_name.slice(1).toLowerCase() ?? "")
                            setBankDetailsError("")
                        })
                        .catch(err => {
                            const decrypted = decryptData(err.response.data.data)
                            // console.log(decrypted)
                            if (decrypted?.message === "Unauthorize to access this route") {
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                window.location.pathname = "/login";
                            }
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
                        })
                } else {
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
                }
            } else {
                setAccNumType("Swift")
                if (e.target.value.length > 7) {
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
                            setBankCountry(decrypted?.bicDetails?.structured_address?.country_name[0] + decrypted?.bicDetails?.structured_address?.country_name.slice(1).toLowerCase() ?? "")
                            setBankCountryCode(decrypted?.bicDetails?.structured_address?.country_code ?? "")
                            setBankCity(decrypted?.bicDetails?.structured_address?.town_name[0] + decrypted?.bicDetails?.structured_address?.town_name.slice(1).toLowerCase() ?? "")
                            setBankDetailsError("")
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
                            setBankCountry("")
                            setBankCountryCode("")
                            setBankCity("")
                        })
                } else {
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
                }
            }
        }, 2000);
    }

    // bank details
    useEffect(() => {
        if (formData.bank_name && formData.branch_name && formData.bank_account_number) {
            setCompletedBank(true)
        } else {
            setCompletedBank(false)
        }
    }, [formData])

    // mobile wallet details
    useEffect(() => {
        if (formData.mobile_wallet_name && formData.mobile_wallet_account_number) {
            setCompletedWallet(true)
        } else {
            setCompletedWallet(false)
        }
    }, [formData])

    // card details
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

                    setSelectedCountryDetails(decrypted?.data)
                } catch (error) {
                    const dec = decryptData(error.response.data.data)
                    if (dec?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    // console.log(decryptData(error.response.data.data))
                }
            }

            getChannels()
        }
    }, [countryId])

    const [services, setServices] = useState([])
    const [mobileProviders, setMobileProviders] = useState([])
    useEffect(() => {
        if (countryIsoCode) {
            const getChannels = async () => {
                axios.get(`${process.env.REACT_APP_THUNES_API}/services/${countryIsoCode}`, { headers: authHeader })
                    .then(res => {
                        // console.log(decryptData(res.data.data))
                        const decrypted = decryptData(res.data.data)
                        setServices(decrypted)

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
            }

            getChannels()
        }
    }, [countryIsoCode])

    return (
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
                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="last-name" type="text" placeholder='Last name' required pattern="[A-Za-z]+" title="(A to Z | a to z)" /*onKeyPress={handleChangeAlpha}*/ value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </FormGroup>
                        <FormGroup style={{ flex: 1, margin: 0 }}>
                            <Label className="col-form-label" htmlFor="address">{t("Company Address")}</Label>
                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="address" id="address" type="text" placeholder='Address line' value={formData.address} onChange={inputChangeHandler} />
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
                        <FormGroup style={{ flex: 1, margin: 0, minWidth: "250px" }}>
                            <Label className="col-form-label" htmlFor="city">{t("City")} <span className="req_star">*</span></Label>
                            {/* <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="city" type="text" placeholder='City/Town' onKeyPress={handleChangeAlpha} required name="city" value={formData.city} onChange={inputChangeHandler} /> */}
                            <CitiesDropDown country={country} userCity={city} setUserCity={setCity} styles={{ flex: 1, minWidth: "250px" }} disabled={~country} iso_3={countryCode} />
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
                        <FormGroup style={{ flex: 1, margin: 0 }}>
                            <Label className="col-form-label" htmlFor="email">{t("Company Email")}</Label>
                            <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} id="email" name="email" type="email" placeholder='Email Address' title="abc@xyz.com" value={formData.email} onChange={inputChangeHandler} />
                        </FormGroup>
                        <FormGroup style={{ flex: 1, margin: 0, transform: "translateY(-4px)" }}>
                            <Label className="col-form-label" htmlFor="mobile_number">{t("Company Phone No")} <span className="req_star">*</span></Label>
                            <PhoneInput
                                placeholder="Enter Phone number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e)}
                                country={countryCode?.toLowerCase() ?? "us"}
                                inputProps={{
                                    id: "mobile_number",
                                    name: "mobile_number"
                                }}
                                inputStyle={{
                                    width: "100%",
                                    flex: 1,
                                    minWidth: "250px",
                                    padding: "22px 15px 22px 48px",
                                    lineHeight: "1.5",
                                    border: "1px solid #ced4da"
                                }}
                                required
                            />
                        </FormGroup>
                        {/* <FormGroup style={{ flex: 1, margin: 0 }}>
                            <label className="col-form-label" htmlFor="relation">Relationship With Beneficiary</label>
                            <Input type="select" name="relation" value={formData.relation} onChange={inputChangeHandler}>
                                <option value="Family Support">Family Support</option>
                                <option value="Trade Related">Trade Related</option>
                                <option value="Goods">Goods</option>
                                <option value="Services">Services</option>
                                <option value="Charity Donations">Charity Donations</option>
                                <option value="Operation Expenses">Operation Expenses</option>
                                <option value="Other">Other</option>
                            </Input>
                        </FormGroup> */}
                    </div>
                </FormGroup>
                <FormGroup className="mb-3">
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
                                selectedCountryDetails?.business_receiving_channels?.bank_account
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
                                selectedCountryDetails?.business_receiving_channels?.mobile_money
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
                                selectedCountryDetails?.business_receiving_channels?.card_payment
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
                            justifyContent: "center"
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
                                justifyContent: "center"
                            }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActive(5)
                                }}>
                                <p style={{ padding: 0, margin: 0 }}>{t("InstaPay Account")}</p>
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
                                selectedCountryDetails?.business_receiving_channels?.cash_pickup
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
                                <Label className="col-form-label" htmlFor="bank_account_number">{t("IBAN / SWIFT Code")} </Label>
                                {/* <div style={{ display: "flex", gap: ".5rem" }}> */}
                                <Input className="form-control" style={{ minWidth: "150px" }} type="select" value={accNumType} onChange={e => setAccNumType(e.target.value)}>
                                    <option value="IBAN">IBAN</option>
                                    <option value="Swift">Swift/BIC Code</option>
                                </Input>
                                {/* </div> */}
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0, position: "relative" }}>
                                <Label className="col-form-label" htmlFor="bank_account_number">{accNumType === "IBAN" ? t("IBAN Number") : t("Swift Code")}</Label>
                                <Input className="form-control" style={{ flex: 1, width: "100%", minWidth: "250px" }} placeholder={accNumType === "IBAN" ? "IBAN Number" : "Swift Code"} required name="bank_account_number" id="bank_account_number" value={ibanSwift} onChange={getBankDetails} maxLength={34} min={8} />
                                {
                                    bankDetailsError && <span style={{ color: "red", position: "absolute", bottom: "-25px", left: "10px" }} > {bankDetailsError}</span>
                                }
                            </FormGroup>
                            {
                                country?.toLowerCase() === "united states"
                                &&
                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                    <Label className="col-form-label" >{t("Routing/ABA Number")}</Label>
                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required /*readOnly*/ />
                                </FormGroup>
                            }
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Account Number")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required /*readOnly={accNumType === "IBAN"}*/ value={formData.bank_account_number} name="bank_account_number" onChange={inputChangeHandler} disabled={ibanSwift.length < 8} />
                            </FormGroup>
                            {
                                accNumType === "IBAN"
                                &&
                                <FormGroup style={{ flex: 1, margin: 0 }}>
                                    <Label className="col-form-label" >{t("Account Holder Name")}</Label>
                                    <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="account_holder_name" type="text" value={formData.account_holder_name} onChange={inputChangeHandler} required /*readOnly*/ />
                                </FormGroup>
                            }
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Bank Name")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="bank_name" type="text" required /*readOnly*/ value={formData.bank_name} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Branch Name")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} name="branch_name" type="text" required /*readOnly*/ value={formData.branch_name} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Branch Street")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_branch_street" required /*readOnly*/ value={formData.bank_branch_street} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("City")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" name="bank_city" required /*readOnly*/ value={formData.bank_city} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Province")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required /*readOnly*/ name="bank_province" value={formData.bank_province} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Postal Code")}</Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" required /*readOnly*/ value={formData.bank_postal_code} name="bank_postal_code" onChange={inputChangeHandler} />
                            </FormGroup>
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
                                <Label className="col-form-label">{t("Mobile Money Provider")}</Label>
                                <Input type="select" className="form-control" style={{ flex: 1, minWidth: "250px" }} value={formData.mobile_wallet_provider} onChange={inputChangeHandler} name="mobile_wallet_provider">
                                    {
                                        mobileProviders.map(item => (
                                            <option value={item?.id}>{item?.name}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" >{t("Company Account Name")} <span className="req_star">*</span></Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} type="text" placeholder='Wallet Name' required id="account_holder_name" name="mobile_wallet_name" value={formData.mobile_wallet_name} onChange={inputChangeHandler} />
                            </FormGroup>
                            <FormGroup style={{ flex: 1, margin: 0 }}>
                                <Label className="col-form-label" htmlFor="mobile_wallet_account_number">{t("Wallet Number")} <span className="req_star">*</span></Label>
                                <Input className="form-control" style={{ flex: 1, minWidth: "250px" }} placeholder='Account Number' required onKeyPress={handleChangeNumber} name="mobile_wallet_account_number" value={formData.mobile_wallet_account_number} onChange={inputChangeHandler} />
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
                                    <option value="Bitcoin">Bitcoin</option>
                                    <option value="Ethereum">Ethereum</option>
                                    <option value="Other">Other</option>
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
                                    <Input className="form-control" value={cashPickupNumber} onChange={e => setCashPickupNumber(e.target.value)} name="crypto_wallet_address" style={{ flex: 1, minWidth: "250px" }} placeholder="ABCD12345WAD2" disabled={!mobileNumber || mobileNumber.length < 9} readOnly={!mobileNumber || mobileNumber.length < 9} />
                                </FormGroup>
                            </div>
                            {
                                !mobileNumber || mobileNumber.length < 9
                                &&
                                <span>Must add phone number to enable these fields.</span>
                            }
                        </>
                    }
                </FormGroup>
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
                        duplicateWallet || walletError || !companyName || !country || !city || mobileNumber.length < 9 || (!completedBank && !completedCard && !completedCrypto && !completedWallet && !cashPickupCompleted && instapayWallets.some(item => item.length < 8 || item.length > 8))
                    }
                    onClick={addBeneficiaryHandler}
                >
                    Add Company
                </Button>
                <ConfirmationModal isOpen={showConfirmation} toggle={() => setShowConfirmation(!showConfirmation)} onConfirm={changeUserDetailsAsPerBankDetails} onCancel={onCancelHandler} />
            </CardFooter>
        </>
    )
}

export default BusinessAccount;