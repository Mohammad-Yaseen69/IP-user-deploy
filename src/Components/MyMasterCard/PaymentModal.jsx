import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/onboard.module.scss"
// import "./files/modal.reset.css"
import { Bank, Bank_h, Down, Help, Mobile, Mobile_h, Payment, Payment_h, Paypal, Paypal_h, Share, Svg, Wallet, Wallet_h, Trans } from "./files"
import { UserContext } from '../../Context/UserContext'
import { WalletCard } from '../PaymentsNewer/InternationalFlow/WalletsComponent'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation'
import { useNavigate } from 'react-router'
import CardNumberInput from '../CreditInput/CardNumberInput'
import CardCVC from '../CreditInput/CardCvc';
import { CARD_TYPES } from '../CreditInput/CreditCardTypes';
import CardExpiry from '../CreditInput/CardExpiry';
import CardHolderName from '../CreditInput/CardHolderName';
import { useTranslation } from 'react-i18next'
import cardStyles from "../PaymentsNewer/InternationalFlow/styles/creditcard.module.css"
import { Check } from 'react-feather'
import logo_w from "../../assets/images/logo/logo_white.png"
import { createShambeToken } from '../../Helper/CreateToken'
import { useReactToPrint } from 'react-to-print'


const options = [
  {
    type: "card",
    text: "Card Payments",
    icon: Payment,
    hoverIcon: Payment_h
  },
  {
    type: "wallet",
    text: "Instapay Wallet",
    icon: Wallet,
    hoverIcon: Wallet_h
  },
  {
    type: "paypal",
    text: "Paypal",
    icon: Paypal,
    hoverIcon: Paypal_h

  },
  {
    type: "mobile",
    text: "Mobile money (coming soon)",
    icon: Mobile,
    hoverIcon: Mobile_h
  },
  {
    type: "bank",
    text: "Bank transfer (coming soon)",
    icon: Bank,
    hoverIcon: Bank_h
  },
]


const paymentConfirmOptions = [
  {
    text: "Need help?",
    icon: Help
  },
  {
    text: "Share",
    icon: Share
  },
  {
    text: "Transation Details",
    icon: Trans
  },
  {
    text: "Download Receipt",
    icon: Down
  }
]

const PLACEHOLDER_CARD_TYPE = {
  type: 'placeholder',
  format: "",
  startPattern: "",
  maxCardNumberLength: 16,
  cvcLength: 3
}


const PaymentModal = ({ isOpen, vvcCardType, setIsOpen }) => {
  const [step, setStep] = useState(1)
  const { t } = useTranslation()
  const { userWallets, getUserWallets, userDetails, authHeader, setProfileLockTime } = useContext(UserContext)
  const [walletState, setWalletState] = useState({})
  const [showOtp, setShowOtp] = useState()
  const [paymentType, setPaymentType] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null)
  const [showOtpModal, setshowOtpModal] = useState(false)
  const [codeType, setCodeType] = useState("authenticator")
  const [success, setShowSuccess] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [cards, setCards] = useState([])
  const [selectedSaveCard, setSelectedSaveCard] = useState({})
  const navigate = useNavigate()
  const [cardDetail, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardHolderName: "",
  })
  console.log(userDetails)
  const [defaultWallet, setDefaultWallet] = useState({})
  const [feeDetails, setFeeDetails] = useState({})
  const [cardNumberError, setCardNumberError] = useState(null)
  const [disabledBtnS, setDisabledBtn] = useState(false)
  const [cardType, setCardType] = useState(PLACEHOLDER_CARD_TYPE)

  useEffect(() => {
    getUserWallets()
  }, [])

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


  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active")
      ?.sort((a, b) => (b?.default === true ? 1 : -1))
      ?.map(item => ({ name: item?.currency?.code, ...item }))
  }, [userWallets])

  useEffect(() => {
    if (filteredWallets?.length) {
      setDefaultWallet(filteredWallets[0])
    }

    console.log(defaultWallet)
  }, [filteredWallets])



  const sendOtp = async (e) => {
    e && e.preventDefault()
    setLoading(true)
    try {
      const twoYearsAhead = new Date();
      twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);

      const cardData = {
        data: {
            currency: "USD",
            expdate: `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAhead.getDate()).padStart(2, '0')}`,
            token: feeDetails?.token,
            cardType: "international_card_payment",
        },
        type: codeType
      }

      if (selectedSaveCard?._id) {
        cardData.data.pan = selectedSaveCard._id
      } else {
        cardData.data.is_card_save = saveCard
        cardData.data.se_shambey = createShambeToken(cardDetail)
      }


   


      const data = {
        data: {
          account_id: userDetails?._id,
          wallet_id: walletState?.wallet_id,
          cardType: vvcCardType == "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual",
          currency: "USD",
          expdate: `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAhead.getDate()).padStart(2, '0')}`

        },
        type: codeType
      }

      const dataToEnc = paymentType === "wallet" ? data : paymentType === "card" && cardData

      console.log(authHeader)
      const encrypted = encryptData(dataToEnc)
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
        data: encrypted
      }, {
        headers: authHeader
      })

      const dec = decryptData(res.data.data)
      setToken(dec?.token)
      setshowOtpModal(true)
    } catch (error) {
      const dec = decryptData(error.response.data.data)
      console.log(dec)
      toast.error("Something went wrong while creating your virtual card! please try again.")
    }
    finally {
      setLoading(false)
    }
  }

  const createWallet = async (setter, type, otp, setError) => {
    console.log("Creating with wallet")
    setLoading(true)
    const data = {
      token: token,
      type: codeType,
      otp
    }
    console.log(data)
    try {
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/virtual-card/create-vvc`, { data: encryptData(data) }, {
        headers: authHeader
      })

      console.log(decryptData(res.data.data))
      setShowSuccess(true)
      setToken(null)
      setStep(4)
      setshowOtpModal(false)

    } catch (err) {
      const decrypted = decryptData(err.response.data.data);
      setError(decrypted?.message ?? "Invalid Verification Code")
      if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
        const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
        setProfileLockTime(timeInSec)
        const coun = localStorage.getItem("ip_country")
        localStorage.clear()
        localStorage.setItem("ip_country", coun)
        navigate("/auth/login")
      }
    }
  }

  useEffect(() => {
    const getSavedCards = async () => {
      try {

        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
          headers: authHeader
        })
        const dec = decryptData(res.data.data)
        console.log(dec)
        setCards(dec?.panList)

      } catch {
        setCards([])
      }
    }

    if (userDetails?._id) {
      getSavedCards()
    }
  }, [userDetails])


  useEffect(() => {
    const getFee = async (method) => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/virtual-card/get-vvc-fee/${defaultWallet?.wallet_id}/${vvcCardType == "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual"}/${method}`, {
          headers: authHeader
        })

        const dec = decryptData(res.data.data)
        console.log(dec)
        setFeeDetails(dec.data)
      } catch (error) {
        const dec = decryptData(error.response.data.data)
        console.log(dec)
      }

    }
    if (paymentType === "card") {
      getFee("card")
    } else if (paymentType === "paypal") {
      getFee("paypal")
    }
  }, [paymentType])

  useEffect(() => {
    const disabledBtn = () => {
      switch (paymentType) {
        case "wallet":
          return !walletState?.wallet_id;
        case "card":
          if (selectedSaveCard._id) {
            return false;
          }
          return !cardDetail.cardNumber || !cardDetail.cardExpiry || !cardDetail.cardCVC || !cardDetail.cardHolderName || cardNumberError;
        default:
          return false;
      }
    };

    setDisabledBtn(disabledBtn());
  }, [walletState, paymentType, cardDetail, cardNumberError, selectedSaveCard]);

  const initiateCardVVC = async (setter, type, otp, setError) => {
    console.log("Creating with card")
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    setLoading(true)
    const data = {
      token: token,
      type: codeType,
      otp,
      panData: {
        currency: "USD",
        expdate: `${twoYearsAhead.getFullYear()}-${String(twoYearsAhead.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAhead.getDate()).padStart(2, '0')}`,
        token: feeDetails?.token,
        cardType: "international_card_payment",
      }
    }


    if (selectedSaveCard?._id) {
      data.panData.pan = selectedSaveCard._id
    } else {
      data.panData.is_card_save = saveCard
      data.panData.se_shambey = createShambeToken(cardDetail)
    }

    console.log(data)

    try {
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/virtual-card/initiate-vcc${selectedSaveCard._id ? "-pan" : ""}-card`, { data: encryptData(data) }, {
        headers: authHeader
      })

      console.log(decryptData(res.data.data))
      setShowSuccess(true)
      setToken(null)
      setStep(4)
      setshowOtpModal(false)

    } catch (err) {
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
        navigate("/auth/login")
      }
    }
  }



  return (
    <div className='vvc-modal'>
      <Modal isOpen={isOpen && !showOtpModal} style={{ borderRadius: "16px", overflow: "hidden", minWidth: step === 4 ? "1000px" : '800px' }}>
        <ModalBody style={{ padding: "0" }}>
          <div className={styles.modal} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: step === 4 && 1 || step === 2 && 1.2 }} className={styles.left}>
              <h1>Select Payment Type</h1>
            </div>

            <div className={styles.right}>
              {step == 1 &&
                <div className={styles.step1}>
                  <div>
                    {options.map(option => (
                      <div
                        onClick={() => {
                          setPaymentType(option.type)
                          setStep(2)
                        }}
                        key={option.type}
                        className={styles.paymentOptions}>
                        <div>

                          <span>
                            <img className={styles.normal} src={option.icon} alt="" />
                            <img src={option.hoverIcon} alt="" className={styles.hover} />
                          </span>

                          <h5>{option.text}</h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }

              {step === 2 &&
                <div className={styles.step2}>
                  {paymentType == "wallet"
                    &&
                    <div className={styles.walletsDiv}>
                      {filteredWallets?.map(wallet_l => (
                        <div key={wallet_l.name}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <h3 className={styles.walletNameHead}>{wallet_l.name}</h3>
                            <span className={styles.walletId}>
                              {wallet_l.wallet_id}
                            </span>
                          </div>

                          <WalletCard
                            wallet={wallet_l}
                            isActive={true}
                            cardType={vvcCardType == "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual"}
                            isInVCard={true}
                            dataHandler={(_, wallet) => setWalletState(wallet)}
                            data={{ wallet: walletState }}
                          />
                        </div>
                      ))}
                    </div>
                  }

                  {paymentType == "card" &&
                    <div className={styles.cardDiv}>
                      <div className={styles.texts}>
                        <h3>Payment Details</h3>
                        <p>Complete your payment by providing your payment details</p>
                      </div>

                      <div className={styles.cardFormDiv}>
                        <div className={styles.field}>
                          <h3 className={styles.label}>Card Number {!cardDetail.cardNumber && "*"}:</h3>
                          <CardNumberInput
                            content={cardDetail.cardNumber}
                            setContent={(e) => {
                              setSelectedSaveCard({})
                              setCardDetails(prev => ({ ...prev, cardNumber: e }))
                            }}
                            cardError={cardNumberError}
                            cardType={cardType}
                            isinVVC={true}
                            widthFull={true}
                          />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <div className={styles.field}>
                            <h3 className={styles.label}>CVC {!cardDetail.cardCVC && "*"}:</h3>
                            <CardCVC
                              content={cardDetail.cardCVC}
                              setContent={(e) => {
                                setSelectedSaveCard({})
                                setCardDetails(prev => ({ ...prev, cardCVC: e }))
                              }}
                              maxLength={cardType.cvcLength}
                              isinVVC={true}
                              widthFull={true}
                            />
                          </div>

                          <div className={styles.field}>
                            <h3 className={styles.label}>Expiry date {!cardDetail.cardExpiry && "*"}:</h3>
                            <CardExpiry
                              content={cardDetail.cardExpiry}
                              setContent={(e) => {
                                setSelectedSaveCard({})
                                setCardDetails(prev => ({ ...prev, cardExpiry: e }))
                              }}
                              isinVVC={true}
                              widthFull={true}
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <h3 className={styles.label}>Expiry Holder Name {!cardDetail.cardHolderName && "*"}:</h3>
                          <CardHolderName
                            content={cardDetail.cardHolderName}
                            setContent={(e) => {
                              setSelectedSaveCard({})
                              setCardDetails(prev => ({ ...prev, cardHolderName: e }))
                            }}
                            isinVVC={true}
                            widthFull={true}
                          />

                          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", marginTop: ".7rem" }}>
                            <Input id='save_info' style={{ cursor: "pointer" }} type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                            <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>{t("save details to use next time.")}</label>
                          </div>
                        </div>

                        {cards.length > 0 &&
                          <div className={styles.field}>

                            <h3 className={styles.label} style={{ fontSize: "14px" }}>Select a saved payment card</h3>
                            <div style={{ maxWidth: '100%', display: 'flex', overflow: "auto", gap: "10px", padding: "10px 0" }}>

                              {cards.map(item => (
                                <div key={item?._id} className={cardStyles.card} onClick={() => {
                                  Object.keys(cardDetail).forEach(key => cardDetail[key] = "")
                                  setSelectedSaveCard(item)
                                }}>
                                  <div className={cardStyles.c_top}>
                                    <img src={logo_w} alt="" />
                                  </div>
                                  <div className={cardStyles.c_bot}>
                                    <span>XXXX XXXX XXXX {item?.last4}</span>
                                    {
                                      selectedSaveCard?._id === item?._id
                                      &&
                                      <Check style={{ color: "white" }} size={20} />
                                    }
                                  </div>
                                </div>
                              ))}


                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <div className={styles.btns}>
                    <button
                      onClick={() => {
                        setStep(1)
                        setWalletState({})
                      }}
                    >Back</button>
                    <button
                      style={{ color: "white", backgroundColor: "#5926F0", opacity: disabledBtnS && 0.4 }}
                      disabled={disabledBtnS}
                      onClick={() => {
                        setStep(3)
                      }}
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>

                    </button>

                  </div>

                </div>
              }

              {step == 3 &&
                <div className={styles.step3}>
                  <div className={styles.infoDiv}>
                    <div className={styles.heads}>
                      <h4>Review your payment details</h4>
                      <p>Please take a few moments to carefully review and verify the information to your payment details.</p>
                    </div>

                    <div className={styles.paymentInfo}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <p>You Have to Pay</p>
                        <h1>$5.00</h1>
                      </div>


                      <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
                    </div>

                    <div className={styles.transactionInfo}>

                      <div>
                        <div>
                          <p>You are using</p>
                          <div>
                            <span>{walletState?.name} Wallet</span>
                            <p>{walletState?.wallet_id}</p>
                          </div>

                          <button onClick={() => setStep(2)}>Change</button>
                        </div>
                      </div>

                      <div>
                        <h3>Card activation fee</h3>
                        <h3>$5.00</h3>
                      </div>

                    </div>
                  </div>

                  <div className={styles.btns}>
                    <button onClick={() => setStep(2)}>Back</button>
                    <button
                      style={{ color: "white", backgroundColor: "#5926F0" }}
                      onClick={sendOtp}
                    >
                      Proceed to Payment
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>

                    </button>
                  </div>
                </div>
              }

              {step === 4 &&
                <div className={styles.step4}>
                  <div style={{ gap: "12px" }} className={styles.infoDiv}>
                    <div className={styles.paymentInfo}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <p>You Have to Pay</p>
                        <h1>$5.00</h1>
                      </div>


                      <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
                    </div>

                    <div className={styles.transactionInfo}>

                      <div>
                        <div>
                          <p>You are using</p>
                          <div>
                            <span>USD Wallet</span>
                            <p>3MKTGFY7</p>
                          </div>

                          <button>Change</button>
                        </div>
                      </div>

                      <div>
                        <h3>Card activation fee</h3>
                        <h3>$5.00</h3>
                      </div>

                    </div>

                    <div className={styles.completeOptions}>
                      {paymentConfirmOptions.map(option => (
                        <div key={option.text}>
                          <img src={option.icon} alt="" />
                          <p>{option.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.btns}>
                    <button
                      style={{ color: "white", backgroundColor: "#5926F0" }}
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </ModalBody>
      </Modal >

      <Modal isOpen={showOtpModal}>
        <ModalHeader toggle={() => setshowOtpModal(false)}> Confirm </ModalHeader>
        <ModalBody>
          <OTPConfirmation
            callback={paymentType === "wallet" ? createWallet : initiateCardVVC}
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

    </div>
  )
}

export default PaymentModal