import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'react-feather'
import LanguagePicker from '../../LanguagePicker'
import { useTranslation } from 'react-i18next'
import styles from "../styles/index.module.css"

const OtpConfirmation = ({ verifyOTpHandler, resendHandler, timer = 120, type = "phone", data, dataHandler }) => {
    const { t } = useTranslation()

    const [resendTimer, setResendTimer] = useState(timer)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [data])
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
            verifyOTpHandler(newOTPValues.join(""), setOTPValues, numberOfFields)
        }
    };
    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault()
                verifyOTpHandler(otpValues.join(""), setOTPValues, numberOfFields)
            }} className={styles.otp} style={{ marginTop: 0 }}>
                <div className={styles.left}>
                    <h1>{t("SMS Verification").replace("SMS", type === "phone" ? "SMS" : "Email")}</h1>
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
                            <label>{t(`Enter the SMS code sent to +41********4053`).replace("+41********4053", `${data?.[type]?.slice(0, data?.[type]?.length - 4).split("").map(_ => "*").join("")}${data?.[type]?.slice(data?.[type]?.length - 4)}`).replace("SMS", type === "phone" ? "SMS" : "Email")}</label>
                            <div
                                style={{
                                    fontSize: ".8rem",
                                    textDecoration: "underline",
                                    fontWeight: 500,
                                    color: "#5926f0",
                                    marginTop: "-1rem",
                                    marginBottom: "2rem",
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    dataHandler("step", 3)
                                    dataHandler("show_otp", false)
                                    dataHandler("phone_otp_verfied", false)
                                    dataHandler("show_email_otp", false)
                                }}
                            >{t("Change Number").replace("Number", type === "phone" ? "Number" : "Email")}</div>
                            <div className={styles.otp_inputs}>
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
                        </div>
                        <div className={styles.toggle_sms}>
                            <span>
                                {
                                    resendTimer > 0
                                        ?
                                        t("Resend Code In 100 Seconds").replace("100", resendTimer)
                                        :
                                        <>{t("Didn't receive OTP?") + " "} <span style={{ color: "#5926f0", cursor: "pointer" }} onClick={() => {
                                            setOTPValues(Array(numberOfFields).fill(''))
                                            resendHandler()
                                            setResendTimer(timer)
                                        }}>{t("Resend Now")}</span></>
                                }
                            </span>
                        </div>
                        {
                            data.error
                            &&
                            <div className={styles.input_error}>
                                <AlertTriangle size={17} color="#F32D2D" />
                                <span>{t(data.error)}</span>
                            </div>
                        }
                    </div>
                    <div className={styles.center_bottom} style={{ justifyContent: "flex-end" }}>
                        <div className={styles.btns}>
                            <button type="submit"
                                className={styles.form_btn}
                                disabled={isAnyFieldEmpty || otpValues.some(item => !item) || data.loading || data.account_created}
                            >
                                <span>{
                                    data.loading
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

        </>
    )
}

export default OtpConfirmation