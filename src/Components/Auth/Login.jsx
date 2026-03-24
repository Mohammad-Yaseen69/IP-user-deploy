import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import PhoneInput from "../PhoneInput";
import { AlertTriangle, ChevronRight, Eye, EyeOff, Mail } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gs from "./files/gs.svg"
import as from "./files/as.svg"
import authenticator from "./files/authenticator.png"
import axios from "axios";
import LanguagePicker from "../LanguagePicker";
import FaceAnimation from "./FaceAnimation"
import BiometricSvg from "../../assets/icons/fingerprint.png"
import { startAuthentication } from "@simplewebauthn/browser"
import * as rdd from "react-device-detect";
import { authIcon, instaIcon, smsIcon, whatsappIcon, email as emailIcon } from "./files"
import "./styles/index.module.css";
import useWindowWidth from "../../utils/useWindowWidth";
import i18next from "i18next";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import localforage from "localforage"
import InstaPayLoader from "../Loader";
import { logger } from "@sentry/react";
import VpnModal from "./VpnModal";
import LocationDeniedModal from "./LocationDeniedModal";
const Login = ({ country, setIsLoginForm, setIsForgot }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const location = useLocation();
    const params = new URLSearchParams(location.search || "");
    const redirectQuery = params.get("redirect");
    const redirect = location?.state?.redirect ?? (redirectQuery ? decodeURIComponent(redirectQuery) : null)
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
    const [pendingOtpMethod, setPendingOtpMethod] = useState(null)
    const [isMobile] = useState(((rdd.isMobile || rdd.isMobileSafari) && (!rdd.isAndroid || !rdd.isIOS)) ?? false)
    const [isInstagramBrowser, setisInstagramBrowser] = useState()
    const [lastOtpSentTo, setLastOtpSentTo] = useState(null);
    const [consecutiveCount, setConsecutiveCount] = useState(0)
    const [firstTime, setFirstTime] = useState(true)
    const [hasChangedMethodOnce, setHasChangedMethodOnce] = useState(false)
    const width = useWindowWidth()
    const [methodLoading, setMethodLoading] = useState(false)
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [loginData, setLoginData] = useState(null)
    const [showQuickLogin, setShowQuickLogin] = useState(false)
    const [biometricLoading, setBiometricLoading] = useState(false)
    const [biometricSuccessfull, setBiometricSuccessfull] = useState(false)
    const [showRestoreModal, setShowRestoreModal] = useState(false)
    const [accountRestoreDetails, setAccountRestoreDetails] = useState(null)
    const [restoreLoading, setRestoreLoading] = useState(false)
    const [pendingLoginData, setPendingLoginData] = useState(null)
    const [capturedSecurityData, setCapturedSecurityData] = useState(null)
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
            avail: false,
            icon: smsIcon,
            attr: "sms",
            text: "SMS"
        },
        {
            avail: false,
            icon: emailIcon,
            attr: "email",
            text: "Email"
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



    const setData = async (data) => {
        await localforage.setItem("loginData", data)
    }




    const loginHandler = async (e, method = undefined, restoreAccount = false) => {
        e.preventDefault()
        setIsPressed(true)
        setIsLoginError("")

        const getLocation = () => {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    resolve(null);
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 20000,
                    enableHighAccuracy: true,
                    maximumAge: 0
                });
            });
        };

        let locationInput = null;
        if (capturedSecurityData?.locationData) {
            locationInput = capturedSecurityData.locationData;
        } else if (step === 1) {
            try {
                locationInput = await getLocation();
            } catch (error) {
                logger.error("Location error occured", {
                    error: error
                })
                if (error.code === 1) {
                    if (rdd.isSafari || rdd.isMobileSafari) {
                        try {
                            locationInput = await new Promise((resolve, reject) => {
                                navigator.geolocation.getCurrentPosition(resolve, reject, {
                                    timeout: 10000,
                                    enableHighAccuracy: true,
                                    maximumAge: 0
                                });
                            });
                        } catch (error2) {
                            logger.error("Location error occured in safari", {
                                error: error2
                            })
                            setPendingLoginData({ method, restoreAccount, isPendingRetry: true });
                            setShowLocationModal(true);
                            setIsPressed(false);
                            setMethodLoading(false);
                            setRestoreLoading(false);
                            return;
                        }
                    } else {
                        setPendingLoginData({ method, restoreAccount, isPendingRetry: true });
                        setShowLocationModal(true);
                        setIsPressed(false);
                        setMethodLoading(false);
                        setRestoreLoading(false);
                        return;
                    }
                }

                console.warn("Geolocation warning:", error);
            }
        }

        setConsecutiveCount(1)
        if (method) {
            setMethodLoading(true)
        }
        if (restoreAccount) {
            setRestoreLoading(true)
        }
        const isAuth = method ? (method === "auth") : (currentOtpMethod === "auth");
        const isInsta = method ? (method === "insta") : (currentOtpMethod === "insta" || currentOtpMethod !== "sms" && currentOtpMethod !== "email" && currentOtpMethod !== "wp");
        const isWp = method ? (method === "wp") : (currentOtpMethod === "wp");
        const isEmailOtp = method ? (method === "email") : (currentOtpMethod === "email");


        const credentials = isEmail.test(email)
            ? {
                email,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : isEmailOtp ? "email" : "email",
                first_time: firstTime,
                ...(restoreAccount && { restoreAccount: true })
            }
            : {
                phone: email,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : isEmailOtp ? "email" : "",
                first_time: firstTime,
                ...(restoreAccount && { restoreAccount: true })
            };
        const encrypted = encryptData(credentials)




        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/send-login-otp`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                const isVpnAllowed = decrypted?.isVpnAllowed
                setFirstTime(false)
                if (!restoreAccount && decrypted?.status === false && decrypted?.accountDetails?.requiresConfirmation === true) {
                    setAccountRestoreDetails(decrypted)
                    setShowRestoreModal(true)
                    setIsPressed(false)
                    setMethodLoading(false)
                    return
                }
                setMethods(prevMethods => prevMethods.map(method => {
                    switch (method.attr) {
                        case 'auth':
                            return { ...method, avail: decrypted?.tfa || false };
                        case 'wp':
                            return { ...method, avail: decrypted?.whatsapp };
                        case 'insta':
                            return { ...method, avail: !isInstagramBrowser && (decrypted?.instagram || false) };
                        case 'biometric':
                            return { ...method, avail: !isInstagramBrowser && (decrypted?.biometric || false) };
                        case 'sms':
                            return { ...method, avail: !!decrypted?.phone };
                        case 'email':
                            return { ...method, avail: !!decrypted?.email };
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
                    if (decrypted?.otpMethod === "email") {
                        setLastOtpSentTo("email")
                    } else {
                        setLastOtpSentTo("sms")
                    }
                }

                const handleMethods = () => {
                    if (method === undefined) {
                        if (decrypted?.biometric && !isInstagramBrowser) return "biometric";
                        if (decrypted?.tfa && decrypted?.message === "authenticator") return "auth";
                        if (decrypted?.message === "instagram" && !isInstagramBrowser) return "insta";
                        if (decrypted?.message === "whatsapp") return "wp";
                        if (decrypted?.otpMethod === "email" || (decrypted?.email && !decrypted?.phone)) return "email";
                        return "sms";
                    } else {
                        return method
                    }
                }

                setCurrentOtpMethod(handleMethods())

                const currentSelection = handleMethods();
                if ((currentSelection === "insta" || currentSelection === "sms" || currentSelection === "wp" || currentSelection === "email")) {
                    setResendTimer(120)
                }
                setLoginToken(decrypted?.token)
                if (restoreAccount) {
                    setShowRestoreModal(false)
                    setAccountRestoreDetails(null)
                    setRestoreLoading(false)
                }

                performSecurityChecks(isVpnAllowed, locationInput)

            })
            .catch(error => {
                setIsPressed(false)
                setMethodLoading(false)
                if (restoreAccount) {
                    setRestoreLoading(false)
                }
                const decrypted = decryptData(error?.response?.data?.data)
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
                    setIsLoginError(decrypted?.message)
                }
                if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                }
            })
    }

    console.log(methods)
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





    const getUserInfo = async (username) => {
        try {
            const res = await fetch(`https://iplocate.io/api/lookup?apikey=${import.meta.env.VITE_IP_LOCATE_API_KEY}`)
            const location = await res.json()

            logger.info(`IP Locate api called for user: ${username} `, {
                data: location
            })
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
            logger.error(`IP Locate api failed at ${Date.now().toLocaleString()} for user: ${username}`, {
                error: error
            })
            console.log("ip locate failed")
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

    const performSecurityChecks = async (isVpnAllowed, input = null) => {
        setIsPressed(true);
        const ipInfo = await getUserInfo(email);

        const finishSecurityChecks = async (locationData = {}) => {
            setCapturedSecurityData({ ipInfo, locationData });
            setStep(2);
            setIsPressed(false);
            setMethodLoading(false);
        }

        if ((ipInfo?.privacy?.is_proxy || ipInfo?.privacy?.is_tor || ipInfo?.privacy?.is_vpn) && !isVpnAllowed) {
            setShowNoticeModal(true);
            setIsPressed(false);
            setMethodLoading(false);
            return;
        }

        const handleLocation = async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await res.json();
                const locationData = {
                    latitude,
                    longitude,
                    country_name: data.countryName,
                    country_code: data.countryCode,
                    city: data.city,
                    state: data.principalSubdivision,
                    postal: data.postcode
                };
                finishSecurityChecks(locationData);
            } catch (error) {
                console.error("Error fetching reverse geocode location data: ", error);
                finishSecurityChecks({ latitude, longitude });
            }
        }

        if (input && input.latitude) {
            finishSecurityChecks(input);
        } else if (input && input.coords) {
            await handleLocation(input);
        } else {
            finishSecurityChecks();
        }
    }

    const completeLoginProcess = async (userAccount, token) => {
        localStorage.setItem("login", true)
        localStorage.setItem("token", token)
        setUserDetails(userAccount)
        setData({
            pfp: userAccount?.profileImage?.url,
            name: userAccount?.account_type === "individual" ? userAccount?.first_name + " " + userAccount?.last_name : userAccount?.company_name,
            loginMethod: loginMethod,
            credential: email,
        })

        const ipInfo = capturedSecurityData?.ipInfo;
        const locationData = capturedSecurityData?.locationData || {};

        const historyData = {
            browser_name: rdd.browserName ?? "N/A",
            browser_version: rdd.browserVersion ?? "N/A",
            is_mobile_user: rdd.isMobile || rdd.isMobileSafari,
            IPv4: ipInfo?.IPv4 || ipInfo?.ip || "",
            city: locationData?.city || ipInfo?.city || "",
            country_code: locationData?.country_code || ipInfo?.country_code || "",
            country_name: locationData?.country_name || ipInfo?.country_name || "",
            latitude: locationData?.latitude || ipInfo?.latitude || "",
            longitude: locationData?.longitude || ipInfo?.longitude || "",
            postal: locationData?.postal || ipInfo?.postal || "",
            state: locationData?.state || ipInfo?.state || "",
            platform: rdd.osName || navigator.platform,
            accountId: userAccount?._id,
            language: navigator.language,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            deviceType: rdd.deviceType ?? "desktop",
        }

        console.log("Final Login History Data:", historyData);

        const encryptedWithLocation = encryptData(historyData);

        try {
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/login/create-login-history`, {
                data: encryptedWithLocation
            });
        } catch (err) {
            console.error("Login history creation failed:", err);
        } finally {
            const path = sessionStorage.getItem("path") && sessionStorage.getItem("path") !== "undefined" ? sessionStorage.getItem("path") : redirect || ""
            if (path && path !== "undefined") {
                navigate(path)
            } else {
                navigate("/")
            }
            sessionStorage.clear()
            setIsPressed(false)
            setBiometricLoading(false)
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
                        const dec = decryptData(res.data.data)
                        setShowInactivityModal(false)
                        if (dec?.country?.status) {
                            completeLoginProcess(dec, token)
                        }
                        else {
                            setUserDetails(dec)
                            sessionStorage.setItem("country_status_error", "Service not available in your country!")
                        }
                    })
                    .catch(err => {
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

        let shouldCallLoginHandler = false;

        if (resendTimer > 0 && lastOtpSentTo && (method === 'sms' || method === 'insta' || method === "wp" || method === "email")) {
            if (!hasChangedMethodOnce || lastOtpSentTo === method) {
                setHasChangedMethodOnce(true);
                setCurrentOtpMethod(method);
                if (resendTimer === 0) {
                    shouldCallLoginHandler = true;
                }
            } else {
                setPendingOtpMethod(method);
                return;
            }
        } else if (method !== "biometric" && (method === "auth" || resendTimer === 0)) {
            shouldCallLoginHandler = true;
            setCurrentOtpMethod(method);
        }

        if (method === "biometric") {
            setCurrentOtpMethod(method);
            return
        }

        if (shouldCallLoginHandler) {
            loginHandler({ preventDefault: () => { } }, method);
        }

        setPendingOtpMethod(null);
    }

    const handleBiometricVerification = async () => {
        try {
            setIsPressed(true)
            setIsLoginError("")
            setBiometricLoading(true)

            const emailOrPhone = isEmail.test(email) ?
                { email: email } :
                { phone: email }

            const response1 = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/login-biometric-challenge`, {
                data: encryptData(emailOrPhone)
            })

            const dec1 = await decryptData(response1.data.data)
            let credentials;
            try {
                credentials = await startAuthentication(dec1.options)

            } catch (err) {
                credentials = null
                setBiometricLoading(false)
                setIsPressed(false)
                console.log(err)
                setIsLoginError("Biometric verification failed..")
                return
            }

            console.log(dec1)
            const verificationData = {
                account_id: dec1.account_id,
                credentials,
            }

            console.log("biometric: challenge", dec1)
            console.log("biometric: credentials (attempt 1)", credentials)

            const tryVerify = async (attempt = 1) => {
                try {
                    const response2 = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/login-biometric-verify`, {
                        data: encryptData(verificationData)
                    })
                    const dec2 = await decryptData(response2.data.data)
                    return dec2
                } catch (err) {
                    const serverErr = err?.response?.data?.data ? decryptData(err.response.data.data) : err
                    logger.error(`Biometric verification failed! for ${email}`, {
                        credentials,
                        serverError: serverErr,
                        attempt,
                    })
                    if (attempt < 2) {
                        try {
                            await new Promise(r => setTimeout(r, 300))
                            const freshCreds = await startAuthentication(dec1.options)
                            verificationData.credentials = freshCreds
                            return await tryVerify(attempt + 1)
                        } catch (innerErr) {
                            console.error('biometric retry startAuthentication failed:', innerErr)
                            throw err
                        }
                    }
                    throw err
                }
            }

            const dec2 = await tryVerify()

            const token = dec2?.token
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${token}`)
                .then(async res => {
                    const dec = decryptData(res.data.data)
                    setShowInactivityModal(false)
                    if (dec?.country?.status) {
                        completeLoginProcess(dec, token)
                    } else {
                        sessionStorage.setItem("country_status_error", "Service not available in your country!")
                    }
                })
                .catch(err => {
                    setIsPressed(false)
                    setBiometricLoading(false)
                    setIsLoginError("Something went wrong while getting account details")
                })


            setBiometricSuccessfull(true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            setIsLoginError("Biometric verification failed");
            setBiometricLoading(false)
        }
        finally {
            setBiometricLoading(false)
            setIsPressed(false)
        }
    };


    console.log(resendTimer, pendingOtpMethod, currentOtpMethod, lastOtpSentTo)
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
            setPendingOtpMethod(null);
        }
    }, [resendTimer]);
    const resetOtpStates = () => {
        setOTPValues(Array(numberOfFields).fill(''))
        setCurrentActiveInput(1)
        setIsAnyFieldEmpty(true)
        setOtpVerified(false)
        setIsOtpCorrect(false)
        setConsecutiveCount(0)
        setLastOtpSentTo(null)
        setIsLoginError('')
        setResendTimer(0)
        setPendingOtpMethod(null)
        setCapturedSecurityData(null)
        setStep(1)
    }

    const resetLoginStates = () => {
        setEmail("")
        setPassword("")
        setEmailVerified(false)
        setIsPressed(false)
        setIsLoginError("")
        setLoginToken("")
        setStep(1)
        setCurrentOtpMethod("auth")
        resetOtpStates()
        setShowRestoreModal(false)
        setAccountRestoreDetails(null)
    }



    return (
        <>

            <VpnModal showNoticeModal={showNoticeModal} />

            <LocationDeniedModal
                isOpen={showLocationModal}
                toggle={() => setShowLocationModal(false)}
                onRetry={() => {
                    setShowLocationModal(false);
                    if (pendingLoginData?.isPendingRetry) {
                        const { method, restoreAccount } = pendingLoginData;
                        loginHandler({ preventDefault: () => { } }, method, restoreAccount);
                    }
                }}
            />

            <Modal isOpen={showRestoreModal} toggle={() => setShowRestoreModal(false)} centered>
                <ModalHeader toggle={() => setShowRestoreModal(false)}>
                    {t("Account Restoration")}
                </ModalHeader>
                <ModalBody>
                    <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                        {t("Your account is currently in the process of being deleted, as per your request. If you continue with the login, the deletion process will be canceled.")}
                    </p>
                </ModalBody>
                <ModalFooter style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <Button
                        color="secondary"
                        onClick={resetLoginStates}
                        disabled={restoreLoading}
                        style={{
                            background: "#f5f5f5",
                            border: "1px solid #e6e6e6",
                            color: "white",
                            borderRadius: "10px",
                            padding: "10px 20px"
                        }}
                    >
                        {t("Logout")}
                    </Button>
                    <Button
                        onClick={(e) => loginHandler(e, undefined, true)}
                        disabled={restoreLoading}
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 20px"
                        }}
                    >
                        {restoreLoading ? t("Proceeding...") : t("Proceed with login")}
                    </Button>
                </ModalFooter>
            </Modal>

            <form autoComplete="off" onSubmit={emailVerified ? loginHandler : checkEmailHandler} className={styles.form_details} style={width > 1000 ? { opacity: step === 1 ? 1 : 0, pointerEvents: step === 1 ? "all" : "none" } : { display: step === 1 ? "inherit" : "none" }}>
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
                                                <input type="email" placeholder={t("eg: john@doe.org")} value={email} onChange={e => setEmail(e.target.value?.toLowerCase())} autoComplete="off" name="email" />
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
                                    <input type={showPassword ? "text" : "password"} placeholder={t("Enter your password")} value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" />
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
                            <button type="submit" className={styles.form_btn} disabled={isLoginError || isPressed || (showQuickLogin ? emailVerified ? !password : false : emailVerified ? !password || (!isPhoneNumber.test(email) && !isEmail.test(email)) : (!isPhoneNumber.test(email) && !isEmail.test(email)))}>
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
                                        currentOtpMethod === "email" ? t("Email OTP Verification") :
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
                                        {biometricLoading || biometricSuccessfull ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', flexDirection: "column" }}>
                                                <span style={{ fontWeight: 600 }}>{biometricSuccessfull ? t("Biometric verification successful, We will redirect you to the dashboard page in a while.") : t('Please wait while we verify your biometric...')}</span>
                                                <div style={{ width: "100px" }}>
                                                    <InstaPayLoader />
                                                </div>
                                            </div>
                                        ) : (
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
                                                disabled={biometricLoading}
                                            >
                                                <img width={30} src={BiometricSvg} alt="" />
                                                <span>
                                                    {t("Click to Continue with Biometric")}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
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
                                                            currentOtpMethod === "email"
                                                                ?
                                                                t("Enter the code sent to your email")
                                                                :
                                                                t(`Enter the code sent to +41********4053`)
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
                                        (consecutiveCount >= 3 && !isLoginError.includes('account is locked') && methods?.length > 0) &&
                                        <div className={styles.input_error}>
                                            <span>{t("Having trouble receiving/verifying your code? Choose another method below or contact support.")}</span>
                                        </div>
                                    }

                                    {
                                        currentOtpMethod === "auth"
                                        &&
                                        <span>{t("Problem with the token?")}</span>
                                    }

                                    {methods.filter(m => m.avail).length > 1
                                        &&
                                        <p style={{ alignSelf: "baseline" }}>
                                            {t("Choose your preferred method to verify your identity:")}
                                        </p>
                                    }
                                    {methods.filter(m => m.avail).length > 1 &&
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
                                                                    disabled={isPressed || methodLoading || biometricLoading}
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
                                                <>
                                                    {methods.map((method, index) => {
                                                        if (method.avail && method.attr !== currentOtpMethod) {
                                                            return (
                                                                <button
                                                                    key={index}
                                                                    className={styles.otpMethodButton}
                                                                    type="button"
                                                                    disabled={isPressed || methodLoading || biometricLoading}
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
                                    }
                                    {
                                        <span>
                                            {
                                                resendTimer > 0
                                                    ? (methods.filter(m => m.avail).length > 1 && (lastOtpSentTo && ['sms', 'insta', 'wp', 'email'].includes(pendingOtpMethod || currentOtpMethod) && lastOtpSentTo !== (pendingOtpMethod || currentOtpMethod)) || (pendingOtpMethod && lastOtpSentTo !== currentOtpMethod))
                                                        ? <span> {t(`You have already requested code on ${lastOtpSentTo === 'sms' ? 'SMS' : lastOtpSentTo === "wp" ? "Whatsapp" : lastOtpSentTo === 'email' ? 'Email' : 'Instagram'}, wait ${resendTimer} seconds to get code on ${(pendingOtpMethod || currentOtpMethod) === 'sms' ? 'SMS' : (pendingOtpMethod || currentOtpMethod) === "wp" ? "Whatsapp" : (pendingOtpMethod || currentOtpMethod) === 'email' ? 'Email' : 'Instagram'}`)} </span>
                                                        :
                                                        currentOtpMethod !== "auth" && currentOtpMethod !== "biometric" && <span>{t("Resend code in 30 seconds").replace("30", resendTimer)}</span>
                                                    :
                                                    <>
                                                        {currentOtpMethod !== "auth" && currentOtpMethod !== "biometric" &&
                                                            <>
                                                                <span>{t("Didn't receive OTP?") + " "}</span>
                                                                <span
                                                                    style={{ color: "#5926f0", cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        setLastOtpSentTo(currentOtpMethod);
                                                                        setOTPValues(Array(numberOfFields).fill(''))
                                                                        loginHandler({ preventDefault: () => { } }, currentOtpMethod)
                                                                        setResendTimer(120)
                                                                    }}>{t("Resend Now")}
                                                                </span>
                                                            </>
                                                        }
                                                    </>
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
                    </form >
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