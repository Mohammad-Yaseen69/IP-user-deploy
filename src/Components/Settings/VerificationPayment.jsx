import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Card, CardBody, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import pc from "../PaymentsNewer/files/pc.png"
import i from "../PaymentsNewer/files/i.svg"
import bd from "../../assets/images/logo/logo_white.png"
import { Check, CheckCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import OTPConfirmation from '../../Common/Component/OtpVerification'
import SuccessModal from '../AddBeneficiary/SuccessModal'
import { toast } from 'react-toastify'
import CardDetails from '../AddFunds/WalletFund/CardDetails'
import ConfirmWalletFund from '../AddFunds/ConfirmWalletFund'
import { useNavigate } from 'react-router'
import useAvailableMethods from '../../hooks/Payments/useAvailableMethods'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import MobileWalletStatus from '../PaymentAddressPublic/PayAsGuest/MobileWalletStatus'
import PlaidBankTransfer from '../AddFunds/WalletFundsFlow/PlaidBankTransfer'
import ErrorModal from '../PaymentsNewer/InternationalFlow/ErrorModal'
import { useIdempotency } from '../../hooks/Payments/useIdempotency'

const paymentChannels = [
    {
        name: "Instapay Wallet",
        icon: bd,
        value: "wallet"
    },
    {
        name: "Payment Card",
        icon: pc,
        value: "card"
    },
    {
        name: "PayPal",
        icon: pc,
        value: "paypal"
    },
    {
        name: "Mobile Wallet",
        icon: pc,
        value: "mobile_wallet"
    },
    {
        name: "Bank Transfer",
        icon: pc,
        value: "bank"
    }
]


const VerificationPayment = ({ isOpen, toggle, verify, desc, occupation, loading, source_of_funds, isKYB, amount, getFeeDetails, partnerId, isGettingFee }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [payoutChannel, setPayoutChannel] = useState({})
    const [wallet, setWallet] = useState(null)
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        cardExpiry: "",
        CardCVC: ""
    })
    const { reset } = useIdempotency()

    const [isValid, setIsValid] = useState(false)
    const { userDetails, userWallets, authHeader, setProfileLockTime, verifyToken, checkAuth } = useContext(UserContext)
    const [saving, setSaving] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [token, setToken] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [saveCard, setSaveCard] = useState(false)
    const [currentCard, setCurrentCard] = useState(null)
    const [cardError, setCardError] = useState('');
    const [codeType, setCodeType] = useState("sms")
    const [otpMethods, setOtpMethods] = useState(null)
    const [feeDetails, setFeeDetails] = useState({})
    const { isLoading, methods } = useAvailableMethods()
    const [createdTransactionId, setCreatedTransactionId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : userDetails?.email_verification ? "email" : userDetails?.whatsapp_verification ? "whatsapp" : "sms")
    }, [userDetails])

    useEffect(() => {
        const isValidCardNumber = cardDetails.cardNumber.split(" ").join("").length >= 16;
        const [contentMonth, contentYear] = expiry.split("/").map(Number);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear() % 100;

        const isValidExpiry = contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
        const isValidCVC = cardDetails.CardCVC.length >= 3;

        setIsValid(isValidCardNumber && isValidExpiry && isValidCVC);

    }, [cardDetails])

    const [filteredWallets, setFilteredWallets] = useState([]);

    useEffect(() => {
        const filterWallets = async () => {
            let activeWallets = userWallets.filter(item =>
                item?.wallet_type === "insta" &&
                !item?.blocked &&
                !item?.admin_blocked &&
                item?.status === "active"
            );

            const walletPromises = activeWallets.map(async (item) => {
                if (item?.currency?.code === "USD") return item?.balance?.available >= (amount || userDetails?.country?.kyc_fee) ? item : null;
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=USD&to=${item?.currency?.code}&amount=${amount || userDetails?.country?.kyc_fee}`, {
                        headers: authHeader
                    });
                    const dec = decryptData(res?.data?.data);
                    const requiredAmountInTarget = Number(dec?.exchangeRate?.exchanged_amount ?? dec?.exchangeRate?.result ?? 0);
                    return item?.balance?.available >= requiredAmountInTarget ? item : null;
                } catch (error) {
                    return null;
                }
            });

            const resolvedWallets = await Promise.all(walletPromises);
            setFilteredWallets(resolvedWallets.filter(wallet => wallet !== null));
        };

        filterWallets();
    }, [userWallets, amount]);

    const wallets = useMemo(() => filteredWallets, [filteredWallets]);

    const sendOtp = async (method) => {
        setSaving(true)
        try {
            const data = {
                data: {
                    wallet_id: wallet?._id,
                    desc,
                    occupation,
                    source_of_funds
                },
                type: method || codeType
            }
            // console.log(data)

            if (!isKYB) {
                data.data.account_id = userDetails?._id
            }

            if (partnerId) {
                data.data.partner_id = partnerId
            }

            const encrypted = encryptData(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setToken(dec?.token)
            setOtpMethods(dec)
            if (!showOtp) setCodeType(dec?.otp_sent_on || "sms")
            setShowOtp(true)
            if (!isKYB) {
                toggle()
            }
        } catch (error) {
            toast.error(
                t("Something went wrong while confirming the transaction!")
            );            // console.log(decryptData(error?.response?.data?.data))
        }
        finally {
            setSaving(false)
        }
    }

    const chargeKYC = async (setter, type, otp, setOtpError) => {
        setSaving(true)
        try {
            const data = {
                token,
                otp,
                type: codeType
            }

            const endpoint = `/api/${payoutChannel?.value === "mobile_wallet" ? "collection" : isKYB ? "company" : "user"}/${payoutChannel?.value === "mobile_wallet" ? "" : 'charge-'}${partnerId ? "partner-kyc" : isKYB ? "kyb" : "kyc"}`

            console.log(endpoint)

            const res = await apiWrapper({
                method: "POST",
                payload: data,
                isEncrypted: true,
                endpoint
            })
            console.log(res)
            setCreatedTransactionId(res?.data?.transactionId || res?.data?.transaction_id)
            setter(true)
        } catch (err) {
            // console.log(decryptData(error?.response?.data?.data))
            const decrypted = decryptData(err.response.data.data);
            if (decrypted?.message?.toLowerCase()?.includes("kyc already paid")) {
                setOtpError('You have already paid for the KYC please refresh the page to continue the verification process.')
            } else {
                setOtpError(decrypted?.message ?? "Something went wrong while verifying the code.")
            }
            if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                setProfileLockTime(timeInSec)
                const coun = localStorage.getItem("ip_country")
                localStorage.clear()
                localStorage.setItem("ip_country", coun)
                navigate("/login")
            }
        } finally {
            setSaving(false)
        }
    }

    const initiatePaypal = async () => {
        setSaving(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-kyc-payment`, { data: encryptData({}) }, { headers: authHeader })
            const dec = decryptData(res.data.data)
            window.location.href = dec?.url
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            toast.error(decrypted?.message)
        } finally {
            setSaving(false)
        }
    }

    const handleClick = async () => {
        if (step === 1) {
            const skipStepMethods = ["paypal", "mobile_wallet"]
            if (skipStepMethods?.includes(payoutChannel?.value)) {
                if (payoutChannel?.value === "paypal") {
                    initiatePaypal()
                }
                else if (payoutChannel?.value === "mobile_wallet") {
                    sendOtp()
                }
            } else {
                setStep(2)
            }
        }

        if (step === 2) {
            if (payoutChannel?.value === "wallet" && wallet) {
                if (!isKYB) {
                    sendOtp()
                } else {
                    if (!partnerId) {
                        const feeDets = await getFeeDetails({
                            payment_type: "wallet",
                            wallet_id: wallet?._id
                        })
                        setFeeDetails(feeDets)
                    }
                    setStep(prev => prev + 1)
                }
            }
            if (payoutChannel?.value === "card" && (currentCard?._id ?? isValid)) {
                if (isKYB && !partnerId) {
                    const feeDets = await getFeeDetails({
                        payment_type: "card",
                    })
                    setFeeDetails(feeDets)
                }
                setStep(prev => prev + 1)
            }
        }
    }


    return (
        <>
            {
                isOpen
                &&
                <Modal isOpen={isOpen}>
                    <ModalHeader toggle={toggle}>
                        {t("Payment For {{type}} Verification", { type: isKYB ? "KYB" : "KYC" })}
                    </ModalHeader>
                    <ModalBody>
                        {
                            step === 1
                            &&
                            <>
                                <h5>{t("Select Payment Method")}</h5>
                                <div style={{ margin: "1rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {
                                        paymentChannels
                                            .filter(item => item?.value === "wallet" ? wallets.length > 0 : methods?.includes(item?.value))
                                            .map(item => {
                                                const isPaypalDisabled = isKYB && item?.value === "paypal" || item.value === "card";
                                                return (
                                                    <Card
                                                        key={item.name}
                                                        style={{ marginBottom: 0, borderRadius: "12px" }}
                                                        onClick={() => {
                                                            if (isPaypalDisabled) return;
                                                            setPayoutChannel(item)
                                                        }}
                                                    >
                                                        <CardBody style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: ".5rem",
                                                            padding: "15px",
                                                            justifyContent: "space-between",
                                                            cursor: isPaypalDisabled ? "not-allowed" : "pointer",
                                                            position: "relative",
                                                            pointerEvents: isPaypalDisabled ? "none" : "auto",
                                                            opacity: isPaypalDisabled ? .7 : 1,
                                                        }}>
                                                            <div style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "20px"
                                                            }}>
                                                                <div style={{
                                                                    height: "35px",
                                                                    width: "35px",
                                                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    borderRadius: "12px",
                                                                    boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                                                                }}>
                                                                    <img src={item.icon} draggable="false" alt={item.name[0]} style={{
                                                                        width: "19px",
                                                                        height: "19px",
                                                                        objectFit: "contain",
                                                                        aspectRatio: 1
                                                                    }} />
                                                                </div>
                                                                <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{t(item.name)}</h5>
                                                            </div>
                                                            {
                                                                isPaypalDisabled
                                                                    ? <span style={{ fontWeight: 600 }}>{t("Coming Soon")}</span>
                                                                    : (
                                                                        payoutChannel?.name === item.name
                                                                            ? <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
                                                                            : <img src={i} alt="i" style={{ objectFit: "cover", position: "absolute", right: "14px", top: "19px" }} />
                                                                    )
                                                            }
                                                        </CardBody>
                                                    </Card>
                                                )
                                            })
                                    }
                                </div>
                            </>
                        }
                        {
                            (step === 2 && payoutChannel?.value === "wallet")
                            &&
                            <>
                                <h5>{t("Select Your Wallet")}</h5>
                                <div style={{ margin: "1rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {
                                        wallets?.map((item, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setWallet(item)}
                                                style={{
                                                    display: "flex",
                                                    background: "white",
                                                    boxShadow: wallet?._id !== item?._id ? "0 0 4px #1111113e" : "0 0 4px green",
                                                    padding: "1rem",
                                                    borderRadius: "16px",
                                                    cursor: "pointer",
                                                    position: "relative"
                                                }}
                                            >
                                                <div style={{
                                                    height: "35px",
                                                    width: "35px",
                                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "12px",
                                                    boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                                                    fontSize: "1rem",
                                                    fontWeight: 900,
                                                    color: "white",
                                                    marginRight: ".75rem"
                                                }}>
                                                    <span>{item?.currency?.code} </span>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                    <h5 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0" }}>{item?.wallet_id}</h5>
                                                    <span style={{ color: "#a8a8a8", fontSize: ".6rem", fontWeight: 500 }}>{item?.currency?.code} </span>
                                                </div>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1rem"
                                                }}>
                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "2px",
                                                        position: "absolute",
                                                        top: "50%",
                                                        right: "1rem",
                                                        transform: "translateY(-50%)",
                                                        textAlign: "right",
                                                        alignItems: "flex-end"
                                                    }}>
                                                        <span style={{ color: "#a8a8a8", fontSize: ".6rem", fontWeight: 500 }}>{t("Balance")}: </span>
                                                        <h5 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0" }}>{item?.currency?.code} {Number(item?.balance?.available)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                                                    </div>
                                                    {/* {
                                                    wallet?._id === item?._id
                                                    &&
                                                    <Check
                                                        color='green'
                                                        style={{
                                                            position: "absolute",
                                                            top: "50%",
                                                            right: "1rem",
                                                            transform: "translateY(-50%)"
                                                        }}
                                                    />
                                                } */}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </>
                        }
                        {
                            (step === 2 && payoutChannel?.value === "card")
                            &&
                            <CardDetails
                                setSubStep={setStep}
                                cardNumber={cardNumber}
                                expiry={expiry}
                                cvc={cvc}
                                cardHolderName={cardHolderName}
                                setCardNumber={setCardNumber}
                                setExpiry={setExpiry}
                                setCVC={setCVC}
                                setCardHolderName={setCardHolderName}
                                saveCard={saveCard}
                                setSaveCard={setSaveCard}
                                showButton={false}
                                isValid={isValid}
                                setIsValid={setIsValid}
                                cardError={cardError}
                                currentCard={currentCard}
                                setCardError={setCardError}
                                setCurrentCard={setCurrentCard}
                            />
                        }
                        {
                            step === 3
                            &&
                            <ConfirmWalletFund
                                setSubStep={setStep}
                                payoutChannel={payoutChannel}
                                amount={feeDetails?.base_fee_breakdown?.base_fee_usd || userDetails?.country?.kyc_fee}
                                card_cvc={cvc}
                                card_expiry={expiry}
                                card_number={cardNumber}
                                saveCard={saveCard}
                                type={isKYB ? "kyb" : 'kyc_fee'}
                                reEnterCallback={() => {
                                    setStep(2)
                                }}
                                paymentWithSavedCard={currentCard?._id ? true : false}
                                currentCard={currentCard}
                                sendKybWalletOTP={sendOtp}
                                kybFeeDets={feeDetails}
                                partnerId={partnerId}
                            // wallet={userWallets?.find(item => item?.currency?.code === "USD")}
                            />
                        }
                        {(step === 2 && payoutChannel?.value === "bank") &&
                            <PlaidBankTransfer
                                closeBtnText={t("Close Modal")}
                                type='verification_payment'
                                initiatePayload={() => ({})}
                                endpoint='/api/plaid/kyc'
                                dataHandler={(type, data) => {
                                    if (type === "error") {
                                        setError(data)
                                    }
                                }}
                                data={{}}
                                handleBackClick={() => {
                                    setStep(1)
                                }}
                                successMessage={'Your payment has been successful, please close this modal or refresh the page and start your verification.'}
                            />
                        }
                        {
                            (payoutChannel?.value === "bank" ? step === 1 : step < 3 && !isKYB)
                            &&
                            <h5 style={{ marginTop: "1rem" }}>{t("A fee of {{amount}} will be charged for the verification process.", { amount: `$${userDetails?.country?.kyc_fee}` })}</h5>
                        }

                        <ErrorModal
                            isOpen={error}
                            toggle={() => setError(null)}
                            message={error}
                            heading='Transaction Error'
                        />
                    </ModalBody>
                    {
                        (payoutChannel?.value === "bank" ? step === 1 : step < 3)
                        &&
                        <ModalFooter style={{ justifyContent: step > 1 ? "space-between" : "flex-end", transition: "250ms" }}>
                            {
                                step > 1
                                &&
                                <Button
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                        backgroundBlendMode: "overlay, normal",
                                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                    onClick={() => {
                                        reset();
                                        setStep(prev => prev - 1);
                                    }}
                                >{t("Back")}</Button>
                            }
                            <Button
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                    backgroundBlendMode: "overlay, normal",
                                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                                disabled={
                                    (() => {
                                        if (step === 1) return !payoutChannel?.value;
                                        if (step === 2) {
                                            if (payoutChannel?.value === "wallet") return !wallet;
                                            if (payoutChannel?.value === "card") {
                                                if (currentCard?._id) return false;
                                                return !isValid || !cardHolderName || !!cardError;
                                            }
                                        }
                                        return false;
                                    })()
                                    || saving
                                    || isGettingFee
                                }
                                onClick={handleClick}
                            >{t("Next")}</Button>
                        </ModalFooter>
                    }
                </Modal >
            }
            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        variant="card"
                        callback={chargeKYC}
                        setter={setShowSuccess}
                        setterValue={true}
                        hideOtp={() => setShowOtp(false)}
                        processing={saving}
                        resendHandler={sendOtp}
                        authType={codeType}
                        setAuthType={setCodeType}
                        methods={otpMethods}
                    />
                </ModalBody>
            </Modal>
            <Modal isOpen={showSuccess} toggle={() => {
                verifyToken(true)
                setShowSuccess(false)
            }}>
                <ModalHeader toggle={() => {
                    verifyToken(true)
                    setShowSuccess(false)
                }}
                >
                    {t("{{type}} Fee Payment", { type: isKYB ? "KYB" : "KYC" })}
                </ModalHeader>
                <ModalBody>


                    {payoutChannel?.value === "mobile_wallet" ?
                        <MobileWalletStatus
                            inGuestPay={false}
                            transactionId={createdTransactionId}
                            containerStyle={{
                                padding: "0",
                                minHeight: "auto"
                            }}
                        />
                        :
                        <>
                            <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CheckCircle size={64} className="text-success" style={{ marginBottom: "1rem" }} />
                                {t("Payment Successful!")}
                            </h5>

                            <div className="text-center">

                                <p className="mb-0">
                                    {isKYB ?
                                        t(`Thank you for submitting the required documents for business verification. An email has been sent to the business directors to complete their KYC verification.
                                    Once the business documents and directors’ KYC are successfully validated, your business account will be verified.`) :
                                        t("The KYC fee payment is successful. Please proceed to verify your account.")
                                    }
                                </p>
                                <Button
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                        backgroundBlendMode: "overlay, normal",
                                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                        borderRadius: "6px",
                                        marginTop: "1.5rem"
                                    }}
                                    onClick={!isKYB ? verify : toggle}
                                    disabled={loading}
                                >
                                    {!isKYB ? t("Procees") : t("Close")}
                                </Button>
                            </div>
                        </>
                    }

                </ModalBody>
            </Modal>
        </>
    )
}

export default VerificationPayment