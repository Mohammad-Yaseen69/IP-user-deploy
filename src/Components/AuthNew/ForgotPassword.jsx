import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import FormLogo from "./FormLogo"
import styles from "./styles/index.module.css"
// import PhoneInput from "react-phone-input-2"
import { AlertTriangle, Check, ChevronRight, Eye, EyeOff } from "react-feather"
import { UserContext } from "../../Context/UserContext"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import otp from "./files/otp.svg"
import Cross from "./Cross.svg"
import success from "./files/success.gif"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import PhoneInput from "../PhoneInput"
import { toast } from "react-toastify"
import { smsIcon, whatsappIcon } from "../Auth/files"

const ForgotPassword = ({ setIsLoginForm, setIsForgot, country }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const isPhoneNumber = /^\d{9,20}$/g;
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [emailVerified, setEmailVerified] = useState(false)
    const [email, setEmail] = useState("")
    const [isPressed, setIsPressed] = useState(false)
    const [step, setStep] = useState(1)
    const [otpToken, setOtpToken] = useState("")
    const [verified,] = useState(false)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    const [currentMethod, setCurrentMethod] = useState("sms")
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [resendTimer, setResendTimer] = useState(90);
    const [isLoginError, setIsLoginError] = useState("")
    const [showToolTip, setShowTooltip] = useState("")
    const [isAgent] = useState(window?.location?.href?.includes("agent") ? true : false)
    const [passwords, setPasswords] = useState({
        password: {
            value: "",
            show: false
        },
        confirm_password: {
            value: "",
            show: false
        }
    })
    const [availableMethods, setAvailableMethods] = useState({ sms: true })
    const whatsappAvailable = currentMethod === "sms" && availableMethods?.['whatsapp'];
    const canSwitchMethod = whatsappAvailable || availableMethods?.sms;

    const changePassHandler = (e) => {
        const { name, value } = e.target;

        setPasswords((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                value
            }
        }))
    }

    const changePassShowHandler = (name, value) => {
        setPasswords((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                show: value
            }
        }))
    }

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
        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
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

    const sendOTP = async (e, method) => {
        e.preventDefault()
        setError("")
        setIsPressed(true)
        try {
            const data = isEmail.test(email) ? {
                email
            } : {
                phone: email
            }

            if ((method === "whatsapp") && data.phone) {
                data.platform = "whatsapp"
            }

            if (isAgent) {
                data.isAgent = true
            }
            console.log('data',data)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/send-forgot-password-otp`, {
                data: encryptData(data)
            })
            const dec = decryptData(response.data.data)
            console.log('decryptData', dec)
            setOtpToken(dec?.token)
            if(dec?.availableMethods){
                setAvailableMethods(dec?.availableMethods)
            }
            setEmailVerified(true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            toast.error("Invalid Email / Phone number").replace("Phone", email?.slice(0, 3) === "971" ? "Whatsapp" : "Phone")
        } finally {
            setIsPressed(false)
        }
    }

    const verifyOTP = async (e, otp = "") => {
        e.preventDefault()
        setError("")
        setIsPressed(true)
        try {
            const data = {
                code: otp || otpValues.join(""),
                token: otpToken
            }
            isEmail.test(email) ? data.email = email : data.phone = email
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-forgot-password-otp`, {
                data: encryptData(data)
            })
            const dec = decryptData(response.data.data)
            setOtpToken(dec?.token)
            setStep(2)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            setTimeout(() => {
                setOTPValues(Array(numberOfFields).fill(''))
                inputRefs.current[0]?.focus()
            }, 1000);
            toast.error(dec.message ?? "Invalid Verification Code")
        } finally {
            setIsPressed(false)
        }
    }

    const updatePassword = async (e) => {
        e.preventDefault()
        setError("")
        setIsPressed(true)
        try {
            const data = {
                code: otpValues.join(""),
                token: otpToken,
                password: passwords.password.value
            }
            isEmail.test(email) ? data.email = email : data.phone = email
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/reset-forgot-password`, {
                data: encryptData(data)
            })
            const dec = decryptData(response.data.data)
            setOtpToken(dec?.token)
            setStep(3)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            toast.error("Invalid Email / Phone number".replace("Phone", email?.slice(0, 3) === "971" ? "Whatsapp" : "Phone"))
        } finally {
            setIsPressed(false)
        }
    }

    useEffect(() => {
        let timeout;
        if (resendTimer > 0 && emailVerified) {
            timeout = setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
        }

        return () => {
            clearTimeout(timeout)
        }
    }, [resendTimer, emailVerified])

    const [loginMethod, setLoginMethod] = useState("phone")

    useLayoutEffect(() => {
        const loginWith = localStorage.getItem("loginWith")
        setLoginMethod(loginWith ?? "phone")
    }, [])

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
            verifyOTP({ preventDefault: () => { } }, newOTPValues.join(""))
        }
    };

    return (
        <form style={{ minHeight: window.innerWidth < "auto" }} className={styles.form} onSubmit={step === 1 && !emailVerified ? sendOTP : step === 1 && emailVerified ? verifyOTP : updatePassword}>
            {
                step === 1
                &&
                <>
                    {
                        !emailVerified
                            ?
                            <>
                                <div className={styles.top}>
                                    <FormLogo />
                                </div>
                                <div className={styles.top_text}>
                                    <h3>{t("Forgot Password?")}</h3>
                                    <p>{t("Change Your Password To Continue")}</p>
                                </div>
                                <div className={styles.input_group}>
                                    <div className={styles.input_container}>
                                        <label>{loginMethod === "phone" ? t("Phone Number").replace("Phone", email?.slice(0, 3) === "971" ? "Whatsapp" : "Phone") : t("Email")}</label>
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
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                                            <div style={{ cursor: "pointer", fontSize: ".8rem", fontWeight: 900, color: "#5926f0" }}
                                                onClick={() => {
                                                    setLoginMethod(loginMethod === "email" ? "phone" : "email")
                                                    localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                                                    setEmail("")
                                                }}
                                            >
                                                {t("Continue with")} {loginMethod === "email" ? t("Phone Number").replace("Phone", email?.slice(0, 3) === "971" ? "Whatsapp" : "Phone") : t("Email")}
                                            </div>
                                            |
                                            <div style={{ cursor: "pointer", fontSize: ".8rem", fontWeight: 900, color: "#5926f0" }}
                                                onClick={() => {
                                                    setIsForgot(false)
                                                    setIsLoginForm(true)
                                                    navigate(isAgent ? "/agent-login" : "/login")
                                                }}
                                            >{t("Back to Login")}</div>
                                        </div>
                                        {
                                            error
                                            &&
                                            <div className={styles.input_error}>
                                                <AlertTriangle size={17} color="#F32D2D" />
                                                <span>{t(error)}</span>
                                            </div>
                                        }
                                        <div className={styles.social_media_login}>

                                        </div>
                                        <button type="submit" className={styles.form_btn} disabled={isPressed || (!isPhoneNumber.test(email) && !isEmail.test(email))}>
                                            <span>{t("Send OTP")}</span>
                                            <ChevronRight size={28} color="white" />
                                        </button>
                                    </div>
                                </div>
                            </>
                            :
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
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
                                                t("A Verification code has been sent to your number.").replace("number", loginMethod === "email" ? "email" : currentMethod === "whatsapp" ? "Whatsapp" : "number")
                                        }
                                    </p>
                                </div>
                                {
                                    !verified
                                    &&
                                    <>
                                        <div className={styles.otp_fields}>
                                            {otpValues.map((value, index) => (
                                                <input
                                                    key={index}
                                                    maxLength={1}
                                                    value={value}
                                                    onPaste={handlePaste}
                                                    onChange={(e) => {
                                                        setIsLoginError("")
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
                                        {canSwitchMethod && <div style={{ position: "relative" }}>
                                            <span
                                                onClick={() => {
                                                    if (resendTimer === 0) {
                                                        if (whatsappAvailable) {
                                                            setCurrentMethod("whatsapp")
                                                            setResendTimer(90)
                                                            sendOTP({ preventDefault: () => { } }, "whatsapp")
                                                            setOTPValues(Array(numberOfFields).fill(''), "whatsapp")
                                                        } else {
                                                            setCurrentMethod("sms")
                                                            setResendTimer(90)
                                                            sendOTP({ preventDefault: () => { } }, "sms")
                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                        }
                                                    }
                                                }}
                                                onMouseEnter={() => {
                                                    if (resendTimer !== 0) {
                                                        setShowTooltip(true)
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    setShowTooltip(false)
                                                }}
                                                style={{ display: 'flex', alignItems: "center", gap: "7px", padding: '10px 15px', boxShadow: "0px 0px 4px #0000002e", borderRadius: "6px", cursor: "pointer" }}>
                                                <img style={{ width: '24px' }} src={whatsappAvailable ? whatsappIcon : smsIcon} alt="" />
                                                <span style={{ fontWeight: 600, color: 'black' }}>
                                                    {t("Verify Using {{method}}", { method: whatsappAvailable ? "Whatsapp" : "SMS" })}
                                                </span>
                                            </span>

                                            {showToolTip && <span style={{ fontWeight: 600, fontSize: '10px', backgroundColor: "gray", padding: '1px 3px', borderRadius: "3px", color: 'white', position: "absolute", bottom: "-20px", right: '-40px' }}>{t("Wait For the Timer")}</span>}
                                        </div>}
                                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}
                                            className={styles.resend_text}
                                        >
                                            {
                                                resendTimer > 0
                                                    ?
                                                    t("Resend available in") + " " + resendTimer + " " + t("seconds")
                                                    :
                                                    <>
                                                        {t("Didn't receive OTP?") + " "}
                                                        <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={(e) => {
                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                            sendOTP(e)
                                                            setResendTimer(90)
                                                        }}>{t("Resend Now")}</span>
                                                    </>
                                            }
                                        </span>
                                    </>
                                }
                                {
                                    isLoginError
                                    &&
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <AlertTriangle size={17} color="#F32D2D" />
                                        <span style={{ color: "#F32D2D" }}>{t(isLoginError)}</span>
                                    </div>
                                }
                                <button className={styles.form_btn} disabled={isPressed || isAnyFieldEmpty}>
                                    <span>{isPressed ? t("Verifying") : t("Verify")}</span>
                                    <ChevronRight size={28} color="white" />
                                </button>
                                <div style={{ cursor: "pointer", fontSize: ".8rem", fontWeight: 900, color: "#5926f0" }}
                                    onClick={() => {
                                        setIsForgot(false)
                                        setIsLoginForm(true)
                                        navigate(isAgent ? "/agent-login" : "/login")
                                    }}
                                >{t("Back to Login")}</div>
                            </div>
                    }
                </>
            }
            {
                step === 2
                &&
                <>
                    <h4 style={{
                        color: "#545454",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        lineHeight: "150%",
                        marginBottom: "10px"
                    }}>{t("Create a strong Password")}</h4>
                    <div
                        className={styles.password_input}
                    >
                        <input type={passwords.password.show ? "text" : "password"} value={passwords.password.value} name="password" onChange={changePassHandler} />
                        {
                            passwords.password.show
                                ?
                                <EyeOff onClick={() => changePassShowHandler("password", !passwords.password.show)} style={{ cursor: "pointer" }} />
                                :
                                <Eye onClick={() => changePassShowHandler("password", !passwords.password.show)} style={{ cursor: "pointer" }} />
                        }
                    </div>
                    <div className={styles.password_guidance}>
                        <h5>{t("Password must:")}</h5>
                        <ul className={styles.pg_list}>
                            <li>
                                {
                                    passwords.password.value.length >= 9 && passwords.password.value.length <= 64
                                        ?
                                        <Check />
                                        :
                                        <Cross />
                                }
                                <p>{t("Be between 9 and 64 characters")}</p>
                            </li>
                            <li>
                                {
                                    (/[^A-Za-z0-9]/.test(passwords.password.value) &&
                                        /[A-Z]/.test(passwords.password.value) &&
                                        /[a-z]/.test(passwords.password.value) &&
                                        /[0-9]/.test(passwords.password.value))
                                        ?
                                        <Check />
                                        :
                                        <Cross />
                                }
                                <p>{t("Include at least two of the following:")}</p>
                            </li>
                            <ul className={styles.pg_sub_list}>
                                <li>
                                    {
                                        /[A-Z]/.test(passwords.password.value)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Uppercase character")}</p>
                                </li>
                                <li>
                                    {
                                        /[a-z]/.test(passwords.password.value)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Lowercase Character")}</p>
                                </li>
                                <li>
                                    {
                                        /[0-9]/.test(passwords.password.value)
                                            ? <Check /> : <Cross />
                                    }
                                    <p>{t("Number")}</p>
                                </li>
                                <li>
                                    {
                                        /[^A-Za-z0-9]/.test(passwords.password.value)
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
                        marginBottom: "10px"
                    }}>{t("Confirm Password")}</h4>
                    <div
                        className={styles.password_input}
                    >
                        <input type={passwords.confirm_password.show ? "text" : "password"} value={passwords.confirm_password.value} name="confirm_password" onChange={changePassHandler} />
                        {
                            passwords.confirm_password.show
                                ?
                                <EyeOff onClick={() => changePassShowHandler("confirm_password", !passwords.confirm_password.show)} style={{ cursor: "pointer" }} />
                                :
                                <Eye onClick={() => changePassShowHandler("confirm_password", !passwords.confirm_password.show)} style={{ cursor: "pointer" }} />
                        }
                    </div>
                    {
                        passwords.confirm_password.value !== passwords.password.value
                            && passwords.confirm_password.value.length > 0
                            ?
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                color: "#f32d2d",
                                fontSize: "10px",
                                fontWeight: 600,
                                lineHeight: "150%",
                                margin: "10px auto 0",
                                width: "80%",
                                gap: ".6rem"
                            }}>
                                <AlertTriangle size={17} color="#F32D2D" />
                                <span>{t("The password doesn't match.")}</span>
                            </div>
                            : ""
                    }
                    <button className={styles.form_btn} disabled={isPressed || !passwords.password.value || !passwords.confirm_password.value || passwords.confirm_password.value !== passwords.password.value} style={{ marginTop: "14px" }}>
                        <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                        <ChevronRight size={28} color="white" />
                    </button>
                </>
            }
            {
                step === 3
                &&
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
                            {t("Password Updated Successfully!")}
                        </h5>
                        <p>
                            {t("Click below to login")}
                        </p>
                    </div>
                    <Link to={"/login"} style={{ color: "white" }}>
                        <button className={styles.form_btn} onClick={() => {
                            setIsForgot(false)
                            setIsLoginForm(true)
                            navigate("/login")
                        }} style={{ minWidth: "180px" }}>
                            <span>{t("Login")}</span>
                            <ChevronRight size={28} color="white" />
                        </button>
                    </Link>
                </>
            }
        </form>
    );
}

export default ForgotPassword