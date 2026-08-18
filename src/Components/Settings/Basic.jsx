import DateMomentUtils from '@date-io/moment';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import axios from 'axios';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, CardFooter, CardHeader, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import SuccessModal from '../AddBeneficiary/SuccessModal';
import CitiesDropDown from '../CitiesDropDown';
import citiesData from "../CitiesDropDown/CitiesData.json";
import countryAlpha2Map from "../AddFunds/WalletFund/countries_iso2.json";
import countriesData from "../PaymentsNewer/CountriesData.json";
import PhoneInput from '../PhoneInput';
import CountryBasedPhone from "../PhoneInput/PhoneNumberBasedOnCountry.json";
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation';
import NextStepModal from './NextStepModal';
import QrGenerate from './QrGenerate';
import { usePermission } from '../../hooks/GeneralUse/usePermission';
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../utils/Functions/apiWrapper';
import { POSTAL_CODE_FORMATS, postalCodeRegex } from '../../Data/CountriesWithTranslations/PostalCode';


export const currentDate = new Date();
export const minDate = new Date(currentDate.getFullYear() - 15, currentDate.getMonth(), currentDate.getDate());
let timeout;

const Basic = ({ setCurrentTab }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader, missingTabsData, userWallets, setUserDetails } = useContext(UserContext);
    const [company, setCompany] = useState('');
    const [username, setUsername] = useState(userDetails?.username ?? "");
    const [phone, setPhone] = useState(userDetails?.phone ?? "");
    const [email, setEmail] = useState(userDetails?.email);
    const [firstName, setFirstName] = useState(userDetails?.user?.first_name);
    const [lastName, setLastName] = useState(userDetails?.user?.last_name);
    const [gender, setGender] = useState(userDetails?.gender ?? "");
    const [dateOfBirth, setDateOfBirth] = useState(userDetails?.dob ?? "");
    const [address, setAddress] = useState(userDetails?.address);
    const [city, setCity] = useState(userDetails?.city);
    const [postalCode, setPostalCode] = useState(userDetails?.postal_code);
    const [state, setState] = useState(userDetails?.state ?? "");
    const [stateCode, setStateCode] = useState(userDetails?.state_code ?? userDetails?.stateCode ?? "");
    const [country, setCountry] = useState(userDetails?.country_iso_code);
    const [aboutMe, setAboutMe] = useState(userDetails?.about_me);
    const [timezone, setTimezone] = useState(userDetails?.timezone)
    const [usernameValid, setUsernameValid] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [usernameError, setUserNameError] = useState("")
    const [codeType, setCodeType] = useState("")
    const [otpType, setOtpType] = useState("")
    const [showNextStepModal, setShowNextStepModal] = useState(false)
    const [loading, setLoading] = useState()
    const can = usePermission()
    useEffect(() => {
        setCodeType("sms")
    }, [userDetails])
    const isKycApproved = useMemo(() => userDetails?.user?.kyc_status === "approved" || userDetails?.user?.kyc_status === "verified" || userDetails?.kyc_status === "approved" || userDetails?.kyc_status === "verified", [userDetails])
    const isKybApproved = useMemo(() => userDetails?.company?.kyb_status === "approved" || userDetails?.kyb_status === "approved", [userDetails])
    const isVerified = useMemo(() => isKycApproved || isKybApproved, [isKycApproved, isKybApproved])

    const { data: statesResponse, isLoading: isStatesLoading } = useQuery({
        queryKey: ['country-states', 'US'],
        queryFn: () => apiWrapper({
            endpoint: '/api/country/get-states/US',
            isPublic: true
        }),
        enabled: country === 'USA',
        retry: 1
    })

    const states = useMemo(() => {
        const responseStates = Array.isArray(statesResponse)
            ? statesResponse
            : statesResponse?.States || statesResponse?.states || statesResponse?.data || []

        return responseStates.map((item) => ({
            value: item?.state_name || item?.name || item?.state || item?.state_code || item?.code || item?.iso_code || item,
            label: item?.state_name || item?.name || item?.state || item?.state_code || item?.code || item,
            isoCode: (item?.isoCode || item?.iso_code || item?.state_code || item?.code || '').replace('US-', '')
        }))
    }, [statesResponse])

    useEffect(() => {
        if (country !== 'USA') {
            setState('')
            setStateCode('')
            return
        }

        if (state && !stateCode) {
            const selectedState = states.find(item => item.value === state || item.isoCode === state)
            if (selectedState?.isoCode) setStateCode(selectedState.isoCode)
        }
    }, [country, state, stateCode, states])

    const refreshUserState = useCallback((field, value) => {
        setUserDetails(prev => {
            if (!prev) return prev;
            const next = { ...prev };

            const nestedUserFields = ["first_name", "last_name", "dob"];

            if (nestedUserFields.includes(field)) {
                if (field === "first_name") next.first_name = value
                if (field === "last_name") next.last_name = value
                if (field === "dob") next.dob = value
                next.user = { ...(next.user || {}), [field]: value };
            } else if (field === "company_name") {
                next.company_name = value
                next.company = { ...(next.company || {}), company_name: value };
            } else {
                next[field] = value;
            }

            return next;
        });
    }, [setUserDetails]);

    const handleDateChange = (date) => {
        if (date) {
            const selected = new Date(date);
            if (selected <= minDate) {
                setDateOfBirth(date.format("YYYY-MM-DD"));
            } else {
                toast.error(t('Please select a date at least 15 years ago or earlier.'));
            }
        } else {
            setDateOfBirth("");
        }
    };

    const checkUsername = (value) => {
        setUserNameError("")
        if (value === userDetails?.username) {
            setUsernameValid(true)
            return;
        };
        setUsernameValid(false)
        setLoading(true)
        const data = {
            username: value
        }

        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/username-check`, {
            data: encrypted
        }, {
            headers: authHeader,
            timeout: 15000
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setUsernameValid(decrypted.status)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                if (decrypted.message.toLowerCase().includes("already")) {
                    setUsernameValid(decrypted.status)
                    setUserNameError("Username not available.")
                }
            }).finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        setEmail(userDetails?.email)
        setPhone(userDetails?.phone)
        setCompany(userDetails?.company?.company_name)
        setFirstName(userDetails?.user?.first_name)
        setLastName(userDetails?.user?.last_name)
        setUsername(userDetails?.username)
        setAddress(userDetails?.address)
        setCity(userDetails?.city ?? "")
        setPostalCode(userDetails?.postal_code)
        setState(userDetails?.state ?? "");
        setStateCode(userDetails?.state_code ?? userDetails?.stateCode ?? "");
        setCountry(userDetails?.country_iso_code ?? "")
        setAboutMe(userDetails?.about_me)
        setGender(userDetails?.gender)
        setTimezone(userDetails?.timezone)
        if (userDetails?.dob) {
            const [day, month, year] = userDetails.dob.split("-");
            setDateOfBirth(`${year}-${month}-${day}`);
        } else {
            setDateOfBirth("");
        }
    }, [userDetails, isEditMode])

    const updateUsername = () => {
        if (username) {
            const data = {
                username
            }

            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-username/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader,
                timeout: 15000
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    refreshUserState("username", username)
                    // console.log(decrypted)
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                })
        }
    }

    const [otpToken, setOtpToken] = useState("")
    const sendOtp = async (type = "") => {
        setIsSaving(true)
        setOtpType(type === "email" ? "email" : "phone")

        if (type === "email") {
            if (!email) return false
        } else {
            if (!phone) return false
        }

        try {
            const body = {
                [type]: type === "email" ? email : phone,
                account_id: userDetails?._id,
                authenticator: codeType === "authenticator"
            }
            // console.log(body)
            const encrypted = encryptData(body)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-${type}-otp`, {
                data: encrypted
            }, {
                headers: authHeader,
                timeout: 15000
            })

            const data = decryptData(res.data.data)
            // console.log(data)
            setOtpToken(data?.token)
            setShowOtp(true)
        } catch (err) {
            const error = decryptData(err.response.data.data)
            toast.error(error.message ?? "Something went wrong while sending otp to your " + type)
        }
        setIsSaving(false)
    }


    const editProfileHandler = () => {
        setIsSaving(true)
        if (!usernameError && usernameValid && !isVerified && userDetails.username !== username) {
            updateUsername()
        }

        if (userDetails?.account_type === "individual") {
            const data = isVerified ? { about_me: aboutMe } : {
                first_name: firstName,
                last_name: lastName,
                address,
                city,
                state,
                postal_code: postalCode,
                about_me: aboutMe,
                // gender,
                dob: dateOfBirth !== userDetails?.dob ? dateOfBirth?.split("-")?.reverse()?.join("-") : dateOfBirth,
                timezone: timezone

            }
            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-${userDetails?.account_type}/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader,
                timeout: 15000
            })
                .then(res => {
                    setIsEditMode(false)
                    setIsSaving(false)

                    refreshUserState("first_name", firstName)
                    refreshUserState("last_name", lastName)
                    refreshUserState("address", address)
                    refreshUserState("city", city)
                    refreshUserState("state", state)
                    refreshUserState("postal_code", postalCode)
                    refreshUserState("about_me", aboutMe)
                    const newDob = dateOfBirth ? dateOfBirth.split("-").reverse().join("-") : "";
                    refreshUserState("dob", newDob)
                    refreshUserState("timezone", timezone)

                    if (missingTabsData.length > 0) {
                        setShowNextStepModal(true)
                    }
                })
                .catch(err => {
                    setIsSaving(false)
                })
        }
        if (userDetails?.account_type === "business") {
            const data = isVerified ? { about_me: aboutMe } : {
                company_name: company,
                address,
                city,
                state,
                postal_code: postalCode,
                about_me: aboutMe,
                // gender,
                timezone: timezone
            }
            // console.log(data)

            const encrypted = encryptData(data)

            axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/account/update-business/${userDetails?._id}`, {
                data: encrypted
            }, {
                headers: authHeader,
                timeout: 15000
            })
                .then(res => {
                    setIsEditMode(false)
                    setIsSaving(false)

                    refreshUserState("company_name", company)

                    refreshUserState("address", address)
                    refreshUserState("city", city)
                    refreshUserState("state", state)
                    refreshUserState("postal_code", postalCode)
                    refreshUserState("about_me", aboutMe)
                    refreshUserState("timezone", timezone)

                    if (missingTabsData.length > 0) {
                        setShowNextStepModal(true)
                    }
                })
                .catch(err => {
                    setIsSaving(false)
                })
        }
    }

    const [availableTimezones, setAvailableTimezones] = useState([])

    useEffect(() => {
        if (userDetails?.country_iso_code) {
            const getCountryTimezones = async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/get-timezones/${userDetails?.country_iso_code}`, {
                        headers: authHeader,
                        timeout: 15000
                    })
                    const data = decryptData(res.data.data)
                    setAvailableTimezones(data?.timezones)
                    // console.log("timezones", data)
                } catch (err) {
                    // console.log(decryptData(err.response.data.data))
                }
            }

            getCountryTimezones()
        }
    }, [userDetails])

    const verifyOTP = async (setter, type = "", otp) => {
        setIsSaving(true)
        try {
            const data = {
                token: otpToken,
                otp,
                [type]: type === "email" ? email : phone,
                account_id: userDetails?._id
            }
            // console.log(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-${type}-otp`, {
                data: encryptData(data)
            }, {
                headers: authHeader,
                timeout: 15000
            })

            const dec = decryptData(res.data.data)
            if (type === "email") {
                refreshUserState("email", email)
            } else if (type === "phone") {
                refreshUserState("phone", phone)
            }

            editProfileHandler()
            setter(true)
            // console.log(dec)
        } catch (err) {
            const dec = decryptData(err.response.data.data)
            console.log(err)
            toast.error(dec?.message || "Something went wrong while verifying otp!")
            // console.log(decryptData(err.response.data.data))
        }
        setIsSaving(false)
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const editmode = queryParams.get("editmode")
    const tab = queryParams.get("tab")

    useEffect(() => {
        setIsEditMode(editmode)
    }, [editmode])

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        if (value.length > 30) return;
        if (/^[a-zA-Z0-9_]*$/.test(value)) {
            setUsername(value?.trim()?.toLowerCase());
            if (timeout) {
                clearTimeout(timeout)
            }
            if (value.length >= 6) {
                timeout = setTimeout(() => {
                    checkUsername(value?.trim()?.toLowerCase())
                }, 1000)
            } else {
                setUsernameValid(false)
                setUserNameError("User name must be atleast 6 characters.")
            }
        }
    }

    const [showUsernameGuide, setShowUsernameGuide] = useState(false)

    const handleSaveClick = () => {
        const dialCode = String(CountryBasedPhone[country].dial_code)?.replace("+", "")

        const filterNumber = (num) => {
            if (typeof num === "string") {
                const withoutDialCode = num.replace(dialCode, "")
                return withoutDialCode ? withoutDialCode : undefined
            } else {
                num ? num : undefined
            }
        }



        if (userDetails?.account_type === "individual") {
            if (!email) return editProfileHandler()
            return userDetails?.email === email ? editProfileHandler() : sendOtp("email")
        }
        if (userDetails?.account_type === "business") {
            return filterNumber(userDetails?.phone) === filterNumber(phone) ? editProfileHandler() : sendOtp("phone")
        }
    }

    const isAfricanCountry = useMemo(() => {
        if (!country) return false;

        const countryData = citiesData.find(
            item =>
                item.iso3 === country ||
                item.alpha3 === country ||
                item.alpha2 === country
        );

        return countryData?.region === "Africa";
    }, [country]);



    const selectedCountry = useMemo(() => {
        return countriesData.find(
            item =>
                item.alpha3 === country ||
                item.alpha2 === country ||
                item.iso3 === country
        );
    }, [country]);

    const countryAlpha2 = useMemo(() => {
        if (!country) return undefined;

        const normalized = String(country).toUpperCase();

        if (countryAlpha2Map[normalized]) {
            return countryAlpha2Map[normalized];
        }

        if (selectedCountry?.alpha2) {
            return selectedCountry.alpha2;
        }

        if (normalized.length === 2) {
            return normalized;
        }

        return undefined;
    }, [country, selectedCountry]);

    const getPostalCodeRegex = (countryCode) => {
        if (!countryCode) return null;

        return postalCodeRegex[countryCode.toUpperCase()] || null;
    };

    const isPostalCodeValid = useMemo(() => {
        if (!postalCode?.trim()) {
            return isAfricanCountry;
        }

        if (!countryAlpha2) {
            return false;
        }

        
        return true
    }, [postalCode, countryAlpha2, isAfricanCountry]);

    console.log({
        country,
        selectedCountry,
        countryAlpha2,
        postalCode,
        isPostalCodeValid
    });
    return (
        <MuiPickersUtilsProvider utils={DateMomentUtils}>
            <Card>
                {
                    userDetails?.username
                        ?
                        <QrGenerate
                            wallets={userWallets?.filter(item => !item?.qrCode?.url)}
                        />
                        :
                        ""
                }
                <SuccessModal
                    isOpen={showSuccess}
                    message={"Profile Updated"}
                    subMessage={"Profile has been updated successfully!"}
                    toggle={() => {
                        setShowSuccess(false)
                        if (missingTabsData.length > 0) {
                            setShowNextStepModal(true)
                        }
                    }}
                />
                <NextStepModal
                    isOpen={showNextStepModal}
                    toggle={() => setShowNextStepModal(false)}
                    setCurrentTab={setCurrentTab}
                />
                <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                    <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                    <ModalBody>
                        <OTPConfirmation
                            type={userDetails?.account_type === "individual" ? "email" : "phone"}
                            callback={verifyOTP}
                            setter={setShowSuccess}
                            setterValue={true}
                            hideOtp={() => setShowOtp(false)}
                            processing={isSaving}
                            resendHandler={sendOtp}
                            authType={codeType}
                            setAuthType={setCodeType}
                            showAuthToggle={false}
                            hideTfaSwitch={true}
                            otpTypeOnProfile={otpType}
                            inBasic={true}
                        />
                    </ModalBody>
                </Modal>
                <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
                    <h4 style={{ width: "50%" }}>{t("Basic Info")}</h4>
                </CardHeader>
                <CardBody>
                    {
                        userDetails?.account_type === "individual"
                            ?
                            <>
                                <FormGroup style={{ position: "relative" }}>
                                    {
                                        !firstName
                                        &&
                                        <div style={{
                                            height: "9px",
                                            width: "9px",
                                            borderRadius: "9px",
                                            background: "red",
                                            position: "absolute",
                                            bottom: "20px",
                                            right: "-17px"
                                        }}></div>
                                    }
                                    <Label>
                                        {t("First Name")}
                                        {!firstName && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                                    </Label>
                                    <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={firstName} onChange={e => setFirstName(e.target.value)} />
                                </FormGroup>
                                <FormGroup style={{ position: "relative" }}>
                                    {
                                        !lastName
                                        &&
                                        <div style={{
                                            height: "9px",
                                            width: "9px",
                                            borderRadius: "9px",
                                            background: "red",
                                            position: "absolute",
                                            bottom: "20px",
                                            right: "-17px"
                                        }}></div>
                                    }
                                    <Label>
                                        {t("Last Name")}
                                        {!lastName && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                                    </Label>
                                    <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={lastName} onChange={e => setLastName(e.target.value)} />
                                </FormGroup>
                            </>
                            :
                            <FormGroup style={{ position: "relative" }}>
                                {
                                    !company
                                    &&
                                    <div style={{
                                        height: "9px",
                                        width: "9px",
                                        borderRadius: "9px",
                                        background: "red",
                                        position: "absolute",
                                        bottom: "20px",
                                        right: "-17px"
                                    }}></div>
                                }
                                <Label>
                                    {t("Company Name")}
                                    {!company && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                                </Label>
                                <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={company} onChange={e => setCompany(e.target.value)} />
                            </FormGroup>
                    }
                    <FormGroup style={{ position: "relative" }}>
                        {
                            !username
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                top: "30px",
                                right: "-17px"
                            }}></div>
                        }
                        {
                            isEditMode
                            &&
                            <div style={{
                                position: "absolute",
                                top: "0px",
                                right: "5px",
                                fontSize: ".8rem",
                                fontWeight: 600
                            }}>
                                {username?.length ?? 0}{t("/30 Chars")}
                            </div>
                        }
                        <Label>
                            {t("Username")}
                            {!username && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                        </Label>
                        <div style={{ position: "relative" }}>
                            <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} style={{
                                borderColor: (!isEditMode || isVerified) ? "#eeeeee" : usernameValid ? "green" : "red",
                            }} value={username} onChange={handleUsernameChange} onFocus={() => setShowUsernameGuide(true)} onBlur={() => setShowUsernameGuide(false)} />


                            {loading &&
                                <div style={{ position: "absolute", right: "7px", top: "7px" }}>
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border" color='primary' role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        {
                            (username && usernameError) &&
                            <div style={{ fontSize: ".8rem", fontWeight: 600, color: "red", marginTop: "5px" }}>{usernameError}</div>
                        }
                        {
                            showUsernameGuide
                            &&
                            <div style={{
                                padding: "1rem",
                                borderRadius: "10px",
                                background: "#5926f0f3",
                                color: "white",
                                marginTop: "1rem"
                            }}>
                                {t("Username may includes only alphabets, numbers and _ (underscores).")}
                            </div>
                        }
                    </FormGroup>
                    <FormGroup style={{ position: "relative" }}>
                        {/* {
                        !aboutMe
                        &&
                        <div style={{
                            height: "9px",
                            width: "9px",
                            borderRadius: "9px",
                            background: "red",
                            position: "absolute",
                            bottom: "20px",
                            right: "-17px"
                        }}></div>
                    } */}
                        <Label>{t("About Me")}</Label>
                        <Input disabled={!isEditMode} readOnly={!isEditMode} type='textarea' value={aboutMe} onChange={e => setAboutMe(e.target.value)} />
                    </FormGroup>
                    {
                        userDetails?.gender
                        &&
                        <FormGroup style={{ position: "relative" }}>
                            {
                                !gender
                                &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label>
                                {t("Gender")}
                                {!gender && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                            </Label>
                            <Input disabled={true} readOnly={true} value={gender} onChange={e => setGender(e.target.value)} />
                            {/* <Input type='select' disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">{t("--Select-Gender--")}</option>
                            <option value="male">{t("Male")}</option>
                            <option value="female">{t("Female")}</option>
                            <option value="other">{t("Other")}</option>
                        </Input> */}
                        </FormGroup>
                    }
                    {userDetails?.account_type === "individual" && (
                        <FormGroup style={{ position: "relative" }}>
                            {!dateOfBirth &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label>
                                {t("Date Of Birth")}
                                {!dateOfBirth && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                            </Label>
                            {!isEditMode
                                ? <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={dateOfBirth} />
                                : <DatePicker
                                    format="YYYY/MM/DD"
                                    className="form-control custom-datepicker"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e9e9e9",
                                        borderRadius: "6px",
                                        boxShadow: "none",
                                        padding: "0px",
                                        display: 'flex',
                                        justifyContent: "center",
                                        position: "static"
                                    }}
                                    value={dateOfBirth || null}
                                    onChange={handleDateChange}
                                    placeholder="YYYY/MM/DD"
                                    maxDate={minDate}
                                    disabled={!isEditMode || isVerified}
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            background: isVerified ? "#e9ecef" : '#fff',
                                            border: 'none',
                                            boxShadow: 'none',
                                            padding: '0 10px',
                                            minHeight: '40px',
                                            fontWeight: 500,
                                        }
                                    }}
                                    inputProps={{
                                        style: {
                                            background: isVerified ? "#e9ecef" : '#fff',
                                            border: 'none',
                                            boxShadow: 'none',
                                            padding: '2px 0px',
                                            minHeight: '40px',
                                        }
                                    }}
                                    clearable
                                    autoOk
                                />
                            }
                        </FormGroup>
                    )}
                    <FormGroup style={{ position: "relative" }}>
                        {
                            (!email && userDetails?.account_type !== "individual")
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>{t("Email Address")}  {
                            (!email && userDetails?.account_type !== "individual")
                            && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                        <Input disabled={!isEditMode || isKybApproved} readOnly={!isEditMode || isKybApproved} value={email} onChange={e => setEmail(e.target.value)} />
                    </FormGroup>
                    <FormGroup style={{ position: "relative" }}>
                        {
                            (!phone && userDetails?.account_type !== "business")
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>{t("Phone Number")} {
                            (!phone && userDetails?.account_type !== "business")
                            && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                        <PhoneInput
                            phone={phone}
                            country={countriesData.find(item => item.alpha3 === country)?.alpha3}
                            disableDropdown={true}
                            setPhone={setPhone}
                            disabled={!isEditMode || isKycApproved}
                            customStyles={{
                                width: "100%",
                                background: (!isEditMode || isKycApproved) ? "#e9ecef" : "white",
                                alignItems: "center"
                            }}
                        />
                        {/* <Input disabled={1 + 1 === 2} readOnly={1 + 1 === 2} value={phone} onChange={e => setPhone(e.target.value)} /> */}
                    </FormGroup>
                    {
                        <FormGroup style={{ position: "relative" }}>
                            {
                                !address
                                &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label>{t("Address")}  {
                                !address
                                && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                            <Input disabled={!isEditMode || isVerified} readOnly={!isEditMode || isVerified} value={address} onChange={e => setAddress(e.target.value)} />
                        </FormGroup>
                    }

                    <FormGroup style={{ position: "relative" }}>
                        {
                            !country
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>{t("Country")}   {
                            !country
                            && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                        <Input disabled={true} readOnly={true} value={countriesData.find(item => item.alpha3 === country).name} onChange={e => setCountry(e.target.value)} />
                    </FormGroup>
                    {country === "USA" && (
                        <FormGroup style={{ position: "relative" }}>
                            {!state && (
                                <div
                                    style={{
                                        height: "9px",
                                        width: "9px",
                                        borderRadius: "9px",
                                        background: "red",
                                        position: "absolute",
                                        bottom: "20px",
                                        right: "-17px"
                                    }}
                                ></div>
                            )}

                            <Label>
                                {t("State")}
                                {!state && (
                                    <span style={{ color: "red" }}>
                                        {t("(Required)")}
                                    </span>
                                )}
                            </Label>

                            <Input
                                type="select"
                                disabled={!isEditMode || isVerified}
                                value={state}
                                onChange={(e) => {
                                    const selectedState = states.find(item => item.value === e.target.value)
                                    setState(e.target.value)
                                    setStateCode(selectedState?.isoCode || '')
                                    setCity('')
                                }}
                            >
                                <option value="">{isStatesLoading ? t("Loading...") : t("--Select-State--")}</option>
                                {states.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    )}
                    <FormGroup style={{ position: "relative" }}>
                        {
                            !city
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>{t("City")}   {
                            !city
                            && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                        <CitiesDropDown country={country === "Cabo Verde" ? "Cape Verde" : country} setUserCity={setCity} userCity={city} disabled={!isEditMode || isVerified || (country === 'USA' && !stateCode)} iso_3={country} stateCode={stateCode} requireState={country === 'USA'} />
                    </FormGroup>
                    {country === "USA" && (
                        <FormGroup style={{ position: "relative" }}>
                            {!state && (
                                <div
                                    style={{
                                        height: "9px",
                                        width: "9px",
                                        borderRadius: "9px",
                                        background: "red",
                                        position: "absolute",
                                        bottom: "20px",
                                        right: "-17px"
                                    }}
                                ></div>
                            )}

                            <Label>
                                {t("State")}
                                {!state && (
                                    <span style={{ color: "red" }}>
                                        {t("(Required)")}
                                    </span>
                                )}
                            </Label>

                            <Input
                                type="select"
                                disabled={!isEditMode || isVerified}
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            >
                                <option value="">{isStatesLoading ? t("Loading...") : t("--Select-State--")}</option>
                                {states.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    )}
                    <FormGroup style={{ position: "relative" }}>
                        {
                            !timezone
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>{t("Timezone")}  {
                            !timezone
                            && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                        {/* {
                        isEditMode
                            ? */}
                        <Input disabled={!isEditMode || isVerified} value={timezone} onChange={e => setTimezone(e.target.value)} type='select'>
                            <option value="">{t("--Select-Your-Timezone--")}</option>
                            {
                                availableTimezones.map(i => (
                                    <option value={i?.split(" GMT")?.[0]}>{i}</option>
                                ))
                            }
                        </Input>
                        {/* :
                            <Input disabled={1 + 1 === 2} readOnly={1 + 1 === 2} value={timezone} />
                    } */}
                    </FormGroup>

                    <FormGroup style={{ position: "relative" }}>
                        {
                            !userDetails?.postal_code && !isAfricanCountry
                            &&
                            <div style={{
                                height: "9px",
                                width: "9px",
                                borderRadius: "9px",
                                background: "red",
                                position: "absolute",
                                bottom: "20px",
                                right: "-17px"
                            }}></div>
                        }
                        <Label>
                            {t("Postal Code")}
                            {(!userDetails?.postal_code && !isAfricanCountry) && <span style={{ color: "red" }}>{t("(Required)")}</span>}
                        </Label>
                        <Input
                            disabled={!isEditMode || isVerified}
                            readOnly={!isEditMode || isVerified}
                            value={postalCode || ""}
                            onChange={(e) => {
                                setPostalCode(e.target.value);
                            }}
                            placeholder={
                                countryAlpha2
                                    ? POSTAL_CODE_FORMATS[countryAlpha2] || ""
                                    : ""
                            }
                        />
                        {postalCode && !isPostalCodeValid && (
                            <div
                                style={{
                                    color: "red",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    marginTop: "5px"
                                }}
                            >
                                {t("Invalid postal code format.")}
                            </div>
                        )}
                    </FormGroup>

                </CardBody>
                <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    {
                        isEditMode
                            ?
                            <>
                                <Button style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }} onClick={() => setIsEditMode(false)} disabled={isSaving}>{t("Cancel")}</Button>
                                <Button style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }} onClick={handleSaveClick}
                                    // (userDetails?.account_type === "individual" ? !firstName || !lastName : !company) || !address || !city || !country || !email || !phone || !postalCode || !timezone || !username || !usernameValid || phone.length < 8
                                    disabled={
                                        isSaving ||
                                        (!isVerified && (
                                            usernameError ||
                                            !usernameValid ||
                                            !city ||
                                            !username ||
                                            (country === "USA" && !state?.trim()) ||
                                            (userDetails?.account_type === "business" && !company?.trim()) ||
                                            (!isAfricanCountry && !postalCode?.trim()) ||
                                            !isPostalCodeValid
                                        ))
                                    }>
                                    {
                                        isSaving
                                            ?
                                            t("Saving")
                                            :
                                            t("Save")
                                    }
                                </Button>
                            </>
                            :
                            (can("settings.basic-info.update") && (<Button style={{
                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                border: "none",
                                outline: "none",
                                borderRadius: "10px"
                            }} onClick={() => setIsEditMode(true)}>{t("Edit Profile")}</Button>))
                    }
                </CardFooter>
            </Card>
        </MuiPickersUtilsProvider >
    )
}

export default Basic
