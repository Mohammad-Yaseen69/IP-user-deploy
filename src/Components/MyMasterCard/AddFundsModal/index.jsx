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
import { useLocation, useNavigate } from 'react-router'
import SideProgress from './SideProgress'
import useWindowWidth from '../../../utils/useWindowWidth'

const PLACEHOLDER_CARD_TYPE = {
    type: 'placeholder',
    format: "",
    startPattern: "",
    maxCardNumberLength: 16,
    cvcLength: 3
}


const AddFundsModal = ({ isOpen, setOpen, vvcCardType, card }) => {
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

                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
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
        setShowSuccess(false);
        setSaveCard(false);
        setSelectedSaveCard({});
        setCardDetails({
            cardNumber: "",
            cardExpiry: "",
            cardCVC: "",
            cardHolderName: "",
        });

        if(width < 1000){
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
    const [showSuccess, setShowSuccess] = useState(false)
    const [sideText, setSideText] = useState("Set the Value")
    const navigate = useNavigate()
    const [disabled, setDisabled] = useState(false)

    const sendOtp = async () => {
        const data = {
            data: {
                sender_wallet_id: walletState?._id,
                token: feeDetails.token,
                account: userDetails._id
            },
            type: codeType
        }


        const encrypted = encryptData(data)
        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            console.log(dec)
            setshowOtpModal(true)
            setToken(dec?.token)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
            toast.error("Something went wrong while creating your virtual card! please try again.")
        }
        finally {
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
        setStep(prev => prev + 1)
    }



    useEffect(() => {
        if (walletState.wallet_id) {
            async function getFee() {
                const data = {
                    cardId: card._id,
                    walletId: walletState?._id,
                    amount: +String(amount)?.replaceAll(",", ""),
                    type: paymentType
                }

                console.log(data)
                const enc = encryptData(data)



                const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/get-card-topup-fee`, { data: enc }, {
                    headers: authHeader
                })

                const dec = decryptData(response?.data?.data)

                console.log(dec)
                setFeeDetails(dec.data)
            }

            getFee()
        }
    }, [walletState])

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

    const walletTopup = async (setter, type, otp, setError) => {
        const data = new FormData()

        data.append("type", codeType)
        data.append("otp", otp)
        data.append("token", token)
        console.log(data)
        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/wallet-to-card-transfer`, data, {
                headers: authHeader
            })
            setToken(null)
            setshowOtpModal(false)
            const dec = decryptData(res.data.data)
            setStep(prev => prev + 1)
            console.log(dec)
        } catch (err) {
            errorHandler(err, setError)
        }
    }


    useEffect(() => {
        switch (step) {
            case 1:
                setSideText(width > 1000 ? "Set The Value" : "")
                setDisabled(!amount)
                break;

            case 2:
                setSideText(width > 1000 ? "Choose the method" : "Select Payment Type")
                setDisabled(!paymentType)
                break;
            case 3:
                setDisabled(!feeDetails.token && !walletState._id)
                setSideText(width > 1000 ? "Choose the method" : paymentType === 'wallet' ? "Choose the wallet" : "Payment Details")
                break;

            case 4:
                setDisabled(false)
                setSideText("Review Your Payment Details")
                break;

            case 5:
                setSideText(width < 1000 ? "Your Payment is now Completed" : "")
                break;

            default:
                setDisabled(false)
                break;
        }


    }, [step, amount, feeDetails, walletState, paymentType, width])





    const renderData = () => (
        <div style={{ width: "100%", display: "flex", gap: "20px", flexDirection: width < 1000 ? "column" : "" }}>
            <div style={{ display: width < 1000 && "none" }} className={styles.left}>
                <div>
                    <div className={styles.top}>
                        <img src={AddFunds} alt="" />
                        <h2>Add Funds</h2>
                    </div>

                    <div className={styles.progressEffect} style={{ marginTop: "2rem" }}>
                        <SideProgress isActive={step === 1} isCompleted={step > 1} Icon={Currency} Text={"Enter the amount"} step={1} />
                        <SideProgress isActive={step === 2 || step === 3} isCompleted={step > 3} Icon={Receipt} Text={"Select the method"} step={2} />
                        <SideProgress isActive={step === 4} isCompleted={step > 4} Icon={CircleCheck} Text={"Review and Confirm"} step={3} />

                    </div>
                </div>


                <div className={styles.contactBox}>
                    <ContactBox />
                </div>


            </div>

            {width < 1000 &&
                <div className={styles.top}>
                    <img src={AddFunds} alt="" />
                    <h2>Add Funds</h2>
                </div>
            }
            <div style={{ minHeight: width < 1000 && "76vh", width: width < 1000 && "100%", padding: width < 1000 && "0", border: width < 1000 && "none" }} className={styles.right}>

                <div>
                    {(step !== 5) &&
                        <div className={styles.top}>
                            <h4>{sideText}</h4>
                            {width > 1000 && <p>STEP 0{step <= 2 ? step : step - 1}</p>}
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
                        <p>Amount</p>
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
                            placeholder='30.00'
                            data-type="currency"
                        />
                    </div>
                }



                <div style={{ display: width < 1000 && "flex", flexDirection: width < 1000 && "column" }} className={styles.btns}>
                    {((step !== 1 || step === 5) && (width > 1000)) && <button onClick={() => setStep(prev => prev - 1)} className={styles.cancel}>Cancel</button>}
                    {width < 1000 && <ContactBox />}
                    <button disabled={disabled} style={{ padding: width < 1000 && "18px", marginTop: width < 1000 && "12px", width: width < 1000 && "100%", opacity: disabled && 0.6 }} onClick={handleNext} className={styles.continue}>
                        {step !== 5 ? "Continue" : "Close"}
                    </button>
                    <button onClick={() => {
                        if (step === 1) {
                            handleClose()
                            navigate("/my-mastercard")
                        }
                        else {
                            setStep(prev => prev - 1)
                        }
                    }} className={styles.cancel} style={{ backgroundColor: "white",display: (width > 1000 && step !== 5) || step === 5 ? "none" : "flex", width: "100%" }} >
                        Back
                    </button>
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
                <ModalHeader toggle={() => setshowOtpModal(false)}> Confirm </ModalHeader>
                <ModalBody>
                    <OTPConfirmation
                        callback={walletTopup}
                        setter={setShowSuccess}
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
        </>
    )
}

export default AddFundsModal