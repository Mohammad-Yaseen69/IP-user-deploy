import { useTranslation } from "react-i18next"
import styles from "./styles/otpconfirmation.module.css"
import { Modal, ModalBody } from 'reactstrap'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import { useNavigate } from "react-router"
import { ChevronRight } from "react-feather"

const OtpConfirmation = ({ isOpen, toggle, callback, data, dataHandler, resendHandler, isLoading, error = "" }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [resendTimer, setResendTimer] = useState(data.codeType === "sms" ? 120 : 0)
    const navigate = useNavigate()

    // useLayoutEffect(() => {
    //     setResendTimer(data.codeType === "sms" ? 120 : 0)
    // }, [])

    useEffect(() => {
        if (resendTimer > 0) {
            const intervalId = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [resendTimer]);

    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event?.clipboardData?.getData('text')?.replace(/[^0-9]/g, '')?.slice(0, numberOfFields);
        let newOTPValues = [...otpValues];

        pasteData.split('').forEach((char, index) => {
            newOTPValues[index] = char;
        });

        setOTPValues(newOTPValues);

        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
        if (!isEmpty) {
            callback(newOTPValues.join(""))
        }
    };

    const handleInputChange = (index, value) => {
        dataHandler("otpError", "")
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

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            inputRefs?.current?.[0]?.focus()
        }, 300)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

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
        <Modal isOpen={isOpen} style={{ borderRadius: "1rem", width: "100vw", maxWidth: window.innerWidth > 1000 ? "fit-content" : "96vw" }}>
            <ModalBody className={styles.body}>
                <div className={styles.left}>
                    <h5>
                        {
                            data.codeType === "sms"
                                ?
                                t("SMS/Email Verification Code").replace("SMS", userDetails.slice(0, 3) === "971" ? "Whatsapp" : "SMS")
                                :
                                t("Google Authenticator")
                        }
                    </h5>
                </div>
                <div className={styles.right}>
                    <label>
                        {
                            data.codeType === "sms"
                                ?
                                t("OTP Verification Code")
                                :
                                t("Two Factor Authentication Code")
                        }
                    </label>
                    <div className={styles.inputs}>
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                maxLength={1}
                                value={value}
                                onPaste={handlePaste}
                                onChange={(e) => {
                                    handleInputChange(index, e.target.value)
                                }}
                                onKeyDown={(e) => handleInputKeyDown(index, e)}
                                ref={(input) => (inputRefs.current[index] = input)}
                            />
                        ))}
                    </div>
                    {
                        userDetails?.tfa
                            ?
                            <div className={styles.resend_and_switch}>
                                <span>
                                    {
                                        data.codeType === "sms"
                                            ?
                                            (
                                                resendTimer > 0
                                                    ?
                                                    t("Resend available in ") + resendTimer + " seconds"
                                                    :
                                                    <>
                                                        {t("Didn't receive the verification code?")}
                                                        <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => {
                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                            resendHandler()
                                                            setResendTimer(120)
                                                        }}>{t("Resend Now")}</span>
                                                    </>
                                            )
                                            :
                                            t("Problem with the token?")
                                    }

                                </span>
                                <button onClick={() => {
                                    if (data.codeType !== "sms") {
                                        inputRefs?.current?.[0]?.focus()
                                        setOTPValues(Array(numberOfFields).fill(''))
                                        setResendTimer(120)
                                        if (resendTimer == "0") {
                                            resendHandler("sms")
                                        }
                                    }
                                    dataHandler("codeType", data.codeType === "sms" ? "authenticator" : "sms")
                                }}>
                                    {data.codeType !== "sms" ? "Verify Using SMS/Email".replace("SMS", userDetails.slice(0, 3) === "971" ? "Whatsapp" : "SMS") : "Verify Using Authenticator"}
                                </button>
                            </div>
                            :
                            <div className={styles.resend_and_switch}>
                                <span>
                                    {
                                        resendTimer > 0
                                            ?
                                            t("Resend available in ") + resendTimer + " seconds"
                                            :
                                            <>
                                                {t("Didn't receive the verification code?")}
                                                <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => {
                                                    inputRefs?.current?.[0]?.focus()
                                                    setOTPValues(Array(numberOfFields).fill(''))
                                                    resendHandler()
                                                    setResendTimer(120)
                                                }}>{t("Resend Now")}</span>
                                            </>
                                    }

                                </span>
                                <button onClick={() => {
                                    navigate("/settings?tab=tfa")
                                }}>
                                    {t("Setup Authenticator")}
                                </button>
                            </div>
                    }
                    {data.otpError || error ? <p style={{ marginBottom: "0", textAlign: "center", fontSize: ".8rem", fontWeight: 500, color: "red" }}>{data?.otpError?.length > 0 ? data?.otpError : error}</p> : ""}
                    <div className={styles.buttons}>
                        <button disabled={isLoading} className={styles.cancel} onClick={() => {
                            dataHandler("error", "")
                            dataHandler("otpError", "")
                            dataHandler("otp_error", "")
                            toggle()
                        }}>{t("Back")}</button>
                        <button disabled={isLoading || isAnyFieldEmpty} onClick={() => callback(otpValues.join(""))} ref={buttonRef}>
                            {t("Verify")}
                            <ChevronRight size={18} color="white" />
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default OtpConfirmation