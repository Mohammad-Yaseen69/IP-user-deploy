import { AlertTriangle, Camera, ChevronLeft, ChevronRight, Eye, EyeOff, Info, Upload, XCircle } from "react-feather"
import styles from "./styles/index.module.css"
import { Link, useNavigate, useParams } from "react-router-dom"
import FormLogo from "./FormLogo"
import { useContext, useEffect, useRef, useState } from "react"
import IndividualSVG from "./Individual.svg"
import BusinessSVG from "./Business.svg"
import otp from "./files/otp.svg"
import Wizard from "./Wizard"
import Check from "./Check.svg"
import Cross from "./Cross.svg"
import { Input, Label, Modal, ModalBody } from "reactstrap"
import countries from "../PaymentsNewer/CountriesData.json"
// import PhoneInput from "react-phone-input-2"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { UserContext } from "../../Context/UserContext"
import { countries as countriesList } from "country-list-json"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import success from "./files/success.gif"
import signupAnim from "./files/signup_anim.gif"
import PhoneInput from "../PhoneInput"

const SIgnupForm = ({ step, setStep, setIsLoginForm, setRegistrationCompleted }) => {
    const { t } = useTranslation()
    const [isPressed, setIsPressed] = useState(false)
    const [selectedAccountType, setSelectedAccountType] = useState("")
    const [company, setCompany] = useState("")
    const [companyType, setCompanyType] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    // countries
    const [countrySearch, setCountrySearch] = useState("")
    const [country, setCountry] = useState(null)
    const [countryCode, setCountryCode] = useState("")
    const [allCountries, setAllCountries] = useState([])
    const [searchedCountries, setSearchedCountries] = useState(allCountries)
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const { authHeader } = useContext(UserContext)
    const [allowedCountries, setAllowedCountries] = useState([])
    const [dp, setDp] = useState(null)
    const [dpFile, setDpFile] = useState(null)

    useEffect(() => {
        const getRegistrationCountries = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/country/get-${selectedAccountType}-registration-countries`)
                const dec = decryptData(res.data.data)
                setAllowedCountries(dec?.Countries)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                // console.log(dec)
            }
        }

        if (selectedAccountType) {
            getRegistrationCountries()
        }
    }, [selectedAccountType])

    useEffect(() => {
        if (allowedCountries.length > 0) {
            const filtered = countries
                .filter(item => allowedCountries?.some(it => item.name.toLowerCase().includes(it?.country_name?.toLowerCase())))
                .map(item => {
                    const country = allowedCountries?.find(it => it?.country_iso_code === item.alpha3)
                    const alpha2 = countriesList.find(item => country?.country_name?.toLowerCase() === item?.name?.toLowerCase() || country?.country_name?.toLowerCase()?.includes(item?.name?.toLowerCase()))?.code
                    return {
                        ...item,
                        id: country?._id,
                        alpha2
                    }
                })
            setAllCountries(filtered)
        }
    }, [allowedCountries])

    /////////////////////////
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    // const [referralCode, setReferralCode] = useState("")
    const [agreedTcs, setAgreedTcs] = useState(false);
    const [agreedPP, setAgreedPP] = useState(false);
    // otp
    const [verified, setVerified] = useState(false)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [resendTimer, setResendTimer] = useState(90);
    const [resendTimerEmail, setResendTimerEmail] = useState(900);
    const [otpValuesPhone, setOTPValuesPhone] = useState(Array(numberOfFields).fill(''));
    const inputPhoneRefs = useRef(Array(numberOfFields).fill(null));
    const [isAnyFieldEmptyPhone, setIsAnyFieldEmptyPhone] = useState(true);

    // referrals
    const { code: ref_code } = useParams()
    const [referralCode, setReferralCode] = useState("")
    const [referralError, setReferralError] = useState("")
    // blacklist
    const [isBlackListed, setIsBlackListed] = useState(false)

    useEffect(() => {
        if (ref_code) {
            setReferralCode(ref_code.toLowerCase())
        }
    }, [ref_code])

    useEffect(() => {
        let debounceTimeout;

        if (referralCode) {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/check-referral-code/${referralCode}`)
                    .then(res => {
                        const decrypted = decryptData(res.data.data);
                        setReferralError("")
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data);
                        if (decrypted.message.toLowerCase().includes("invalid")) {
                            setReferralError("Invalid Referral code.")
                        }
                    });
            }, 1000);
        } else {
            setReferralError("")
        }

        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [referralCode])

    // functions
    const accTypeHandler = (type) => {
        setSelectedAccountType(type)
    }

    // otp
    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...otpValues];
        newOTPValues[index] = numericValue;
        setOTPValues(newOTPValues);
        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
    };

    const handleInputChangePhone = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...otpValuesPhone];
        newOTPValues[index] = numericValue;
        setOTPValuesPhone(newOTPValues);
        if (numericValue && index < numberOfFields - 1) {
            inputPhoneRefs.current[index + 1].focus();
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmptyPhone(isEmpty);
    };

    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (index > 0) {
                const newOTPValues = [...otpValues];
                newOTPValues[index] = '';
                setOTPValues(newOTPValues);
                setIsAnyFieldEmpty(true)
            }
        }
    };

    const handleInputKeyDownPhone = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValuesPhone[index] === '' && index > 0) {
                inputPhoneRefs.current[index - 1].focus();
            } else if (index > 0) {
                const newOTPValues = [...otpValuesPhone];
                newOTPValues[index] = '';
                setOTPValuesPhone(newOTPValues);
                setIsAnyFieldEmptyPhone(true)
            }
        }
    };

    useEffect(() => {
        if (countrySearch.length > 1) {
            setShowCountryDropdown(true)
            const filtered = allCountries.filter(item => item.name.toLowerCase().includes(countrySearch.toLowerCase()))
            setSearchedCountries(filtered)
        } else {
            setSearchedCountries(allCountries)
        }
    }, [countrySearch])

    // currentLocation

    useEffect(() => {
        if (allCountries.length > 0) {
            const getIPAddress = async () => {
                try {
                    const res = await axios.get(`https://ipinfo.io?token=${import.meta.env.VITE_IP_INFO_TOKEN}`)
                    const location = res.data;
                    if (location) {
                        const filteredCountry = allCountries.filter(item => item?.alpha2 === location?.country)?.[0]
                        setCountry(filteredCountry)
                        setCountryCode(filteredCountry?.alpha3)
                        if (!filteredCountry) {
                            setIsBlackListed(true)
                        } else {
                            setCountry(filteredCountry)
                            setCountryCode(filteredCountry?.alpha3)
                        }
                    }
                } catch (error) {
                    const ipRes = await fetch("https://api.ipify.org/?format=json")
                    const dataIp = await ipRes.json()
                    const ip = dataIp?.ip

                    // const res = await fetch("https://geolocation-db.com/json/")
                    if (ip) {
                        const res = await fetch(`https://ip-api.com/json/${ip}`)
                        const data = await res.json()
                        // console.log(data)
                        const filteredCountry = allCountries.filter(item => item.name.toLowerCase().includes(data?.country?.toLowerCase()))?.[0]
                        setCountry(filteredCountry)
                        setCountryCode(filteredCountry?.alpha3)
                        // console.log("filtered country", filteredCountry)
                        if (!filteredCountry) {
                            setIsBlackListed(true)
                        } else {
                            setCountry(filteredCountry)
                            setCountryCode(filteredCountry?.alpha3)
                        }
                    }
                }
            }

            function getUserCountryCode() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;

                            const geocodingApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

                            fetch(geocodingApiUrl)
                                .then(response => response.json())
                                .then(data => {
                                    // console.log("all_countries", allCountries)
                                    // console.log("user_country", data.countryName)
                                    const countryCode = data.countryCode;
                                    const filteredCountry = allCountries.filter(item => item.name.toLowerCase().includes(data.countryName.toLowerCase()))?.[0]
                                    setCountry(filteredCountry)
                                    setCountryCode(filteredCountry?.alpha3)
                                    // console.log("filtered_country", filteredCountry)
                                    if (!filteredCountry) {
                                        setIsBlackListed(true)
                                    } else {
                                        setCountry(filteredCountry)
                                        setCountryCode(filteredCountry?.alpha3)
                                    }
                                })
                                .catch(error => {
                                    // console.log('Error:', error);
                                });
                        },
                        function (error) {
                            getIPAddress()
                        }
                    );
                } else {
                    getIPAddress()
                }
                // console.log("signup function")
            }

            getUserCountryCode();
        }
    }, [allCountries]);


    // email and phone check
    const [emailError, setEmailError] = useState("")
    const [phoneError, setPhoneError] = useState("")

    const checkBusiness = () => {
        setEmailError("")
        setIsPressed(true)
        const data = { email }
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/business`, {
            data: encrypted
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    setEmailError("")
                    setStep(prev => prev + 1);
                }
            })
            .catch(error => {
                const decrypted = decryptData(error?.response?.data?.data)
                setPhoneError("Phone number/Email already in use.")
                if (decrypted.message === "Account not found!") {
                    setEmailError("")
                    setStep(prev => prev + 1);
                }
            })
            .finally(() => {
                setIsPressed(false)
            })
    }

    const checkIndividual = () => {
        setEmailError("")
        setPhoneError("")
        setIsPressed(true)
        const data = email.length > 0 ? { email, phone } : { phone }
        // console.log(data)
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/account-check/individual`, {
            data: encrypted
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.message === "Account not found!") {
                    setPhoneError("")
                    setEmailError("")
                    setStep(prev => prev + 1);
                }
            })
            .catch(error => {
                const decrypted = decryptData(error?.response?.data?.data)
                setPhoneError("Phone number/Email already in use.")
                if (decrypted.message === "Account not found!") {
                    setPhoneError("")
                    setEmailError("")
                    setStep(prev => prev + 1);
                }
            })
            .finally(() => {
                setIsPressed(false)
            })
    }


    // signin function 
    const navigate = useNavigate()
    const [token, setToken] = useState("")
    const [signupError, setSignupError] = useState("")

    const signup = (e) => {
        e.preventDefault()
        setIsPressed(true)
        if (selectedAccountType === "business") {

            const credentials = phone ? {
                email, company_name: company, password, country_iso_code: countryCode, country_name: country?.name, country: country?.id, category_id: companyType, phone
            } : { email, company_name: company, password, country_iso_code: countryCode, country_name: country?.name, country: country?.id, category_id: companyType };

            if (referralCode) {
                credentials.ref_code = referralCode
            }

            const encrypted = encryptData(credentials)

            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/registration/business`, {
                data: encrypted
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setToken(decrypted?.token)
                    if (decrypted.status === true) {
                        setIsPressed(false)
                        setStep(prev => prev !== 7 ? prev + 1 : prev)
                    }
                })
                .catch(error => {
                    const decrypted = decryptData(error?.response?.data?.data)
                    // console.log(decrypted)
                    setIsPressed(false)
                    setSignupError("Something went wrong while creating your account. Please try again later.")
                    if (decrypted.message === "Invalid referral code!") {
                        setSignupError("The referral code you've entered doesn't belongs to any account. Please try with a valid referral code.")
                    }
                    if (decrypted.message?.toLowerCase()?.includes("sending sms")) {
                        setSignupError("We were unable to send a verification code to your Phone Number. Please try again later.")
                    }
                    if (decrypted.message?.toLowerCase()?.includes("sending mail")) {
                        setSignupError("We were unable to send a verification code to your Email. Please try again later.")
                    }
                    if (decrypted.message === "Email already exist!") {
                        setEmailError("Email Taken.")
                        setStep(4)
                    }
                })
        }
        if (selectedAccountType === "individual") {
            const credentials = email ? {
                email, phone, first_name: firstName, last_name: lastName, password, country_iso_code: countryCode, country_name: country?.name, country: country?.id
            } : {
                phone, first_name: firstName, last_name: lastName, password, country_iso_code: countryCode, country_name: country?.name, country: country?.id
            }
            if (referralCode) {
                credentials.ref_code = referralCode
            }
            const encrypted = encryptData(credentials)

            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/registration/individual`, {
                data: encrypted
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setToken(decrypted?.token)
                    if (decrypted.status === true) {
                        setIsPressed(false)
                        setStep(prev => prev !== 7 ? prev + 1 : prev)
                    }
                })
                .catch(error => {
                    setIsPressed(false)
                    setSignupError("Something went wrong while creating your account. Please try again later.")
                    const decrypted = decryptData(error?.response?.data?.data)
                    console.log(decrypted)
                    if (decrypted.message === "Invalid referral code!") {
                        setSignupError("The referral code you've entered doesn't belongs to any account. Please try with a valid referral code.")
                    }
                    if (decrypted.message?.toLowerCase()?.includes("sending sms")) {
                        setSignupError("We were unable to send a verification code to your Phone Number. Please try again later.")
                    }
                    if (decrypted.message?.toLowerCase()?.includes("sending mail")) {
                        setSignupError("We were unable to send a verification code to your Email. Please try again later.")
                    }
                    // console.log(decrypted)
                    if (decrypted.message === "Email already exist!") {
                        setStep(4)
                        setEmailError("Email Taken.")
                    }
                })
        }
    }
    // }

    const [winWidth, setWinWidth] = useState(window.innerWidth < 1700)


    // reset all states
    useEffect(() => {
        if (step === 1) {
            setFirstName("")
            setLastName("")
            setCompany("")
            setCompanyType("")
            setCountry(null)
            setCountryCode("")
            setEmail("")
            setPhone("")
            setEmailError("")
            setPhoneError("")
            setPassword("")
            setShowPassword(false)
            setConfirmPassword("")
            setShowConfirmPassword(false)
            setAgreedPP(false)
            setAgreedTcs(false)
            setVerified(false)
            setDp(null)
        }
    }, [step])


    // business categories 
    const [categories, setCategories] = useState([])

    useEffect(() => {
        const getCategories = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account-settings/get-business-categories`)
                const data = decryptData(res.data.data)
                setCategories(data?.categoryList)
                // console.log(data?.categoryList)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            }
        }

        getCategories()
    }, [])

    const uploadDp = async (dec) => {
        try {
            const formData = new FormData()
            formData.append("file", dpFile);
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/upload-profile-image/${dec?.accountData?._id}`, formData)
            const decrypted = decryptData(res.data.data)
            setVerified(true)
        }
        catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
        }
        finally {
            setIsPressed(false)
        }
    }

    // otp
    const [showEmail, setShowEmail] = useState(false)
    const [emailOtpToken, setEmailOtpToken] = useState("")
    const [showPassVerified, setShowPassVerified] = useState(false)
    const [otpError, setOtpError] = useState("")
    const otpVerify = async () => {
        setOtpError("")
        setIsPressed(true)
        try {
            // const data = selectedAccountType === "individual" ? (
            //     email ? { token, email_otp: otpValues.join(""), sms_otp: otpValuesPhone.join("") } : { token, sms_otp: otpValuesPhone.join("") }
            // ) : (
            //     phone ? { token, email_otp: otpValues.join(""), sms_otp: otpValuesPhone.join("") } : { token, email_otp: otpValues.join("") }
            // );

            const data = selectedAccountType === "individual" ? { token, sms_otp: otpValuesPhone.join("") } : { token, email_otp: otpValues.join("") }

            const enc = encryptData(data);

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-registration/${selectedAccountType}`, {
                data: enc
            })
            const dec = decryptData(res.data.data)
            if (!email) {
                if (dp) {
                    uploadDp(dec)
                } else {
                    setVerified(true)
                }
            } else {
                setIsPressed(false)
                setShowPassVerified(true)
                setEmailOtpToken(dec?.token)
            }
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
            setOTPValues(Array(numberOfFields).fill(""))
            setOTPValuesPhone(Array(numberOfFields).fill(""))
            setIsPressed(false)
            setOtpError("Invalid Verification Code!")
        }
    }

    const otpEmailVerify = async () => {
        setOtpError("")
        setIsPressed(true)
        try {
            const data = selectedAccountType !== "individual" ? { token, sms_otp: otpValuesPhone.join("") } : { token:emailOtpToken, email_otp: otpValues.join("") }

            const enc = encryptData(data);

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-email-registration/${selectedAccountType}`, {
                data: enc
            })
            const dec = decryptData(res.data.data)
            if (dp) {
                uploadDp(dec)
            } else {
                setIsPressed(false)
                setVerified(true)
            }
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
            setOTPValues(Array(numberOfFields).fill(""))
            setOTPValuesPhone(Array(numberOfFields).fill(""))
            setIsPressed(false)
            setOtpError("Invalid Verification Code!")
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setDpFile(file)
        if (!file?.type?.toLowerCase()?.includes("image")) {
            toast.error("Only images are allowed!")
            return
        }
        const reader = new FileReader();
        reader.onload = () => {
            setDp(reader.result);
        };
        reader.readAsDataURL(file);
    }

    useEffect(() => {
        let timeout;
        if (resendTimer > 0 && step === 7) {
            timeout = setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
        }
        return () => {
            clearTimeout(timeout)
        }
    }, [resendTimer, step])

    useEffect(() => {
        let timeout;
        if (resendTimerEmail > 0 && showEmail) {
            timeout = setTimeout(() => {
                setResendTimerEmail(prev => prev - 1)
            }, 1000)
        }
        return () => {
            clearTimeout(timeout)
        }
    }, [resendTimerEmail, showEmail])

    // useEffect(() => {
    //     if (verified) {
    //         setTimeout(() => {
    //             setRegistrationCompleted(true)
    //         }, 3000)
    //     }
    // }, [verified])

    useEffect(() => {
        setOTPValues(Array(numberOfFields).fill(""))
        setOTPValuesPhone(Array(numberOfFields).fill(""))
        setOtpError("")
        setPhotoSelect(false)
    }, [step])

    const [photoSelect, setPhotoSelect] = useState(false)
    const [showOptions, setShowOptions] = useState(false)


    const buttonRef = useRef(null)

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                buttonRef.current?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className={styles.form}>
            <Modal isOpen={isBlackListed}>
                <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <XCircle size={70} color="red" />
                    <p color="red" style={{ fontSize: "1.1rem", fontWeight: "600", color: "red", marginTop: ".3rem" }}>{t("Oops! Your country doesn't supports InstaPay!")}</p>
                    <p style={{ fontSize: ".6rem", marginTop: ".5rem" }}>{t("Thanks For Using InstaPay!")}</p>
                </ModalBody>
            </Modal>
            {
                step === 1
                &&
                <>
                    <div className={styles.top}>
                        <FormLogo />
                    </div>
                    <div className={styles.top_text}>
                        <h3>{t("Sign Up")}</h3>
                        <p>{t("Start Your Instapay Journey Today!")}</p>
                    </div>
                    <div className={styles.choose_acc_type}>
                        <h5>{t("Account Type")}</h5>
                        <div className={styles.acc_types}>
                            <div className={styles.acc_type} onClick={() => accTypeHandler("individual")}>
                                <IndividualSVG size={window.innerWidth > 450 ? 184 : 145} color={selectedAccountType === "individual" ? "#5926f0" : "#d5d5d5"} isActive={selectedAccountType === "individual"} />
                                <span style={{ color: selectedAccountType === "individual" ? "#5926f0" : "#000" }}>{t("Individual")}</span>
                            </div>
                            <div className={styles.acc_type} onClick={() => accTypeHandler("business")}>
                                <BusinessSVG size={window.innerWidth > 450 ? 184 : 145} color={selectedAccountType === "business" ? "#5926f0" : "#d5d5d5"} isActive={selectedAccountType === "business"} />
                                <span style={{ color: selectedAccountType === "business" ? "#5926f0" : "#000" }}>{t("Business")}</span>
                            </div>
                        </div>
                    </div>
                    <button className={styles.form_btn} disabled={isPressed || !selectedAccountType} onClick={() => {
                        setIsPressed(true)
                        setStep(prev => prev + 1);
                        setIsPressed(false)
                    }}>
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            }
            {/* {
                step === 2
                &&
                <>
                    <Wizard current={step - 1} total={6} />
                    <div className={styles.top_text}>
                        <h3>Enter Your {selectedAccountType === "individual" ? "Personal" : "Business"} Details</h3>
                        <p>Start Your Instapay Journey Today!</p>
                    </div>
                    {
                        selectedAccountType === "individual"
                            ?
                            dp
                                ?
                                <img src={dp} style={{ height: "170px", width: "170px", objectFit: "cover", borderRadius: "10px" }} />
                                :
                                <label style={{ marginBottom: "0", cursor: "pointer" }} htmlFor="dp" className={styles.acc_type}>
                                    <IndividualSVG size={110} color={"#5926f0"} isActive={true} />
                                    <span style={{ color: "#5926f0" }}>Add Photo or Logo</span>
                                    <input type="file" id="dp" hidden onChange={handleFileChange} accept="image/*" />
                                </label>
                            :
                            dp
                                ?
                                <img src={dp} style={{ height: "170px", width: "170px", objectFit: "cover", borderRadius: "10px" }} />
                                :
                                <label style={{ marginBottom: "0", cursor: "pointer" }} htmlFor="dp" className={styles.acc_type} onClick={() => accTypeHandler("business")}>
                                    <BusinessSVG size={110} color={"#5926f0"} isActive={true} />
                                    <span style={{ color: "#5926f0" }}>Add Photo or Logo</span>
                                    <input type="file" id="dp" hidden onChange={handleFileChange} accept="image/*" />
                                </label>
                    }
                    {
                        selectedAccountType === "individual"
                            ?
                            <div className={styles.input_container} style={{ width: "80%", marginTop: winWidth ? "16px" : "30px", marginBottom: winWidth ? "24px" : "44px" }}>
                                <label>Enter your name</label>
                                <input type="text" placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                <input type="text" placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                            :
                            <div className={styles.input_container} style={{ width: "80%", marginTop: winWidth ? "30px" : "54px", marginBottom: winWidth ? "24px" : "44px" }}>
                                <label>Company Name</label>
                                <input type="text" placeholder="Enter your company name" value={company} onChange={e => setCompany(e.target.value)} />
                                <Input type="select" placeholder="--Select-Company-Type--" value={companyType} onChange={e => setCompanyType(e.target.value)}>
                                    <option value="" disabled>--Select-Company-Type--</option>
                                    {
                                        categories.map(item => {
                                            return <option value={item?._id}>{item?.name}</option>
                                        })
                                    }
                                </Input>
                            </div>
                    }
                    <button className={styles.form_btn} disabled={isPressed || (selectedAccountType === "individual" ? !firstName || !lastName : !company || !companyType)} onClick={() => {
                        setIsPressed(true)
                        setStep(prev => selectedAccountType === "individual" ? prev + 2 : prev + 1);
                        setIsPressed(false)
                    }}>
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            } */}
            {
                step === 2 &&
                <>
                    {
                        selectedAccountType === "individual"
                            ?
                            <>
                                <Wizard current={step - 1} total={6} />
                                <div className={styles.top_text}>
                                    <h3>{t("Enter Your")} {selectedAccountType === "individual" ? t("Personal") : t("Business")} {t("Details")}</h3>
                                    <p>{t("Start Your Instapay Journey Today!")}</p>
                                </div>
                                {
                                    selectedAccountType === "individual"
                                        ?
                                        dp
                                            ?
                                            <div style={{
                                                height: "170px",
                                                width: "170px",
                                                borderRadius: "16px",
                                                overflow: "hidden",
                                                position: "relative",
                                                boxShadow: "0 0 4px #1111112e"
                                            }} onMouseEnter={() => setShowOptions(true)} onMouseLeave={() => setShowOptions(false)}>
                                                <img src={dp} style={{ height: "100%", width: "100%", objectFit: "cover", borderRadius: "10px" }} />
                                                <div style={{
                                                    position: "absolute",
                                                    top: "0",
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: ".75rem",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    zIndex: 1,
                                                    background: "#1111117e",
                                                    backdropFilter: "blur(10px)",
                                                    opacity: showOptions ? 1 : 0,
                                                    pointerEvents: showOptions ? "all" : "none",
                                                    transition: "250ms"
                                                }}>
                                                    <Label htmlFor="upload_dp"
                                                        style={{
                                                            background: "white",
                                                            width: "100px",
                                                            textAlign: "center",
                                                            padding: ".7rem",
                                                            color: "black",
                                                            borderRadius: "10px",
                                                            cursor: "pointer",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Re-Take
                                                    </Label>
                                                    <Label htmlFor="dp"
                                                        style={{
                                                            background: "white",
                                                            width: "100px",
                                                            textAlign: "center",
                                                            padding: ".7rem",
                                                            color: "black",
                                                            borderRadius: "10px",
                                                            cursor: "pointer",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Re-Upload
                                                    </Label>
                                                </div>
                                                <input type="file" id="dp" hidden onChange={handleFileChange} accept="image/*" />
                                                <input type="file" id="upload_dp" hidden onChange={handleFileChange} accept="image/*" capture="user" />
                                            </div>
                                            :
                                            photoSelect
                                                ?
                                                <div style={{ display: "flex", gap: "1.5rem" }}>
                                                    <label style={{ marginBottom: "0", cursor: "pointer" }} htmlFor="upload_dp" className={styles.acc_type}>
                                                        <div style={{
                                                            height: "100px",
                                                            width: "100px",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            border: "4px solid #5926f0",
                                                            borderRadius: "16px"
                                                        }}>
                                                            <Camera size={60} color="#5926f0" />
                                                        </div>
                                                        <span style={{ color: "#5926f0" }}>{t("Take A Photo")}</span>
                                                        <input type="file" id="upload_dp" hidden onChange={handleFileChange} accept="image/*" capture="user" />
                                                    </label>
                                                    <label style={{ marginBottom: "0", cursor: "pointer" }} htmlFor="dp" className={styles.acc_type}>
                                                        <div style={{
                                                            height: "100px",
                                                            width: "100px",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            border: "4px solid #5926f0",
                                                            borderRadius: "16px"
                                                        }}>
                                                            <Upload size={60} color="#5926f0" />
                                                        </div>
                                                        <span style={{ color: "#5926f0" }}>{t("Upload A Photo")}</span>
                                                        <input type="file" id="dp" hidden onChange={handleFileChange} accept="image/*" />
                                                    </label>
                                                </div>
                                                :
                                                <label style={{ marginBottom: "0", cursor: "pointer" }} onClick={() => setPhotoSelect(true)} className={styles.acc_type}>
                                                    <IndividualSVG size={110} color={"#5926f0"} isActive={true} />
                                                    <span style={{ color: "#5926f0" }}>{t("Add Photo or Logo")}</span>
                                                </label>
                                        :
                                        dp
                                            ?
                                            <img src={dp} style={{ height: "170px", width: "170px", objectFit: "cover", borderRadius: "10px" }} />
                                            :
                                            <label style={{ marginBottom: "0", cursor: "pointer" }} htmlFor="dp" className={styles.acc_type} onClick={() => accTypeHandler("business")}>
                                                <BusinessSVG size={110} color={"#5926f0"} isActive={true} />
                                                <span style={{ color: "#5926f0" }}>{t("Add Photo or Logo")}</span>
                                                <input type="file" id="dp" hidden onChange={handleFileChange} accept="image/*" />
                                            </label>
                                }
                                {
                                    selectedAccountType === "individual"
                                        ?
                                        <div className={styles.input_container} style={{ width: "80%", marginTop: winWidth ? "16px" : "30px", marginBottom: winWidth ? "24px" : "44px" }}>
                                            <label>{t("Enter your name")}</label>
                                            <input type="text" placeholder={t("Enter your first name")} value={firstName} onChange={e => setFirstName(e.target.value)} />
                                            <input type="text" placeholder={t("Enter your last name")} value={lastName} onChange={e => setLastName(e.target.value)} />
                                        </div>
                                        :
                                        <div className={styles.input_container} style={{ width: "80%", marginTop: winWidth ? "30px" : "54px", marginBottom: winWidth ? "24px" : "44px" }}>
                                            <label>{t("Company Name")}</label>
                                            <input type="text" placeholder={t("Enter your company name")} value={company} onChange={e => setCompany(e.target.value)} />
                                            <Input type="select" placeholder={t("--Select-Company-Type--")} value={companyType} onChange={e => setCompanyType(e.target.value)}>
                                                <option value="" disabled>{t("--Select-Company-Type--")}</option>
                                                {
                                                    categories.map(item => {
                                                        return <option value={item?._id}>{t(item?.name)}</option>
                                                    })
                                                }
                                            </Input>
                                        </div>
                                }
                                <button className={styles.form_btn} disabled={isPressed || (selectedAccountType === "individual" ? !firstName || !lastName : !company || !companyType)} onClick={() => {
                                    setIsPressed(true)
                                    setStep(prev => selectedAccountType === "individual" ? prev + 2 : prev + 1);
                                    setIsPressed(false)
                                }}>
                                    <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                                    <ChevronRight size={28} color="white" />
                                </button>
                            </>
                            :
                            <>
                                <div className={styles.top}>
                                    <FormLogo />
                                </div>
                                <div className={styles.top_text}>
                                    <h3>{t("Sign Up")}</h3>
                                    <p>{t("Start Your Instapay Journey Today!")}</p>
                                </div>
                                <div className={styles.choose_acc_type}>
                                    <h5>{t("Business Account")}</h5>
                                    <div className={styles.acc_types} style={{
                                        position: "relative"
                                    }}>
                                        <div style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            color: "#5926f0",
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap"
                                        }}>{t("Coming Soon!")}</div>
                                        <div className={styles.acc_type} style={{ opacity: 0, pointerEvents: "none" }} onClick={() => accTypeHandler("individual")}>
                                            <IndividualSVG size={window.innerWidth > 450 ? 184 : 145} color={selectedAccountType === "individual" ? "#5926f0" : "#d5d5d5"} isActive={selectedAccountType === "individual"} />
                                            <span style={{ color: selectedAccountType === "individual" ? "#5926f0" : "#000" }}>Individual</span>
                                        </div>
                                        <div className={styles.acc_type} style={{ opacity: 0, pointerEvents: "none" }} onClick={() => accTypeHandler("business")}>
                                            <BusinessSVG size={window.innerWidth > 450 ? 184 : 145} color={selectedAccountType === "business" ? "#5926f0" : "#d5d5d5"} isActive={selectedAccountType === "business"} />
                                            <span style={{ color: selectedAccountType === "business" ? "#5926f0" : "#000" }}>Business</span>
                                        </div>
                                    </div>
                                </div>
                                <button className={styles.form_btn} onClick={() => setStep(1)}>
                                    <ChevronLeft size={28} color="white" />
                                    <span>{isPressed ? t("Back") : t("Back")}</span>
                                </button>
                            </>
                    }
                </>
            }
            {
                step === 3
                &&
                <>
                    <Wizard current={step - 1} total={6} />
                    <div className={styles.top_text}>
                        <h3>{t("Enter Your")} {selectedAccountType === "individual" ? t("Personal") : t("Business")} Details</h3>
                        <p>{t("Start Your Instapay Journey Today!")}</p>
                    </div>
                    <div className={styles.input_group}>
                        <div className={styles.email_verified}>
                            <BusinessSVG size={56} color={"#5926f0"} isActive={true} />
                            <p>{company}</p>
                            <button onClick={() => setStep(prev => prev - 1)}>{t("edit")}</button>
                        </div>
                        <div className={styles.input_container} style={{ position: "relative" }}>
                            <label>{t("Country")}</label>
                            {
                                country && !showCountryDropdown
                                    ?
                                    <div className={styles.selected_cd_item}>
                                        <div>
                                            <img src={country.file_url} alt={country.alpha3} />
                                            <span>{t(country.name)}</span>
                                        </div>
                                        <button onClick={() => setShowCountryDropdown(true)}>edit</button>
                                    </div>
                                    :
                                    <input type="text" placeholder={t("Search your country")} value={countrySearch} onChange={e => setCountrySearch(e.target.value)} />
                            }
                            {
                                showCountryDropdown
                                    ?
                                    <div className={styles.country_dropdown}>
                                        {
                                            searchedCountries.length > 0
                                                ?
                                                searchedCountries.map(coun => (
                                                    <div className={styles.cd_item} key={coun.alpha3} onClick={() => {
                                                        setCountry(coun)
                                                        setShowCountryDropdown(false)
                                                        setCountryCode(coun.alpha3)
                                                    }}>
                                                        <img src={coun.file_url} alt={coun.alpha3} />
                                                        <span>{coun.name}</span>
                                                    </div>
                                                ))
                                                :
                                                <div className="text-center font-600 py-4">{t("No Country")}</div>
                                        }
                                    </div>
                                    :
                                    ""
                            }
                        </div>
                        <div className={styles.warning}>
                            <Info color="#FFAA29" />
                            <p>{t("You cannot change the country, once your account is verified.")} <Link>{t("Learn more.")}</Link></p>
                        </div>
                    </div>
                    <button className={styles.form_btn} disabled={isPressed || !country} onClick={() => {
                        setIsPressed(true)
                        setStep(prev => prev + 1);
                        setIsPressed(false)
                    }}>
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            }
            {
                step === 4
                &&
                <>
                    <Wizard current={step - 1} total={6} />
                    <div className={styles.top_text}>
                        <h3>{t("Enter Your")} {selectedAccountType === "individual" ? t("Personal") : t("Business")} {t("Details")}</h3>
                        <p>{t("Start Your Instapay Journey Today!")}</p>
                    </div>
                    <div className={styles.input_group} style={{ marginBottom: winWidth ? "60px" : "100px" }}>
                        {
                            selectedAccountType === "individual"
                                ?
                                <>
                                    <div className={styles.input_container}>
                                        <label>{t("Phone Number")}</label>
                                        <PhoneInput
                                            setPhone={setPhone}
                                            country={countryCode}
                                            setCountry={(country) => {
                                                const filteredCountry = allCountries.filter(item => item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.[0]
                                                setCountry(filteredCountry)
                                                setCountryCode(filteredCountry?.alpha3)
                                            }}
                                        />
                                    </div>
                                    <div className={styles.input_container}>
                                        <label>{t("Email Address")} ({t("Optional")})</label>
                                        <input type="email" placeholder={t("Enter your email address")} value={email} onChange={e => {
                                            setEmail(e.target.value?.toLowerCase())
                                            setPhoneError("")
                                            setEmailError("")
                                        }} />
                                    </div>
                                    {
                                        phoneError
                                        &&
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#f32d2d",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            lineHeight: "150%",
                                            margin: "3px 0 0",
                                            width: "100%",
                                            gap: ".6rem",
                                        }}>
                                            <AlertTriangle size={17} color="#F32D2D" />
                                            <span>{t(phoneError)}</span>
                                        </div>
                                    }
                                </>
                                :
                                <>
                                    <div className={styles.input_container}>
                                        <label>{t("Email Address")}</label>
                                        <input type="email" placeholder={t("Enter your email address")} value={email} onChange={e => {
                                            setPhoneError("")
                                            setEmailError("")
                                            setEmail(e.target.value?.toLowerCase())
                                        }} />
                                    </div>
                                    <div className={styles.input_container}>
                                        <label>{t("Phone Number")} ({t("Optional")})</label>
                                        <PhoneInput
                                            setPhone={setPhone}
                                            country={countryCode}
                                            setCountry={(country) => {
                                                const filteredCountry = allCountries.filter(item => item.name.toLowerCase().includes(country?.name?.toLowerCase()))?.[0]
                                                setCountry(filteredCountry)
                                                setCountryCode(filteredCountry?.alpha3)
                                            }}
                                        />
                                    </div>
                                    {
                                        phoneError
                                        &&
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#f32d2d",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            lineHeight: "150%",
                                            margin: "3px 0 0",
                                            width: "100%",
                                            gap: ".6rem",
                                        }}>
                                            <AlertTriangle size={17} color="#F32D2D" />
                                            <span>{t(phoneError)}</span>
                                        </div>
                                    }
                                </>
                        }
                    </div>
                    <button
                        className={styles.form_btn}
                        disabled={isPressed || (selectedAccountType === "individual" ? (email.length > 0 ? !emailRegex.test(email) || phone.length < 8 : phone.length < 8) : !emailRegex.test(email))}
                        onClick={selectedAccountType === "individual" ? checkIndividual : checkBusiness}
                    >
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            }
            {
                step === 5
                &&
                <>
                    <Wizard current={step - 1} total={6} />
                    <h4 style={{
                        color: "#545454",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        lineHeight: "150%",
                        marginBottom: winWidth ? "10px" : "18px"
                    }}>{t("Create a strong Password")}</h4>
                    <div
                        className={styles.password_input}
                    >
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
                        {
                            showPassword
                                ?
                                <EyeOff onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }} />
                                :
                                <Eye onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }} />
                        }
                    </div>
                    <div className={styles.password_guidance}>
                        <h5>{t("Password must")}:</h5>
                        <ul className={styles.pg_list}>
                            <li>
                                {
                                    password.length >= 9 && password.length <= 64
                                        ?
                                        <Check />
                                        :
                                        <Cross />
                                }
                                <p>{t("Be between 9 and 64 characters")}</p>
                            </li>
                            <li>
                                {
                                    (/[^A-Za-z0-9]/.test(password) &&
                                        /[A-Z]/.test(password) &&
                                        /[a-z]/.test(password) &&
                                        /[0-9]/.test(password))
                                        ?
                                        <Check />
                                        :
                                        <Cross />
                                }
                                <p>{t("Include at least two of the following")}:</p>
                            </li>
                            <ul className={styles.pg_sub_list}>
                                <li>
                                    {
                                        /[A-Z]/.test(password)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Uppercase character")}</p>
                                </li>
                                <li>
                                    {
                                        /[a-z]/.test(password)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Lowercase Character")}</p>
                                </li>
                                <li>
                                    {
                                        /[0-9]/.test(password)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Number")}</p>
                                </li>
                                <li>
                                    {
                                        /[^A-Za-z0-9]/.test(password)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Special Character")}</p>
                                </li>
                            </ul>
                        </ul>
                    </div>
                    <h4 style={{
                        color: "#545454",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        lineHeight: "150%",
                        marginBottom: winWidth ? "10px" : "18px"
                    }}>{t("Confirm Password")}</h4>
                    <div
                        className={styles.password_input}
                    >
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        {
                            showPassword
                                ?
                                <EyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }} />
                                :
                                <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }} />
                        }
                    </div>
                    {
                        password !== confirmPassword
                            && confirmPassword.length > 0
                            ?
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                color: "#f32d2d",
                                fontSize: "10px",
                                fontWeight: 600,
                                lineHeight: "150%",
                                margin: winWidth ? "3px 0 0" : "12px 0 0",
                                width: "80%",
                                gap: ".6rem"
                            }}>
                                <AlertTriangle size={17} color="#F32D2D" />
                                <span>{t("The password doesn't match.")}</span>
                            </div>
                            : ""
                    }
                    <button className={styles.form_btn} disabled={isPressed || !password || !confirmPassword || confirmPassword !== password} onClick={() => {
                        setIsPressed(true)
                        setStep(prev => prev + 1);
                        setIsPressed(false)
                    }} style={{ marginTop: winWidth ? "14px" : "22px" }}>
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            }
            {
                step === 6
                &&
                <>
                    <Wizard current={step - 1} total={6} />
                    {
                        isPressed && !signupError
                            ?
                            <>
                                <h2 style={{
                                    color: "#000",
                                    textAlign: "center",
                                    leadingTrim: "both",
                                    textEdge: "cap",
                                    fontFamily: "Manrope",
                                    fontSize: "24px",
                                    fontStyle: "normal",
                                    fontWeight: "700",
                                    lineHeight: "130%",
                                    marginBottom: "28px",
                                    marginTop: "40px"
                                }}>{t("Creating your Account")}</h2>
                                <p style={{
                                    color: "#575757",
                                    textAlign: "center",
                                    leadingTrim: "both",
                                    textEdge: "cap",
                                    fontFamily: "Manrope",
                                    fontSize: "16px",
                                    fontStyle: "normal",
                                    fontWeight: "600",
                                    lineHeight: "150%",
                                    maxWidth: "260px",
                                    margin: "0 auto 19px"
                                }}>{t("We are finalizing and creating your InstaPay account.")}</p>
                                <img src={signupAnim} alt="" style={{ width: "284px", height: "284px", objectFit: "contain", margin: "0 auto 70px" }} />
                            </>
                            :
                            signupError
                                ?
                                <>
                                    <XCircle size={80} color="red" style={{
                                        marginTop: "40px",
                                    }} />
                                    <h2 style={{
                                        color: "#000",
                                        textAlign: "center",
                                        leadingTrim: "both",
                                        textEdge: "cap",
                                        fontFamily: "Manrope",
                                        fontSize: "24px",
                                        fontStyle: "normal",
                                        fontWeight: "700",
                                        lineHeight: "130%",
                                        marginBottom: "28px",
                                        marginTop: "10px"
                                    }}>{t("We cannot process your request at the moment, please try again later.")}</h2>
                                    <p style={{
                                        color: "#575757",
                                        textAlign: "center",
                                        leadingTrim: "both",
                                        textEdge: "cap",
                                        fontFamily: "Manrope",
                                        fontSize: "16px",
                                        fontStyle: "normal",
                                        fontWeight: "600",
                                        lineHeight: "150%",
                                        maxWidth: "260px",
                                        margin: "0 auto 19px"
                                    }}>{t(signupError)}</p>
                                    <button className={styles.form_btn} onClick={() => {
                                        setStep(1)
                                        setSelectedAccountType("")
                                        setCompany("")
                                        setCompanyType("")
                                        setFirstName("")
                                        setLastName("")
                                        setSignupError("")
                                        setCountrySearch("")
                                        setCountry(null)
                                        setCountryCode("")
                                        setAllCountries([])
                                        setSearchedCountries(allCountries)
                                        setShowCountryDropdown(false)
                                        setEmail("")
                                        setPhone("")
                                        setPassword("")
                                        setShowPassword(false)
                                        setConfirmPassword("")
                                        setShowConfirmPassword(false)
                                        setAgreedTcs(false)
                                        setAgreedPP(false)
                                        setVerified(false)
                                    }} style={{ marginTop: winWidth ? "29px" : "50px" }}>
                                        <span>{t("Try Again")}</span>
                                        <ChevronRight size={28} color="white" />
                                    </button>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                                        <Link style={{ fontWeight: "600" }} to={"/login"} onClick={() => setIsLoginForm(true)}>{t("Sign In")}</Link>
                                        |
                                        <Link style={{ fontWeight: "600" }} to={"mailto:support@insta-pay.ch"}>{t("Contact Support")}</Link>
                                    </div>
                                </>
                                :
                                <>
                                    <h4 className={styles.finalize_head}>Finalize Your Process</h4>
                                    <div className={styles.input_container} style={{ width: "70%", marginTop: winWidth ? "60px" : "100px" }}>
                                        <label>{t("Referral Code")} ({t("Optional")})</label>
                                        <input type="text" placeholder="eg: IMTIAZ0307" value={referralCode} onChange={e => setReferralCode(e.target.value.toLowerCase())} />
                                    </div>
                                    {
                                        referralError
                                        &&
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#f32d2d",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            lineHeight: "150%",
                                            margin: winWidth ? "3px  0 0" : "12px 0 0",
                                            width: "80%",
                                            gap: ".6rem",
                                        }}>
                                            <AlertTriangle size={17} color="#F32D2D" />
                                            <span>{t(referralError)}</span>
                                        </div>
                                    }
                                    <div className={styles.warning} style={{ margin: winWidth ? "18px 0 22px" : "28px 0 32px", width: "70%" }}>
                                        <Info color="#FFAA29" />
                                        <p>{t("It will be autofill, if you're signing up with invitation link.")}</p>
                                    </div>
                                    <div className={styles.agree_item} style={{ marginBottom: winWidth ? "16px" : "24px" }}>
                                        <Label className="d-block" for="chk-tcs">
                                            <Input className="checkbox_animated" id="chk-tcs" type="checkbox" checked={agreedTcs} onChange={e => setAgreedTcs(e.target.checked)} />
                                        </Label>
                                        <p>{t("I agree with")} <Link to={"https://insta-pay.ch/terms-and-conditions"} target="_blank">{t("Terms & Conditions")}</Link></p>
                                    </div>
                                    <div className={styles.agree_item}>
                                        <Label className="d-block" for="chk-tcs">
                                            <Input className="checkbox_animated" id="chk-tcs" type="checkbox" checked={agreedPP} onChange={e => setAgreedPP(e.target.checked)} />
                                        </Label>
                                        <p>{t("I agree with")} <Link to={"https://insta-pay.ch/privacy-policy"} target="_blank">{t("Privacy Policy")}</Link></p>
                                    </div>
                                    <button className={styles.form_btn} disabled={isPressed || !agreedPP || !agreedTcs || referralError} onClick={signup} style={{ marginTop: winWidth ? "29px" : "50px" }}>
                                        <span>{isPressed ? t("Creating Your Account") : ("Create Your Account")}</span>
                                        <ChevronRight size={28} color="white" />
                                    </button>
                                    {
                                        signupError
                                        &&
                                        <div style={{ margin: "-.5rem .5rem .5rem", color: "red", fontWeight: 600 }}>
                                            {t(signupError)}
                                        </div>
                                    }
                                </>
                    }
                </>
            }
            {
                step === 7
                &&
                <>
                    {
                        verified
                            ?
                            <>
                                <div className={styles.top}>
                                    <FormLogo />
                                </div>
                                <img src={success} style={{
                                    width: "70%",
                                    objectFit: "contain",
                                    margin: "1rem auto"

                                }} />
                                <div className={styles.otp_text}>
                                    <h5 style={{ whiteSpace: "nowrap" }}>
                                        {t("Registration is Completed")}
                                    </h5>
                                    <p>
                                        {t("Click below to login")}
                                    </p>
                                </div>
                                <Link to={"/login"} style={{ color: "white" }}>
                                    <button className={styles.form_btn} onClick={() => {
                                        setIsLoginForm(true)
                                        navigate("/login")
                                    }} style={{ minWidth: "180px" }}>
                                        <span>{t("Login")}</span>
                                        <ChevronRight size={28} color="white" />
                                    </button>
                                </Link>
                            </>
                            :
                            showPassVerified
                                ?
                                <>
                                    <div className={styles.top}>
                                        <FormLogo />
                                    </div>
                                    <img src={success} style={{
                                        width: "70%",
                                        objectFit: "contain",
                                        margin: "1rem auto"

                                    }} />
                                    <div className={styles.otp_text}>
                                        <h5 style={{ whiteSpace: "nowrap" }}>
                                            {t("Password Verified Successfully!")}
                                        </h5>
                                        <p>
                                            {t("Verify your email now.")}
                                        </p>
                                    </div>
                                    <button className={styles.form_btn} onClick={() => {
                                        setShowPassVerified(false)
                                        setShowEmail(true)
                                    }} style={{ minWidth: "180px" }}>
                                        <span>{t("Verify Email")}</span>
                                        <ChevronRight size={28} color="white" />
                                    </button>
                                </>
                                :
                                <>
                                    <Wizard current={step - 1} total={6} complete={verified} />
                                    <div className={styles.otp_s_bg}>
                                        <img src={otp} alt="otp" />
                                    </div>
                                    <div className={styles.otp_text}>
                                        <h5>
                                            {
                                                verified
                                                    ?
                                                    t("Verification Code Verified")
                                                    :
                                                    t("Enter Code")
                                            }
                                        </h5>
                                        <p>
                                            {
                                                verified
                                                    ?
                                                    t("Verification code has been verified, Please continue to the next step.")
                                                    :
                                                    t("A Verification code has been sent to your email and number.")
                                            }
                                        </p>
                                    </div>
                                    {
                                        !verified
                                        &&
                                        <>
                                            {
                                                (selectedAccountType === "individual" ? email : true) && showEmail
                                                    ?
                                                    <>
                                                        <span style={{
                                                            fontSize: ".9rem",
                                                            fontWeight: "600",
                                                            marginBottom: ".5rem",
                                                            color: "#3c3c3c"
                                                        }}>{t("Enter code from Email")}</span>
                                                        <div className={styles.otp_fields}>
                                                            {otpValues.map((value, index) => (
                                                                <input
                                                                    key={index}
                                                                    type="number"
                                                                    maxLength={1}
                                                                    value={value}
                                                                    onChange={(e) => {
                                                                        setOtpError("")
                                                                        handleInputChange(index, e.target.value)
                                                                    }}
                                                                    onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                                    ref={(input) => (inputRefs.current[index] = input)}
                                                                    style={{
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        textAlign: 'center',
                                                                        fontSize: '16px',
                                                                        border: '1px solid #5926f0',
                                                                        borderRadius: '6px',
                                                                        outline: "none"
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        {
                                                            otpError
                                                            &&
                                                            <div style={{ margin: ".5rem", color: "red" }}>
                                                                {otpError}
                                                            </div>
                                                        }
                                                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}
                                                            className={styles.resend_text}
                                                        >
                                                            {
                                                                resendTimer > 0
                                                                    ?
                                                                    t("Resend available in") + " " + resendTimer + " " + t("seconds")
                                                                    :
                                                                    <>
                                                                        {t("Didn't receive OTP?")}
                                                                        <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={(e) => {
                                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                                            signup(e)
                                                                            setResendTimerEmail(900)
                                                                        }}>{t("Resend Now")}</span>
                                                                    </>
                                                            }
                                                        </span>
                                                    </>
                                                    : ""
                                            }

                                            {/* phone */}
                                            {
                                                (selectedAccountType === "business" ? phone : true) && !showEmail
                                                    ?
                                                    <>
                                                        <span style={{
                                                            fontSize: ".9rem",
                                                            fontWeight: "600",
                                                            marginBottom: ".5rem",
                                                            color: "#3c3c3c"
                                                        }}>{t("Enter code from SMS")}</span>
                                                        <div className={styles.otp_fields}>
                                                            {otpValuesPhone.map((value, index) => (
                                                                <input
                                                                    key={index}
                                                                    type="number"
                                                                    maxLength={1}
                                                                    value={value}
                                                                    onChange={(e) => handleInputChangePhone(index, e.target.value)}
                                                                    onKeyDown={(e) => handleInputKeyDownPhone(index, e)}
                                                                    ref={(input) => (inputPhoneRefs.current[index] = input)}
                                                                    style={{
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        textAlign: 'center',
                                                                        fontSize: '16px',
                                                                        border: '1px solid #5926f0',
                                                                        borderRadius: '6px',
                                                                        outline: "none"
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        {
                                                            otpError
                                                            &&
                                                            <div style={{ margin: ".5rem", color: "red" }}>
                                                                {otpError}
                                                            </div>
                                                        }
                                                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}
                                                            className={styles.resend_text}
                                                        >
                                                            {
                                                                resendTimer > 0
                                                                    ?
                                                                    t("Resend available in ") + resendTimer + t(" seconds")
                                                                    :
                                                                    <>
                                                                        {"Didn't receive OTP? "}
                                                                        <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={(e) => {
                                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                                            signup(e)
                                                                            setResendTimer(90)
                                                                        }}>{t("Resend Now")}</span>
                                                                    </>
                                                            }
                                                        </span>
                                                    </>
                                                    :
                                                    ""
                                            }
                                        </>
                                    }
                                </>
                    }
                    {
                        verified
                            ?
                            ""
                            // <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}
                            //     className={styles.resend_text}>Redirecting...</span>
                            // <button className={styles.form_btn} disabled={isPressed || !verified} onClick={() => {
                            //     setIsLoginForm(true)
                            //     navigate("/login")
                            // }} style={{ marginTop: winWidth ? "100px" : "180px" }}>
                            //     <span>{isPressed ? "Finishing" : "Finish"}</span>
                            //     <ChevronRight size={28} color="white" />
                            // </button>
                            :
                            <button ref={buttonRef} className={styles.form_btn} disabled={isPressed || showEmail ? isAnyFieldEmpty : isAnyFieldEmptyPhone} onClick={showEmail ? otpEmailVerify : otpVerify}>
                                <span>{isPressed ? t("Verifying") : t("Verify")}</span>
                                <ChevronRight size={28} color="white" />
                            </button>
                    }
                </>
            }
            {
                (step === 6 ? !isPressed && !signupError : !verified)
                &&
                <div className={styles.bottom_text}>
                    <span>{t("Already have an account?")} </span>
                    <Link to={"/login"} onClick={() => setIsLoginForm(true)}>{t("Sign In")}</Link>
                </div>
            }
            {
                step === 6 ? !isPressed && !signupError : step !== 1 && !verified && selectedAccountType !== "business" // remove account type
                    ?
                    <div onClick={() => {
                        if (selectedAccountType === "individual" && step === 4) {
                            setStep(prev => prev - 2)
                        } else {
                            setStep(prev => prev - 1)
                        }
                    }} style={{
                        textAlign: "center",
                        marginTop: winWidth ? "14px" : "24px",
                        color: "#575757",
                        fontsize: "16px",
                        fontstyle: "normal",
                        fontWeight: "600",
                        lineHeight: "150%",
                        cursor: "pointer"
                    }}>
                        {t("Back")}
                    </div>
                    : ""
            }
        </div>
    )
}

export default SIgnupForm