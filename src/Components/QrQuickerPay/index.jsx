import { useEffect, useState } from "react"
import ip from "../PaymentAddressPublic/instapay_black.svg"
import styles from "./styles/index.module.scss"
import r from "./r.svg"
import fail from "./faile.svg"
import success from "./success.svg"
import { paymentConfirmOptions } from "../MyMasterCard/PaymentModal/SuccessStep"
import { useNavigate, useParams } from "react-router"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import { startAuthentication } from "@simplewebauthn/browser"

const QrQuickerPay = () => {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(1.00)
  const { wallet_id } = useParams()
  const navigate = useNavigate()
  const [isPressed, setIsPressed] = useState(false)
  const [userDetails, setUserDetails] = useState({})
  const [token, setToken] = useState(null)

  useEffect(() => {
    const getWalletDetails = async () => {
      try {
        const data = {
          wallet_id: wallet_id,
        }

        const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-wallet-details-public`, { data: encryptData(data) })
        const dec = decryptData(res.data.data)


        console.log(dec)
      } catch (error) {
        const dec = decryptData(error.response.data.data)
        console.log(dec)
      }
    }

    getWalletDetails()
  }, [wallet_id])

  const handleBiometricVerification = async () => {
    try {
      setIsPressed(true)



      const response1 = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/login-biometric-challenge`, {
        data: encryptData({})
      })

      const dec1 = await decryptData(response1.data.data)

      const credentials = await startAuthentication(dec1.options)

      console.log(dec1)
      const verificationData = {
        account_id: dec1.account_id,
        credentials,
      }

      console.log(verificationData)


      const response2 = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/login-biometric-verify`, {
        data: encryptData(verificationData)
      })

      const dec2 = await decryptData(response2.data.data)

      const token = dec2?.token
      axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/auth/${token}`)
        .then(async res => {
          const dec = decryptData(res.data.data)
          localStorage.setItem("token", token)
          setUserDetails(dec)
        })
        .catch(err => {
          // console.log(decryptData(err.response.data.data))
          setIsPressed(false)
          toast.error("Something went wrong while getting account details")
        })


    } catch (error) {
      const dec = decryptData(error?.response?.data?.data)
      console.log(dec)
      toast.error("Biometric verification failed");
    }
    finally {
      setIsPressed(false)
    }
  };

  return (
    <div className={styles.cont}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src={ip} alt="" />
        <h1>Qr Quicker Pay</h1>
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
          <img src="https://thispersondoesnotexist.com/" alt="" />
          <div>
            <h5>Mohammad Yaseen</h5>
            <span>yaseen123</span>
            <span>Pakistan</span>
          </div>
        </div>

        {step === 1 &&
          <div className={styles.amountBox}>
            <span>Type Your Amount</span>

            <div>
              <p>USD</p>
              <input type="text" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          </div>
        }

        {step !== 1 &&
          <div className={styles.feeW}>

            <div className={styles.walletDets}>
              <span>You used</span>

              <div>

                <span className={styles.curr}>USD Wallet</span>
                <span className={styles.id}>323fs</span>
              </div>
            </div>
            <div className={styles.fee}>
              <span>Fees</span>
              <span>USD 0.00</span>
            </div>
            <div className={styles.fee}>
              <span>Fees</span>
              <span>USD 0.00</span>
            </div>
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

      <div className={styles.btns}>
        {step !== 3 &&
          <button onClick={() => {
            if (step === 1) {
              setStep(2)
            }
            else {

            }
          }}>
            {step === 1 ? "Next" : "Authenticate & Confirm"}
          </button>
        }
        {step === 2 && <button onClick={() => navigate(`/q/${wallet_id}?login_flow=true`)} style={{ marginTop: "10px" }}>Proceed via login</button>}
      </div>
    </div>
  )
}

export default QrQuickerPay
