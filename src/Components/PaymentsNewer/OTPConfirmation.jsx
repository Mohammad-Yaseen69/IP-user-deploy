import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from 'reactstrap';
import { OTP_METHOD_CONFIG, getAvailableOtpMethods } from '../../Common/Component/OtpVerification';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { resendHandler } from '../../Helper/SendOTP';
import { useIdempotency } from '../../hooks/Payments/useIdempotency';
import { InactivityContext } from '../../InactivityWrapper';
import { LimitsErrorMessage } from '../../utils/Functions/paymentLimits';
import TrustpaymentPage from '../AddFunds/WalletFund/CreditTransaction';
import auth from './files/auth.png';
import otp_icon from './files/otp_icon.png';
import modalStyles from './InternationalFlow/styles/otpconfirmation.module.css';

const OTPConfirmation = ({
    setSubStep,
    createdTransaction = "",
    setTransactionDetails,
    paymentDetails = "",
    intFiles = [],
    intComment = "",
    intResend = {},
    authType = "authenticator",
    setAuthType = () => { },
    coords,
    vendor,
    type,
    requestObject,
    quotationDetails,
    externalWithdrawalPayload,
    isExternalWithdrawal,
    onBeforeConfirm,
    methods,
}) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { getKey, reset } = useIdempotency()

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
    const { authHeader, userDetails, userWallets, verifyToken, setProfileLockTime, getUserWallets } = useContext(UserContext)
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [otpError, setOtpError] = useState("")
    const { setIsExtended } = useContext(InactivityContext)
    const [isSaving, setIsSaving] = useState(false)
    const [token, setToken] = useState("")
    const navigate = useNavigate()

    const [otpMethods, setOtpMethods] = useState(methods)
    useEffect(() => {
        if (methods?.available_methods) setOtpMethods(methods)
    }, [methods])
    const hasApiMethods = !!otpMethods?.available_methods
    const { available: availableMethods } = getAvailableOtpMethods(userDetails, hasApiMethods ? otpMethods : undefined)
    const hasAuthenticator = availableMethods.includes('authenticator')
    const isCodeMethod = hasApiMethods ? authType !== "authenticator" : authType === "sms"
    const getResendSeconds = (method) => hasApiMethods ? (method === "email" ? 300 : 90) : 120

    useEffect(() => {
        if (hasApiMethods) {
            setResendTimer(authType === "authenticator" ? 0 : getResendSeconds(authType))
        }
    }, [authType, hasApiMethods])

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
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-request-exchange-rate`, {
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

    const completeTransaction = (otp) => {
        setOtpError("")
        setIsSaving(true)

        if (onBeforeConfirm && !onBeforeConfirm()) {
            setIsSaving(false)
            return
        }

        console.log(type, requestObject)
        if (type === "request" && requestObject) {
            if (requestObject.paymentType.value === "standard") {
                const data = new FormData()
                Array.from(requestObject?.files).forEach((image) => {
                    data.append("files", image);
                });
                data.append("otp", otp ? otp.join("") : otpValues.join(""))
                data.append("token", token || requestObject?.token)
                data.append("type", authType)
                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/insta-payment-request-w2w`, data, { headers: { ...authHeader, "idempotency-key": getKey() } })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setIsSaving(false)
                        if (decrypted.status) {
                            setVerified(true)
                            requestObject?.setRequestDetails(decrypted.requestDetails)


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
                        console.log(decrypted, "decrypted")
                        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                        if (error) {
                            setOtpError(error)
                        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                            setProfileLockTime(timeInSec)
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            navigate("/login")
                        } else {
                            setOtpError(decrypted?.message ?? "You have entered the wrong OTP.")
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
                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w`, data, {
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
                            setOtpError(error)
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
                axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/schedule-payment-request-w2w`, data, {
                    headers: authHeader
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setIsSaving(false)
                        // console.log(decrypted)
                        if (decrypted.status) {
                            setVerified(true)
                            requestObject?.setRequestDetails(decrypted.subscribtionDetails)


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
                            setOtpError(error)
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
        if (type === "quoting" && quotationDetails) {
            const formdata = new FormData()
            Array.from(quotationDetails?.files).forEach((image) => {
                formdata.append("files", image);
            });
            formdata.append("otp", otp ? otp.join("") : otpValues.join(""))
            formdata.append("token", token || quotationDetails?.token)
            formdata.append("type", authType)
            formdata.forEach(item => {
                // console.log(item)
            })

            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/quotation/create-quotation`, formdata, { headers: { ...authHeader, "idempotency-key": getKey() } })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setIsSaving(false)
                    setTransactionDetails(decrypted?.quotation)
                    setVerified(true)
                    queryClient.invalidateQueries({ queryKey: ['sentQuotations', userDetails?._id] })
                })
                .catch(err => {
                    setIsSaving(false)
                    const decrypted = decryptData(err.response.data.data)
                    const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message)
                    console.log(decrypted)
                    if (error) {
                        setOtpError(error)
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

        if (createdTransaction) {
            const data = new FormData()
            data.append("token", token || createdTransaction.token)
            data.append("otp", otp ? otp.join("") : otpValues.join(""))
            Array.from(intFiles).forEach((image) => {
                data.append("files", image);
            });
            data.append("type", authType)
            data.append("description", intComment)

            // console.log(token, createdTransaction.token, intComment)

            data.forEach(item => "a")

            const url = isExternalWithdrawal ? `${import.meta.env.VITE_IP_DEV_API}/api/external-withdrawal/create-request` : vendor === "neema" ? `${import.meta.env.VITE_IP_DEV_API}/api/payment/confirm-withdrawal-transaction` : `${import.meta.env.VITE_THUNES_API}/confirmTransaction`
            const neemaData = {
                token: token || createdTransaction.token,
                otp: otp ? otp.join("") : otpValues.join(""),
                type: authType,
            }

            const enc = encryptData(neemaData)
            const body = { data: enc }
            const vendorSpecificBody = vendor === "neema" || isExternalWithdrawal ? body : data
            axios.post(url, vendorSpecificBody, {
                headers: {
                    ...authHeader,
                    "Idempotency-Key": getKey()
                }
            })
                .then(async res => {
                    const decrypted = decryptData(res.data.data)
                    await getUserWallets()
                    setTransactionDetails(decrypted)
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
                completeTransaction(newOTPValues)
            }, 100)
        }
    };



    const resendOTP = (typeOfAuth) => {
        let data;
        reset()
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

        if (externalWithdrawalPayload && isExternalWithdrawal) {
            data = {
                type: typeOfAuth ?? "",
                data: externalWithdrawalPayload
            }
        } else if (createdTransaction) {
            let withdrawalVendorSpecificData = {}

            if (vendor === "thunes") {
                withdrawalVendorSpecificData = {
                    data: {
                        token: createdTransaction?.token
                    },
                    type: typeOfAuth ?? ""
                }
            } else {
                withdrawalVendorSpecificData = {
                    data: {
                        "additional_information": intResend?.comment,
                        "purpose_of_remittance": intResend?.reason,
                        "account_id": userDetails?._id,
                        "service_id": intResend?.service_id,
                        "payer_id": intResend?.payer_id,
                        "transaction_type": userDetails?.account_type === "individual" ? "C2C" : "C2B",
                        wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === intResend?.currency?.toLowerCase())[0]?._id,
                        "token": intResend.token,
                        type: typeOfAuth ?? "",
                        user_id: userDetails?.user?._id,
                        vendor: vendor ?? "",
                        withdrawal_id: intResend.withdrawal_id
                    },
                    type: typeOfAuth ?? ""
                }
            }

            data = intResend?.userWithdrawals ? withdrawalVendorSpecificData : {
                data: {
                    additional_information: intResend?.comment,
                    purpose_of_remittance: intResend?.reason,
                    user_id: userDetails?.user?._id,
                    beneficiary_id: intResend?.beneficiary?._id,
                    service: { id: intResend?.payoutChannel?.id },
                    transaction_type: intResend?.beneficiary?.beneficiary_type ? intResend?.beneficiary?.beneficiary_type === "individual" ? "C2C" : "C2B" : intResend?.beneficiary?.account_type === "individual" ? "C2C" : "C2B",
                    wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === intResend?.currency?.toLowerCase())[0]?._id,
                    token: intResend?.token,
                },
                type: typeOfAuth ?? ""
            }
            if (intResend?.userWithdrawals) {
                intResend?.payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.data.bank_id = intResend?.userWithdrawals?.bank_details?.[0]?._id : data.data.mobile_wallet_id = intResend?.userWithdrawals?.mobile_wallet?.[0]?._id
            } else {
                intResend?.payoutChannel?.value?.toLowerCase()?.includes("bank") ? data.data.bank_id = intResend?.beneficiary?.bank_details?.[0]?._id : data.data.mobile_wallet_id = intResend?.beneficiary?.mobile_wallet?.[0]?._id
            }
        }
        resendHandler(data, setToken, () => { }, authHeader, vendor === "thunes" ? true : false, (dec) => {
            if (dec?.available_methods) setOtpMethods(dec)
        })
    }


    useEffect(() => {
        if (type === "request") {
            resendOTP(authType)
        }
    }, [type])
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
                if (isSaving) return;
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
                        url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/w2w-payment-confirmation/${paymentDetails?.transactionDetails?.transaction_id}/${token || paymentDetails?.token}`}
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
                            src={isCodeMethod ? otp_icon : auth}
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
                                        isCodeMethod
                                            ?
                                            t("Verification Code Verified")
                                            :
                                            t("Authenticator Code Verified")
                                    )
                                    :
                                    (
                                        isCodeMethod
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
                                        isCodeMethod
                                            ?
                                            t("Verification code has been verified, You'll be redirected to the next step.")
                                            :
                                            t("The code was verified and you’re good to go!")
                                    )
                                    :
                                    (
                                        isCodeMethod
                                            ?
                                            (
                                                hasApiMethods
                                                    ?
                                                    `${t('A one-time verification code has been sent to your')} ${authType === 'email' ? t('email address') : authType === 'whatsapp' ? t('whatsapp number.') : t('phone number.')}`
                                                    :
                                                    t("A one-time verification code has been sent to your email address and phone number.").replace("phone", userDetails?.phone?.slice(0, 3) === "971" ? "whatsapp" : "phone")
                                            )
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
                                    hasApiMethods
                                        ?
                                        (
                                            !hasAuthenticator && !userDetails?.tfa
                                            &&
                                            <span onClick={() => navigate("/settings?tab=tfa")} style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{t("Setup Authenticator")}</span>
                                        )
                                        :
                                    userDetails?.tfa
                                        ?
                                        <span style={{
                                            fontSize: "12px",
                                        }} onClick={() => {
                                            reset()
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
                                    isCodeMethod
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
                                                        setIsAnyFieldEmpty(true)
                                                        resendOTP(hasApiMethods ? authType : "sms")
                                                        setResendTimer(getResendSeconds(authType))
                                                    }}>{t("Resend Now")}</span>
                                                </>
                                        }

                                    </span>
                                }
                                {
                                    hasApiMethods && availableMethods.length > 1
                                    &&
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem', width: '100%', marginTop: '.25rem' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#aeaeae', textAlign: 'center' }}>
                                            {t('Choose your preferred method to receive your verification code:')}
                                        </div>
                                        <div className={modalStyles.otpMethods} style={{ justifyContent: 'center' }}>
                                            {availableMethods.filter((methodId) => methodId !== authType).map((methodId) => {
                                                const { label, Icon } = OTP_METHOD_CONFIG[methodId]

                                                return (
                                                    <button
                                                        type="button"
                                                        key={methodId}
                                                        className={modalStyles.otpMethod}
                                                        disabled={methodId !== 'authenticator' && resendTimer > 0}
                                                        onClick={() => {
                                                            inputRefs?.current?.[0]?.focus()
                                                            setOTPValues(Array(numberOfFields).fill(''))
                                                            setIsAnyFieldEmpty(true)
                                                            setOtpError('')
                                                            reset()

                                                            if (methodId === 'authenticator') {
                                                                setAuthType('authenticator')
                                                                return
                                                            }

                                                            setAuthType(methodId)

                                                            if (resendTimer === 0) {
                                                                resendOTP(methodId)
                                                                setResendTimer(getResendSeconds(methodId))
                                                            }
                                                        }}
                                                    >
                                                        <Icon size={14} />
                                                        <span>{t(label)}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                }
                                <Button type="submit" size="lg" style={{
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