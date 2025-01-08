import styles from "./styles/index.module.css"
import FormLogo from "./FormLogo"
import InstaIcon from "./InstaIcon"
import { Link } from "react-router-dom"
import ev_left from "./files/ev_left.png"
import { AlertTriangle, ChevronRight, Eye, EyeOff, XCircle } from "react-feather"
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import OtpConfimation from "./OtpConfimation"
import { Modal, ModalBody } from "reactstrap"
// import PhoneInput from "react-phone-input-2"
import { UserContext } from "../../Context/UserContext"
import { countries } from "country-list-json"
import PhoneInput from "../PhoneInput"
import { useTranslation } from "react-i18next"
// import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ setIsLoginForm, setIsForgot, country }) => {
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
    const { allowedCountries, profileLockTIme, setProfileLockTime } = useContext(UserContext)
    const [loginMethod, setLoginMethod] = useState("phone")

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


    const loginHandler = (e) => {
        e.preventDefault()
        setIsPressed(true)
        setIsLoginError("")
        if (emailVerified) {
            const credentials = isEmail.test(email)
                ? { email, password }
                : { phone: email, password }
            const encrypted = encryptData(credentials)

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/send-login-otp`, {
                data: encrypted
            })
                .then(async (res) => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    if (decrypted?.status) {
                        setLoginToken(decrypted?.token)
                        setStep(2)
                        setIsPressed(false)
                    }
                })
                .catch(error => {
                    const decrypted = decryptData(error.response.data.data)
                    console.log(decrypted)
                    setIsPressed(false)
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

    return (
        <form className={styles.form} onSubmit={emailVerified ? loginHandler : checkEmailHandler}>
            {
                serviceError
                &&
                <Modal isOpen={true}>
                    <ModalBody style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
                        <XCircle size={80} color="red" />
                        <h5 style={{ color: "red", fontSize: "1.1rem", fontWeight: "600" }}>{t(serviceError)}</h5>
                    </ModalBody>
                </Modal>
            }
            {
                step === 1
                    ?
                    <>
                        <div className={styles.top}>
                            <FormLogo />
                        </div>
                        <div className={styles.top_text}>
                            <h3>{t("Login")}</h3>
                            <p>{t("Start Your InstaPay Journey Today!")}</p>
                        </div>
                        <div className={styles.input_group}>
                            {
                                !emailVerified
                                    ?
                                    <div className={styles.input_container}>
                                        <label>{loginMethod === "phone" ? t("Phone Number") : t("Email")}</label>
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
                                        {
                                            isLoginError
                                            &&
                                            <div className={styles.input_error}>
                                                <AlertTriangle size={17} color="#F32D2D" />
                                                <span>{t(isLoginError)}</span>
                                            </div>
                                        }

                                        <div style={{ cursor: "pointer", fontSize: ".8rem", fontWeight: 900, color: "#5926f0" }}
                                            onClick={() => {
                                                setLoginMethod(loginMethod === "email" ? "phone" : "email")
                                                localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                                                setEmail("")
                                            }}
                                        >
                                            {t("Login with")} {loginMethod === "email" ? t("Phone Number") : t("Email")}
                                        </div>
                                    </div>
                                    :
                                    <div className={styles.email_verified}>
                                        <div>
                                            <img src={ev_left} alt="img" />
                                        </div>
                                        <p>{email}</p>
                                        <button type="button" onClick={() => {
                                            setEmailVerified(false)
                                            setIsLoginError("")
                                            setPassword("")
                                        }}>{t("Edit").toLowerCase()}</button>
                                    </div>
                            }
                            {
                                emailVerified
                                &&
                                <div className={styles.input_container} style={{ position: "relative" }}>
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
                                    {
                                        isLoginError
                                        &&
                                        <div className={styles.input_error}>
                                            <AlertTriangle size={17} color="#F32D2D" />
                                            <span>{t(isLoginError)}</span>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                        {
                            emailVerified
                                ?
                                <div className={styles.forgot_pass} style={{ cursor: "pointer" }} onClick={() => setIsForgot(true)}>
                                    <span>{t("Forgot Password?")}</span>
                                </div>
                                :
                                <div className={styles.social_media_login}>

                                </div>
                            // <div className={styles.social_media_login}>
                            //     <span>Login using social media</span>
                            //     <InstaIcon size={50} />
                            // </div>
                        }
                        <button type="button" className={styles.form_btn} disabled={isPressed || (emailVerified ? !password || (!isPhoneNumber.test(email) && !isEmail.test(email)) : (!isPhoneNumber.test(email) && !isEmail.test(email)))} onClick={emailVerified ? loginHandler : checkEmailHandler}>
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
                        <div className={styles.bottom_text}>
                            <span>{t("Don't Have an Account? Sign Up").split("?")?.[0]} </span>
                            <Link to={"/auth/signup"} onClick={() => setIsLoginForm(false)}>{t("Sign Up")}</Link>
                        </div>
                        {/* <GoogleLogin
                            onSuccess={credentialResponse => {
                                console.log(credentialResponse);
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />; */}
                    </>
                    :
                    <OtpConfimation
                        email={email}
                        isEmail={isEmail}
                        password={password}
                        token={loginToken}
                        setServiceError={setServiceError}
                        resendHandler={loginHandler}
                    />
            }
        </form>
    )
}

export default LoginForm