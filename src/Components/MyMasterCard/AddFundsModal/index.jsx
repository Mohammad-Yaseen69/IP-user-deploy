import React, { useContext, useEffect, useMemo, useState } from 'react'
import styles from "../styles/addFunds.module.scss"
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { AddFunds, Receipt, Currency, CircleCheck } from '../files'
import ContactBox from '../PaymentModal/ContactBox'
import onboardStyles from "../styles/onboard.module.scss"
import PaymentSelect from '../PaymentModal/PaymentSelectStep'
import PaymentStep from '../PaymentModal/PaymentStep'
import ConfirmationStep from '../PaymentModal/ConfirmationStep'
import SuccessStep from '../PaymentModal/SuccessStep'
import { UserContext } from '../../../Context/UserContext'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { CARD_TYPES } from '../../CreditInput/CreditCardTypes';
import axios from 'axios'
import { formatCurrency } from '../../../Helper/AmountFormat'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import OTPConfirmation from '../../UserSettingsNew/OTPConfirmation'
import { useNavigate } from 'react-router'
import SideProgress from './SideProgress'
import useWindowWidth from '../../../utils/useWindowWidth'
import { createShambeToken } from '../../../Helper/CreateToken'
import TrustpaymentPage from '../../AddFunds/WalletFund/CreditTransaction'
import { useTranslation } from 'react-i18next'
import { apiErrorMessage } from '../../PaymentsNewer/InternationalFlow';

const PLACEHOLDER_CARD_TYPE = {
    type: 'placeholder',
    format: "",
    startPattern: "",
    maxCardNumberLength: 16,
    cvcLength: 3
}


const AddFundsModal = ({ isOpen, setOpen, vvcCardType, card, setCurrentCardDetails }) => {
    const [step, setStep] = useState(1)
    const [paymentType, setPaymentType] = useState("")
    const [selectedSaveCard, setSelectedSaveCard] = useState(null)
    const { userWallets, authHeader, userDetails, setProfileLockTime } = useContext(UserContext)
    const [cards, setCards] = useState([])
    const [codeType, setCodeType] = useState("sms")
    const [saveCard, setSaveCard] = useState(false)
    const [walletState, setWalletState] = useState({})
    const [cardNumberError, setCardNumberError] = useState(null)
    const [disabledBtnS,] = useState(false)
    const [amount, setAmount] = useState("")
    const width = useWindowWidth()
    const [cardType, setCardType] = useState(PLACEHOLDER_CARD_TYPE)
    const { t } = useTranslation()
    const [feeDetails, setFeeDetails] = useState({})
    const [cardDetail, setCardDetails] = useState({
        cardNumber: "",
        cardExpiry: "",
        cardCVC: "",
        cardHolderName: "",
    })

    useEffect(() => {
        const getSavedCards = async () => {
            try {

                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                setCards(dec?.panList)

            } catch {
                setCards([])
            }
        }

        if (userDetails?.tfa) {
            setCodeType("authenticator")
        } else {
            setCodeType("sms")
        }

        if (userDetails?._id) {
            getSavedCards()
        }
    }, [userDetails])

    const handleClose = () => {
        setAmount("")
        setOpen(prev => ({ ...prev, addFunds: false }));
        setStep(1);
        setPaymentType("");
        setWalletState({});
        setLoading(false);
        setFeeDetails({})
        setToken(null);
        setshowOtpModal(false);
        setCodeType("sms");
        setSaveCard(false);
        setSelectedSaveCard({});
        setCardDetails({
            cardNumber: "",
            cardExpiry: "",
            cardCVC: "",
            cardHolderName: "",
        });
        if (width < 1000) {
            navigate("/my-mastercard")
        }
    };


    const filteredWallets = useMemo(() => {
        return userWallets
            ?.filter(item =>
                item?.wallet_type === "insta" &&
                !item?.blocked &&
                !item?.admin_blocked &&
                item?.status === "active"
            )
            ?.map(item => ({
                name: item?.currency?.code,
                ...item,
            }))
            ?.sort((a, b) => {
                if (a.isSufficient && !b.isSufficient) return -1;
                if (!a.isSufficient && b.isSufficient) return 1;
                if (b?.default === true) return 1;
                if (a?.default === true) return -1;
                return b?.balance?.available - a?.balance?.available;
            });
    }, [userWallets, amount]);


    useEffect(() => {
        const getCardTypeByValue = function getCardTypeByValue(value) {
            return CARD_TYPES.filter(function (cardType) {
                return cardType.startPattern.test(value);
            })[0];
        };
        const type = getCardTypeByValue(cardDetail.cardNumber)
        if (!type || cardDetail.cardNumber.length < type?.maxCardNumberLength) {
            setCardNumberError("Invalid Card Number")
        } else {
            setCardNumberError("")
        }
        setCardType(type ?? PLACEHOLDER_CARD_TYPE)
    }, [cardDetail.cardNumber])


    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showOtpModal, setshowOtpModal] = useState(false)
    const [sideText, setSideText] = useState(t("Set the Value"))
    const navigate = useNavigate()
    const [disabled, setDisabled] = useState(false)
    const [cardTransactionDetails, setCardTransactionDetails] = useState({})


    const sendOtp = async () => {
        const data = {
            data: {
                token: feeDetails.token,
                accountId: userDetails._id
            },
            type: codeType
        }

        setDisabled(true)

        if (paymentType === "wallet") {
            data.data.sender_wallet_id = walletState?._id
        }

        if (paymentType === "card") {
            data.data.token = feeDetails.token
            if (selectedSaveCard?._id) {
                data.data.pan = selectedSaveCard?._id
            } else {
                data.data.is_card_save = saveCard
                data.data.se_shambey = createShambeToken(cardDetail)
            }
        }

        console.log(data)
        const encrypted = encryptData(data)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setshowOtpModal(true)
            setToken(dec?.token)
        } catch (error) {
            toast.error("Something went wrong while creating your virtual card! please try again.")
        }
        finally {
            setDisabled(false)
            setLoading(false)
        }
    }


    const handleNext = () => {
        if (step === 5) {
            handleClose()
            return
        }
        if (step === 4) {
            sendOtp()
            return
        }
        if (paymentType === "paypal" && step === 2) {
            setStep(prev => prev + 2)
        } else {
            setStep(prev => prev + 1)
        }
    }

    async function getFee() {
        const data = {
            cardId: card?._id,
            walletId: walletState?._id ?? filteredWallets.find(w => w.default)?._id,
            amount: +String(amount)?.replaceAll(",", ""),
            type: paymentType
        }

        console.log(data)
        const enc = encryptData(data)



        const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-card-topup-fee`, { data: enc }, {
            headers: authHeader
        })

        const dec = decryptData(response?.data?.data)

        console.log(dec)
        setFeeDetails(dec.data)
    }


    useEffect(() => {
        if (walletState.wallet_id) {
            getFee()
        }
        if (paymentType === "paypal") {
            getFee()
        }
        if (paymentType === "card") {
            getFee()
        }
    }, [walletState, paymentType])

    function errorHandler(err, setError) {
        const decrypted = decryptData(err.response.data.data);
        console.log(decrypted)
        setError(decrypted?.message ?? "Invalid Verification Code")
        if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
            const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
            const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
            setProfileLockTime(timeInSec)
            const coun = localStorage.getItem("ip_country")
            localStorage.clear()
            localStorage.setItem("ip_country", coun)
            navigate("/login")
        }
    }

    const cardTopup = async (setter, type, otp, setError) => {
        setLoading(true)
        const data = {
            otp,
            type: codeType,
            token,
            // panData: {
            //     token: feeDetails.token,
            //     accountId: userDetails?._id
            // }
        }

        // if (paymentType === "card") {
        //     if (selectedSaveCard?._id) {
        //         data.panData.pan = selectedSaveCard._id
        //     } else {
        //         data.panData.is_card_save = saveCard
        //         data.panData.se_shambey = createShambeToken(cardDetail)
        //     }
        // }

        const enc = encryptData(data)

        console.log(data)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/topup-by${!selectedSaveCard?._id ? "-new" : ""}-card`, { data: enc }, {
                headers: authHeader
            })
            setToken(null)
            setshowOtpModal(false)
            const dec = decryptData(res.data.data)
            setCardTransactionDetails(dec.data)
            console.log(dec)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            const error2 = apiErrorMessage(decrypted?.message);
            if (error2) {
                setError(error2);
            } else {
                errorHandler(err, setError);
            }
        }
        finally {
            setLoading(false)
        }
    }

    const paypalTopup = async (setter, type, otp, setError) => {
        const data = {
            otp: otp,
            token: token,
            type: codeType,
        }


        const enc = encryptData(data)
        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/topup-by-paypal`, { data: enc }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)

            window.location.href = dec?.data?.url
            console.log(dec)
        }
        catch (err) {
            const decrypted = decryptData(err.response.data.data);
            const error2 = apiErrorMessage(decrypted?.message);
            if (error2) {
                setError(error2);
            } else {
                errorHandler(err, setError);
            }
        }
        finally {
            setLoading(false)
        }
    }
    const walletTopup = async (setter, type, otp, setError) => {
        const data = new FormData()

        data.append("type", codeType)
        data.append("otp", otp)
        data.append("token", token)
        console.log(data)
        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/wallet-to-card-transfer`, data, {
                headers: authHeader
            })
            setToken(null)
            setshowOtpModal(false)
            const dec = decryptData(res.data.data)
            setStep(prev => prev + 1)
            setCurrentCardDetails(prev => ({
                ...prev,
                balance: (+prev?.balance + +feeDetails?.feeDetails?.amountToTopup).toFixed(2),
            }))
            console.log(dec)
        } catch (err) {
            const decrypted = decryptData(err.response.data.data);
            const error2 = apiErrorMessage(decrypted?.message);
            if (error2) {
                setError(error2);
            } else {
                errorHandler(err, setError);
            }
        }
        finally {
            setLoading(true)
        }
    }


    useEffect(() => {
        switch (step) {
            case 1:
                setSideText(width > 1000 ? t("Set The Value") : "")
                setDisabled(!amount)
                break;
            case 2:
                setSideText(width > 1000 ? t("Choose the method") : t("Select Payment Type"))
                setDisabled(!paymentType || (paymentType === "paypal" && !feeDetails.token))
                break;
            case 3:
                setDisabled(!feeDetails.token && !walletState._id)
                setSideText(width > 1000 ? t("Choose the method") : paymentType === 'wallet' ? t("Choose The Wallet") : t("Payment Details"))
                break;
            case 4:
                setDisabled(false)
                setSideText(t("Review Your Payment Details"))
                break;
            case 5:
                setSideText(width < 1000 ? t("Your Payment is now Completed") : "")
                break;
            default:
                setDisabled(false)
                break;
        }
    }, [step, amount, feeDetails, walletState, paymentType, width])


    const handleBack = () => {
        if (step === 2) {
            setPaymentType("")
        }
        if (step === 3) {
            setWalletState({})
            setCardDetails({
                cardNumber: "",
                cardExpiry: "",
                cardCVC: "",
                cardHolderName: "",
            })
            setSelectedSaveCard({});
        }
        if (step === 4 && paymentType === "paypal") {
            setStep(prev => prev - 2)
        }
        else {
            setStep(prev => prev - 1)
        }
    }


    const renderData = () => (
        <div style={{ width: "100%", display: "flex", gap: "20px", flexDirection: width < 1000 ? "column" : "" }}>
            <div style={{ display: width < 1000 && "none" }} className={styles.left}>
                <div>
                    <div className={styles.top}>
                        <img src={AddFunds} alt="" />
                        <h2>{t("Add Funds")}</h2>
                    </div>

                    <div className={styles.progressEffect} style={{ marginTop: "2rem" }}>
                        <SideProgress isActive={step === 1} isCompleted={step > 1} Icon={Currency} Text={t("Enter the amount")} step={1} />
                        <SideProgress isActive={step === 2 || step === 3} isCompleted={step > 3} Icon={Receipt} Text={t("Select the method")} step={2} />
                        <SideProgress isActive={step === 4} isCompleted={step > 4} Icon={CircleCheck} Text={t("Review and Confirm")} step={3} />

                    </div>
                </div>


                <div className={styles.contactBox}>
                    <ContactBox />
                </div>


            </div>

            {width < 1000 &&
                <div className={styles.top}>
                    <img src={AddFunds} alt="" />
                    <h2>{t("Add Funds")}</h2>
                </div>
            }
            <div style={{ minHeight: width < 1000 && "76vh", width: width < 1000 && "100%", padding: width < 1000 && "0", border: width < 1000 && "none" }} className={styles.right}>

                <div>
                    {(step !== 5) &&
                        <div className={styles.top}>
                            <h4>{sideText}</h4>
                            {width > 1000 && <p>{t("STEP")} 0{step <= 2 ? step : step - 1}</p>}
                        </div>
                    }

                    <div className={onboardStyles.paymentContent}>
                        <div className={onboardStyles.right} style={{ padding: "0px", flex: 1 }}>
                            {step === 2 &&
                                <PaymentSelect styling={{ marginTop: "1rem", backgroundColor: width < 1000 && "white", padding: width < 1000 && "0" }} paymentType={paymentType} setPaymentType={setPaymentType} />
                            }
                            {step === 3 &&
                                <PaymentStep
                                    marginTop={"1rem"}
                                    paymentType={paymentType}
                                    filteredWallets={filteredWallets}
                                    cardDetail={cardDetail}
                                    cards={cards}
                                    disabledBtnS={disabledBtnS}
                                    vvcCardType={vvcCardType}
                                    walletState={walletState}
                                    setWalletState={setWalletState}
                                    cardType={cardType}
                                    saveCard={saveCard}
                                    setSaveCard={setSaveCard}
                                    setCardDetails={setCardDetails}
                                    selectedSaveCard={selectedSaveCard}
                                    setSelectedSaveCard={setSelectedSaveCard}
                                    feeDetails={feeDetails}
                                    setFeeDetails={setFeeDetails}
                                    cardNumberError={cardNumberError}
                                    addFunds={true}
                                    setCards={setCards}
                                    card={card}
                                    amount={amount}
                                />
                            }

                            {step === 4 &&
                                <ConfirmationStep
                                    feeDetails={feeDetails}
                                    walletState={walletState}
                                    sendOtp={sendOtp}
                                    addFunds={true}
                                    setStep={setStep}
                                    cardDets={card}
                                    paymentType={paymentType}
                                />
                            }

                            {step === 5 &&
                                <SuccessStep
                                    feeDetails={feeDetails}
                                    walletState={walletState}
                                    setIsOpen={setOpen}
                                    paymentType={paymentType}
                                    addFunds={true}
                                    cardDets={card}
                                />}
                        </div>
                    </div>
                </div>

                {step === 1 &&
                    <div className={styles.amount}>
                        <p>{t("Amount")}</p>
                        <input
                            value={amount}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    setAmount("");
                                    return;
                                }
                                setAmount(e.target.value);
                            }}
                            onKeyUp={(e) => formatCurrency(e.target.value, false, setAmount)}
                            onBlur={(e) => formatCurrency(e.target.value, true, setAmount)}
                            type="text"
                            placeholder={t('30.00')}
                            data-type="currency"
                        />
                    </div>
                }



                <div style={{ display: width < 1000 && "flex", flexDirection: width < 1000 && "column" }} className={styles.btns}>
                    {((step !== 1 && step !== 5) && (width > 1000)) && <button onClick={handleBack} className={styles.cancel}>{t("Cancel")}</button>}
                    {width < 1000 && <ContactBox />}

                    <button disabled={disabled} style={{ padding: width < 1000 && "18px", marginTop: width < 1000 && "12px", width: width < 1000 && "100%", opacity: disabled && 0.6 }} onClick={handleNext} className={styles.continue}>
                        {step !== 5 ? t("Continue") : t("Close")}
                    </button>

                    {step !== 5 &&
                        <button onClick={() => {
                            if (step === 1) {
                                handleClose()
                                navigate("/my-mastercard")
                            }
                            else {
                                setStep(prev => prev - 1)
                            }
                        }} className={styles.cancel} style={{ backgroundColor: "white", display: (width > 1000 && step !== 5) || step === 5 ? "none" : "flex", width: "100%" }} >
                            {t("Back")}
                        </button>
                    }
                </div>
            </div>
        </div>
    )
    return (
        <>

            <Modal isOpen={isOpen && width > 1000} style={{ minWidth: '850px' }} toggle={handleClose}>
                <ModalBody>
                    {renderData()}
                </ModalBody>
            </Modal>

            {width < 1000 &&
                <div >
                    {renderData()}
                </div >
            }


            <Modal isOpen={showOtpModal}>
                <ModalHeader toggle={() => setshowOtpModal(false)}> {t("Confirm")} </ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        callback={paymentType === "wallet" ? walletTopup : paymentType === "paypal" ? paypalTopup : cardTopup}
                        setterValue={true}
                        hideOtp={() => setshowOtpModal(false)}
                        processing={loading}
                        resendHandler={sendOtp}
                        authType={codeType}
                        setAuthType={setCodeType}
                        showAuthToggle={true}
                    />
                </ModalBody>
            </Modal>

            {cardTransactionDetails?.transaction_id
                ?
                <TrustpaymentPage
                    paymentWithSavedCard={selectedSaveCard?._id ? true : false}
                    card_cvc={cardDetail.cardCVC}
                    card_expiry={cardDetail.cardExpiry}
                    card_number={cardDetail.cardNumber}
                    currency={cardTransactionDetails?.currency}
                    transaction={cardTransactionDetails}
                    amount={cardTransactionDetails?.amount}
                    url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm${selectedSaveCard?._id ? "-chatbot" : ""}-vcc-topup/${cardTransactionDetails?.transaction_id}/${cardTransactionDetails?.token}`}
                    tokenUrl={() => `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm${selectedSaveCard?._id ? "-chatbot" : ""}-vcc-topup/${cardTransactionDetails?.transaction_id}/${cardTransactionDetails?.token}`}
                />
                :
                <></>
            }
        </>
    )
}

export default AddFundsModal