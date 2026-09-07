import React, { useState, useRef, useEffect, useContext } from 'react';
import otp_icon from '../PaymentsNewer/files/otp_icon.png';
import { Button } from 'reactstrap';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { InactivityContext } from '../../InactivityWrapper';
import { useTranslation } from 'react-i18next';
import auth_icon from "../PaymentsNewer/files/auth.png"
import { useNavigate } from 'react-router';
import { UserContext } from '../../Context/UserContext';


const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
const OTPConfirmation = ({ setter, callback, setterValue, hideOtp, type = "", processing = false, resendHandler = () => { }, authType, setAuthType, hideTfaSwitch = false, showAuthToggle = true, inBasic, fullHeight, showBackButton = false,
    onBack = () => { } }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const navigate = useNavigate()
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])

    const [verified, setVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState();
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [otpError, setOtpError] = useState("")
    const { setIsExtended } = useContext(InactivityContext)
    const [isSaving, setIsSaving] = useState(false)

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
    }, [verified]);

    useEffect(() => {
        if (!verified && resendTimer > 0) {
            const intervalId = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [verified, resendTimer]);

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
            callback(setVerified, type, newOTPValues.join(""), setOtpError)
        }
    };

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault()
                if (isSaving) return
                setIsSaving(true)

                try {
                    await callback(setVerified, type, otpValues.join(""), setOtpError)
                } finally {
                    setIsSaving(false)
                }
            }}

            style={{
                height: fullHeight ? "100%" : '450px',
                marginBottom: 0,
                boxShadow: 'none',
                gap: '1.3rem',
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    borderRadius: '20px',
                    flex: '1',
                    display: 'flex',
                    alignItems: "center",
                    overflow: 'hidden',
                    padding: '14px',
                    // gap: '14px',
                    paddingBottom: '1rem',
                    boxShadow: '0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)',
                }}
                className="otp_cont"
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    maxHeight: "420px",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%"
                }}>
                    <div
                        style={{
                            border: '2px solid rgba(0, 0, 0, 0.04)',
                            borderRadius: '30px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            boxShadow: '0px 11.233247756958008px 19.658184051513672px 0px rgba(172, 53, 159, 0.09)',
                            height: '120px',
                            width: '120px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={authType === "sms" ? otp_icon : auth_icon}
                            alt="otp"
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                filter: 'drop-shadow(0px 4px 7px 0px rgba(172, 53, 159, 0.31))',
                            }}
                        />
                    </div>
                    <div className='text-center'>
                        <h4 style={{
                            fontSize: "24px",
                            fontWeight: 700
                        }}>
                            {
                                verified
                                    ?
                                    (
                                        authType === "sms"
                                            ?
                                            t("Verification Code Verified")
                                            :
                                            (showAuthToggle ? t("Authenticator Code Verified") : null)
                                    )
                                    :
                                    (
                                        authType === "sms"
                                            ?
                                            t("Enter Code")
                                            :
                                            t("Authenticator Code")
                                    )
                            }
                        </h4>
                        <p style={{ maxWidth: "212px", fontSize: "14px", fontWeight: 600 }}>
                            {
                                verified
                                    ?
                                    (
                                        authType === "sms"
                                            ?
                                            t("Verification code has been verified, You'll be redirected to the next step.")
                                            :
                                            t("The code was verified and you’re good to go!")
                                    )
                                    :
                                    (
                                        authType === "sms"
                                            ? `${t("A one-time verification code has been sent to your")} ${(userDetails?.email || type === "email") ? "email address" : ""
                                            }${!inBasic ? " and " : " "} ${type === "phone"
                                                ? (userDetails?.phone?.slice(0, 3) === "971"
                                                    ? t("whatsapp number.")
                                                    : t("phone number."))
                                                : t("SMS")
                                            }`
                                            :
                                            t("Enter a code shown in the app to make sure everything works fine.")
                                    )
                            }
                        </p>
                    </div>
                    <>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {otpValues.map((value, index) => (
                                <input
                                    key={index}
                                    maxLength={1}
                                    value={value}
                                    onPaste={handlePaste}
                                    onChange={(e) => {
                                        setOtpError("")
                                        handleInputChange(index, e.target.value)
                                    }}
                                    onKeyDown={(e) => handleInputKeyDown(index, e)}
                                    ref={(input) => (inputRefs.current[index] = input)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        textAlign: 'center',
                                        fontSize: '16px',
                                        border: '1px solid #ccc',
                                        borderRadius: '6px',
                                        outline: "none"
                                    }}
                                />
                            ))}
                        </div>
                        {
                            hideTfaSwitch
                                ?
                                ""
                                :
                                userDetails?.tfa
                                    ?
                                    <span style={{
                                        fontSize: "12px",
                                    }} onClick={() => {
                                        if (authType !== "sms") {
                                            inputRefs?.current?.[0]?.focus()
                                            setOTPValues(Array(numberOfFields).fill(''))
                                            if (type === "email") {
                                                setResendTimer(300)
                                            } else {
                                                setResendTimer(120)
                                            }
                                            console.log(resendTimer)

                                            resendHandler("sms")
                                        }
                                        setAuthType(authType === "sms" ? "authenticator" : "sms")
                                    }}>
                                        <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{authType === "sms" ? (showAuthToggle ? t("Verify Using Authenticator") : null) : t("Verify Using Sms/Email")}</span>
                                    </span>
                                    :
                                    <span onClick={() => navigate("/settings?tab=tfa")} style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{t("Setup Authenticator")}</span>
                        }
                        {
                            otpError && <span style={{ fontSize: ".8rem", fontWeight: 700, color: "red" }}>{t(otpError)}</span>
                        }
                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                            {
                                authType === "sms"
                                &&
                                (
                                    resendTimer > 0
                                        ?
                                        t("Resend available in ") + formatTime(resendTimer) + " "
                                        :
                                        <>
                                            {"Didn't receive OTP? "}
                                            <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => {
                                                setOTPValues(Array(numberOfFields).fill(''))
                                                resendHandler()
                                                if (type === 'email') {
                                                    setResendTimer(300)
                                                } else {
                                                    setResendTimer(90)
                                                }
                                            }}>{t("Resend Now")}</span>
                                        </>
                                )
                            }

                        </span>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            marginTop: "1rem"
                        }}>
                            {showBackButton && (
                                <button
                                    type="button"
                                    size="lg"
                                    onClick={onBack}
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        background: "#fff",
                                        color: "#000",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "18px",
                                    }}
                                >
                                    <ChevronLeft size={24} />
                                    {t("Back")}
                                </button>
                            )}
                            <Button size="lg" style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                fontSize: "18px",
                                opacity: (isAnyFieldEmpty || isSaving || processing) ? 0.5 : 1,
                                pointerEvents: (isAnyFieldEmpty || isSaving || processing) ? 'none' : 'auto'
                            }}
                                className="i_t_button"
                                disabled={isAnyFieldEmpty || isSaving || processing}
                            >
                                {isSaving ? t("Verifing") : t("Verify")} <ChevronRight size={24} />
                            </Button>
                        </div>
                    </>
                </div>
            </div>
        </form>
    );
};

export default OTPConfirmation;