import { useContext, useEffect, useState } from "react"
import ip from "../PaymentAddressPublic/instapay_black.svg"
import styles from "./styles/index.module.scss"
import r from "./r.svg"
import { Eye, EyeOff } from "react-feather";
import success from "./success.svg"
import { paymentConfirmOptions } from "../MyMasterCard/PaymentModal/SuccessStep"
import { useNavigate, useParams } from "react-router"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import { startAuthentication } from "@simplewebauthn/browser"
import { Input, Modal, ModalBody, ModalHeader } from "reactstrap"
import PhoneInput from "../PhoneInput"
import { countries } from "country-list-json"
import { UserContext } from "../../Context/UserContext"
import { formatCurrency } from "../../Helper/AmountFormat"
import { ArrowLeft } from "react-feather"
import countriesData from "../PaymentsNewer/CountriesData.json"
import InstaPayLoader from "../Loader"
import { getDecimalPointIndex } from "../../Helper/getDecimalIndex"
import useWindowWidth from "../../utils/useWindowWidth"
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation"

const QrQuickerPay = () => {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(0.00)
  const { wallet_id } = useParams()
  const navigate = useNavigate()
  const [isPressed, setIsPressed] = useState(false)
  const [userDetails, setUserDetails] = useState({})
  const [token, setToken] = useState(null)
  const [showDetsModal, setShowDetsModal] = useState(false)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [recipientDets, setRecipientDets] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")
  const [limitErrors, setLimitErrors] = useState(false)
  const windowWidth = useWindowWidth()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const getWalletDetails = async () => {
      try {
        const data = {
          wallet_id: wallet_id,
        }

        const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-details-wallet-public`, { data: encryptData(data) })
        const dec = decryptData(res.data.data)
        const file = countriesData.find(item => item.name.toLowerCase() === dec?.walletDetails?.country?.toLowerCase())?.file_url
        setRecipientDets({ ...dec.walletDetails, file })
        console.log(dec)
      } catch (error) {

      }
    }

    getWalletDetails()
  }, [wallet_id])


  const [feeData, setFeeData] = useState(null);

  const getFeeDetails = async (sender_wallet_id, from, tokenApi, account_id, level) => {
    const apiHeaders = {
      "Authorization": `Bearer ${tokenApi || token}`,
      "source": "user"
    }
    setFeeData({})

    console.log(Number(amount?.replace(",", "")))

    try {
      const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${from || userDetails?.walletDetails?.currency?.code}&to=${recipientDets?.currency?.code}&amount=${Number(amount?.toString()?.replaceAll(",", ""))}&payment_method=request&account_id=${account_id || userDetails?._id}&type=qr_pay&receiver_wallet_id=${recipientDets._id}&sender_wallet_id=${sender_wallet_id || userDetails?.walletDetails?._id}&payment_type=wallet&level_id=${level || userDetails?.level_id}`;
      const res = await axios.get(url, { headers: apiHeaders });
      const dec = decryptData(res.data.data);

      const exchange_rate_details = {
        exchange_rate: dec?.data?.exchanged_rate?.value,
        receiver: { currency: dec?.data?.recipient?.currency, amount: dec?.data?.recipient?.value },
        fee: { amount: dec?.data?.fee?.value ?? 0.00, currency: dec?.data?.fee?.currency },
        sending: { amount: dec?.data?.sending?.value, currency: dec?.data?.sending?.currency },
        total: dec?.data?.total?.value,
        min_amount: dec?.data?.min_amount,
        max_amount: dec?.data?.max_amount,
        token: dec?.data?.token ?? ""
      };


      if (dec?.localStorage === false && phone) {
        localStorage.setItem("phone", phone)

        const localphone = localStorage.getItem("phone")
        console.log(localphone, "local storage value")
      }
      setFeeData(exchange_rate_details);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      if (typeof dec?.message === "object") {
        if (dec?.message?.[0]?.code === "1003007") {
          toast.error("Payer unavailable");
          return;
        }
        toast.error("Something went wrong");
        return;
      }
      if (dec?.message?.toLowerCase()?.includes("insufficient")) {
        toast.error("Insufficient balance");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("exceeds max") ||
        dec?.message?.toLowerCase()?.includes("above the max")
      ) {
        toast.error("Amount exceeds maximum allowed");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("below the min") ||
        dec?.message?.toLowerCase()?.includes("below the max")
      ) {
        toast.error("Amount below minimum allowed");
        return;
      }
      toast.error(dec?.message || "Something went wrong");
      setFeeData(null);
      return;
    }
  };

  const confirmTransaction = async (token, apiHeaders) => {
    const data = {
      token,
      otp: "11212",
      type: "authenticator",
      auth_type: "biometric"
    }

    const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/insta-wallet-to-wallet`, { data: encryptData(data) }, {
      headers: apiHeaders
    })

    const dec = decryptData(res.data.data)
    // setCompleted(true)
    // setStatus(dec?.status)
    setStep(prev => prev + 1)
    console.log(dec)
  }

  const sendOtpSkip = async () => {
    setIsPressed(true)
    const apiHeaders = {
      "Authorization": `Bearer ${token}`,
      "source": "user"
    }
    try {
      const payload = {
        "data": {
          "receiver_wallet_id": recipientDets?.wallet_id,
          "sender_wallet_id": userDetails?.walletDetails?._id,
          "purpose": "OTHERS",
          "amount": Number(amount?.toString()?.replaceAll(",", "")),
          "type": "instant",
          "payment_type": "qr_pay",
          "description": "",
          "token": feeData?.token
        },
        "type": "authenticator",
        "auth_type": "biometric"
      }

      console.log(payload)
      const encrypted = encryptData(payload)
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/send-otp`, {
        data: encrypted
      }, {
        headers: apiHeaders
      })

      const dec = decryptData(res.data.data)
      await confirmTransaction(dec.token, apiHeaders)
      console.log(dec)
    } catch (error) {
      console.log(error)
      const dec = decryptData(error.response.data.data)
      const err = LimitsErrorMessage(dec.message)

      if (err) {
        setError(err)
        setLimitErrors(true)
        return setShowModal(true)
      }
      if (dec?.message?.toLowerCase()?.includes("exceeded")) {
        setError("The transaction amount exceeds your QR payment threshold amount.")
        return setShowModal(true)
      }
      toast.error(dec.message || "Something went wrong")
    }
    finally {
      setIsPressed(false)
    }
  }


  const handleBiometricVerification = async () => {
    try {
      setIsPressed(true)
      const localPhone = localStorage.getItem("phone");

      const payload = {
        qr_quicker_pay: true
      }
      if (phone && password) {
        payload.phone = phone;
        payload.password = password;
      }
      else if (localPhone) {
        payload.phone = localPhone;
        payload.localstorage = true;
      }

      const response1 = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/login-biometric-challenge`, {
        data: encryptData(payload)
      })

      const dec1 = await decryptData(response1.data.data)

      const credentials = await startAuthentication(dec1.options)

      console.log(dec1)

      const getDetails = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-biometric-details`, { data: encryptData({ credentials }) })
      const dec2 = decryptData(getDetails.data.data)

      console.log(dec2)

      if (dec2.user?.walletDetails?.wallet_id === recipientDets?.wallet_id) {
        toast.error("You cannot send money to your own wallet")
        setIsPressed(false)
        return
      } else {
        setStep(prev => prev + 1)
        getFeeDetails(dec2?.user?.walletDetails?._id, dec2?.user?.walletDetails?.currency?.code, dec2?.token, dec2?.user?._id, dec2?.user?.level_id)
        setShowDetsModal(false)
        setToken(dec2.token)
        setUserDetails(dec2.user)
      }
    } catch (error) {
      setIsPressed(false)
      const dec = decryptData(error?.response?.data?.data)
      if (dec?.message?.toLowerCase()?.includes("cookie")) {
        return setShowDetsModal(true)
      }
      if (dec?.message?.toLowerCase()?.includes("user not found")) {
        return toast.error("You have entered wrong phone number")
      }
      if (dec?.message?.toLowerCase()?.includes("password")) {
        return toast.error("You have entered wrong password")
      }
      if (dec?.message?.toLowerCase()?.includes("quickerqrpay is disabled")) {
        setError("Quicker QR pay is inactive in your account, please enable it from settings/payment threshold for quick payments.")
        return setShowModal(true)
      }


      console.log(dec)
      toast.error("Biometric verification failed");
    }
    finally {
      setIsPressed(false)
    }
  };

  const { allowedCountries } = useContext(UserContext)

  const [country, setCountry] = useState({})

  useEffect(() => {
    const getCountryDetails = async () => {
      const ipBasedStoredCountry = localStorage.getItem("ip_country")
      if (ipBasedStoredCountry?.length === 3) {
        setCountry(ipBasedStoredCountry)
      } else {
        try {
          const res = await axios.get(`https://ipinfo.io?token=${process.env.REACT_APP_IP_INFO_TOKEN}`)
          const location = res.data;


          console.log(res.data)

          if (location) {
            const findCOuntry = countries.find(item => item?.code === location?.country)

            if (findCOuntry) {
              const foundCount = allowedCountries?.find(item => item?.country_name?.toLowerCase() === findCOuntry?.name?.toLowerCase() || item?.country_name?.toLowerCase()?.includes(findCOuntry?.name?.toLowerCase()))
              if (foundCount?.country_iso_code) {
                localStorage.setItem("ip_country", foundCount?.country_iso_code)
              }
              setCountry(foundCount?.country_iso_code ?? localStorage.getItem("ip_country"))
            }
          }
        } catch (error) {
          const res = await fetch("https://geolocation-db.com/json/")
          const data = await res.json()
          const filteredCountry = allowedCountries.filter(item => item.country_name.toLowerCase().includes(data?.country_name?.toLowerCase()))?.[0]?.country_iso_code
          if (filteredCountry) {
            localStorage.setItem("ip_country", filteredCountry)
          }
          setCountry(filteredCountry ?? localStorage.getItem("ip_country"))
        }
      }
    }
    if (allowedCountries?.length > 0) {
      getCountryDetails()
    }
  }, [allowedCountries])

  const handleKeyUp = (e) => {
    formatCurrency(e.target.value, false, setAmount);
    e.target.size = Math.max(e.target.value.length, 1);
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, setAmount, true, e);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    // let base = 16;
    // let extra = Math.max(0, value.length - 3) * 4;
    // let total = Math.min(base + extra, 90);
    // setWidth(`${total}%`);
    e.target.size = Math.max(e.target.value.length, 1);
  };


  const feeJSX = (label, curr, value, fx, total) => {

    return (
      <div style={{ padding: total && "10px", border: total && "1px solid #00000026", borderRadius: total && "6px" }} className={styles.fee}>
        <span>{label}</span>
        <span>{curr}
          {
            fx
              ?
              value
              :
              value >= 0.01 ? value.toFixed(2) : value.toFixed(getDecimalPointIndex(value))
          }

        </span>
      </div>
    )
  }


  return (
    <div style={{ position: 'relative' }} className={styles.cont}>

      <Modal isOpen={showModal}>
        <ModalBody>
          <h2 style={{ color: "red" }}>
            Oops!
          </h2>
          <p style={{ fontWeight: 600, fontSize: "15px", color: "#6f6f6f" }}>{error}</p>

          <div style={{ display: "flex", gap: "10px", flexDirection: windowWidth < 400 && "column", marginTop: "2rem" }}>
            {(error.toLowerCase().includes("inactive") || limitErrors) &&
              <button
               onClick={() => {
                setStep(1)
                setShowModal(false)
                setLimitErrors(false)
                setError("")
              }} style={{ background: "#5926f0", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Change Amount
              </button>
            }
            <button onClick={() => navigate(`/q/${wallet_id}?login_flow=true`)} style={{ background: "#ff4b4b", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Login and Continue
            </button>
          </div>
        </ModalBody>
      </Modal>

      {step === 2 &&
        <div style={{ position: "absolute", top: "20px", left: "20px", cursor: "pointer" }} onClick={() => setStep(1)}>
          <ArrowLeft />
        </div>
      }
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src={ip} alt="" />
        <h1>Quicker QR Pay</h1>
        {step === 1 &&
          <div className={styles.detsText}>
            <h3>Merchant Details</h3>
            <p>Please take a few moments to carefully verify the information to your payee details.</p>
          </div>
        }


        {step === 3 &&
          <div className={styles.statusDiv}>
            <div className={styles.circle}>
              <img src={r} alt="" />
              <span>
                {/* tick */}
                <img src={success} alt="" />

                {/*  */}
              </span>
            </div>

            <div>
              <h5>Your payment is confirmed</h5>
              <p>Thanks for using InstaPay!</p>
            </div>
          </div>
        }


        {step !== 1 && <span className={styles.label}>Recipient Details:</span>}
        <div style={{ margin: step !== 1 && "0 0 20px 0" }} className={styles.infoBox}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <img style={{ height: "48px", borderRadius: "100%" }} src={recipientDets?.profilePicture} alt="" />
            <div style={{ width: "100%" }}>
              <h5 style={{ textAlign: "left", fontSize: recipientDets?.name?.length > 20 && "smaller" }}>{recipientDets?.name}</h5>
              <span>@{recipientDets?.username}</span>
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><img style={{ width: "20px", height: "20px", borderRadius: "0" }} src={recipientDets.file} alt="" /> {recipientDets?.country}</span>
                <p onClick={() => navigate(`/profile/${recipientDets?.username}`)} style={{ marginBottom: "0", fontWeight: 600, color: "#5926f0", cursor: "pointer" }}>View Profile</p>
              </div>
            </div>
          </div>
        </div>

        {step === 1 &&
          <div className={styles.amountBox}>
            <span>Type Your Amount</span>
            <div>
              <p>{recipientDets?.currency?.code}</p>

              <input
                type="text"
                value={amount}
                // style={{ width }}
                onChange={handleAmountChange}
                onKeyUp={handleKeyUp}
                size={"1"}
                onBlur={handleBlur}
              />
            </div>
          </div>
        }

        {step !== 1 &&
          <div className={styles.feeW}>

            <div className={styles.walletDets}>
              <span>
                {step === 2 ? "You are using" : " You used"}
              </span>

              <div>
                <span className={styles.curr}>{userDetails?.walletDetails?.currency?.code} Wallet</span>
                <span className={styles.id}>{userDetails?.walletDetails?.wallet_id}</span>
              </div>
            </div>

            {feeData?.token ?
              <>
                {feeJSX("Sending Amount", feeData?.sending?.currency, feeData?.sending?.amount)}
                {feeJSX("Fees", feeData?.fee?.currency, feeData?.fee?.amount)}
                {(feeData?.exchange_rate && feeData?.exchange_rate !== 1) && feeJSX("Exchange Rate", feeData?.receiver?.currency, feeData?.exchange_rate, true)}
                {feeJSX("Receiving Amount", feeData?.receiver?.currency, feeData?.receiver?.amount)}
                {feeJSX("Total", feeData?.sending?.currency, feeData?.total, false, true)}
              </> :
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "200px" }}>
                <InstaPayLoader />
              </div>
            }
          </div>
        }

        {step === 3 &&
          <div className={styles.options}>
            {paymentConfirmOptions.map(option => (
              <div onClick={() => !option.link && navigate(option.navigate)} key={option.text}>
                <img src={option.icon} alt="" />
                <span>
                  {option.link ? <a style={{ color: "black" }} href={option.navigate}>{option.text}</a> : option.text}
                </span>
              </div>
            ))}
          </div>
        }
      </div>

      <Modal isOpen={showDetsModal} toggle={() => setShowDetsModal()}>

        <ModalHeader>
          <h5 style={{ marginBottom: "4px", fontWeight: 700, fontSize: "18px" }}>Enter Your Details</h5>
          <p style={{ fontWeight: 600, color: "darkgray", color: "#757272", lineHeight: '18px', marginBottom: '0' }}>Please enter your Instapay account credentials for security purpose. you only have to enter your credentials once to use Qr Quicker Pay</p>
        </ModalHeader>
        <ModalBody>


          <div>
            <label htmlFor="" style={{ fontWeight: 600 }}>Phone Number</label>
            <PhoneInput
              phone={phone}
              setPhone={setPhone}
              country={country}
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="" style={{ fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"}
                style={{ 
                  padding: "1rem", 
                  boxShadow: '0px 4px 11px 0px rgba(0, 0, 0, 0.16), 0px 0px 4px 6px #FDFDFD inset', 
                  fontWeight: 800 
                }} 
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              className={styles.modalbtn}
              disabled={!password || !phone || isPressed}
              style={{ opacity: (!password || !phone || isPressed) && ".5" }}
              onClick={handleBiometricVerification}
            >Continue</button>
          </div>
        </ModalBody>
      </Modal>

      <div className={styles.btns}>
        {step !== 3 &&
          <button
            disabled={isPressed || !amount || /^0+$/.test(amount.toString().replace(/\./g, ''))}
            style={{ opacity: (isPressed || !amount || /^0+$/.test(amount.toString().replace(/\./g, ''))) && ".5" }}
            onClick={() => {
              if (step === 1) {
                if (!userDetails._id) {
                  handleBiometricVerification()
                }
                else {
                  getFeeDetails()
                  setStep(prev => prev + 1)
                }
              }
              else {
                sendOtpSkip()
              }
            }}>
            {step !== 1 ? "Next" : "Authenticate & Proceed"}
          </button>
        }
        {step === 1 &&
          <p onClick={() => navigate(`/q/${wallet_id}?login_flow=true`)} style={{ marginTop: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer", textAlign: "center", color: "#5926f0" }}>
            Quicker QR pay not active? login and continue.
          </p>
        }
      </div>
    </div>
  )
}

export default QrQuickerPay