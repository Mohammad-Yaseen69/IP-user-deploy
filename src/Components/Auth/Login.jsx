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
import { countries } from "country-list-json";
import LanguagePicker from "../LanguagePicker";
import FaceAnimation from "./FaceAnimation"
import { motion } from "framer-motion"
import InstaSvg from "../../assets/icons/insta.svg"
import SmsSvg from "../../assets/icons/sms.svg"
import AuthSvg from "../../assets/icons/auth.svg"
import "./styles/index.module.css";

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
    const { allowedCountries, profileLockTIme, setProfileLockTime, setUserDetails } = useContext(UserContext)
    const [loginMethod, setLoginMethod] = useState("phone")
    const [userAuthSetup, setUserAuthSetup] = useState(false)
    const [isInstagram, setIsInstagram] = useState(false)
    const [currentActiveInput, setCurrentActiveInput] = useState(1)
    const [isOtpCorrect, setIsOtpCorrect] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false)
    const [startTyping, setStartTyping] = useState(false)
    const [currentOtpMethod, setCurrentOtpMethod] = useState("auth")

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

    const loginHandler = (e, method = null) => {
        e.preventDefault()
        setIsPressed(true)
        setIsLoginError("")
        console.log(currentOtpMethod, method)
        const isAuth = method ? (method === "auth") : (currentOtpMethod === "auth");
        const isInsta = method ? (method === "insta") : (currentOtpMethod === "insta" || currentOtpMethod !== "sms");

        const credentials = isEmail.test(email)
            ? {
                email,
                password,
                authenticator: isAuth,
                platform: isInsta ? "instagram" : ""
            }
            : {
                phone: email,
                password,
                authenticator: isAuth,
                platform: isInsta ? "instagram" : ""
            };
        const encrypted = encryptData(credentials)
        console.log(credentials)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/send-login-otp`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                setUserAuthSetup(decrypted?.tfa)
                setIsInstagram(decrypted?.instagram)
                setCurrentOtpMethod((decrypted?.tfa) && (decrypted?.authenticator) ? "auth" : (decrypted?.instagram) && (isInsta) ? "insta" : "sms")
                setResendTimer(120)
                console.log(decrypted)



                if (decrypted?.authenticator == true) {
                    setResendTimer(0)
                }

                setLoginToken(decrypted?.token)
                setStep(2)
                setIsPressed(false)
            })
            .catch(error => {
                setIsPressed(false)
                const decrypted = decryptData(error.response.data?.data)
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
            setIsLoginError(`Account is locked. Try again in ${minutes < 10 ? `0${minutes}` : minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds} minutes.`)
        } else {
            setIsLoginError("")
        }
    }, [profileLockTIme])

    // service error
    const [serviceError, setServiceError] = useState("")
    useLayoutEffect(() => {
        const error = sessionStorage.getItem("country_status_error")
        if (error) {
            setServiceError(error)
        }
    }, [sessionStorage])

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
        if (loginMethod === "email") {
            setEmail("")
        }
    }, [loginMethod])


    // useEffect(() => {
    //     if (step === 1) {
    //         console.log("as")
    //         setCurrentOtpMethod(userAuthSetup ? "auth" : isInstagram ? "insta" : "sms")
    //     }
    // }, [step])


    const getUserInfo = async () => {
        try {
            const res = await axios.get(`https://ipinfo.io?token=${process.env.REACT_APP_IP_INFO_TOKEN}`)
            const location = res.data;
            if (location) {
                const country_name = countries.find(item => item?.code === location?.country)?.name
                return {
                    browser_name: navigator?.userAgentData?.brands[0]?.brand ?? "N/A",
                    platform: navigator?.userAgentData?.platform,
                    browser_version: navigator?.userAgentData?.brands[0]?.version ?? "N/A",
                    is_mobile_user: navigator?.userAgentData?.mobile,
                    IPv4: location?.ip,
                    city: location?.city,
                    country_code: location?.country,
                    country_name: country_name ?? "N/A",
                    latitude: 0.00,
                    longitude: 0.00,
                    postal: location?.postal,
                    state: location?.region,
                }
            }
        } catch (error) {
            try {
                const res = await fetch("https://geolocation-db.com/json/")
                const location = await res.json()
                if (location) {
                    return {
                        browser_name: navigator?.userAgentData?.brands[0]?.brand ?? "N/A",
                        platform: navigator?.userAgentData?.platform,
                        ...location,
                        browser_version: navigator?.userAgentData?.brands[0]?.version ?? "N/A",
                        is_mobile_user: navigator?.userAgentData?.mobile,
                    }
                }
            } catch (error) {
                setIsPressed(false)
                // setIsLoginError("Something went wrong. Please try again.")
            }
        }
    }
    const [resendTimer, setResendTimer] = useState(120)
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

        if (index == 0) {
            setCurrentActiveInput(1)
        }

        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
            setCurrentActiveInput(prev => prev < 6 ? prev += 1 : prev)
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
    };


    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
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

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/verify-login-${currentOtpMethod === "auth" ? "auth" : "otp"}`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                console.log(decrypted)
                const token = decrypted?.token
                setIsOtpCorrect(true)
                axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/auth/${decrypted?.token}`)
                    .then(async res => {
                        const decrypted = decryptData(res.data.data)
                        const dec = decryptData(res.data.data)
                        localStorage.setItem("login", true)
                        localStorage.setItem("token", token)
                        setUserDetails(dec)
                        if (dec?.country?.status) {
                            const data = await getUserInfo()
                                .catch(() => {
                                    const path = sessionStorage.getItem("path")
                                    if(path && path !== "undefined"){
                                        navigate(path)
                                    }else{
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
                            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/login/create-login-history`, {
                                data: encrypted
                            })
                                .then(res => {
                                    const decrypted = decryptData(res.data.data)
                                    const path = sessionStorage.getItem("path")
                                    if(path && path !== "undefined"){
                                        navigate(path)
                                    }else{
                                        navigate("/")
                                    }
                                    sessionStorage.clear()
                                    setIsPressed(false)
                                })
                                .catch(err => {
                                    setIsPressed(false)
                                    setIsLoginError("Something went wrong while creating login details")
                                    const decrypted = decryptData(err.response.data.data)
                                    const path = sessionStorage.getItem("path")
                                    console.log(path)
                                    if(path && path !== "undefined"){
                                        navigate(path)
                                    }else{
                                        navigate("/")
                                    }
                                    sessionStorage.clear()
                                })
                        } else {
                            sessionStorage.setItem("country_status_error", "Service not available in your country!")
                            setServiceError("Service not available in your country!")
                        }
                    })
                    .catch(err => {
                        // console.log(decryptData(err.response.data.data))
                        setIsPressed(false)
                        setIsLoginError("Something went wrong while getting account details")
                    })
            })
            .catch(error => {
                const decrypted = decryptData(error.response.data.data)
                console.log(decrypted)
                setIsPressed(false)
                if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                } else {
                    setIsLoginError("Uh-Oh! You entered incorrect OTP.")
                    setOTPValues(Array(numberOfFields).fill(""))
                    setTimeout(() => {
                        setOtpVerified(false)
                        inputRefs.current[0].focus()
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
        if (resendTimer == 0) {
            loginHandler({ preventDefault: () => { } }, method)
            if (currentOtpMethod !== "sms" || currentOtpMethod !== "insta") {
                setResendTimer(120)
            }
        }
        setCurrentOtpMethod(method)
    }

    useEffect(() => {
        if (profileLockTIme > 0) {
            let minutes = Math.floor(profileLockTIme / 60);
            let remainingSeconds = profileLockTIme % 60;
            setIsLoginError(`Account is locked. Try again in ${minutes < 10 ? `0${minutes}` : minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds} minutes.`)
        } else {
            setIsLoginError("")
        }
    }, [profileLockTIme])

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
    return (
        <>
            <form onSubmit={emailVerified ? loginHandler : checkEmailHandler} className={styles.form_details} style={window.innerWidth > 1000 ? { opacity: step === 1 ? 1 : 0, pointerEvents: step === 1 ? "all" : "none" } : { display: step === 1 ? "inherit" : "none" }}>
                <div className={styles.left}>
                    <h1>{t("Login")}</h1>
                    <p>{t("Start Your InstaPay Journey Today!")}</p>
                    {
                        window.innerWidth < 1000
                        &&
                        <LanguagePicker />
                    }
                </div>
                <div className={styles.right}>
                    {
                        !emailVerified
                            ?
                            <>
                                <div className={styles.inp_con}>
                                    <label>{loginMethod === "phone" ? t("Enter your phone number") : t("Enter your email")}</label>
                                    {
                                        loginMethod === "phone"
                                            ?
                                            <PhoneInput
                                                setPhone={setEmail}
                                                country={country}
                                            />
                                            :
                                            <input type="email" placeholder="eg: john@doe.org" value={email} onChange={e => setEmail(e.target.value?.toLowerCase())} autoComplete="on" name="email" />
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
                                                t("login with email")
                                        }
                                        {/* {t("Login with")} {loginMethod === "email" ? t("Phone Number") : t("Email")} */}
                                    </div>
                                </div>
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
                                <Link to={"/auth/forgot-password"} className={styles.forgot_pass}>
                                    {t("Forgot Password?")}
                                </Link>
                            </div>
                    }
                    {
                        isLoginError
                        &&
                        <div className={styles.input_error}>
                            <AlertTriangle size={17} color="#F32D2D" />
                            <span>{t(isLoginError)}</span>
                        </div>
                    }
                    <div className={styles.center_bottom}>
                        {
                            (emailVerified && window.innerWidth < 1000)
                            &&
                            <button type="button" className={styles.go_back_btn} onClick={() => setEmailVerified(false)}>
                                {t("Back")}
                            </button>
                        }
                        <div className={styles.bottom_text}>
                            <span>{t("Don't Have an Account? Sign Up").split("?")?.[0]} </span>
                            <Link to={"/auth/signup"} onClick={() => setIsLoginForm(false)}>{t("Sign Up")}</Link>
                        </div>
                        <div className={styles.btns}>
                            {
                                (emailVerified && window.innerWidth > 1000)
                                &&
                                <button type="button" className={styles.go_back_btn} onClick={() => setEmailVerified(false)}>
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
                            <h1>{currentOtpMethod === "auth" ? t("Google Authenticator") : currentOtpMethod == "insta" ? "Instagram" : t("SMS Verification")}</h1>
                            <p>{t("Start Your InstaPay Journey Today!")}</p>
                            {
                                window.innerWidth < 1000
                                &&
                                <LanguagePicker />
                            }
                        </div>
                        <div className={styles.right}>
                            <div className={styles.top}>
                                <div className={styles.otp_inp}>
                                    <label>
                                        {
                                            currentOtpMethod === "auth"
                                                ?
                                                t("Two Factor Authentication Code")
                                                :
                                                currentOtpMethod === "insta"
                                                    ?
                                                    "Enter the code sent to your Instagram Account"
                                                    :
                                                    t(`Enter the SMS code sent to +41********4053`)
                                                        .replace(
                                                            "+41********4053",
                                                            isEmail.test(email)
                                                                ?
                                                                `${email.slice(0, 4).split("").map(_ => "*").join("")}${email.slice(4)}`
                                                                :
                                                                `${email.slice(0, email.length - 4).split("").map(_ => "*").join("")}${email.slice(email.length - 4)}`
                                                        )
                                        }
                                    </label>
                                    <FaceAnimation currentInput={currentActiveInput} verification={otpVerified} isCorrect={isOtpCorrect} startTyping />
                                    <div style={{ animation: otpVerified && !isOtpCorrect ? "horizontal-shaking 0.5s ease-in-out" : "" }} className={styles.otp_inputs + " " + (otpVerified && (!isOtpCorrect ? "wrong" : "correct"))}>
                                        {otpValues.map((value, index) => (
                                            <motion.input
                                                key={index}
                                                maxLength={1}
                                                value={value}
                                                onPaste={handlePaste}
                                                onChange={(e) => {
                                                    setIsLoginError("")
                                                    setStartTyping(true)
                                                    handleInputChange(index, e.target.value)
                                                }}

                                                onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                ref={(input) => (inputRefs.current[index] = input)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ paddingTop: "10px" }} className={styles.toggle_sms}>
                                    {
                                        currentOtpMethod === "auth"
                                        &&
                                        <span>{t("Problem with the token?")}</span>
                                    }
                                    <div className={styles.otp_methods}>
                                        {
                                            (userAuthSetup || isInstagram)
                                            &&
                                            <>
                                                {(currentOtpMethod !== "auth" && userAuthSetup) && (
                                                    <button className={styles.otpMethodButton} type="button" disabled={isPressed} onClick={() => handleOtpMethod("auth")}>
                                                        <img style={{ width: "30px" }} src={AuthSvg} alt="" /> <p style={{ marginBottom: "0" }}>Verify Using Authenticator</p>
                                                    </button>
                                                )}

                                                {(currentOtpMethod !== "insta" && isInstagram) && (
                                                    <button className={styles.otpMethodButton} type="button" disabled={isPressed} onClick={() => handleOtpMethod("insta")}>
                                                        <img style={{ width: "30px" }} src={InstaSvg} alt="" /> <p style={{ marginBottom: "0" }}>Verify Using Instagram</p>
                                                    </button>
                                                )}

                                                {currentOtpMethod !== "sms" && (
                                                    <button className={styles.otpMethodButton} type="button" disabled={isPressed} onClick={() => handleOtpMethod("sms")}>
                                                        <img style={{ width: "33px" }} src={SmsSvg} alt="" /> <p style={{ marginBottom: "0" }}>Verify Using Sms/Email</p>
                                                    </button>
                                                )}
                                            </>

                                        }
                                    </div>
                                    {
                                        currentOtpMethod !== "auth"
                                        &&
                                        <span>
                                            {
                                                resendTimer > 0
                                                    ?
                                                    t("Resend code in 30 seconds".replace("30", resendTimer))
                                                    :
                                                    <>{t("Didn't receive OTP?") + " "} <span style={{ color: "#5926f0", cursor: "pointer" }} onClick={() => {
                                                        setOTPValues(Array(numberOfFields).fill(''))
                                                        loginHandler({ preventDefault: () => { } })
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
                                    window.innerWidth < 1000
                                    &&
                                    <button type="button" className={styles.go_back_btn} onClick={() => setStep(1)}>
                                        {t("Back")}
                                    </button>
                                }
                                <div className={styles.bottom_text}>
                                    <span>{t("Don't Have an Account? Sign Up").split("?")?.[0]} </span>
                                    <Link to={"/auth/signup"} onClick={() => setIsLoginForm(false)}>{t("Sign Up")}</Link>
                                </div>
                                <div className={styles.btns}>
                                    {
                                        window.innerWidth > 1000
                                        &&
                                        <button type="button" className={styles.go_back_btn} onClick={() => setStep(1)}>
                                            {t("Back")}
                                        </button>
                                    }
                                    <button type="submit"
                                        className={styles.form_btn}
                                        disabled={isAnyFieldEmpty || otpValues.some(item => !item) || isPressed}
                                    >
                                        <span>{
                                            isPressed
                                                ?
                                                t("Verifying")
                                                :
                                                t("Verify")
                                        }</span>
                                        <ChevronRight size={28} color="white" />
                                    </button>
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
                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                        <img src={gs} alt="" />
                    </a>
                    <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank">
                        <img src={as} alt="" />
                    </a>
                </div>
            </div>
            <div className={styles.right}>
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1" target="_blank">
                    <img src={authenticator} alt="" />
                </a>
                <h4>{t("Strong security with Google Authenticator")}</h4>
            </div>
        </div>
    )
}