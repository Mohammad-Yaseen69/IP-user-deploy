import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import PhoneInput from "../PhoneInput";
import { AlertTriangle, ChevronRight, Eye, EyeOff } from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import gs from "./files/gs.svg"
import as from "./files/as.svg"
import authenticator from "./files/authenticator.png"
import axios from "axios";
import LanguagePicker from "../LanguagePicker";
import FaceAnimation from "./FaceAnimation"
import BiometricSvg from "../../assets/icons/fingerprint.png"
import { startAuthentication } from "@simplewebauthn/browser"
import * as rdd from "react-device-detect";
import { authIcon, instaIcon, smsIcon, whatsappIcon } from "./files"
import "./styles/index.module.css";
import useWindowWidth from "../../utils/useWindowWidth";
import i18next from "i18next";
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import localforage from "localforage"
const Login = ({ country, setIsLoginForm, setIsForgot }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const isPhoneNumber = /^\d{9,20}$/g;
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [emailVerified, setEmailVerified] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoginError, setIsLoginError] = useState("")
    const [isPressed, setIsPressed] = useState(false)
    const [loginToken, setLoginToken] = useState("")
    const [step, setStep] = useState(1)
    const { profileLockTIme, setProfileLockTime, setUserDetails, setShowInactivityModal } = useContext(UserContext)
    const [loginMethod, setLoginMethod] = useState("phone")
    const [currentActiveInput, setCurrentActiveInput] = useState(1)
    const [isOtpCorrect, setIsOtpCorrect] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false)
    const [currentOtpMethod, setCurrentOtpMethod] = useState("auth")
    const [isMobile] = useState(((rdd.isMobile || rdd.isMobileSafari) && (!rdd.isAndroid || !rdd.isIOS)) ?? false)
    const [isInstagramBrowser, setisInstagramBrowser] = useState()
    const [lastOtpSentTo, setLastOtpSentTo] = useState(null);
    const [consecutiveCount, setConsecutiveCount] = useState(0)
    const [firstTime, setFirstTime] = useState(true)
    const width = useWindowWidth()
    const [methodLoading, setMethodLoading] = useState(false)
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [loginData, setLoginData] = useState(null)
    const [showQuickLogin, setShowQuickLogin] = useState(false)

    // convert this object into an array of object it should just have a type property which should tell like whatsapp insta biometric instead of a object property

    const [methods, setMethods] = useState([
        {
            avail: false,
            icon: BiometricSvg,
            attr: "biometric",
            text: "Biometric"
        },
        {
            avail: false,
            icon: authIcon,
            attr: "auth",
            text: "Google Authenticator"
        },
        {
            avail: false,
            icon: instaIcon,
            attr: "insta",
            text: "Instagram"
        },
        {
            avail: false,
            icon: whatsappIcon,
            attr: "wp",
            text: "Whatsapp"
        },
        {
            avail: true,
            icon: smsIcon,
            attr: "sms",
            text: "SMS/Email"
        }
    ])

    useLayoutEffect(() => {
        const loginWith = localStorage.getItem("loginWith")
        setLoginMethod(loginWith ?? "phone")
    }, [])

    const checkEmailHandler = (e) => {
        e.preventDefault()
        setIsPressed(true)
        setEmailVerified(true)
        setIsPressed(false)
    }

    useEffect(() => {
        function isInstagramBrowser() {
            return /Instagram/i.test(navigator.userAgent);
        }

        if (isInstagramBrowser()) {
            setisInstagramBrowser(true)
        } else {
            setisInstagramBrowser(false);
        }
    }, [])

    useEffect(() => {
        const getData = async () => {
            const data = await localforage.getItem("loginData")
            if (data) {
                setLoginData(data)
                setShowQuickLogin(true)
                setEmail(data?.credential)
                setLoginMethod(data?.loginMethod)
            } else {
                setShowQuickLogin(false)
            }
        }

        getData()
    }, [])

    console.log(loginData, email, loginMethod, "quick login")


    const setData = async (data) => {
        await localforage.setItem("loginData", data)
    }




    const loginHandler = (e, method = undefined) => {
        e.preventDefault()
        setIsPressed(true)
        setConsecutiveCount(1)
        setIsLoginError("")
        if (method) {
            setMethodLoading(true)
        }
        console.log(currentOtpMethod, method)
        const isAuth = method ? (method === "auth") : (currentOtpMethod === "auth");
        const isInsta = method ? (method === "insta") : (currentOtpMethod === "insta" || currentOtpMethod !== "sms");
        const isWp = method ? (method === "wp") : (currentOtpMethod === "wp");


        const credentials = isEmail.test(email)
            ? {
                email,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : "",
                first_time: firstTime
            }
            : {
                phone: email,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : "",
                first_time: firstTime
            };
        const encrypted = encryptData(credentials)

        console.log(credentials)



        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/send-login-otp`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                setFirstTime(false)
                // console.log(decrypted)
                setMethods(prevMethods => prevMethods.map(method => {
                    switch (method.attr) {
                        case 'auth':
                            return { ...method, avail: decrypted?.tfa || false };
                        case 'wp':
                            return { ...method, avail: decrypted.whatsapp };
                        case 'insta':
                            return { ...method, avail: !isInstagramBrowser && (decrypted?.instagram || false) };
                        case 'biometric':
                            return { ...method, avail: !isInstagramBrowser && (decrypted?.biometric || false) };
                        case 'sms':
                            return { ...method, avail: true };
                        default:
                            return method;
                    }
                }));

                if (decrypted?.message === "instagram") {
                    setLastOtpSentTo("insta")
                }
                else if (decrypted?.message === "whatsapp") {
                    setLastOtpSentTo("wp")
                }
                else if (decrypted?.message === "otp") {
                    setLastOtpSentTo("sms")
                }

                const handleMethods = () => {
                    if (method === undefined) {
                        if (decrypted?.biometric && !isInstagramBrowser) return "biometric";
                        if (decrypted?.tfa && decrypted?.message === "authenticator") return "auth";
                        if (decrypted?.message === "instagram" && !isInstagramBrowser) return "insta";
                        if (decrypted?.message === "whatsapp") return "wp";
                        return "sms";
                    } else {
                        return method
                    }
                }

                setCurrentOtpMethod(handleMethods())

                console.log(handleMethods())
                if ((handleMethods() === "insta" || handleMethods() === "sms" || handleMethods() === "wp")) {
                    console.log("RESET")
                    setResendTimer(120)
                }
                // console.log(decrypted)



                // if (decrypted?.authenticator === true) {
                //     setResendTimer(0)
                // }

                setLoginToken(decrypted?.token)
                setStep(2)
                setIsPressed(false)
                setMethodLoading(false)

            })
            .catch(error => {
                setIsPressed(false)
                setMethodLoading(false)
                const decrypted = decryptData(error?.response?.data?.data)
                console.log(decrypted)
                if (decrypted.message === "Account not found!" || decrypted.message === "Incorrect Password!" || decrypted.message?.toLowerCase()?.includes("incorrect") || decrypted.message === "User not found!") {
                    setIsLoginError(`Uh-Oh! The password/${isEmail.test(email) ? "email" : "phone number"} you entered is wrong.`)
                }
                if (decrypted.message?.toLowerCase()?.includes("inactive")) {
                    setIsLoginError(`Uh-Oh! Your account is not active anymore.`)
                }
                if (decrypted.message?.toLowerCase()?.includes("onhold")) {
                    setIsLoginError(`Uh-Oh! Your account is onhold.`)
                }
                if (decrypted.message?.toLowerCase()?.includes("delete")) {
                    setIsLoginError(`Uh-Oh! Your account is currently on delete status.`)
                }
                if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                }
            })
    }

    useEffect(() => {
        if (profileLockTIme > 0) {
            let minutes = Math.floor(profileLockTIme / 60);
            let remainingSeconds = profileLockTIme % 60;
            setIsLoginError(
                t("Account is locked. Try again in {{time}} minutes.", {
                    time: `${minutes < 10 ? `0${minutes}` : minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`
                })
            )
        } else {
            setIsLoginError("")
        }
    }, [profileLockTIme, i18next.language])

    // service error

    useLayoutEffect(() => {
        if (loginMethod === "email") return;
        const newEmail = email;
        if (/^\d+$/.test(newEmail.slice(0, 6)) && newEmail.startsWith(0) && newEmail.length >= 6) {
            if (country) {
                const formatted = `${country?.country_code?.split("+")[1] ?? "41"}${newEmail.slice(1)} `
                setEmail(formatted)
            } else {
                const formatted = `41${newEmail.slice(1)} `
                setEmail(formatted)
            }
        }
    }, [email, loginMethod])

    useEffect(() => {
        if (loginMethod === "email" && !loginData) {
            setEmail("")
        }
    }, [loginMethod, loginData])


    // useEffect(() => {
    //     if (step === 1) {
    //         console.log("as")
    //         setCurrentOtpMethod(userAuthSetup ? "auth" : isInstagram ? "insta" : "sms")
    //     }
    // }, [step])


    const getUserInfo = async () => {
        try {
            const res = await fetch(`https://iplocate.io/api/lookup?apikey=${import.meta.env.VITE_IP_LOCATE_API_KEY}`)
            const location = await res.json()

            console.log("locate api", location)
            if (location) {
                return {
                    browser_name: rdd.browserName ?? "N/A",
                    platform: navigator?.userAgentData?.platform,
                    browser_version: rdd.browserVersion ?? "N/A",
                    is_mobile_user: navigator?.userAgentData?.mobile ?? rdd.isMobile,
                    IPv4: location?.ip,
                    city: location?.city,
                    country_code: location?.country_code,
                    country_name: location?.country,
                    latitude: location?.latitude,
                    longitude: location?.latitude,
                    postal: location?.postal_code,
                    state: location?.subdivision,
                    ...location
                }
            }

        } catch (error) {
            try {
                const res = await fetch("https://geolocation-db.com/json")
                const location = await res.json()

                if (location) {
                    return {
                        browser_name: rdd.browserName ?? "N/A",
                        platform: navigator?.userAgentData?.platform,
                        ...location,
                        browser_version: rdd.browserVersion ?? "N/A",
                        is_mobile_user: navigator?.userAgentData?.mobile ?? rdd.isMobile,
                    }
                }
            } catch (error) {
                setIsPressed(false)
            }
        }
    }


    const [resendTimer, setResendTimer] = useState(0)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [step])
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);


    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue < 0 || String(numericValue)?.includes("+") || String(numericValue)?.includes("-") || String(numericValue)?.includes("e")) {
            return
        }
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...otpValues];
        newOTPValues[index] = numericValue;
        setOTPValues(newOTPValues);

        if (index === 0) {
            setCurrentActiveInput(1)
        }

        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1]?.focus();
            setCurrentActiveInput(prev => prev < 6 ? prev += 1 : prev)
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
    };


    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
                setCurrentActiveInput(prev => prev -= 1)
            } else if (index > 0) {
                const newOTPValues = [...otpValues];
                newOTPValues[index] = '';
                setOTPValues(newOTPValues);
                setIsAnyFieldEmpty(true)
            }
        }
    };

    const verifyOTpHandler = async (e, otp = "") => {
        e.preventDefault()
        setIsPressed(true)
        setIsLoginError("")
        const credentials = isEmail.test(email)
            ? { email, password, token: loginToken, code: otp || otpValues.join("") }
            : { phone: email, password, token: loginToken, code: otp || otpValues.join("") }

        const encrypted = encryptData(credentials)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-login-${currentOtpMethod === "auth" ? "auth" : "otp"}`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                console.log(decrypted)
                const token = decrypted?.token
                setIsOtpCorrect(true)
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${decrypted?.token}`)
                    .then(async res => {
                        const decrypted = decryptData(res.data.data)
                        const dec = decryptData(res.data.data)
                        setShowInactivityModal(false)
                        if (dec?.country?.status) {
                            const data = await getUserInfo()
                                .catch(() => {
                                    const path = sessionStorage.getItem("path")
                                    localStorage.setItem("login", true)
                                    localStorage.setItem("token", token)
                                    setData({
                                        pfp: dec?.profileImage?.url,
                                        name: dec?.account_type === "individual" ? dec?.first_name + " " + dec?.last_name : dec?.company_name,
                                        loginMethod: loginMethod,
                                        credential: email,
                                    })
                                    setUserDetails(dec)
                                    if (path && path !== "undefined") {
                                        navigate(path)
                                    } else {
                                        navigate("/")
                                    }
                                    sessionStorage.clear()
                                })
                            const encrypted = encryptData(
                                {
                                    accountId: decrypted?._id,
                                    ...data
                                }
                            )
                            if ((data?.privacy?.is_proxy === true || data?.privacy?.is_tor === true || data?.privacy?.is_vpn === true) && !dec?.isVpnAllowed) {
                                setShowNoticeModal(true);
                            } else {
                                localStorage.setItem("login", true)
                                localStorage.setItem("token", token)
                                setUserDetails(dec)
                                setData({
                                    pfp: dec?.profileImage?.url,
                                    name: dec?.account_type === "individual" ? dec?.first_name + " " + dec?.last_name : dec?.company_name,
                                    loginMethod: loginMethod,
                                    credential: email,
                                })
                                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/login/create-login-history`, {
                                    data: encrypted
                                })
                                    .then(res => {
                                        const path = sessionStorage.getItem("path")
                                        if (path && path !== "undefined") {
                                            navigate(path)
                                        } else {
                                            navigate("/")
                                        }
                                        sessionStorage.clear()
                                        setIsPressed(false)
                                    })
                                    .catch(err => {
                                        setIsPressed(false)
                                        setIsLoginError("Something went wrong while creating login details")
                                        const path = sessionStorage.getItem("path")
                                        console.log(path)
                                        if (path && path !== "undefined") {
                                            navigate(path)
                                        } else {
                                            navigate("/")
                                        }
                                        sessionStorage.clear()
                                    })
                            }
                        }
                        else {
                            setUserDetails(dec)
                            sessionStorage.setItem("country_status_error", "Service not available in your country!")
                        }
                    })
                    .catch(err => {
                        // console.log(decryptData(err.response.data.data))
                        setIsPressed(false)
                        setIsLoginError("Something went wrong while getting account details")
                    })
            })
            .catch(error => {
                const decrypted = decryptData(error?.response?.data?.data)
                console.log(decrypted)
                setIsPressed(false)
                if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                } else {
                    setIsLoginError("Uh-Oh! You entered incorrect OTP.")
                    setOTPValues(Array(numberOfFields).fill(""))
                    setConsecutiveCount(prev => prev + 1)
                    setTimeout(() => {
                        setOtpVerified(false)
                        inputRefs.current[0]?.focus()
                        setCurrentActiveInput(1)
                    }, 2000);
                }
            })
            .finally(() => {
                setOtpVerified(true)
            })
    }

    const handlePaste = (event) => {
        event.preventDefault();
        console.log(event)
        const pasteData = event?.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields);
        let newOTPValues = [...otpValues];

        pasteData.split('').forEach((char, index) => {
            newOTPValues[index] = char;
        });
        setCurrentActiveInput(6)

        setOTPValues(newOTPValues);


        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
        if (!isEmpty) {
            verifyOTpHandler({ preventDefault: () => { } }, newOTPValues.join(""))
        }
    };

    const handleOtpMethod = (method) => {
        setOTPValues(Array(numberOfFields).fill(''))
        inputRefs?.current?.[0]?.focus()

        if (resendTimer > 0 && lastOtpSentTo && (method === 'sms' || method === 'insta' || method === "wp")) {
            setCurrentOtpMethod(method);
            return;
        }

        if ((method !== "biometric") && (method === "auth" || resendTimer === 0)) {
            loginHandler({ preventDefault: () => { } }, method);
        }

        setCurrentOtpMethod(method);
    }

    const handleBiometricVerification = async () => {
        try {
            setIsPressed(true)
            setIsLoginError("")

            const emailOrPhone = isEmail.test(email) ?
                { email: email } :
                { phone: email }

            const response1 = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/login-biometric-challenge`, {
                data: encryptData(emailOrPhone)
            })

            const dec1 = await decryptData(response1.data.data)

            const credentials = await startAuthentication(dec1.options)

            console.log(dec1)
            const verificationData = {
                account_id: dec1.account_id,
                credentials,
            }



            const response2 = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/login-biometric-verify`, {
                data: encryptData(verificationData)
            })

            const dec2 = await decryptData(response2.data.data)

            const token = dec2?.token
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${token}`)
                .then(async res => {
                    const decrypted = decryptData(res.data.data)
                    const dec = decryptData(res.data.data)
                    setShowInactivityModal(false)
                    if (dec?.country?.status) {
                        const data = await getUserInfo()
                            .catch(() => {
                                const path = sessionStorage.getItem("path")
                                localStorage.setItem("login", true)
                                localStorage.setItem("token", token)
                                setUserDetails(dec)
                                setData({
                                    pfp: dec?.profileImage?.url,
                                    name: dec?.account_type === "individual" ? dec?.first_name + " " + dec?.last_name : dec?.company_name,
                                    loginMethod: loginMethod,
                                    credential: email,
                                })
                                if (path && path !== "undefined") {
                                    navigate(path)
                                } else {
                                    navigate("/")
                                }
                                sessionStorage.clear()
                            })
                        const encrypted = encryptData(
                            {
                                accountId: decrypted?._id,
                                ...data
                            }
                        )
                        if (data?.privacy?.is_proxy === true || data?.privacy?.is_tor === true || data?.privacy?.is_vpn === true) {
                            setShowNoticeModal(true);
                        } else {
                            localStorage.setItem("login", true)
                            localStorage.setItem("token", token)
                            setUserDetails(dec)
                            setData({
                                pfp: dec?.profileImage?.url,
                                name: dec?.account_type === "individual" ? dec?.first_name + " " + dec?.last_name : dec?.company_name,
                                loginMethod: loginMethod,
                                credential: email,
                            })
                            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/login/create-login-history`, {
                                data: encrypted
                            })
                                .then(res => {
                                    const path = sessionStorage.getItem("path")
                                    if (path && path !== "undefined") {
                                        navigate(path)
                                    } else {
                                        navigate("/")
                                    }
                                    sessionStorage.clear()
                                    setIsPressed(false)
                                })
                                .catch(err => {
                                    setIsPressed(false)
                                    setIsLoginError("Something went wrong while creating login details")
                                    const path = sessionStorage.getItem("path")
                                    console.log(path)
                                    if (path && path !== "undefined") {
                                        navigate(path)
                                    } else {
                                        navigate("/")
                                    }
                                    sessionStorage.clear()
                                })
                        }
                    } else {
                        sessionStorage.setItem("country_status_error", "Service not available in your country!")
                    }
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                    setIsPressed(false)
                    setIsLoginError("Something went wrong while getting account details")
                })


        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            setIsLoginError("Biometric verification failed");
        }
        finally {
            setIsPressed(false)
        }
    };


    useEffect(() => {
        let timeout;
        if (resendTimer > 0) {
            timeout = setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
        }

        return () => {
            clearTimeout(timeout)
        }
    }, [resendTimer])

    useEffect(() => {
        setOTPValues(Array(numberOfFields).fill(""))
        setIsLoginError("")
    }, [step])

    useEffect(() => {
        setIsLoginError("")
    }, [email, password])

    useEffect(() => {
        if (resendTimer === 0) {
            setLastOtpSentTo(null);
        }
    }, [resendTimer]);

    const resetOtpStates = () => {
        setOTPValues(Array(numberOfFields).fill('')) // Reset OTP input values
        setCurrentActiveInput(1) // Reset active input field
        setIsAnyFieldEmpty(true) // Reset field empty check
        setOtpVerified(false) // Reset OTP verification status
        setIsOtpCorrect(false) // Reset OTP correctness check
        setConsecutiveCount(0) // Reset consecutive attempts counter
        setLastOtpSentTo(null) // Reset last OTP method
        setIsLoginError('') // Reset login error message
        setResendTimer(0) // Reset resend timer
        setStep(1) // Reset step to 1
    }

    const noticeMessage = `It appears that your connection is being made through a VPN, proxy, or TOR network. For security and compliance reasons, please disable any such services and refresh the page to continue using InstaPay.`;

    return (
        <>
            <Modal isOpen={showNoticeModal}>
                <ModalHeader>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                            <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="red" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        <h4 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "0", color: "red" }}>{t("Notice")}</h4>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "15px" }}>
                        {t(noticeMessage)}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "0px" }}>
                        {t("Thank you for your understanding.")}
                    </p>

                </ModalBody>
                <ModalFooter>
                    <button style={{ borderRadius: "8px", backgroundColor: "#5926f0", fontWeight: 600, border: "none", outline: "none", color: "white", padding: "10px 20px" }} onClick={() => window.location.reload()}>
                        {t("Refresh Page")}
                    </button>
                </ModalFooter>
            </Modal>
            <form onSubmit={emailVerified ? loginHandler : checkEmailHandler} className={styles.form_details} style={width > 1000 ? { opacity: step === 1 ? 1 : 0, pointerEvents: step === 1 ? "all" : "none" } : { display: step === 1 ? "inherit" : "none" }}>
                <div className={styles.left}>
                    <h1>{t("Login")}</h1>
                    <p>{t("Start Your InstaPay Journey Today!")}</p>
                    {
                        width < 1000
                        &&
                        <LanguagePicker />
                    }
                </div>
                <div className={styles.right}>
                    {
                        !emailVerified
                            ?
                            <>
                                {!showQuickLogin ? <>
                                    <div className={styles.inp_con}>
                                        <label>{loginMethod === "phone" ? t("Enter your phone number") : t("Enter Your Email")}</label>
                                        {
                                            loginMethod === "phone"
                                                ?
                                                <PhoneInput
                                                    setPhone={setEmail}
                                                    country={country}
                                                />
                                                :
                                                <input type="email" placeholder={t("eg: john@doe.org")} value={email} onChange={e => setEmail(e.target.value?.toLowerCase())} autoComplete="on" name="email" />
                                        }
                                        <div
                                            className={styles.loginWith}
                                            onClick={() => {
                                                setLoginMethod(loginMethod === "email" ? "phone" : "email")
                                                localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                                                setEmail("")
                                            }}
                                        >
                                            {
                                                loginMethod === "email"
                                                    ?
                                                    t("Login With Phone Number")
                                                    :
                                                    t("Login with email")
                                            }
                                            {/* {t("Login with")} {loginMethod === "email" ? t("Phone Number") : t("Email")} */}
                                        </div>
                                    </div>
                                </> :
                                    <>
                                        <div className={styles.inp_con}>
                                            <label>{t("Welcome Back!")}</label>
                                            <div className={styles.user_info}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    {loginData?.pfp ?
                                                        <img style={{ width: "50px", borderRadius: "100%", height: "50px", objectFit: "cover", flexShrink: 0 }} src={loginData?.pfp} alt="" /> :
                                                        <div className={styles.dp}>{loginData?.name?.[0]?.toUpperCase()}</div>
                                                    }
                                                    <div>
                                                        <h4 style={{ marginBottom: "0", fontWeight: 600, color: "black", fontSize: "15px" }}>{loginData?.name}</h4>
                                                    </div>
                                                </div>
                                                {width > 1000 &&
                                                    <div
                                                        className={styles.loginWith}
                                                        onClick={() => {
                                                            setShowQuickLogin(false)
                                                            setEmail("")
                                                        }}
                                                        style={{ position: "relative", top: "0", left: "0px", flexShrink: 0 }}
                                                    >
                                                        {t("Change Account")}
                                                    </div>
                                                }
                                            </div>

                                            {width < 1000 &&
                                                <div
                                                    className={styles.loginWith}
                                                    onClick={() => {
                                                        setShowQuickLogin(false)
                                                        setEmail("")
                                                    }}
                                                    style={{ position: "relative", top: "0", left: "0px", margin: "20px auto" }}
                                                >
                                                    {t("Change Account")}
                                                </div>
                                            }
                                        </div>
                                    </>
                                }
                            </>
                            :
                            <div className={`${styles.inp_con} ${styles.password_field}`}>
                                <label>{t("Enter Your Password")}</label>
                                <div style={{
                                    position: "relative",
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                    <input type={showPassword ? "text" : "password"} placeholder={t("Enter your password")} value={password} onChange={e => setPassword(e.target.value)} />
                                    <div style={{
                                        position: "absolute",
                                        top: "55%",
                                        right: "10px",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer"
                                    }}
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        {
                                            showPassword
                                                ?
                                                <EyeOff />
                                                :
                                                <Eye />
                                        }
                                    </div>
                                </div>
                                <Link to={"/forgot-password"} className={styles.forgot_pass}>
                                    {t("Forgot Password?")}
                                </Link>
                            </div>
                    }
                    {
                        isLoginError
                        &&
                        <div className={styles.input_error}>
                            <AlertTriangle size={17} color="#F32D2D" />
                            <span>{profileLockTIme > 0 ? isLoginError : t(isLoginError)}</span>
                        </div>
                    }
                    <div className={styles.center_bottom}>
                        {
                            (emailVerified && width < 1000)
                            &&
                            <button type="button" className={styles.go_back_btn}
                                onClick={() => {
                                    setPassword("")
                                    setEmailVerified(false)
                                }}>
                                {t("Back")}
                            </button>
                        }
                        <div className={styles.bottom_text}>
                            <span>{t("Don't Have an Account? Sign Up").split("?")?.[0]} </span>
                            <Link to={"/signup"} onClick={() => setIsLoginForm(false)}>{t("Sign Up")}</Link>
                        </div>
                        <div className={styles.btns}>
                            {
                                (emailVerified && width > 1000)
                                &&
                                <button type="button" className={styles.go_back_btn}
                                    onClick={() => {
                                        setPassword("")
                                        setEmailVerified(false)
                                    }}
                                >
                                    {t("Back")}
                                </button>
                            }
                            <button type="submit" className={styles.form_btn} disabled={isLoginError || isPressed || (emailVerified ? !password || (!isPhoneNumber.test(email) && !isEmail.test(email)) : (!isPhoneNumber.test(email) && !isEmail.test(email)))}>
                                <span>{
                                    !emailVerified
                                        ?
                                        <>
                                            {
                                                isPressed
                                                    ?
                                                    t("Continuing")
                                                    :
                                                    t("Continue")
                                            }
                                        </>
                                        :
                                        <>
                                            {
                                                isPressed
                                                    ?
                                                    t("Processing")
                                                    :
                                                    t("Login")
                                            }
                                        </>
                                }</span>
                                <ChevronRight size={28} color="white" />
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {
                step === 1
                    ?
                    <AuthenticatorDetails />
                    :
                    <form onSubmit={verifyOTpHandler} className={styles.otp}>
                        <div className={styles.left}>
                            <h1>{currentOtpMethod === "biometric" ? t("Biometric Verification") :
                                currentOtpMethod === "auth" ? t("Google Authenticator") :
                                    currentOtpMethod === "insta" ? t("Instagram") : currentOtpMethod === "wp" ? t("Whatsapp") :
                                        t("SMS Verification").replace("SMS", email.slice(0, 3) === "971" ? "Whatsapp" : "SMS")}</h1>
                            <p>{t("Start Your InstaPay Journey Today!")}</p>
                            {
                                width < 1000
                                &&
                                <LanguagePicker />
                            }
                        </div>
                        <div className={styles.right}>
                            <div className={styles.top}>
                                {currentOtpMethod === "biometric" ? (
                                    <div className={styles.biometric_section}>
                                        <h4 style={{ color: "#545454", fontSize: "1rem", fontWeight: 600 }}>
                                            {t("Verify identity using your created Passkey on this device")}
                                        </h4>
                                        <button
                                            onClick={handleBiometricVerification}
                                            className={styles.otpMethodButton}
                                            type="button"
                                            style={{
                                                border: "none",
                                                outline: "none",
                                                backgroundColor: "#f5f5f5",
                                                padding: "10px 1.5rem",
                                                borderRadius: "5px",
                                                width: "100%"
                                            }}
                                        >
                                            <img width={30} src={BiometricSvg} alt="" />
                                            <span>
                                                {t("Click to Continue with Biometric")}
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    // Existing OTP input fields
                                    <div className={styles.otp_inp}>
                                        <label>
                                            {
                                                currentOtpMethod === "auth"
                                                    ?
                                                    t("Google Authenticator Code")
                                                    :
                                                    currentOtpMethod === "insta"
                                                        ?
                                                        t("Enter the code sent to your Instagram Account")
                                                        :
                                                        currentOtpMethod === "wp"
                                                            ?
                                                            t("Enter the code send on your Whatsapp")
                                                            :
                                                            t(`Enter the SMS code sent to +41********4053`)
                                                                .replace(
                                                                    "+41********4053",
                                                                    isEmail.test(email)
                                                                        ?
                                                                        `${email.slice(0, 4).split("").map(_ => "*").join("")}${email.slice(4)}`
                                                                        :
                                                                        `${email.slice(0, email.length - 4).split("").map(_ => "*").join("")}${email.slice(email.length - 4)}`
                                                                ).replace("SMS", email.slice(0, 3) === "971" ? "Whatsapp" : "SMS")
                                            }
                                        </label>
                                        <FaceAnimation currentInput={currentActiveInput} verification={otpVerified} isCorrect={isOtpCorrect} startTyping />
                                        <div
                                            style={{ animation: otpVerified && !isOtpCorrect ? "horizontal-shaking 0.5s ease-in-out" : "" }}
                                            className={styles.otp_inputs + " " + (otpVerified && (!isOtpCorrect ? "wrong" : "correct"))}
                                        >
                                            {otpValues.map((value, index) => (
                                                <input
                                                    key={`otp-input-${index}`}
                                                    maxLength={1}
                                                    disabled={isOtpCorrect}
                                                    value={value}
                                                    onPaste={handlePaste}
                                                    onChange={(e) => {
                                                        setIsLoginError("")
                                                        handleInputChange(index, e.target.value)
                                                    }}
                                                    onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                    ref={(input) => (inputRefs.current[index] = input)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {width < 1000 && (
                                    <div className={styles.btns}>
                                        <button type="submit"
                                            className={styles.form_btn}
                                            disabled={isAnyFieldEmpty || otpValues.some(item => !item) || isPressed || isLoginError}
                                        >
                                            <span>{
                                                (isPressed && !methodLoading)
                                                    ?
                                                    t("Verifying")
                                                    :
                                                    t("Verify")
                                            }</span>
                                            <ChevronRight size={28} color="white" />
                                        </button>
                                    </div>
                                )}
                                <div style={{ paddingTop: "10px" }} className={styles.toggle_sms}>
                                    {
                                        (consecutiveCount >= 3 && !isLoginError.includes('account is locked')) &&
                                        <div className={styles.input_error}>
                                            <span>{t("Having trouble receiving/verifying your code? Choose another method below or contact support.")}</span>
                                        </div>
                                    }

                                    {
                                        currentOtpMethod === "auth"
                                        &&
                                        <span>{t("Problem with the token?")}</span>
                                    }

                                    {methods.filter(m => m.attr !== "sms").some(m => m.avail === true)
                                        &&
                                        <p style={{ alignSelf: "baseline" }}>
                                            {t("Choose your preferred method to verify your identity:")}
                                        </p>
                                    }
                                    <div className={styles.otp_methods}>
                                        {isMobile ? (
                                            <>
                                                {methods.map((method, index) => {
                                                    if (method.avail && method.attr !== currentOtpMethod) {
                                                        return (
                                                            <button
                                                                key={index}
                                                                className={styles.otpMethodButton}
                                                                type="button"
                                                                disabled={isPressed || methodLoading}
                                                                onClick={() => handleOtpMethod(method.attr)}
                                                            >
                                                                <img
                                                                    src={method.icon}
                                                                    alt=""
                                                                />
                                                                <span style={{ marginBottom: "0", textDecoration: "underline", textDecorationColor: "white", color: 'black', whiteSpace: 'nowrap' }}
                                                                >
                                                                    {t(method.text)}
                                                                </span>
                                                            </button>
                                                        )
                                                    }
                                                    return null;
                                                })}
                                            </>
                                        ) : (
                                            // Desktop flow
                                            <>
                                                {methods.map((method, index) => {
                                                    if (method.avail && method.attr !== currentOtpMethod) {
                                                        return (
                                                            <button
                                                                key={index}
                                                                className={styles.otpMethodButton}
                                                                type="button"
                                                                disabled={isPressed || methodLoading}
                                                                onClick={() => handleOtpMethod(method.attr)}
                                                            >
                                                                <img
                                                                    src={method.icon}
                                                                    alt=""
                                                                />
                                                                <span style={{ marginBottom: "0" }}>
                                                                    {t(method.text)}
                                                                </span>
                                                            </button>
                                                        )
                                                    }
                                                    return null;
                                                })}
                                            </>
                                        )}
                                    </div>
                                    {
                                        (currentOtpMethod !== "auth" && currentOtpMethod !== "biometric")
                                        &&
                                        <span>
                                            {
                                                resendTimer > 0
                                                    ? (lastOtpSentTo && ['sms', 'insta', 'wp'].includes(currentOtpMethod) && lastOtpSentTo !== currentOtpMethod)
                                                        ? <span> {t(`You have already requested code on ${lastOtpSentTo === 'sms' ? 'SMS' : lastOtpSentTo === "wp" ? "Whatsapp" : 'Instagram'}, wait ${resendTimer} seconds to get code on ${currentOtpMethod}`)} </span>
                                                        :
                                                        <span>{t("Resend code in 30 seconds").replace("30", resendTimer)}</span>
                                                    :
                                                    <> <span>{t("Didn't receive OTP?") + " "}</span> <span style={{ color: "#5926f0", cursor: "pointer" }} onClick={() => {
                                                        setLastOtpSentTo(currentOtpMethod);
                                                        setOTPValues(Array(numberOfFields).fill(''))
                                                        loginHandler({ preventDefault: () => { } }, currentOtpMethod)
                                                        setResendTimer(120)
                                                    }}>{t("Resend Now")}</span></>
                                            }
                                        </span>
                                    }

                                </div>
                                {
                                    isLoginError
                                    &&
                                    <div className={styles.input_error}>
                                        <AlertTriangle size={17} color="#F32D2D" />
                                        <span>{t(isLoginError)}</span>
                                    </div>
                                }
                            </div>
                            <div className={styles.center_bottom}>
                                {
                                    width < 1000
                                    &&
                                    <button type="button" className={styles.go_back_btn} onClick={resetOtpStates}>
                                        {t("Back")}
                                    </button>
                                }
                                <div className={styles.bottom_text}>
                                    <span>{t("Don't Have an Account? Sign Up").split("?")?.[0]} </span>
                                    <Link to={"/signup"} onClick={() => setIsLoginForm(false)}>{t("Sign Up")}</Link>
                                </div>
                                <div className={styles.btns}>
                                    {
                                        width > 1000
                                        &&
                                        <button type="button" className={styles.go_back_btn} onClick={resetOtpStates}>
                                            {t("Back")}
                                        </button>
                                    }
                                    {width > 1000 &&
                                        <button type="submit"
                                            className={styles.form_btn}
                                            disabled={isAnyFieldEmpty || otpValues.some(item => !item) || isPressed || isLoginError}
                                        >
                                            <span>{
                                                (isPressed && !methodLoading)
                                                    ?
                                                    t("Verifying")
                                                    :
                                                    t("Verify")
                                            }</span>
                                            <ChevronRight size={28} color="white" />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </form>
            }
        </>
    )
}

export default Login

export const AuthenticatorDetails = () => {
    const { t } = useTranslation()
    return (
        <div className={styles.auth_details}>
            <div className={styles.left}>
                <h5>{t("Two-factor authentication (2FA) is the best way to protect yourself online.")}</h5>
                <p>{t("We recommend you download and install the Google Authenticator app to ensure you receive your verification codes instantly, avoiding any SMS delays or issues.")}</p>
                <div className={styles.download_info}>
                    <a rel="noreferrer" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                        <img src={gs} alt="" />
                    </a>
                    <a rel="noreferrer" href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank">
                        <img src={as} alt="" />
                    </a>
                </div>
            </div>
            <div className={styles.right}>
                <a rel="noreferrer" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                    <img src={authenticator} alt="" />
                </a>
                <h4>{t("Strong security with Google Authenticator")}</h4>
            </div>
        </div>
    )
}