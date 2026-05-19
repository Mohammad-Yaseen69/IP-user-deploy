import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import ErrorModal from '../PaymentsNewer/InternationalFlow/ErrorModal'
import styles from "./styles/index.module.css"
import styles2 from "./styles/createPassword.module.css"
import otpStyles from "./styles/otp.module.css"
import { Check, ChevronRight, Eye, EyeOff, Lock } from 'react-feather'
import Cross from './Cross'
import { useTranslation } from 'react-i18next'
import Logo from "../../assets/images/logo/logo2.webp"
import InstapayLogo from "../../assets/images/logo/logo_white.png"
import Gif from "../../assets/gif.gif"
import { Modal, ModalBody } from 'reactstrap'
import imgLeft from "./files/image.png"
import LanguagePicker from '../LanguagePicker'
import { FlagSvg } from '../Auth/agentAuth/files/svg'

const CreateAgentPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [otpToken, setOtpToken] = useState("")
    const [success, setSuccess] = useState(false)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [resendTimer, setResendTimer] = useState(120)
    const [error, setError] = useState(null)
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { mutateAsync: sendPassword, isPending: sendingPassword } = useMutation({
        mutationFn: () => apiWrapper({
            method: "POST",
            isEncrypted: true,
            endpoint: "/api/business-agents/agents/set-password",
            payload: {
                token,
                password: passwords.password
            }
        }),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            setError(dec?.message || "We're unable to process your request at the moment.")
        },
        onSuccess: (data) => {
            setOtpToken(data?.token)
            setStep(2)
        }
    })

    const { mutateAsync: resendOtp, isPending: resendingOtp } = useMutation({
        mutationFn: () => apiWrapper({
            method: "POST",
            isEncrypted: true,
            endpoint: "/api/business-agents/agents/resend-password-otp",
            payload: {
                token: otpToken
            }
        }),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            setError(dec?.message || "We're unable to process your request at the moment.")
        },
        onSuccess: (data) => {
            setOtpToken(data?.token)
            setResendTimer(120)
            setOTPValues(Array(numberOfFields).fill(''))
            setError(null)
        }
    })



    const { mutateAsync: verifyOtp, isPending: verifyingOtp } = useMutation({
        mutationFn: () => apiWrapper({
            method: "POST",
            isEncrypted: true,
            endpoint: "/api/business-agents/agents/verify-password-otp",
            payload: {
                token: otpToken,
                password: passwords.password,
                otp: otpValues.join("")
            }
        }),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            setError(dec?.message || "We're unable to process your request at the moment.")
        },
        onSuccess: (data) => {
            setSuccess(true)
        }
    })

    useEffect(() => {
        if (step === 2 && resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [step, resendTimer])

    const handleOtpChange = (index, value) => {
        const numericValue = value.replace(/[^0-9]/g, '').slice(-1)
        const newOtp = [...otpValues]
        newOtp[index] = numericValue
        setOTPValues(newOtp)

        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus()
        }
        setIsAnyFieldEmpty(newOtp.some(val => val === ''))
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1].focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, numberOfFields)
        const newOtp = [...otpValues]
        pasteData.split('').forEach((char, i) => {
            if (i < numberOfFields) newOtp[i] = char
        })
        setOTPValues(newOtp)
        setIsAnyFieldEmpty(newOtp.some(val => val === ''))

        const lastFilledIndex = Math.min(pasteData.length, numberOfFields - 1)
        inputRefs.current[lastFilledIndex]?.focus()
    }

    const isLengthValid = passwords.password.length >= 9 && passwords.password.length <= 64
    const hasUpper = /[A-Z]/.test(passwords.password)
    const hasLower = /[a-z]/.test(passwords.password)
    const hasNumber = /[0-9]/.test(passwords.password)
    const hasSpecial = /[^A-Za-z0-9]/.test(passwords.password)
    const requirementCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length >= 2
    const isPasswordValid = isLengthValid && requirementCount
    const passwordsMatch = passwords.password === passwords.confirmPassword && passwords.confirmPassword !== ""

    const renderStep1 = () => (
        <div className={styles2.wrapper}>

            <div className={otpStyles.leftPanel}>
                <img
                    src={imgLeft}
                    loading="lazy"
                    alt=""
                    className={otpStyles.leftImg}
                />

                <img
                    src={InstapayLogo}
                    className={otpStyles.childLogo}
                    loading="lazy"
                    alt=""
                />

                <h2>{t("Unlock Seamless Payments with InstaPay")}</h2>
            </div>

            <div className={styles2.wrapperRight}>
                <div className={styles2.wrapperRight_two}>
                    <div className={styles2.top}>
                        <div className={styles2.iconArea}>
                            <Lock size={22} color="#5926F0" />
                        </div>

                        <h4>{t("Create a new password")}</h4>
                        <p className={styles2.subtitle}>{t("Enter a strong password.")}</p>
                    </div>

                    <div className={styles2.password_input}>
                        <Lock size={16} color="#bbb" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                            placeholder={t("Password")}
                        />
                        {showPassword
                            ? <EyeOff size={18} onClick={() => setShowPassword(false)} style={{ cursor: "pointer", color: "#aaa", flexShrink: 0 }} />
                            : <Eye size={18} onClick={() => setShowPassword(true)} style={{ cursor: "pointer", color: "#aaa", flexShrink: 0 }} />
                        }
                    </div>

                    <div className={styles2.password_guidance}>
                        <h5>{t("Password must:")}</h5>
                        <ul className={styles2.pg_list}>
                            <li>
                                {isLengthValid ? <Check size={14} color="#22c55e" /> : <Cross />}
                                <p>{t("Be between 9 and 64 characters")}</p>
                            </li>
                            <li>
                                {requirementCount ? <Check size={14} color="#22c55e" /> : <Cross />}
                                <p>{t("Include at least two of the following:")}</p>
                            </li>
                            <ul className={styles2.pg_sub_list}>
                                <li>{hasUpper ? <Check size={13} color="#22c55e" /> : <Cross />}<p>{t("Uppercase character")}</p></li>
                                <li>{hasLower ? <Check size={13} color="#22c55e" /> : <Cross />}<p>{t("Lowercase Character")}</p></li>
                                <li>{hasNumber ? <Check size={13} color="#22c55e" /> : <Cross />}<p>{t("Number")}</p></li>
                                <li>{hasSpecial ? <Check size={13} color="#22c55e" /> : <Cross />}<p>{t("Special Character")}</p></li>
                            </ul>
                        </ul>
                    </div>

                    <div className={styles2.password_input}>
                        <Lock size={16} color="#bbb" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            placeholder={t("Confirm Password")}
                        />
                        {showConfirmPassword
                            ? <EyeOff size={18} onClick={() => setShowConfirmPassword(false)} style={{ cursor: "pointer", color: "#aaa", flexShrink: 0 }} />
                            : <Eye size={18} onClick={() => setShowConfirmPassword(true)} style={{ cursor: "pointer", color: "#aaa", flexShrink: 0 }} />
                        }
                    </div>

                    {!passwordsMatch && passwords.confirmPassword.length > 0 && (
                        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "-6px", marginBottom: "8px", alignSelf: "flex-start" }}>
                            {t("The password doesn't match.")}
                        </p>
                    )}

                    <button
                        onClick={() => sendPassword()}
                        className={styles2.form_btn}
                        disabled={sendingPassword || !isPasswordValid || !passwordsMatch}
                    >
                        <span>{sendingPassword ? t("Continuing") : t("Send verification code")}</span>
                        <ChevronRight size={22} color="white" />
                    </button>

                    <p className={styles2.termsText}>
                        {t("By continuing, you agree to our")}{" "}
                        <a href="https://www.insta-pay.ch/terms-and-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                        >{t("Terms & Conditions")}</a>{" "}
                        {t("and")}{" "}
                        <a href="https://www.insta-pay.ch/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >{t("Privacy Statement")}</a>.
                    </p>
                </div>
                <div className={styles2.footer}>
                    <LanguagePicker />
                    <span>© 2024 Instapay. {t("All rights reserved.")}</span>
                    <span><FlagSvg /> {t("A Swiss Company")}</span>
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className={otpStyles.wrapper}>

            <div className={otpStyles.leftPanel}>
                <img
                    src={imgLeft}
                    loading="lazy"
                    alt=""
                    className={otpStyles.leftImg}
                />

                <img
                    src={InstapayLogo}
                    className={otpStyles.childLogo}
                    loading="lazy"
                    alt=""
                />

                <h2>{t("Unlock Seamless Payments with InstaPay")}</h2>
            </div>

            <div className={otpStyles.wrapperRight}>
                <div className={otpStyles.wrapperRight_two}>
                    <div className={otpStyles.logo}>
                        <img src={Logo} loading="lazy" width={100} height={100} alt="logo" />
                    </div>
                    <div className={otpStyles.top}>
                        <div className={otpStyles.iconArea}>
                            <Lock size={22} color="#5926F0" />
                        </div>

                        <h5>{t("SMS Verification Code")}</h5>

                        <p className={otpStyles.subtitle}>
                            {t("Enter the 6 digit verification code sent to your device")}
                        </p>
                    </div>

                    <div className={otpStyles.otpWrapper}>


                        <div className={otpStyles.inputs}>
                            {otpValues.map((val, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    value={val}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={handleOtpPaste}
                                    maxLength={1}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={otpStyles.resend_and_switch}>
                        <span>
                            {resendTimer > 0 ? (
                                `${t("Resend available in")} ${resendTimer} ${t("seconds")}`
                            ) : (
                                <>
                                    {t("Didn't receive the code?")}

                                    <span
                                        className={otpStyles.resendBtn}
                                        onClick={() => resendOtp()}
                                    >
                                        {resendingOtp
                                            ? t("Resending...")
                                            : t("Resend Now")}
                                    </span>
                                </>
                            )}
                        </span>
                    </div>

                    <div className={otpStyles.buttons}>

                        <button
                            className={otpStyles.form_btn}
                            disabled={verifyingOtp || isAnyFieldEmpty}
                            onClick={() => verifyOtp()}
                        >
                            <span>
                                {verifyingOtp
                                    ? t("Verifying")
                                    : t("Verify and continue")}
                            </span>

                            <ChevronRight size={20} color="white" />
                        </button>
                    </div>
                </div>
                <div className={styles.footer}>
                    <LanguagePicker />
                    <span>© 2024 Instapay. {t("All rights reserved.")}</span>
                    <span><FlagSvg /> {t("A Swiss Company")}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className={styles.container}>


            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}

            <ErrorModal
                heading='Action Failed'
                isOpen={error}
                message={error}
                toggle={() => setError(null)}
            />

            <Modal isOpen={success} centered backdrop="static" style={{ borderRadius: "1rem" }}>
                <ModalBody style={{ textAlign: "center", padding: "40px" }}>
                    <img src={Gif} loading="lazy" style={{ width: '150px', marginBottom: "20px" }} alt="Success" />
                    <h3 style={{ fontSize: "22px", fontWeight: 700 }}>{t("Success!")}</h3>
                    <p style={{ color: "#575757", margin: "15px 0 25px" }}>
                        {t("Your agent password has been successfully set. Please login to your agent account to continue.")}
                    </p>
                    <button
                        onClick={() => navigate("/agent-login")}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            backgroundColor: "#5926f0",
                            color: "white",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "16px"
                        }}
                    >
                        {t("Go to Login")}
                    </button>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default CreateAgentPassword