import React, { useState, useRef, useEffect, useContext } from 'react';
import otp_icon from '../../PaymentsNewer/files/otp_icon.png';
import { Button } from 'reactstrap';
import { ChevronRight } from 'react-feather';
import axios from 'axios';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { UserContext } from '../../../Context/UserContext';
import { useTranslation } from 'react-i18next';
import { InactivityContext } from '../../../InactivityWrapper';

const OTPConfirmation = ({ setStep, createdTransaction = "", setTransactionDetails, type = "", paymentDetails = "", requestObject = "" }) => {
    const { t } = useTranslation()
    const numberOfFields = 4;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    useEffect(() => {
        if (inputRefs?.current?.[0]) {
            inputRefs?.current?.[0]?.focus()
        }
    }, [])
    const [verified, setVerified] = useState(false);
    const [timer, setTimer] = useState(3);
    const [resendTimer, setResendTimer] = useState(90);
    const { authHeader, userDetails, userWallets } = useContext(UserContext)
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
    const [otpError, setOtpError] = useState("")
    const { setIsExtended } = useContext(InactivityContext)

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
            setStep(4)
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
                // console.log(decrypted)
                if (decrypted.status) {
                    requestObject.setExchangeRate(decrypted.exchangeRate)
                }
            })
            .catch(err => {
                // console.log(decryptData(err.response.data.data))
            })
    }

    const completeTransaction = () => {
        setOtpError("")

        // request money
        if (type === "request" && requestObject) {
            requestObject.beneficiary.forEach((ben) => {
                if (requestObject.paymentType.value === "standard") {
                    const data = {
                        amount: +requestObject.amount,
                        wallet_id: userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                        purpose: requestObject.reason,
                        sender: userDetails?._id,
                        receiver: ben._id,
                    }
                    // console.log(data)
                    const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-payment-request-w2w`, {
                        data: encrypted
                    }, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
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
                            // console.log(decryptData(err.response.data.data))
                            setOtpError("Something went wrong!")
                        })
                }
                if (requestObject.paymentType.value === "subscription") {
                    const date = new Date(requestObject.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    const data = {
                        amount: +requestObject.amount,
                        wallet_id: userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                        purpose: requestObject.reason ?? "family support",
                        sender: userDetails?._id,
                        receiver: ben._id,
                        cycles: requestObject.unlimited ? "unlimited" : +requestObject.recCycle,
                        date
                    }
                    // console.log(data)
                    const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/subcribe-payment-request-w2w`, {
                        data: encrypted
                    }, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
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
                            // console.log(decryptData(err.response.data.data))
                            setOtpError("Something went wrong!")
                        })
                }
                if (requestObject.paymentType.value === "schedule") {
                    const date = new Date(requestObject.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                    const data = {
                        amount: +requestObject.amount,
                        wallet_id: userWallets.filter(item => item.currency.code === requestObject.currency)[0]?._id,
                        purpose: requestObject.reason ?? "family support",
                        sender: userDetails?._id,
                        receiver: ben._id,
                        time: requestObject.scheduleTime,
                        date
                    }
                    // console.log(data)
                    const encrypted = encryptData(data)
                    axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/schedule-payment-request-w2w`, {
                        data: encrypted
                    }, {
                        headers: authHeader
                    })
                        .then(res => {
                            const decrypted = decryptData(res.data.data)
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
                            // console.log(decryptData(err.response.data.data))
                            setOtpError("Something went wrong!")
                        })
                }
            })
        }

        // international transfer
        if (createdTransaction) {
            const data = { token: createdTransaction.token }
            const encrypted = encryptData(data)
            axios.post(`${process.env.REACT_APP_THUNES_API}/confirmTransaction`, {
                data: encrypted
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setTransactionDetails(decrypted)
                    // console.log(decrypted)
                    if (decrypted.TransactionID) {
                        setVerified(true)
                    }
                })
                .catch(err => "a") // console.log(decryptData(err.response.data.data)))
        }

        // wallet send
        else if (type === "wallet" && paymentDetails) {
            if (paymentDetails.type === "instant") {
                const data = {
                    receiver_wallet_id: paymentDetails.receiver_wallet_id,
                    sender_wallet_id: paymentDetails.sender_wallet_id,
                    purpose: paymentDetails.purpose,
                    amount: paymentDetails.amount,
                    type: paymentDetails.type
                }
                // console.log(data)

                const encrypted = encryptData(data)

                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-wallet-to-wallet`,
                    {
                        data: encrypted
                    }, {
                    headers: authHeader
                }
                )
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        if (decrypted.status === true) {
                            setVerified(true)
                            setTransactionDetails(decrypted.data)
                            setOtpError("")
                        }
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        setOtpError("Something Went Wrong!")
                        // console.log(decrypted)
                    })
            }
            if (paymentDetails.type === "subscription") {
                const date = new Date(paymentDetails.recStartDate).toISOString().split("T")[0].split("-").reverse().join("-")
                const data = {
                    receiver_wallet_id: paymentDetails.receiver_wallet_id,
                    sender_wallet_id: paymentDetails.sender_wallet_id,
                    purpose: paymentDetails.purpose,
                    amount: paymentDetails.amount,
                    cycles: paymentDetails.unlimited ? "unlimited" : +paymentDetails.recCycle,
                    date
                }


                const encrypted = encryptData(data)

                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/subscribe-payment-w2w`,
                    {
                        data: encrypted
                    }, {
                    headers: authHeader
                }
                )
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        // console.log(decrypted)
                        if (decrypted.status == "true") {
                            setVerified(true)
                            setTransactionDetails(decrypted.subscribtionDetails)
                            setOtpError("")
                        }
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        setOtpError("Something Went Wrong!")
                        // console.log(decrypted)
                    })

            }
            if (paymentDetails.type === "schedule") {
                const date = new Date(paymentDetails.scheduleDate).toISOString().split("T")[0].split("-").reverse().join("-")
                const data = {
                    receiver_wallet_id: paymentDetails.receiver_wallet_id,
                    sender_wallet_id: paymentDetails.sender_wallet_id,
                    purpose: paymentDetails.purpose,
                    amount: paymentDetails.amount,
                    time: paymentDetails.scheduleTime,
                    date
                }
                // console.log(data)

                const encrypted = encryptData(data)

                axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/schedule-payment-w2w`,
                    {
                        data: encrypted
                    }, {
                    headers: authHeader
                }
                )
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        // console.log(decrypted)
                        if (decrypted.status == "true") {
                            setVerified(true)
                            setTransactionDetails(decrypted.subscribtionDetails)
                            setOtpError("")
                        }
                    })
                    .catch(err => {
                        const decrypted = decryptData(err.response.data.data)
                        setOtpError("Something Went Wrong!")
                        // console.log(decrypted)
                    })
            }
        }
    }

    return (
        <div
            style={{
                height: '100%',
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
                    height: "100%",
                    minHeight: "440px"
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
                            src={otp_icon}
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
                                    t("Verification Code Verified")
                                    :
                                    t("Enter Code")
                            }
                        </h4>
                        <p style={{ maxWidth: "212px", fontSize: "14px", fontWeight: 600 }}>
                            {
                                verified
                                    ?
                                    t("Verification code has been verified, You'll be redirected to the next step.")
                                    :
                                    t("A Verification code has been sent to your email and number.")
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {otpValues.map((value, index) => (
                                        <input
                                            key={index}
                                            type="number"
                                            maxLength={1}
                                            value={value}
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
                                    otpError && <span style={{ fontSize: ".8rem", fontWeight: 700, color: "red" }}>{otpError}</span>
                                }
                                <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                    {
                                        resendTimer > 0
                                            ?
                                            t("Resend available in ") + resendTimer + " seconds"
                                            :
                                            <>
                                                {t("Didn't receive OTP?") + " "}
                                                <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => setResendTimer(90)}>{t("Resend Now")}</span>
                                            </>
                                    }

                                </span>
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
                                    opacity: isAnyFieldEmpty ? 0.5 : 1,
                                    pointerEvents: isAnyFieldEmpty ? 'none' : 'auto'
                                }}
                                    className="i_t_button"
                                    onClick={() => completeTransaction()}
                                    disabled={isAnyFieldEmpty}
                                >
                                    {t("Verify")} <ChevronRight size={24} />
                                </Button>
                            </>
                    }
                </div>
            </div>
        </div>
    );
};

export default OTPConfirmation;