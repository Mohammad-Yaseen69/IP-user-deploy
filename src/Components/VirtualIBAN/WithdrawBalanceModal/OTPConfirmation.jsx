import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Star } from "react-feather"
import { InactivityContext } from "../../../InactivityWrapper"
import { UserContext } from "../../../Context/UserContext"
import styles from "./withdrawBalance.module.scss"

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

const verificationMethods = [
    { id: "authenticator", label: "Google Authenticator", Icon: Star },
]

const OTPConfirmation = ({
    setter,
    callback,
    setterValue,
    hideOtp,
    type = "",
    processing = false,
    resendHandler = () => {},
    authType,
    setAuthType,
    hideTfaSwitch = false,
    showAuthToggle = true,
    inBasic,
    onCancel,
}) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const navigate = useNavigate()
    const numberOfFields = 6
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(""))
    const inputRefs = useRef(Array(numberOfFields).fill(null))
    const [verified, setVerified] = useState(false)
    const [resendTimer, setResendTimer] = useState()
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true)
    const [otpError, setOtpError] = useState("")
    const { setIsExtended } = useContext(InactivityContext)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        inputRefs?.current?.[0]?.focus()
    }, [])

    useEffect(() => {
        setIsExtended(true)
    }, [])

    useEffect(() => {
        if (type === "email") {
            setResendTimer(300)
        } else {
            setResendTimer(90)
        }
    }, [type])

    useEffect(() => {
        if (verified) {
            setter(setterValue)
            hideOtp()
            setIsExtended(false)
        }
    }, [verified])

    useEffect(() => {
        if (!verified && resendTimer > 0) {
            const intervalId = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1)
            }, 1000)

            return () => {
                clearInterval(intervalId)
            }
        }
    }, [verified, resendTimer])

    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, "")

        if (numericValue < 0 || String(numericValue)?.includes("+") || String(numericValue)?.includes("-") || String(numericValue)?.includes("e")) {
            return
        }

        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1)
        }

        const newOTPValues = [...otpValues]
        newOTPValues[index] = numericValue
        setOTPValues(newOTPValues)

        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus()
        }

        const isEmpty = newOTPValues.some((val) => val === "")
        setIsAnyFieldEmpty(isEmpty)
    }

    const handleInputKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (otpValues[index] === "" && index > 0) {
                inputRefs.current[index - 1].focus()
            } else if (index > 0) {
                const newOTPValues = [...otpValues]
                newOTPValues[index] = ""
                setOTPValues(newOTPValues)
                setIsAnyFieldEmpty(true)
            }
        }
    }

    const handlePaste = (event) => {
        event.preventDefault()
        const pasteData = event?.clipboardData?.getData("text")?.replace(/[^0-9]/g, "")?.slice(0, numberOfFields)
        const newOTPValues = [...otpValues]

        pasteData.split("").forEach((char, index) => {
            newOTPValues[index] = char
        })

        setOTPValues(newOTPValues)

        const isEmpty = newOTPValues.some((val) => val === "")
        setIsAnyFieldEmpty(isEmpty)

        if (!isEmpty) {
            callback(setVerified, type, newOTPValues.join(""), setOtpError)
        }
    }

    const handleAuthTypeChange = (methodId) => {
        if (hideTfaSwitch || !setAuthType) return

        if (methodId === "authenticator" && !userDetails?.tfa) {
            navigate("/settings?tab=tfa")
            return
        }

        inputRefs?.current?.[0]?.focus()
        setOTPValues(Array(numberOfFields).fill(""))
        setOtpError("")
        setIsAnyFieldEmpty(true)
        setAuthType(methodId === "authenticator" ? "authenticator" : "sms")

        if (methodId !== "authenticator" && resendTimer === 0) {
            resendHandler(methodId)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (isSaving) return

        setIsSaving(true)

        try {
            await callback(setVerified, type, otpValues.join(""), setOtpError)
        } finally {
            setIsSaving(false)
        }
    }

    const email = userDetails?.email || "hello@example.com"

    return (
        <form className={styles.otpStep} onSubmit={handleSubmit}>
            <div>
                <div className={styles.otpLabel}>{t("Enter OTP")}</div>
                <p className={styles.otpHint}>{t("We've sent a 6-digit secure code to")}</p>
                <div className={styles.otpCenter}>
                    <div className={styles.otpEmail}>{email}</div>

                    <div className={styles.otpInputs}>
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                maxLength={1}
                                value={value}
                                onPaste={handlePaste}
                                onChange={(event) => {
                                    setOtpError("")
                                    handleInputChange(index, event.target.value)
                                }}
                                onKeyDown={(event) => handleInputKeyDown(index, event)}
                                ref={(input) => (inputRefs.current[index] = input)}
                                inputMode="numeric"
                            />
                        ))}
                    </div>

                    <div className={styles.otpResend}>
                        {t("Didn't receive the code?")}{" "}
                        {resendTimer > 0 ? (
                            <span>{t("Resend in")} {formatTime(resendTimer)}</span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setOTPValues(Array(numberOfFields).fill(""))
                                    resendHandler()
                                    setResendTimer(type === "email" ? 300 : 90)
                                }}
                            >
                                {t("Resend now")}
                            </button>
                        )}
                    </div>
                </div>

                {otpError && <div className={styles.otpError}>{t(otpError)}</div>}

                {showAuthToggle && (
                    <div className={styles.otpMethodsWrap}>
                        <div className={styles.otpMethodsLabel}>{t("Choose your preferred method to receive your verification code:")}</div>
                        <div className={styles.otpMethods}>
                            {verificationMethods.map(({ id, label, Icon }) => {
                                const isSelected = id === "authenticator" ? authType !== "sms" : authType === "sms"

                                return (
                                    <button
                                        type="button"
                                        key={id}
                                        className={`${styles.otpMethod} ${isSelected ? styles.selectedOtpMethod : ""}`}
                                        onClick={() => handleAuthTypeChange(id)}
                                    >
                                        <Icon size={14} />
                                        <span>{t(label)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {!showAuthToggle && !inBasic && !userDetails?.tfa && (
                    <button type="button" className={styles.setupAuthenticator} onClick={() => navigate("/settings?tab=tfa")}>
                        {t("Setup Authenticator")}
                    </button>
                )}
            </div>

            <div className={styles.otpFooter}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel || hideOtp}>
                    {t("Cancel")}
                </button>
                <button
                    type="submit"
                    className={styles.nextBtn}
                    disabled={isAnyFieldEmpty || isSaving || processing}
                >
                    {isSaving ? t("Verifying") : t("Authenticate")}
                </button>
            </div>
        </form>
    )
}

export default OTPConfirmation
