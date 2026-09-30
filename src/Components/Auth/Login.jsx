import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import PhoneInput from "../PhoneInput";
import { AlertTriangle, Eye, EyeOff, Mail } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gs from "./files/gs.svg"
import as from "./files/as.svg"
import authenticator from "./files/authenticator.webp"
import axios from "axios";
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
import { InputAdornment, Stack, TextField } from "@mui/material";
import { AlarmIcon } from "../PaymentAddressPublic/PayAsGuest/Svgs";

const linkStyle = {
    color: "#5926F0",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "150%",
    letterSpacing: "-0.28px",
    textDecoration: "underline"
};

const isPhoneNumber = /^\d{9,20}$/;
const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Login = ({ country, setIsLoginForm, }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const location = useLocation();
    const params = new URLSearchParams(location.search || "");
    const isQuickLoginRef = useRef(false)
    const redirectQuery = params.get("redirect");
    const redirect = location?.state?.redirect ?? (redirectQuery ? decodeURIComponent(redirectQuery) : null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoginError, setIsLoginError] = useState("")
    const [isPressed, setIsPressed] = useState(false)
    const [loginToken, setLoginToken] = useState("")
    const [step, setStep] = useState(1)
    const { profileLockTIme, setProfileLockTime, setUserDetails, setShowInactivityModal, setMissingTabsData } = useContext(UserContext)
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
    const [restoreLoading, setRestoreLoading] = useState(false)
    const [pendingLoginData, setPendingLoginData] = useState(null)
    const [capturedSecurityData, setCapturedSecurityData] = useState(null)
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const normalizeCredential = (value) => (value ?? "").toString().trim().toLowerCase();
    const getResolvedCredential = () => {
        const fromState = normalizeCredential(email);
        if (fromState) return fromState;

        if (isQuickLoginRef.current) {
            const fromQuickLogin = normalizeCredential(loginData?.credential);
            if (fromQuickLogin) return fromQuickLogin;
        }

        return "";
    };
    const [locationLoading, setLocationLoading] = useState(false);
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
            const savedCredential = normalizeCredential(data?.credential)
            if (data && savedCredential) {
                logger.info(`Local forage data for ${data?.name}`, {
                    data
                })
                isQuickLoginRef.current = true
                setLoginData(data)
                setShowQuickLogin(true)
                setLoginMethod(data?.loginMethod)
                setEmail(savedCredential)
            } else {
                isQuickLoginRef.current = false
                setLoginData(null)
                setShowQuickLogin(false)
            }
            setIsDataLoaded(true);
        }

        getData()
    }, [])

    const setData = async (data) => {
        await localforage.setItem("loginData", data)
    }

    const loginHandler = async (e, method = undefined, restoreAccount = false, isFirstTime = false) => {
        e.preventDefault()
        setIsPressed(true)
        setIsLoginError("")

        const getLocation = () => {
            setLocationLoading(true);
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    setLocationLoading(false);
                    resolve(null);
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setLocationLoading(false);
                        resolve(pos);
                    },
                    (err) => {
                        setLocationLoading(false);
                        reject(err);
                    },
                    {
                        timeout: 20000,
                        enableHighAccuracy: true,
                        maximumAge: 0
                    }
                );
            });
        };

        setConsecutiveCount(1)
        if (method) {
            setMethodLoading(true)
        }

        if (restoreAccount) {
            setRestoreLoading(true)
        }
        const credential = getResolvedCredential();
        const credentialIsEmail = isEmail.test(credential);
        const isCredentialValid = isPhoneNumber.test(credential) || credentialIsEmail;

        if (!isCredentialValid) {
            setIsLoginError("Uh-Oh! Please enter a valid email or phone number.")
            setIsPressed(false)
            setMethodLoading(false)
            if (restoreAccount) {
                setRestoreLoading(false)
            }
            return
        }

        if (credential !== email) {
            setEmail(credential)
        }

        const isAuth = method ? (method === "auth") : (currentOtpMethod === "auth");
        const isInsta = method ? (method === "insta") : (currentOtpMethod === "insta" || currentOtpMethod !== "sms" && currentOtpMethod !== "email" && currentOtpMethod !== "wp");
        const isWp = method ? (method === "wp") : (currentOtpMethod === "wp");
        const isEmailOtp = method ? (method === "email") : (currentOtpMethod === "email");


        const credentials = credentialIsEmail
            ? {
                email: credential,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : isEmailOtp ? "email" : "sms",
                first_time: isFirstTime || firstTime,
                ...(restoreAccount && { restoreAccount: true })
            }
            : {
                phone: credential,
                password,
                authenticator: isAuth,
                platform: (isInsta && !isInstagramBrowser) ? "instagram" : isWp ? "whatsapp" : isEmailOtp ? "email" : "",
                first_time: isFirstTime || firstTime,
                ...(restoreAccount && { restoreAccount: true })
            };
        // console.log("payload of the data :", credentials)
        const encrypted = encryptData(credentials)
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/send-login-otp`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                const isVpnAllowed = decrypted?.isVpnAllowed
                const isLocationRequired = decrypted?.isLocationRequired
                setFirstTime(false)
                if (!restoreAccount && decrypted?.status === false && decrypted?.accountDetails?.requiresConfirmation === true) {
                    setShowRestoreModal(true)
                    setIsPressed(false)
                    setMethodLoading(false)
                    return
                }
                // console.log("FULL LOGIN RESPONSE:", decrypted)
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
                    setRestoreLoading(false)
                }

                let locationInput = capturedSecurityData?.locationData || {};
                if (!locationInput.latitude && isLocationRequired && step === 1) {
                    try {
                        locationInput = await getLocation();
                    } catch (error) {
                        logger.error("Location error occured", {
                            code: error?.code,
                            message: error?.message,
                        })
                        if (error.code === 1) {
                            if (rdd.isSafari || rdd.isMobileSafari) {
                                try {
                                    setLocationLoading(true);
                                    locationInput = await new Promise((resolve, reject) => {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setLocationLoading(false);
                                                resolve(pos);
                                            },
                                            (err) => {
                                                setLocationLoading(false);
                                                reject(err);
                                            },
                                            {
                                                timeout: 10000,
                                                enableHighAccuracy: true,
                                                maximumAge: 0
                                            }
                                        );
                                    });
                                } catch (error2) {
                                    logger.error("Location error occured in safari", {
                                        code: error2?.code,
                                        message: error2?.message,
                                    })

                                    locationInput = {};
                                }
                            } else {
                                setPendingLoginData({ method, restoreAccount, isPendingRetry: true });
                                setShowLocationModal(true);
                                setIsPressed(false);
                                setMethodLoading(false);
                                setRestoreLoading(false);
                                return;
                            }
                        } else if (error.code === 3) {
                            setIsLoginError("Location access timed out. Please ensure GPS is enabled and try again.")
                            setIsPressed(false);
                            setMethodLoading(false);
                            setRestoreLoading(false);
                            return;
                        } else {
                            setIsLoginError("Unable to retrieve your location. Please check your browser settings.")
                            setIsPressed(false);
                            setMethodLoading(false);
                            setRestoreLoading(false);
                            return;
                        }

                        console.warn("Geolocation warning:", error);
                    }
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
                    setIsLoginError(`Uh-Oh! The password/${credentialIsEmail ? "email" : "phone number"} you entered is wrong.`)
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

    // console.log(methods)
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
        // console.log(email)
        if (!isDataLoaded) return;
        if (isQuickLoginRef.current) return;

        if (showQuickLogin) return;
        if (loginMethod === "email") return;
        if (!email) {
            console.warn("Invalid email/phone blocked: empty input");
            return;
        }
        if (email.startsWith("92")) return;
        const newEmail = email;
        if (/^\d+$/.test(newEmail.slice(0, 6)) && newEmail.startsWith(0) && newEmail.length >= 6) {
            if (country) {
                const formatted = `${country?.country_code?.split("+")[1] ?? "41"}${newEmail.slice(1)}`
                setEmail(formatted)
            } else {
                const formatted = `41${newEmail.slice(1)}`
                setEmail(formatted)
            }
        }
    }, [loginMethod, isDataLoaded, email, country])
    useEffect(() => {
        if (loginMethod === "email" && !loginData) {
            setEmail("")
        }
    }, [loginMethod,])

    const getUserInfo = async (username) => {
        const platform = navigator?.userAgentData?.platform
            || rdd.osName
            || navigator.platform
            || "N/A";
        const isMobileUser = navigator?.userAgentData?.mobile
            ?? rdd.isMobile
            ?? rdd.isMobileSafari
            ?? false;
        try {
            const res = await fetch(`https://iplocate.io/api/lookup?apikey=${import.meta.env.VITE_IP_LOCATE_API_KEY}`)
            const location = await res.json()

            logger.info(`IP Locate api called for user: ${username} `, {
                data: location
            })
            if (location) {
                return {
                    browser_name: rdd.browserName ?? "N/A",
                    platform,
                    browser_version: rdd.browserVersion ?? "N/A",
                    is_mobile_user: isMobileUser,
                    IPv4: location?.ip,
                    city: location?.city,
                    country_code: location?.country_code,
                    country_name: location?.country,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
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
                        platform,
                        ...location,
                        browser_version: rdd.browserVersion ?? "N/A",
                        is_mobile_user: isMobileUser,
                    }
                }
            } catch (error) {
                setIsPressed(false)
            }
        }
    }

    const performSecurityChecks = async (isVpnAllowed, input = null) => {
        setIsPressed(true);
        const ipInfo = await getUserInfo(getResolvedCredential());

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
        const credential = getResolvedCredential();
        setData({
            pfp: userAccount?.profileImage?.url,
            name: userAccount?.account_type === "individual" ? userAccount?.first_name + " " + userAccount?.last_name : userAccount?.company_name,
            loginMethod: loginMethod,
            credential,
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

        if (!userAccount?.tfa) {
            setMissingTabsData(prev => prev.includes("tfa") ? prev : [...prev, "tfa"]);
        }
        const isKycMissing = userAccount?.account_type === 'business'
            ? (userAccount?.company?.kyb_status === "declined" || !userAccount.company?.kyb_status)
            : (userAccount?.user?.kyc_status === "declined" || !userAccount.user?.kyc_status);

        if (isKycMissing) {
            setMissingTabsData(prev => prev.includes("kyc") ? prev : [...prev, "kyc"]);
        }
        if (!userAccount?.insta_username && !userAccount?.telegram_bot) {
            setMissingTabsData(prev => prev.includes("social") ? prev : [...prev, "social"]);
        }

        try {
            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/login/create-login-history`, {
                data: encryptedWithLocation
            });
        } catch (err) {
            console.error("Login history creation failed:", err);
        } finally {
            const savedPath = sessionStorage.getItem("path");
            const targetPath = (savedPath && savedPath !== "undefined" && !savedPath.includes("login") && !savedPath.includes("auth"))
                ? savedPath
                : (redirect && !redirect.includes("login") ? redirect : "/");
            sessionStorage.clear();
            sessionStorage.setItem("force_auth_on_login", "true");
            setIsPressed(false);
            setBiometricLoading(false);
            navigate(targetPath, { replace: true });
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
            const newOTPValues = [...otpValues];

            numericValue
                .slice(0, numberOfFields)
                .split("")
                .forEach((char, i) => {
                    newOTPValues[i] = char;
                });

            setOTPValues(newOTPValues);
            setCurrentActiveInput(
                Math.min(numericValue.length, numberOfFields)
            );

            const isEmpty = newOTPValues.some((val) => val === "");
            setIsAnyFieldEmpty(isEmpty);

            if (!isEmpty) {
                verifyOTpHandler(
                    { preventDefault: () => { } },
                    newOTPValues.join("")
                );
            }

            return;
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
        const credential = getResolvedCredential();
        const credentials = isEmail.test(credential)
            ? { email: credential, password, token: loginToken, code: otp || otpValues.join("") }
            : { phone: credential, password, token: loginToken, code: otp || otpValues.join("") }

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
                        if (dec?.country?.status !== false) {
                            completeLoginProcess(dec, token)
                        }
                        else {
                            setUserDetails(dec)
                            sessionStorage.setItem("country_status_error", "Service not available in your country!")
                            setIsPressed(false)
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

        const pasteData = event.clipboardData
            ?.getData("text")
            ?.replace(/\D/g, "")
            ?.slice(0, numberOfFields);

        if (!pasteData) return;

        const newOTPValues = Array(numberOfFields).fill("");

        pasteData.split("").forEach((char, index) => {
            newOTPValues[index] = char;
        });

        setOTPValues(newOTPValues);

        const isEmpty = newOTPValues.some((val) => val === "");
        setIsAnyFieldEmpty(isEmpty);

        setCurrentActiveInput(
            Math.min(pasteData.length, numberOfFields)
        );

        if (!isEmpty) {
            verifyOTpHandler(
                { preventDefault: () => { } },
                newOTPValues.join("")
            );
        }
    };
    const handleOtpMethod = (method) => {
        setOTPValues(Array(numberOfFields).fill(''))
        inputRefs?.current?.[0]?.focus()

        let shouldCallLoginHandler = false;

        if (resendTimer > 0 && lastOtpSentTo && (method === 'sms' || method === 'insta' || method === "wp" || method === "email")) {
            if (!hasChangedMethodOnce || lastOtpSentTo === method) {
                setHasChangedMethodOnce(true);
                if (!hasChangedMethodOnce) {
                    shouldCallLoginHandler = true;
                } else {
                    setCurrentOtpMethod(method);
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
            const credential = getResolvedCredential();

            const emailOrPhone = isEmail.test(credential) ?
                { email: credential } :
                { phone: credential }

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
                setIsLoginError("Biometric verification failed")
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
                    logger.error(`Biometric verification failed! for ${credential}`, {
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
        setIsPressed(false)
        setIsLoginError("")
        setLoginToken("")
        setStep(1)
        setCurrentOtpMethod("auth")
        resetOtpStates()
        setShowRestoreModal(false)
    }

    const resolvedCredential = getResolvedCredential();
    const isCredentialValid = (isPhoneNumber.test(resolvedCredential) || isEmail.test(resolvedCredential)) && password;
    const availableMethods = methods.filter(
        m => m.avail && m.attr !== currentOtpMethod
    )

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

            {step === 1 ?
                <form
                    autoComplete="off"
                    onSubmit={(e) => {
                        loginHandler(e, undefined, false, true)
                    }}
                    className={styles.login_form}
                    style={width > 1000 ? { opacity: step === 1 ? 1 : 0, pointerEvents: step === 1 ? "all" : "none" } : { display: step === 1 ? "inherit" : "none" }}
                >
                    <div className={styles.right}>
                        <div className={styles.topSection}>
                            <label>{t("Welcome Back")} {t("👋")}</label>
                            <p>{t('Enter your phone and password to access your account')}</p>
                        </div>
                        <div className={styles.formWrapper}>
                            <div className={styles.fieldsContainer}>
                                {
                                    loginMethod === "email" ? 
                                    <TextField    
                                        className={styles.inputField}
                                        type="email"
                                        placeholder={t("Enter Your Email")}
                                        value={email}
                                        onChange={e => setEmail(e.target.value?.toLowerCase())}
                                        name="email"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Mail size={20}/>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    :                                                 
                                        <PhoneInput
                                            phone={email}
                                            setPhone={setEmail}
                                            country={country}
                                            customStyles={{
                                                display: "flex",
                                                height: "100%",
                                                padding: "12px",
                                                alignItems: "center",
                                                gap: "12px",
                                                alignSelf: "stretch",
                                                borderRadius: "6px",
                                                border: "1px solid #E1E5EE",
                                                background: "#FFF",
                                                boxShadow: "0 1px 1.5px 0 rgba(44, 54, 53, 0.03)",
                                                width: "100%",
                                            }}
                                        />                                              
                                }
                                <TextField    
                                    className={styles.inputField}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t(" Password")}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    name="password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AlarmIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment onClick={() => setShowPassword(prev => !prev)} position="end">
                                                {showPassword ?
                                                    <EyeOff size={20} />
                                                    :
                                                    <Eye size={20} />
                                                }
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                            {
                            isLoginError
                            &&
                            <div className={styles.input_error}>
                                <AlertTriangle size={17} color="#F32D2D" />
                                <span>{profileLockTIme > 0 ? isLoginError : t(isLoginError)}</span>
                            </div>
                        }
                            <span className={styles.para}>{t("By logging in, you agree to the terms outlined in InstaPay's Privacy Policy.")}</span>
                            <button type="submit" className={styles.form_btn} disabled={isLoginError || isPressed || !isCredentialValid}>
                                {t('Login')}
                            </button>
                            <Stack direction={'row'} padding={'8px 12px'} justifyContent={'space-between'}>
                                <div
                                    className={styles.toggleLoginBtn}
                                    onClick={() => {
                                        setLoginMethod(loginMethod === "email" ? "phone" : "email")
                                        localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                                        setEmail("")
                                    }}
                                >
                                    {
                                        loginMethod === "email"
                                            ?
                                            t("Sign in with phone")
                                            :
                                            t("Sign in with email")
                                    }
                                </div>
                                <Link to="/forgot-password" className={styles.forgot_pass}>
                                    {t('Forgot Password?')}
                                </Link>
                            </Stack>
                            <span className={styles.para}>
                                {t("If you don't have an account")}&nbsp;•&nbsp;
                                <Link style={linkStyle} onClick={() => setIsLoginForm(false)}>
                                    {t("Create an Account")}
                                </Link>
                            </span>
                        </div>                    
                        {
                            locationLoading
                            &&
                            <div className={styles.location_status}>
                                <div className={styles.loader_dots}>
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                                <span>{t("Reading Location...")}</span>
                            </div>
                        }
                    </div>
                </form>
            :
                <form onSubmit={verifyOTpHandler} className={styles.otp}>                
                    <div className={styles.right}>
                        <div className={`${styles.topSection} ${styles.otpTopSection}`}>
                            {currentOtpMethod !== "biometric" && <label>{t("Enter OTP")}</label>}
                            <p>{t(currentOtpMethod === "biometric" ? "Verify identity using your created Passkey on this device" : 'Please enter the one-time password (OTP) sent to your phone to access your account.')}</p>
                        </div>
                        <div className={styles.top}>
                            {currentOtpMethod === "biometric" ? (
                                <div className={styles.biometric_section}>
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
                                            type="button"
                                            style={{
                                                display: "flex",
                                                padding: "22px 8px",
                                                alignItems: "center",
                                                gap: "6px",
                                                flex: "1 0 0",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(18, 18, 18, 0.20)",
                                                background: "#FFF",
                                                overflow: "hidden",
                                                width: "100%",
                                                fontWeight: 600,
                                                fontSize: "12px"
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
                                    <FaceAnimation currentInput={currentActiveInput} verification={otpVerified} isCorrect={isOtpCorrect} startTyping />
                                    <div
                                        style={{ animation: otpVerified && !isOtpCorrect ? "horizontal-shaking 0.5s ease-in-out" : "" }}
                                        className={styles.otp_inputs + " " + (otpVerified && (!isOtpCorrect ? "wrong" : "correct"))}
                                    >
                                        {otpValues.map((value, index) => (
                                            <input
                                                type="tel"
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
                            <div className={styles.optBtns}>                                 
                                <button type="submit"
                                    className={styles.form_btn}
                                    disabled={isAnyFieldEmpty || otpValues.some(item => !item) || isPressed || isLoginError}
                                >
                                    <span>{
                                        (isPressed && !methodLoading)
                                            ?
                                            t("Authorising")
                                            :
                                            t("Authorise")
                                    }</span>
                                </button>
                                <button type="button" disabled={isPressed} className={styles.go_back_btn} onClick={resetOtpStates}>
                                    {t("Back")}
                                </button>
                            </div> 
                             {
                                isLoginError
                                &&
                                <div className={styles.input_error}>
                                    <AlertTriangle size={17} color="#F32D2D" />
                                    <span>{t(isLoginError)}</span>
                                </div>
                            }
                            <div className={styles.lineBreak} />                
                            <div className={styles.toggle_sms}>
                                {
                                    (consecutiveCount >= 3 && !isLoginError.includes('account is locked') && methods?.length > 0) &&
                                    <div className={styles.input_error}>
                                        <span>{t("Having trouble receiving/verifying your code? Choose another method below or contact support.")}</span>
                                    </div>
                                }

                                {methods.filter(m => m.avail).length > 1
                                    &&
                                    <p style={{ alignSelf: "baseline" }}>
                                        {t("Choose your preferred method to receive your verification code:")}
                                    </p>
                                }
                                {methods.filter(m => m.avail).length > 1 &&
                                    <div className={styles.otp_methods} style={{
                                        marginTop:'20px',
                                        gridTemplateColumns:
                                            (availableMethods.length === 1 || width <= 600)
                                                ? "1fr"
                                                : "repeat(2, minmax(0, 1fr))"
                                    }}>
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
                                                        <span className={isMobile && styles.otpMethodText} style={!isMobile && { marginBottom: "0" }}>
                                                            {t(method.text)}
                                                        </span>
                                                    </button>
                                                )
                                            }
                                            return null;
                                        })}
                                    </div>
                                }
                                {
                                    <span>
                                        {
                                            resendTimer > 0
                                                ? (methods.filter(m => m.avail).length > 1 && (lastOtpSentTo && ['sms', 'insta', 'wp', 'email'].includes(pendingOtpMethod || currentOtpMethod) && lastOtpSentTo !== (pendingOtpMethod || currentOtpMethod)) || (pendingOtpMethod && lastOtpSentTo !== currentOtpMethod))
                                                    ?
                                                    <span>
                                                        {t(
                                                            "You have already requested code on {{lastOtpMethod}}, wait {{timer}} seconds to get code on {{nextOtpMethod}}",
                                                            {
                                                                lastOtpMethod:
                                                                    lastOtpSentTo === "sms"
                                                                        ? "SMS"
                                                                        : lastOtpSentTo === "wp"
                                                                            ? "WhatsApp"
                                                                            : lastOtpSentTo === "email"
                                                                                ? "Email"
                                                                                : "Instagram",

                                                                nextOtpMethod:
                                                                    (pendingOtpMethod || currentOtpMethod) === "sms"
                                                                        ? "SMS"
                                                                        : (pendingOtpMethod || currentOtpMethod) === "wp"
                                                                            ? "WhatsApp"
                                                                            : (pendingOtpMethod || currentOtpMethod) === "email"
                                                                                ? "Email"
                                                                                : "Instagram",

                                                                timer: resendTimer,
                                                            }
                                                        )}
                                                    </span> :
                                                    currentOtpMethod !== "auth" && currentOtpMethod !== "biometric" && <span>
                                                        {t("Resend code in {{timer}} seconds", {
                                                            timer: resendTimer,
                                                        })}
                                                    </span>
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
                        </div>                        
                    </div>
                </form>
            }
        </>
    );
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