import React, { useState, useRef, useEffect, useContext } from 'react';
import otp_icon from './files/otp_icon.png';
import auth from './files/auth.png';
import { Button } from 'reactstrap';
import { ChevronRight } from 'react-feather';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { UserContext } from '../../Context/UserContext';
import { InactivityContext } from '../../InactivityWrapper';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { resendHandler } from '../../Helper/SendOTP';
import { useNavigate } from 'react-router';
import TrustpaymentPage from '../AddFunds/WalletFund/CreditTransaction';
import { apiErrorMessage } from './InternationalFlow';

export const possibleErrors = {
    sdl400: "Daily Sending Limit exceeded",
    sml400: "Monthly Sending Limit exceeded",
    syl400: "Yearly Sending Limit exceeded",
    tal400: "Transaction Amount Limit exceeded",
    dtc400: "Daily Transaction Count Limit exceeded",
    mtc400: "Monthly Transaction Count Limit exceeded",
    ytc400: "Yearly Transaction Count Limit exceeded",
    rdl400: "Receiver's Daily Receiving Limit exceeded",
    rml400: "Receiver's Monthly Receiving Limit exceeded",
    ryl400: "Receiver's Yearly Receiving Limit exceeded",
    rbl400: "Receiver's Balance Limit Reached.",
    "Feature not available!": "Feature not available!",
    tpl400 : "Topup Amount Limit exceeded"
}

export const LimitsErrorMessage = (message = "") => {
    let error;

    for (const key in possibleErrors) {
        if (message.includes(key)) {
            error = possibleErrors[key]
            break
        }
    }

    return error ?? false
}

const OTPConfirmation = ({
    setSubStep,
    createdTransaction = "",
    setTransactionDetails,
    type = "",
    paymentDetails = "",
    requestObject = "",
    quotationDetails = "",
    airtimeDetails = "",
    airtimeProduct = "",
    intFiles = [],
    intComment = "",
    intResend = {},
    intSendType = "",
    intCardPayment,
    authType = "authenticator",
    setAuthType = () => { },
    coords,
}) => {
    const { t } = useTranslation()
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [verified, setVerified] = useState(false);
    const [timer, setTimer] = useState(3);
    const [resendTimer, setResendTimer] = useState(authType !== "authenticator" ? 120 : 0);
    const { authHeader, userDetails, userWallets, verifyToken, setProfileLockTime } = useContext(UserContext)
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [otpError, setOtpError] = useState("")
    const { setIsExtended } = useContext(InactivityContext)
    const [isSaving, setIsSaving] = useState(false)
    const [token, setToken] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        setIsExtended(true)
    }, [])

    useEffect(() => {
        if (verified && timer > 0) {
            const intervalId = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => {
                clearInterval(intervalId);
            };
        } else if (verified && timer === 0) {
            setSubStep(prev => prev + 1)
            setIsExtended(false)
        }
    }, [verified, timer]);
    useEffect(() => {
        verifyToken()
    }, [])

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

    const getExchangeRate = (data) => {
        // console.log(decryptData(data))
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-request-exchange-rate`, {
            data: data
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setIsSaving(false)
                // console.log(decrypted)
                if (decrypted.status) {
                    requestObject.setExchangeRate(decrypted.exchangeRate)
                }
            })
            .catch(err => {
                setIsSaving(false)
                // console.log(decryptData(err.response.data.data))
            })
    }

    const completeTransaction = () => {
        setOtpError("")
        setIsSaving(true)

        // airtime
        if (type === "airtime") {
            const data = {
                token: airtimeDetails?.token,
                otp: otpValues.join(""),
                type: authType
            }
            console.log(data)
            const enc = encryptData(data)

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/${airtimeDetails?.path}`, {
                data: enc
            }, {
                headers: authHeader
            })
                .then((res) => {
                    const dec = decryptData(res.data.data)
                    // console.log(dec)
                    setVerified(true)
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    console.log(decrypted)
                    const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                    if (error) {
                        setOtpError(t(error))
                    } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                        const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                        setProfileLockTime(timeInSec)
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        navigate("/login")
                    } else {
                        setOtpError(decrypted?.message)
                    }
                })
                .finally(() => {
                    setIsSaving(false)
                })
        }

        // crypto
        if (type === "crypto") {
            setVerified(true)
            setIsSaving(false)
        }

        // quote money
        if (type === "quoting" && quotationDetails) {
            const formdata = new FormData()
            Array.from(quotationDetails?.files).forEach((image) => {
                formdata.append("files", image);
            });
            formdata.append("otp", otpValues.join(""))
            formdata.append("token", token || quotationDetails?.token)
            formdata.append("type", authType)
            formdata.forEach(item => {
                // console.log(item)
            })

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/quotation/create-quotation`, formdata, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setIsSaving(false)
                    setTransactionDetails(decrypted?.quotation)
                    // console.log(decrypted?.quotation)
                    setVerified(true)
                })
                .catch(err => {
                    setIsSaving(false)
                    const decrypted = decryptData(err.response.data.data)
                    const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                    console.log(decrypted)
                    if (error) {
                        setOtpError(t(error))
                    } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                        const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                        setProfileLockTime(timeInSec)
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        navigate("/login")
                    } else {
                        setOtpError("You have entered wrong OTP.")
                    }
                })
        }

        // request money
        if (type === "request" && requestObject) {
            requestObject.beneficiary.forEach((ben) => {
                if (requestObject.paymentType.value === "standard") {
                    const data = new FormData()
                    Array.from(requestObject?.files).forEach((image) => {
                        data.append("files", image);
                    });
                    data.append("otp", otpValues.join(""))
                    data.append("token", token || requestObject?.token)
                    data.append("type", authType)
                    data.forEach(item => {
                        // console.log(item)
                    })
                    // console.log(requestObject)
                    // console.log(data)
                    // const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-payment-request-w2w`, data, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            setIsSaving(false)
                            if (decrypted.status) {
                                setVerified(true)
                                requestObject?.setRequestDetails(decrypted.requestDetails)


                                // exchange rate api
                                const data = {
                                    request_id: decrypted?.requestDetails?.reference_id,
                                    currency: decrypted?.requestDetails?.currency?.code
                                }
                                const encrypted = encryptData(data)
                                setTimeout(() => {
                                    getExchangeRate(encrypted)
                                }, 2000)
                            }
                        })
                        .catch(err => {
                            setIsSaving(false)
                            const decrypted = decryptData(err.response.data.data)
                            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                            if (error) {
                                setOtpError(t(error))
                            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                                setProfileLockTime(timeInSec)
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                navigate("/login")
                            } else {
                                setOtpError("You have entered wrong OTP.")
                            }
                        })
                }
                if (requestObject.paymentType.value === "subscription") {
                    const data = new FormData()
                    Array.from(requestObject?.files).forEach((image) => {
                        data.append("files", image);
                    });
                    data.append("otp", otpValues.join(""))
                    data.append("token", token || requestObject?.token)
                    data.append("type", authType)
                    data.forEach(item => {
                        // console.log(item)
                    })
                    // console.log(requestObject)
                    // console.log(data)
                    const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w`, data, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            setIsSaving(false)
                            // console.log(decrypted)
                            if (decrypted.status) {
                                setVerified(true)
                                requestObject?.setRequestDetails(decrypted.subscribtionDetails)


                                // exchange rate api
                                const data = {
                                    request_id: decrypted?.subscribtionDetails?._id,
                                    currency: decrypted?.subscribtionDetails?.request_payment?.currency?.code
                                }
                                const encrypted = encryptData(data)
                                setTimeout(() => {
                                    getExchangeRate(encrypted)
                                }, 2000)
                            }
                        })
                        .catch(err => {
                            setIsSaving(false)
                            const decrypted = decryptData(err.response.data.data)
                            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                            if (error) {
                                setOtpError(t(error))
                            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                                setProfileLockTime(timeInSec)
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                navigate("/login")
                            } else {
                                setOtpError("You have entered wrong OTP.")
                            }
                        })
                }
                if (requestObject.paymentType.value === "schedule") {
                    const data = new FormData()
                    Array.from(requestObject?.files).forEach((image) => {
                        data.append("files", image);
                    });
                    data.append("type", authType)
                    data.append("otp", otpValues.join(""))
                    data.append("token", token || requestObject?.token)
                    data.forEach(item => {
                        // console.log(item)
                    })
                    // console.log(requestObject)
                    // console.log(data)
                    const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/schedule-payment-request-w2w`, data, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            setIsSaving(false)
                            // console.log(decrypted)
                            if (decrypted.status) {
                                setVerified(true)
                                requestObject?.setRequestDetails(decrypted.subscribtionDetails)


                                // exchange rate api
                                const data = {
                                    request_id: decrypted?.subscribtionDetails?._id,
                                    currency: decrypted?.subscribtionDetails?.request_payment?.currency?.code
                                }
                                const encrypted = encryptData(data)
                                setTimeout(() => {
                                    getExchangeRate(encrypted)
                                }, 2000)
                            }
                        })
                        .catch(err => {
                            setIsSaving(false)
                            const decrypted = decryptData(err.response.data.data)
                            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                            if (error) {
                                setOtpError(t(error))
                            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                                setProfileLockTime(timeInSec)
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                navigate("/login")
                            } else {
                                setOtpError("You have entered wrong OTP.")
                            }
                        })
                }
            })
        }

        // international transfer
        if (createdTransaction) {
            if (intSendType === "card") {
                const data = {
                    wallet_id: intCardPayment?.sender_wallet_id,
                    amount: intCardPayment?.amount,
                    payment_type: "card",
                    type: authType,
                    is_card_save: intCardPayment?.saveCard,
                    w2w_data: {
                        type: "international",
                        body: {
                            otp: otpValues.join(""),
                            token: token || createdTransaction?.token
                        }
                    }
                }
                const enc = encryptData(data)

                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/initiat-w2w-transaction`, {
                    data: enc
                }, {
                    headers: authHeader
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        console.log(decrypted)
                        setIsSaving(false)
                        setVerified(true)
                        setTransactionDetails(decrypted.data)
                        setOtpError("")
                    })
                    .catch(err => {
                        setIsSaving(false)
                        const decrypted = decryptData(err.response.data.data)
                        console.log(decrypted)
                        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                        const error2 = apiErrorMessage(decrypted?.message)

                        if (error2) {
                            setOtpError(t(error2))
                        }
                        else if (error) {
                            setOtpError(t(error))
                        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                            setProfileLockTime(timeInSec)
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            navigate("/login")
                        } else {
                            setOtpError("You have entered wrong OTP.")
                        }
                    })
            } else {
                const data = new FormData()
                data.append("token", token || createdTransaction.token)
                data.append("otp", otpValues.join(""))
                Array.from(intFiles).forEach((image) => {
                    data.append("files", image);
                });
                data.append("type", authType)
                data.append("description", intComment)

                // console.log(token, createdTransaction.token, intComment)

                data.forEach(item => "a") // console.log(item))
                axios.post(`${process.env.REACT_APP_THUNES_API}/confirmTransaction`, data, {
                    headers: authHeader
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setTransactionDetails(decrypted)
                        // console.log(decrypted)
                        setSubStep(prev => prev + 1)
                        if (decrypted.TransactionID) {
                            setVerified(true)
                        }
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                        console.log(decrypted)
                        if (error) {
                            setOtpError(t(error))
                        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                            setProfileLockTime(timeInSec)
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            navigate("/login")
                        } else {
                            setOtpError(decrypted.message ?? "You have entered wrong OTP.")
                        }
                    })
                    .finally(() => setIsSaving(false))
            }
        }

        // wallet send
        else if (type === "wallet" && paymentDetails) {
            if (paymentDetails.type === "instant") {
                if (paymentDetails?.sendType === "card") {
                    const data = {
                        wallet_id: paymentDetails?.sender_wallet_id,
                        amount: paymentDetails?.amount,
                        payment_type: "card",
                        type: authType,
                        is_card_save: paymentDetails?.saveCard,
                        w2w_data: {
                            type: paymentDetails?.payment_type,
                            body: {
                                otp: otpValues.join(""),
                                token: token || paymentDetails?.token
                            }
                        }
                    }
                    const enc = encryptData(data)

                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/initiat-w2w-transaction`, {
                        data: enc
                    }, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            console.log(decrypted)
                            setIsSaving(false)
                            setVerified(true)
                            setTransactionDetails(decrypted.data)
                            setOtpError("")
                        })
                        .catch(err => {
                            setIsSaving(false)
                            const decrypted = decryptData(err.response.data.data)
                            console.log(decrypted)
                            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                            const error2 = apiErrorMessage(decrypted?.message)

                            if (error2) {
                                setOtpError(t(error2))
                            }
                            else if (error) {
                                setOtpError(t(error))
                            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                                setProfileLockTime(timeInSec)
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                navigate("/login")
                            } else {
                                setOtpError("You have entered wrong OTP.")
                            }
                        })
                } else {
                    const data = new FormData()
                    Array.from(paymentDetails?.files).forEach((image) => {
                        data.append("files", image);
                    });
                    data.append("type", authType)
                    data.append("otp", otpValues.join(""))
                    data.append("token", token || paymentDetails?.token)
                    // console.log(paymentDetails)
                    data.forEach(item => console.log(item))
                    console.log("headers: ", authHeader)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-wallet-to-wallet`,
                        data,
                        {
                            headers: authHeader
                        }
                    )
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
                            setIsSaving(false)
                            if (decrypted.status === true) {
                                setVerified(true)
                                setTransactionDetails(decrypted.data)
                                setOtpError("")
                            }
                        })
                        .catch(err => {
                            setIsSaving(false)
                            const decrypted = decryptData(err.response.data.data)
                            console.log(decrypted)
                            const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                            if (error) {
                                setOtpError(t(error))
                            } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                                setProfileLockTime(timeInSec)
                                const coun = localStorage.getItem("ip_country")
                                localStorage.clear()
                                localStorage.setItem("ip_country", coun)
                                navigate("/login")
                            } else {
                                setOtpError("You have entered wrong OTP.")
                            }
                        })
                }
            }
            if (paymentDetails.type === "subscription") {
                const data = new FormData()
                Array.from(paymentDetails?.files).forEach((image) => {
                    data.append("files", image);
                });
                data.append("type", authType)
                data.append("otp", otpValues.join(""))
                data.append("token", token || paymentDetails?.token)

                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/subscribe-payment-w2w`,
                    data, {
                    headers: authHeader
                }
                )
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setIsSaving(false)
                        // console.log(decrypted)
                        if (decrypted.status == "true") {
                            setVerified(true)
                            setTransactionDetails(decrypted.subscribtionDetails)
                            setOtpError("")
                        }
                    })
                    .catch(err => {
                        setIsSaving(false)
                        const decrypted = decryptData(err.response.data.data)
                        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                        if (error) {
                            setOtpError(t(error))
                        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                            setProfileLockTime(timeInSec)
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            navigate("/login")
                        } else {
                            setOtpError("You have entered wrong OTP.")
                        }
                    })

            }
            if (paymentDetails.type === "schedule") {
                const data = new FormData()
                Array.from(paymentDetails?.files).forEach((image) => {
                    data.append("files", image);
                });
                data.append("type", authType)
                data.append("otp", otpValues.join(""))
                data.append("token", token || paymentDetails?.token)
                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/schedule-payment-w2w`,
                    data,
                    {
                        headers: authHeader
                    }
                )
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setIsSaving(false)
                        // console.log(decrypted)
                        if (decrypted.status === "true") {
                            setVerified(true)
                            setTransactionDetails(decrypted.subscribtionDetails)
                            setOtpError("")
                        }
                    })
                    .catch(err => {
                        setIsSaving(false)
                        const decrypted = decryptData(err.response.data.data)
                        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                        if (error) {
                            setOtpError(t(error))
                        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                            setProfileLockTime(timeInSec)
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            navigate("/login")
                        } else {
                            setOtpError("You have entered wrong OTP.")
                        }
                    })
            }
        }
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
            setTimeout(() => {
                completeTransaction()
            }, 100)
        }
    };

    const resendOTP = (typeOfAuth) => {
        let data;
        if (type === "airtime") { }
        if (type === "crypto") { }
        if (type === "quoting" && quotationDetails) {
            data = {
                type: typeOfAuth ?? "",
                data: {
                    "account_id": quotationDetails?.account_id,
                    "reciever_id": quotationDetails?.receiver_id,
                    "title": quotationDetails?.title,
                    "desc": quotationDetails?.desc,
                    "amount": quotationDetails?.amount,
                    "bargain": quotationDetails?.bargain,
                    "sender_wallet_id": quotationDetails?.sender_wallet_id,
                }
            }
        }
        if (type === "request" && requestObject) {
            if (requestObject?.paymentType?.value === "standard") {
                data = {
                    type: typeOfAuth ?? "",
                    data: {
                        "amount": + requestObject.amount,
                        "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                        "purpose": requestObject.reason || "FAMILY_SUPPORT",
                        "sender": userDetails?._id,
                        "receiver": requestObject?.beneficiary?.[0]._id,
                        "description": requestObject.comment ?? "FAMILY_SUPPORT",
                        "payment_type": "payment_request",
                        lat: coords?.latitude,
                        long: coords?.longitude
                    }
                }
            }
            if (requestObject?.paymentType?.value === "subscription") {
                const date = new Date(requestObject.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                data = {
                    type: typeOfAuth ?? "",
                    data: {
                        "amount": +requestObject.amount,
                        "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)?.[0]?._id,
                        "purpose": requestObject.reason ?? "family support",
                        "sender": userDetails?._id,
                        "receiver": requestObject?.beneficiary?.[0]._id,
                        "cycles": requestObject.unlimited ? "unlimited" : +requestObject.recCycle,
                        "date": date,
                        "description": requestObject.comment,
                        "payment_type": "payment_request",
                        timezone: requestObject?.timezone,
                        lat: coords?.latitude,
                        long: coords?.longitude
                    }
                }
            }
            if (requestObject?.paymentType?.value === "schedule") {
                const date = new Date(requestObject.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                data = {
                    type: typeOfAuth ?? "",
                    data: {
                        "amount": +requestObject.amount,
                        "wallet_id": userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                        "purpose": requestObject.reason ?? "family support",
                        "sender": userDetails?._id,
                        "receiver": requestObject?.beneficiary?.[0]._id,
                        "time": requestObject.scheduleTime,
                        "date": date,
                        "description": requestObject.comment,
                        "payment_type": "payment_request",
                        timezone: requestObject?.timezone,
                        lat: coords?.latitude,
                        long: coords?.longitude
                    }
                }
            }
        }
        if (createdTransaction) {
            data = intResend?.userWithdrawals ? {
                "additional_information": intResend?.comment,
                "purpose_of_remittance": intResend?.reason,
                "account_id": userDetails?._id,
                "service_id": intResend?.service_id,
                "payer_id": intResend?.payer_id,
                "transaction_type": userDetails?.account_type === "individual" ? "C2C" : "C2B",
                wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === intResend?.currency?.toLowerCase())[0]?._id,
                "token": intResend.token
            } : {
                additional_information: intResend?.comment,
                purpose_of_remittance: intResend?.reason,
                user_id: userDetails?.user?._id,
                beneficiary_id: intResend?.beneficiary?._id,
                service: { id: intResend?.payoutChannel?.id },
                transaction_type: intResend?.beneficiary?.beneficiary_type ? intResend?.beneficiary?.beneficiary_type === "individual" ? "C2C" : "C2B" : intResend?.beneficiary?.account_type === "individual" ? "C2C" : "C2B",
                wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === intResend?.currency?.toLowerCase())[0]?._id,
                token: intResend?.token,
            }
            if (intResend?.userWithdrawals) {
                intResend?.payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = intResend?.userWithdrawals?.bank_details?.[0]?._id : data.mobile_wallet_id = intResend?.userWithdrawals?.mobile_wallet?.[0]?._id
            } else {
                intResend?.payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.bank_id = intResend?.beneficiary?.bank_details?.[0]?._id : data.mobile_wallet_id = intResend?.beneficiary?.mobile_wallet?.[0]?._id
            }
        }
        if (type === "wallet" && paymentDetails) {
            if (paymentDetails?.type === "instant") {
                data = {
                    "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                    "sender_wallet_id": paymentDetails.sender_wallet_id,
                    "purpose": paymentDetails.purpose,
                    "amount": paymentDetails.amount,
                    "type": paymentDetails.type,
                    "payment_type": paymentDetails.payment_type,
                    'description': paymentDetails.comment,
                }
            }
            if (paymentDetails?.type === "subscription") {
                const date = new Date(paymentDetails.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                data = {
                    "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                    "sender_wallet_id": paymentDetails.sender_wallet_id,
                    "purpose": paymentDetails.purpose,
                    "amount": paymentDetails.amount,
                    "cycles": paymentDetails.unlimited ? "unlimited" : +paymentDetails.recCycle,
                    "date": date,
                    'description': paymentDetails.comment,
                    timezone: userDetails?.timezone
                }
            }
            if (paymentDetails?.type === "schedule") {
                const date = new Date(paymentDetails.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                data = {
                    "receiver_wallet_id": paymentDetails.receiver_wallet_id,
                    "sender_wallet_id": paymentDetails.sender_wallet_id,
                    "purpose": paymentDetails.purpose,
                    "amount": paymentDetails.amount,
                    "time": paymentDetails.scheduleTime,
                    "date": date,
                    'description': paymentDetails.comment,
                    timezone: userDetails?.timezone
                }
            }
        }
        console.log(data)
        resendHandler(data, setToken, () => { }, authHeader)
    }

    return (
        <form
            style={{
                height: window.innerWidth < 1000 ? "600px" : '100%',
                marginBottom: 0,
                boxShadow: 'none',
                gap: '1.3rem',
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
            }}
            onSubmit={(e) => {
                e.preventDefault()
                completeTransaction()
            }}

        >
            {
                verified
                    && paymentDetails?.transactionDetails !== null
                    && paymentDetails?.sendType === "card"
                    ?
                    <TrustpaymentPage
                        amount={paymentDetails?.amount}
                        card_cvc={paymentDetails?.cvc}
                        card_expiry={paymentDetails?.expiry}
                        card_number={paymentDetails?.cardNumber}
                        currency={paymentDetails?.currency}
                        transaction={paymentDetails?.transactionDetails}
                        url={`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/w2w-payment-confirmation/${paymentDetails?.transactionDetails?.transaction_id}/${token || paymentDetails?.token}`}
                    />
                    : ""
            }
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
                            src={authType === "sms" ? otp_icon : auth}
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
                                            t("Authenticator Code Verified")
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
                        <p style={{ maxWidth: "212px", fontSize: "14px", fontWeight: 600, margin: "0 auto" }}>
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
                                            ?
                                            t("A one-time verification code has been sent to your email address  and phone number.".replace("phone", userDetails?.phone?.slice(0, 3) === "971" ? "whatsapp" : "phone"))
                                            :
                                            t("Enter a code shown in the app to make sure everything works fine.")
                                    )
                            }
                        </p>
                    </div>
                    {
                        verified
                            ?
                            <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                {t("Moving To Next Step in")} <span style={{ color: "#5926f0", fontWeight: 800 }}>{timer}</span>
                            </span>
                            :
                            <>
                                <div style={{ display: 'flex', gap: '8px', margin: "0.5rem 0" }}>
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
                                    userDetails?.tfa
                                        ?
                                        <span style={{
                                            fontSize: "12px",
                                        }} onClick={() => {
                                            if (authType !== "sms") {
                                                inputRefs?.current?.[0]?.focus()
                                                setOTPValues(Array(numberOfFields).fill(''))
                                                setResendTimer(120)
                                                if (resendTimer == "0") {
                                                    resendOTP("sms")
                                                }
                                            }
                                            setAuthType(authType === "sms" ? "authenticator" : "sms")
                                            // if (authType === "sms") {
                                            //     resendOTP()
                                            //     setAuthType("authenticator")
                                            // } else {
                                            //     setAuthType("sms")
                                            // }
                                        }}>
                                            <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{authType === "sms" ? t("Verify Using Authenticator") : t("Verify Using Sms/Email")}</span>
                                        </span>
                                        :
                                        <span onClick={() => navigate("/settings?tab=tfa")} style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{t("Setup Authenticator")}</span>
                                }
                                {
                                    otpError && <span style={{ fontSize: ".8rem", fontWeight: 700, color: "red" }}>{otpError}</span>
                                }
                                {
                                    authType === "sms"
                                    &&
                                    <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                        {
                                            resendTimer > 0
                                                ?
                                                t("Resend available in ") + resendTimer + " seconds"
                                                :
                                                <>
                                                    {t("Didn't receive the verification code?")}
                                                    <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => {
                                                        setOTPValues(Array(numberOfFields).fill(''))
                                                        resendOTP("sms")
                                                        setResendTimer(120)
                                                    }}>{t("Resend Now")}</span>
                                                </>
                                        }

                                    </span>
                                }
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
                                    opacity: isAnyFieldEmpty || isSaving ? 0.5 : 1,
                                    pointerEvents: isAnyFieldEmpty || isSaving ? 'none' : 'auto',
                                    marginTop: "0.5rem"
                                }}
                                    className="i_t_button"
                                    disabled={isAnyFieldEmpty || isSaving}
                                >
                                    {
                                        isSaving
                                            ?
                                            t("Verifying")
                                            :
                                            <>
                                                {t("Verify")} <ChevronRight size={24} />
                                            </>
                                    }
                                </Button>
                            </>
                    }
                </div>
            </div>
        </form>
    );
};

export default OTPConfirmation;