import React, { useContext, useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'react-feather';
import otp from "./files/otp.svg"
import styles from "./styles/index.module.css"
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { useNavigate } from 'react-router';
import { countries } from 'country-list-json';
import { useTranslation } from 'react-i18next';

const OtpConfimation = ({ email, password, token, isEmail, setServiceError, resendHandler }) => {
    const { t } = useTranslation()
    const [verified, setVerified] = useState(false)
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [isPressed, setIsPressed] = useState(false)
    const [resendTimer, setResendTimer] = useState(90);
    const [isLoginError, setIsLoginError] = useState("")
    const { setUserDetails, profileLockTIme, setProfileLockTime } = useContext(UserContext)
    const navigate = useNavigate()


    // old func
    // const handleInputChange = (index, value) => {
    //     const numericValue = value.replace(/[^0-9]/g, '');

    //     const newOTPValues = [...otpValues];
    //     newOTPValues[index] = numericValue;
    //     setOTPValues(newOTPValues);

    //     if (numericValue && index < numberOfFields - 1) {
    //         inputRefs.current[index + 1].focus();
    //     }

    //     const isEmpty = newOTPValues.some(val => val === '');
    //     setIsAnyFieldEmpty(isEmpty);
    // };
    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
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

    const [winWidth, setWinWidth] = useState(window.innerWidth < 1700)


    const getUserInfo = async () => {
        try {
            const res = await axios.get(`https://ipinfo.io?token=${import.meta.env.VITE_IP_INFO_TOKEN}`)
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
                setIsLoginError("Something went wrong. Please try again.")
            }
        }
    }

    const loginHandler = async () => {
        setIsPressed(true)
        setIsLoginError("")
        const credentials = isEmail.test(email)
            ? { email, password, token, code: otpValues.join("") }
            : { phone: email, password, token, code: otpValues.join("") }

        const encrypted = encryptData(credentials)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-login-otp`, {
            data: encrypted
        })
            .then(async (res) => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                const token = decrypted?.token
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${decrypted?.token}`)
                    .then(async res => {
                        const decrypted = decryptData(res.data.data)
                        const data = await getUserInfo()
                        const encrypted = encryptData(
                            {
                                accountId: decrypted?._id,
                                ...data
                            }
                        )
                        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/login/create-login-history`, {
                            data: encrypted
                        })
                            .then(res => {
                                const decrypted = decryptData(res.data.data)

                                if (decrypted?.status) {
                                    axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/auth/${token}`)
                                        .then(res => {
                                            const dec = decryptData(res.data.data)
                                            if (dec?.country?.status) {
                                                localStorage.setItem("login", true)
                                                localStorage.setItem("token", token)
                                                setUserDetails(dec)
                                                const path = sessionStorage.getItem("path")
                                                sessionStorage.clear()
                                                navigate(path || "/dashboard/default")
                                                setIsPressed(false)
                                            } else {
                                                sessionStorage.setItem("country_status_error", "Service not available in your country!")
                                                setServiceError("Service not available in your country!")
                                            }
                                        })
                                        .catch(err => {
                                            // console.log(decryptData(err?.response?.data?.data))
                                        })
                                }
                            })
                            .catch(err => {
                                setIsPressed(false)
                                const decrypted = decryptData(err.response.data.data)
                            })
                    })
                    .catch(err => {
                        // console.log(decryptData(err.response.data.data))
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

    return (
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
                            t("OTP has been verified, Please continue to the next step.")
                            :
                            t("A one-time verification code has been sent to your email address  and phone number.")
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
                                type="number"
                                maxLength={1}
                                value={value}
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
                    <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}
                        className={styles.resend_text}
                    >
                        {
                            resendTimer > 0
                                ?
                                t("Resend available in") + " " + resendTimer + " " + t("seconds")
                                :
                                <>
                                    {t("Didn't receive OTP?")}
                                    <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={(e) => {
                                        setOTPValues(Array(numberOfFields).fill(''))
                                        resendHandler(e)
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
            <button className={styles.form_btn} disabled={isPressed || isAnyFieldEmpty || otpValues.some(item => !item)} onClick={loginHandler}>
                <span>{isPressed ? t("Verifying") : t("Verify")}</span>
                <ChevronRight size={28} color="white" />
            </button>
        </div>
    )
}

export default OtpConfimation