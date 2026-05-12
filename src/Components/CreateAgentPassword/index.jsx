import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import ErrorModal from '../PaymentsNewer/InternationalFlow/ErrorModal'
import styles from "./styles/index.module.css"
import otpStyles from "./styles/otp.module.css"
import { Check, ChevronRight, Eye, EyeOff } from 'react-feather'
import Cross from './Cross'
import { useTranslation } from 'react-i18next'
import Logo from "../../assets/images/logo/logo2.webp"
import Gif from "../../assets/gif.gif"
import { Modal, ModalBody } from 'reactstrap'

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

    // Timer Logic
    useEffect(() => {
        if (step === 2 && resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [step, resendTimer])

    // OTP Handlers
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

    // Password Validation Logic
    const isLengthValid = passwords.password.length >= 9 && passwords.password.length <= 64
    const hasUpper = /[A-Z]/.test(passwords.password)
    const hasLower = /[a-z]/.test(passwords.password)
    const hasNumber = /[0-9]/.test(passwords.password)
    const hasSpecial = /[^A-Za-z0-9]/.test(passwords.password)
    const requirementCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length >= 2
    const isPasswordValid = isLengthValid && requirementCount
    const passwordsMatch = passwords.password === passwords.confirmPassword && passwords.confirmPassword !== ""

    const renderStep1 = () => (
        <div className={styles.wrapper}>
            <span className={styles.topHeading}>{t("Agent Sign Up")}</span>
            <h4 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", alignSelf: "flex-start" }}>
                {t("Enter Your Password")}
            </h4>
            
            <div className={styles.password_input}>
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.password} 
                    onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                    placeholder={t("Password")}
                />
                {showPassword ? 
                    <EyeOff onClick={() => setShowPassword(false)} style={{ cursor: "pointer" }} /> : 
                    <Eye onClick={() => setShowPassword(true)} style={{ cursor: "pointer" }} />
                }
            </div>

            <div className={styles.password_guidance}>
                <h5>{t("Password must:")}</h5>
                <ul className={styles.pg_list}>
                    <li>
                        {isLengthValid ? <Check /> : <Cross />}
                        <p>{t("Be between 9 and 64 characters")}</p>
                    </li>
                    <li>
                        {requirementCount ? <Check /> : <Cross />}
                        <p>{t("Include at least two of the following:")}</p>
                    </li>
                    <ul className={styles.pg_sub_list}>
                        <li>{hasUpper ? <Check /> : <Cross />}<p>{t("Uppercase character")}</p></li>
                        <li>{hasLower ? <Check /> : <Cross />}<p>{t("Lowercase Character")}</p></li>
                        <li>{hasNumber ? <Check /> : <Cross />}<p>{t("Number")}</p></li>
                        <li>{hasSpecial ? <Check /> : <Cross />}<p>{t("Special Character")}</p></li>
                    </ul>
                </ul>
            </div>

            <h4 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", alignSelf: "flex-start", marginTop: "10px" }}>
                {t("Confirm Password")}
            </h4>
            <div className={styles.password_input}>
                <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={passwords.confirmPassword} 
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder={t("Confirm Password")}
                />
                {showConfirmPassword ? 
                    <EyeOff onClick={() => setShowConfirmPassword(false)} style={{ cursor: "pointer" }} /> : 
                    <Eye onClick={() => setShowConfirmPassword(true)} style={{ cursor: "pointer" }} />
                }
            </div>
            
            {!passwordsMatch && passwords.confirmPassword.length > 0 && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "5px", alignSelf: "flex-start" }}>
                    {t("The password doesn't match.")}
                </p>
            )}

            <button 
                onClick={() => sendPassword()} 
                className={styles.form_btn} 
                disabled={sendingPassword || !isPasswordValid || !passwordsMatch}
                style={{ marginTop: "20px", width: "100%" }}
            >
                <span>{sendingPassword ? t("Continuing") : t("Continue")}</span>
                <ChevronRight size={28} color="white" />
            </button>
        </div>
    )

    const renderStep2 = () => (
        <div className={otpStyles.body} style={{ borderRadius: "1rem", overflow: "hidden", margin: "40px auto", maxWidth: "900px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className={otpStyles.left}>
                <h5>{t("SMS Verification Code")}</h5>
            </div>
            <div className={otpStyles.right}>
                <label>{t("OTP Verification Code")}</label>
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
                
                <div className={otpStyles.resend_and_switch}>
                    <span>
                        {resendTimer > 0 ? 
                            `${t("Resend available in")} ${resendTimer} ${t("seconds")}` : 
                            <>
                                {t("Didn't receive the code?")} 
                                <span 
                                    style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer", marginLeft: "5px" }} 
                                    onClick={() => resendOtp()}
                                >
                                    {resendingOtp ? t("Resending...") : t("Resend Now")}
                                </span>
                            </>
                        }
                    </span>
                </div>

                <div className={otpStyles.buttons}>
                    <button className={otpStyles.cancel} onClick={() => setStep(1)}>{t("Back")}</button>
                    <button 
                        disabled={verifyingOtp || isAnyFieldEmpty} 
                        onClick={() => verifyOtp()}
                    >
                        {verifyingOtp ? t("Verifying") : t("Verify")}
                        <ChevronRight size={18} color="white" />
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className={styles.container}>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={Logo} loading="lazy" style={{ margin: "40px auto", width: "150px" }} alt="Logo" />
            </div>

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