import React, { useContext, useEffect, useReducer } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import styles from "../styles/CardToCard.module.scss"
import useWindowWidth from '../../../utils/useWindowWidth'
import "../styles/modal.reset.css"
import RecipientSelect from './RecipientSelect'
import { formatCurrency } from '../../../Helper/AmountFormat'
import { Svg, PremiumLabel, StandardLabel, Help, Share, Trans, Down, ctc } from '../files'
import { useTranslation } from 'react-i18next'
import logo from "../../PaymentsNewer/InternationalFlow/files/ins_logo.svg"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { UserContext } from '../../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import OtpConfirmation from "../../PaymentsNewer/InternationalFlow/OtpConfirmation"
import { useNavigate } from 'react-router'
import InstaPayLoader from '../../Loader'
import { update } from 'lodash'
import { Link } from 'react-router-dom'


const initialState = {
  step: 1,
  sideText: "Choose The Recipient",
  recipient: {},
  amount: "",
  note: "",
  disabled: false,
  showOtpModal: false,
  token: '',
  codeType: "sms",
  cards: [],
  loading: false,
  otpError: "",
  feeDetails: {},
  getFee: true,
  feeToken: null
}


const paymentConfirmOptions = [
  {
    text: "Need help?",
    icon: Help,
    navigate: `mailto:support@insta-pay.ch`
  },
  {
    text: "Transation Details",
    icon: Trans,
    navigate: "/my-mastercard?showT=true"
  },
]


function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value
      };
    case "RESET" : 
      return initialState  
    default:
      return state;
  }
}



function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return currencyCode
  const formatted = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(1);

  return formatted.replace(/[0-9.,\s]/g, ''); // removes numbers, dots, commas, and spaces
}



const CardtoCard = ({ setOpen, isOpen, card, currentCardDetails, setCurrentCardDetails }) => {
  const width = useWindowWidth()
  const [data, dispatch] = useReducer(reducer, initialState)
  const { userDetails, authHeader } = useContext(UserContext)
  const { t } = useTranslation()

  const formatAmountWithSymbol = (amount, currency, addCheck = false) => {
    if (!amount || !currency) {
      return <div style={{ width: "50px" }}><InstaPayLoader /></div>;
    }
    if (addCheck) {
      if (+data.feeDetails?.total_amount > +currentCardDetails.balance) {
        console.log("asdfasdf")
        return <div style={{ width: "50px" }}><InstaPayLoader /></div>;
      }
    }
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount}`;
  }

  const updateHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value })
  }



  useEffect(() => {
    if (data.getFee && data.amount.replace(/,/g, "") !== "" && data.amount !== ".") {
      let debounceTimer;
      updateHandler("feeToken", null)
      updateHandler("feeDetails", {})
      updateHandler("loading", true)

      const getFee = async () => {
        const apiData = {
          senderCardId: card._id,
          receiverCardId: data.recipient?.card?.id,
          amount: +data.amount.replace(/,/g, ""),
        }

        const enc = encryptData(apiData)


        try {
          const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/card-to-card-fee`, {
            data: enc
          }, {
            headers: authHeader
          })


          const dec = decryptData(res.data.data)

          console.log(dec)

          updateHandler("feeDetails", dec?.data?.feeDetails)
          updateHandler("feeToken", dec?.data?.token)
          updateHandler("getFee", false)
        } catch (err) {
          const dec = decryptData(err.response.data.data)
          console.log(dec)
          toast.error(dec.message || "Something went wrong while getting exchange rate.")
        }
        finally {
          updateHandler("loading", false)
        }
      }


      clearTimeout(debounceTimer)


      debounceTimer = setTimeout(() => {
        getFee()
      }, 300)


      return () => {
        clearTimeout(debounceTimer)
      }
    }
  }, [data.amount])


  useEffect(() => {
    const getSavedCards = async () => {
      try {

        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
          headers: authHeader
        })
        const dec = decryptData(res.data.data)
        updateHandler("cards", dec?.panList)

      } catch {
        updateHandler("", [])
      }
    }

    if (userDetails?.tfa) {
      updateHandler("codeType", "authenticator")
    } else {
      updateHandler("codeType", "sms")
    }

    if (userDetails?._id) {
      getSavedCards()
    }
  }, [userDetails])

  const navigate = useNavigate()

  const handleClose = () => {
    // navigate("/my-mastercard")
    if((data.step === 5 || data.step === 6) && data.feeDetails?.total_amount){
      setCurrentCardDetails(prev => ({
        ...prev,
        balance: (prev.balance - data.feeDetails?.total_amount?.replace(/,/g, "")).toFixed(2)
      }))
    }
    // dispatch({ type: "RESET" })
    setOpen(prev => ({ ...prev, ctc: false }));
  }


  const sendOtp = async () => {
    const apiData = {
      data: {
        senderCardId: card._id,
        receiverCardId: data.recipient?.card?.id,
        amount: +data.amount.replace(/,/g, ""),
        note: data.note,
        token: data.feeToken,
      },
      type: data.codeType
    }


    const encrypted = encryptData(apiData)
    updateHandler("loading", true)
    try {
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
        data: encrypted
      }, {
        headers: authHeader
      })

      const dec = decryptData(res.data.data)

      updateHandler("showOtpModal", true)
      updateHandler("token", dec?.token)
    } catch (error) {
      const dec = decryptData(error.response.data.data)

      toast.error(dec.message || "Something went wrong while creating your virtual card! please try again.")
    }
    finally {
      updateHandler("loading", false)
    }
  }

  const handleNext = () => {
    if (data.step === 5) {
      sendOtp()
      return
    }

    if (data.step === 1) {
      updateHandler("amount", "1.00")
    }
    updateHandler("step", data.step + 1)
  }

  const handleBack = () => {
    if (data.step === 1) {
      updateHandler("recipient", {})
    }
    else if (data.step === 2) {
      updateHandler("feeDetails", {})
      updateHandler("feeToken", null)
      updateHandler("amount", "")
    }

    updateHandler("step", data.step - 1)

  }


  useEffect(() => {
    switch (data.step) {
      case 1:
        updateHandler("sideText", "Choose The Recipient")
        updateHandler("disabled", false)
        break;

      case 2:
        updateHandler("sideText", "Specify Amount")
        updateHandler("disabled", data.amount === "" || data.amount === "0" || +data.feeDetails?.total_amount?.replace(/,/g, "") > +currentCardDetails.balance || !data.feeDetails?.total_amount)
        break;

      case 3:
        updateHandler("sideText", "Add a Note (Optional)")
        break;

      case 4:
        updateHandler("sideText", "Review Payment")
        break;

      case 5:
        updateHandler("sideText", "User Consent")
        break;


      default:
        updateHandler("disabled", false)
    }
  }, [data.amount, data.step, data.feeDetails])



  const ctcPayment = async (otp) => {
    const apiData = {
      type: data.codeType,
      token: data.token,
      otp: otp
    }

    const encrypted = encryptData(apiData)


    try {
      await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/mastercard/card-to-card-transfer`, { data: encrypted }, {
        headers: authHeader
      })

      // const dec = decryptData(res.data.data)

      updateHandler("showOtpModal", false)
      updateHandler("token", "")
      updateHandler("otpError", "")
      updateHandler("step", 6)

    } catch (error) {
      const dec = decryptData(error.response.data.data)

      toast.error(dec.message.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "Something went wrong while making the transaction please try again!")
      updateHandler("showOtpModal", false)
      updateHandler("token", "")
    }
  }
  const buttons = () => (
    <div className={styles.btns}>
      <button onClick={handleBack} className={styles.back}>
        Back
      </button>
      <button style={{ opacity: data.disabled && .5 }} disabled={data.disabled} onClick={handleNext} className={styles.continue}>
        Verify & Continue
      </button>
    </div>
  )

  const feeCol = (label, fee, isBold = false) => (
    <div className={styles.feeCol} style={{ marginTop: isBold && "1rem" }}>
      {isBold &&
        <>
          <h5>{label}</h5>
          <h5>{fee}</h5>
        </>
      }
      {!isBold &&
        <>
          <p>{label}</p>
          <p> {fee} </p>
        </>
      }
    </div>
  )

  const feeContent = () => (
    <>
      <div className={`${styles.feeDiv} ${styles.fx}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 10H2M11 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H17M11 19L13 21M11 19L13 17M7 19H5.2C4.07989 19 3.51984 19 3.09202 18.782C2.71569 18.5903 2.40973 18.2843 2.21799 17.908C2 17.4802 2 16.9201 2 15.8V8.2C2 7.0799 2 6.51984 2.21799 6.09202C2.40973 5.71569 2.7157 5.40973 3.09202 5.21799C3.51984 5 4.0799 5 5.2 5H13M13 5L11 7M13 5L11 3" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>


        {(!data.loading || data.feeDetails?.recipient_amount) ? (
          <p style={{ display: "flex" }}>
            {formatAmountWithSymbol(data.feeDetails?.recipient_amount, data.feeDetails?.sending_currency, true)} = {formatAmountWithSymbol(data.feeDetails?.recipient_amount, data.feeDetails?.recipient_currency, true)}
          </p>
        ) : (
          <div style={{ width: "50px" }}>
            <InstaPayLoader />
          </div>
        )}
      </div>

      <div className={`${styles.feeDiv}`}>
        <p style={{ color: "black" }}>Fees & Charges</p>
        {(!data.loading || data.feeDetails?.fee) ? (
          <p>{formatAmountWithSymbol(data.feeDetails?.fee, data.feeDetails?.sending_currency, true)}</p>
        ) : (
          <div style={{ width: "50px" }}>
            <InstaPayLoader />
          </div>
        )}
      </div>

      <div className={`${styles.feeDiv}`}>
        <p style={{ color: "black" }}>Total amount to be deducted</p>
        {(!data.loading || data.feeDetails?.total_amount) ? (
          <p>{formatAmountWithSymbol(data.feeDetails?.total_amount, data.feeDetails?.sending_currency, true)}</p>
        ) : (
          <div style={{ width: "50px" }}>
            <InstaPayLoader />
          </div>
        )}
      </div>

    </>
  )

  console.log(data.feeDetails)

  const renderData = () => (
    <>
      {
        data.step === 6 ?
          <div className={styles.successDiv}>
            <div className={styles.purpleDiv}>
              <img src={logo} alt="" />
              {width > 1000 && <p onClick={handleClose}>Close</p>}
            </div>

            <div style={{ padding: width < 1000 && "0px" }} className={styles.whiteDiv}>
              <div className={styles.content}>
                <div className={styles.textDiv}>
                  <h2>Your payment is being processed</h2>
                  <p>Thanks for using Instapay!</p>
                </div>


                <div className={styles.paymentOptions}>
                  {paymentConfirmOptions.map(option => (
                    <Link to={option.navigate}>
                      <div

                        className={styles.option}
                        key={option.text}
                      >
                        <img src={option.icon} alt="" />
                        <p>{option.text}</p>
                      </div>
                    </Link>


                  ))}

                  {width < 1000 && (
                    <div className={styles.btns}>
                      <button onClick={handleClose} className={styles.continue}>Back to Dashboard</button>
                    </div>
                  )}
                </div>
              </div>

              <DotLottieReact
                src="https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
                backgroundColor="transparent"
                speed="1"
                style={{ width: "225px", height: "225px" }}
                playMode="normal"
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
          :
          <div style={{ width: "100%", display: "flex", flexDirection: width < 1000 ? "column" : "", minHeight: width > 1000 ? "700px" : "91vh" }}>
            <div style={{ display: width < 1000 && "none" }} className={styles.left}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
                <h3 className={styles.label}>Send Money</h3>
                <h2 className={styles.head}>{data.sideText}</h2>
              </div>



              {data.step === 2 && (
                <div className={styles.cardChange}>
                  <div>
                    <p>Pay from</p>
                    <span>
                      Change
                    </span>
                  </div>

                  <div>
                    <img src={card?.type === "premium_plus" ? PremiumLabel : StandardLabel} alt="" />

                    <div>
                      <div>
                        <p>{card?.type === "premium_plus" ? "Premium" : ""}</p>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="12" viewBox="0 0 19 12" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.00635 10.321H11.8271V1.67969H7.00635V10.321Z" fill="#FF5F00" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.31092 6.00006C7.31092 4.24694 8.13381 2.68556 9.4152 1.6794C8.47799 0.943437 7.29562 0.504395 6.0104 0.504395C2.96784 0.504395 0.501465 2.96493 0.501465 6.00006C0.501465 9.03519 2.96784 11.4957 6.0104 11.4957C7.29562 11.4957 8.47799 11.0567 9.4152 10.3207C8.13381 9.3144 7.31092 7.75318 7.31092 6.00006Z" fill="#EB001B" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1572 9.40554V9.19228H18.1014L18.0373 9.33898L17.973 9.19228H17.9171V9.40554H17.9565V9.24464L18.0168 9.38341H18.0576L18.1179 9.24434V9.40554H18.1572ZM17.8036 9.40554V9.22861H17.8752V9.19258H17.6931V9.22861H17.7646V9.40554H17.8036ZM18.3293 6.00006C18.3293 9.03519 15.8627 11.4957 12.8203 11.4957C11.5351 11.4957 10.3526 11.0567 9.41553 10.3207C10.6969 9.31456 11.5198 7.75318 11.5198 6.00006C11.5198 4.2471 10.6969 2.68572 9.41553 1.6794C10.3526 0.943437 11.5351 0.504395 12.8203 0.504395C15.8627 0.504395 18.3293 2.96493 18.3293 6.00006Z" fill="#F79E1B" />
                          </svg>
                        </span>
                      </div>

                      <div>
                        <h4>{formatAmountWithSymbol(data.feeDetails?.total_amount?.replace(/,/g, "") ? (currentCardDetails?.balance - data.feeDetails?.total_amount?.replace(/,/g, "")).toFixed(2) : currentCardDetails?.balance, card?.currency)}</h4>
                        <h4>{card?.last4?.slice(-8)}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.right} style={{ display: "flex", flexDirection: "column", padding: width < 1000 && "0px", gap: width < 1000 && "30px" }}>

              {width < 1000 &&
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ padding: "7.5px", borderRadius: "5px", backgroundColor: "#5926F0" }}>
                    <img src={ctc} alt="" />
                  </span>
                  <h4 style={{ fontSize: "23px", fontWeight: 700, marginBottom: "0px" }}>{data.sideText}</h4>
                </div>
              }

              <div
                className={styles.cont}
                style={{
                  padding: ((data.step === 2 || data.step === 3) && width > 1000) && '24px',
                  background: ((data.step === 2 || data.step === 3) && width > 1000) && "#FAFAFA",
                  boxShadow: ((data.step === 2 || data.step === 3) && width > 1000) && "0px 4px 10px 0px rgba(0, 0, 0, 0.09)",
                  height: "100%",
                  flex: width < 1000 && 1,
                  gap: width < 1000 && "2rem"
                }}
              >
                {data.step === 1 && <RecipientSelect dataHandler={updateHandler} data={data} />}

                {data.step === 2 &&
                  <>
                    <div className={styles.amountDiv}>
                      <div>
                        <h2 style={{ marginBottom: "2rem" }}>Enter the amount</h2>
                        <div className={styles.amount}>
                          <p>Amount</p>
                          <input
                            value={data.amount}
                            onChange={(e) => {
                              updateHandler("getFee", true)
                              if (e.target.value === "") {
                                updateHandler("amount", "");
                                return;
                              }
                              updateHandler("amount", e.target.value);
                            }}
                            onKeyUp={(e) => formatCurrency(e.target.value, false, (value) => updateHandler("amount", value))}
                            onBlur={(e) => formatCurrency(e.target.value, true, (value) => updateHandler("amount", value))}
                            type="text"
                            placeholder='30.00'
                            data-type="currency"
                          />
                        </div>

                        {((+data.feeDetails?.total_amount?.replace(/,/g, "") > +currentCardDetails.balance) && data.feeDetails?.total_amount) &&
                          <p style={{ marginTop: "2rem", color: "red", fontWeight: 600, fontSize: "12px" }}>Insufficient Balance</p>
                        }
                      </div>

                      {width < 1000 &&
                        <div className={styles.feeDetails}>
                          {feeContent()}
                        </div>
                      }
                    </div>

                    {width < 1000 && (
                      <div className={styles.cardChange}>
                        <div>
                          <p>Pay from</p>
                          <span>
                            Change
                          </span>
                        </div>

                        <div>
                          <img src={card.type === "premium_plus" ? PremiumLabel : StandardLabel} alt="" />

                          <div>
                            <div>
                              <p>{card.type === "premium_plus" ? "Premium" : ""}</p>
                              <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="12" viewBox="0 0 19 12" fill="none">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.00635 10.321H11.8271V1.67969H7.00635V10.321Z" fill="#FF5F00" />
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.31092 6.00006C7.31092 4.24694 8.13381 2.68556 9.4152 1.6794C8.47799 0.943437 7.29562 0.504395 6.0104 0.504395C2.96784 0.504395 0.501465 2.96493 0.501465 6.00006C0.501465 9.03519 2.96784 11.4957 6.0104 11.4957C7.29562 11.4957 8.47799 11.0567 9.4152 10.3207C8.13381 9.3144 7.31092 7.75318 7.31092 6.00006Z" fill="#EB001B" />
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1572 9.40554V9.19228H18.1014L18.0373 9.33898L17.973 9.19228H17.9171V9.40554H17.9565V9.24464L18.0168 9.38341H18.0576L18.1179 9.24434V9.40554H18.1572ZM17.8036 9.40554V9.22861H17.8752V9.19258H17.6931V9.22861H17.7646V9.40554H17.8036ZM18.3293 6.00006C18.3293 9.03519 15.8627 11.4957 12.8203 11.4957C11.5351 11.4957 10.3526 11.0567 9.41553 10.3207C10.6969 9.31456 11.5198 7.75318 11.5198 6.00006C11.5198 4.2471 10.6969 2.68572 9.41553 1.6794C10.3526 0.943437 11.5351 0.504395 12.8203 0.504395C15.8627 0.504395 18.3293 2.96493 18.3293 6.00006Z" fill="#F79E1B" />
                                </svg>
                              </span>
                            </div>

                            <div>
                              <h4>{formatAmountWithSymbol(data.feeDetails?.total_amount?.replace(/,/g, "") ? (currentCardDetails?.balance - data.feeDetails.total_amount?.replace(/,/g, "")).toFixed(2) : currentCardDetails?.balance, card?.currency)}</h4>
                              <h4>{card?.last4?.slice(-8)}</h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                }



                {data.step === 3 &&
                  <div className={styles.noteDiv}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <h3>Transaction Note</h3>
                      <div style={{ position: "relative" }}>
                        <textarea value={data.note} onChange={(e) => updateHandler("note", e.target.value)} placeholder='type here..' name="" id=""></textarea>
                        <span>
                          0/200
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: width > 1000 ? "center" : "flex-start", gap: width < 1000 && "7px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00004C1.33325 4.31814 4.31802 1.33337 7.99992 1.33337C11.6818 1.33337 14.6666 4.31814 14.6666 8.00004C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667ZM7.33325 7.33337V11.3334H8.66659V7.33337H7.33325ZM7.33325 4.66671V6.00004H8.66659V4.66671H7.33325Z" fill="#B6B9C8" />
                      </svg>

                      <p>Shown in your Transactions page and shared with your recipient</p>
                    </div>
                  </div>
                }

                {data.step === 4 &&
                  <div style={{ width: "100%" }}>

                    <div className={styles.reviewTexts}>
                      <h4>Review your payment details</h4>
                      <p>Please take a few moments to carefully review and verify the information to your payment details.  </p>
                    </div>
                    <div className={styles.paymentInfo}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                        <p>You Have to Pay</p>
                        <h1>{formatAmountWithSymbol(data.feeDetails?.total_amount, data.feeDetails?.sending_currency)}</h1>
                      </div>


                      <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
                    </div>


                    <div className={styles.confirmFeeDiv}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignSelf: "stretch", alignItems: "center" }}>
                          <p>You are using</p>

                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <div className={styles.cardFlag}>
                              <img src={card.type === "premium_plus" ? PremiumLabel : StandardLabel} alt="" />
                              <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="12" viewBox="0 0 19 12" fill="none">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.00635 10.321H11.8271V1.67969H7.00635V10.321Z" fill="#FF5F00" />
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.31092 6.00006C7.31092 4.24694 8.13381 2.68556 9.4152 1.6794C8.47799 0.943437 7.29562 0.504395 6.0104 0.504395C2.96784 0.504395 0.501465 2.96493 0.501465 6.00006C0.501465 9.03519 2.96784 11.4957 6.0104 11.4957C7.29562 11.4957 8.47799 11.0567 9.4152 10.3207C8.13381 9.3144 7.31092 7.75318 7.31092 6.00006Z" fill="#EB001B" />
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1572 9.40554V9.19228H18.1014L18.0373 9.33898L17.973 9.19228H17.9171V9.40554H17.9565V9.24464L18.0168 9.38341H18.0576L18.1179 9.24434V9.40554H18.1572ZM17.8036 9.40554V9.22861H17.8752V9.19258H17.6931V9.22861H17.7646V9.40554H17.8036ZM18.3293 6.00006C18.3293 9.03519 15.8627 11.4957 12.8203 11.4957C11.5351 11.4957 10.3526 11.0567 9.41553 10.3207C10.6969 9.31456 11.5198 7.75318 11.5198 6.00006C11.5198 4.2471 10.6969 2.68572 9.41553 1.6794C10.3526 0.943437 11.5351 0.504395 12.8203 0.504395C15.8627 0.504395 18.3293 2.96493 18.3293 6.00006Z" fill="#F79E1B" />
                                </svg>
                              </span>

                              <p>{card?.last4?.slice(-6)}</p>

                            </div>
                            <button>Change</button>
                          </div>
                        </div>
                      </div>

                      {feeCol("Sending", formatAmountWithSymbol(data.feeDetails?.recipient_amount, data.feeDetails?.sending_currency))}
                      {feeCol("Transfer fees", formatAmountWithSymbol(data.feeDetails?.fee, data.feeDetails?.sending_currency))}
                      {feeCol("Available Balance after transfer", formatAmountWithSymbol((currentCardDetails?.balance - data.feeDetails?.total_amount).toFixed(2), data.feeDetails?.sending_currency))}
                      {feeCol("Total to Pay", formatAmountWithSymbol(data.feeDetails?.total_amount, data.feeDetails?.sending_currency), true)}
                    </div>

                  </div>
                }

                {data.step === 5 &&
                  <div className={styles.noticeDiv}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
                        <path d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z" stroke="#6039CD" stroke-width="4" stroke-linecap="round" />
                      </svg>
                      <span className={styles.noticeHead}>{t("Notice!")}</span>
                    </div>

                    <div>
                      <p>{t("By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.")}</p>
                      <p style={{ marginTop: "8px" }}>{t("I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.")}</p>
                    </div>
                  </div>
                }



                {(data.step === 2 && width > 1000) ?
                  <div className={styles.feeDetails}>
                    {feeContent()}
                    {buttons()}
                  </div> :
                  data.recipient?.user ?
                    buttons() : null
                }
              </div>

            </div>



          </div>
      }
    </>
  )
  return (
    <>
      <Modal className='ctc-modal' isOpen={isOpen && width > 1000} toggle={handleClose} centered style={{ minWidth: "950px", borderRadius: "16px", height: "100%" }} >
        <ModalBody style={{ borderRadius: "16px", minHeight: data.step !== 6 && '650px', padding: "0px", height: "100%" }}>
          {renderData()}
        </ModalBody>
      </Modal>

      {width < 1000 &&
        <div>
          {renderData()}
        </div>
      }

      <OtpConfirmation
        data={data}
        dataHandler={updateHandler}
        isLoading={data.loading}
        isOpen={data.showOtpModal}
        toggle={() => {
          updateHandler("showOtpModal", false)
          updateHandler("token", "")
          updateHandler("otpError", "")
        }}
        callback={ctcPayment}
        resendHandler={sendOtp}
        error={data.otpError}
      />
    </>
  )
}

export default CardtoCard