import React, { useContext, useEffect, useMemo, useState } from 'react'
import styles from "../styles/addFunds.module.scss"
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { AddFunds } from '../files'
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
    const navigate = useNavigate()

    const sendOtp = async () => {
        const data = {
            sender_wallet_id: walletState?.wallet_id,
            token: feeDetails.token,
            account: userDetails._id
        }

        console.log(data)

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
        const data = {
            token: token,
            otp: otp,
            type: codeType
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/wallet-to-card-transfer`, { data: encryptData(data) }, {
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

    return (
        <Modal isOpen={isOpen} style={{ minWidth: '850px' }} toggle={() => setOpen(prev => ({ ...prev, addFunds: false }))}>
            <ModalBody>
                <div style={{ width: "100%", display: "flex", gap: "20px" }}>
                    <div className={styles.left}>


                        <div className={styles.top}>
                            <img src={AddFunds} alt="" />
                            <h2>Add Funds</h2>
                        </div>


                        <div className={styles.contactBox}>
                            <ContactBox />
                        </div>


                    </div>

                    <div className={styles.right}>
                        <div>
                            <div className={styles.top}>
                                <h4>Set the Value</h4>
                                <p>STEP 0{step <= 2 ? step : step - 1}</p>
                            </div>

                            <div className={onboardStyles.paymentContent}>
                                <div className={onboardStyles.right} style={{ padding: "0px", flex: 1 }}>
                                    {step === 2 &&
                                        <PaymentSelect style={{ marginTop: "" }} paymentType={paymentType} setPaymentType={setPaymentType} />
                                    }
                                    {step === 3 &&
                                        <PaymentStep
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
                                        />
                                    }

                                    {step === 5 &&
                                        <SuccessStep
                                            feeDetails={feeDetails}
                                            walletState={walletState}
                                            setIsOpen={setOpen}
                                            paymentType={paymentType}
                                            addFunds={true}
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



                        <div className={styles.btns}>
                            {step !== 1 && <button onClick={() => setStep(prev => prev - 1)} className={styles.cancel}>Cancel</button>}
                            <button onClick={handleNext} className={styles.continue}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>

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
            </ModalBody>
        </Modal>
    )
}

export default AddFundsModal