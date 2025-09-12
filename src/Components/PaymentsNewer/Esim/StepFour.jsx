import eSimBanner from "./files/eSimBanner.svg"
import styles from "./styles/steptwo.module.scss"
import styles2 from "../AirtimeFlow/styles/steptwo.module.css"
import PlanCard from "./PlanCard"
import info from "./files/info.svg"
import axios from "axios"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const StepFour = ({ data, dataHandler, dataHandlerE }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [showError, setShowError] = useState(null)
  const { t } = useTranslation()

  const verifyNumber = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-public`, {
        data: encryptData({ number: `+${data.eSimData.phone}` })
      })

      const dec = decryptData(res.data.data)
      dataHandler("step", data.step + 1)
      console.log(dec)
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data)
      if (dec.toLowerCase().includes("invalid")) {
        setShowError("Invalid phone number")
      }
      console.log(dec)
    }
  }
  return (
    <div>
      <div style={{ width: "100%", overflow: "hidden" }}>
        <img style={{ maxWidth: "100%" }} src={eSimBanner} alt="" />
      </div>


      <div className={styles.cont}>
        <h3>{t("Enter the consumer's mobile phone number and email address to send eSIM activation and usage information.")}</h3>

        <div style={{ maxHeight: "fit-content", }} className={styles.plans}>
          <div className={styles.inputs}>
            <div className={styles.input}>
              <label htmlFor="">{t("Mobile Number")}</label>
              <input
                value={data.eSimData.phone}
                type="number"
                inputMode="numeric"
                onChange={(e) => {
                  dataHandlerE("phone", e.target.value)
                  setShowError(null)
                }}
              />
            </div>


            {showError && <p style={{ color: "red", fontSize: "12px", marginBottom: "0px" }}>{t(showError)}</p>}

            <div className={styles.input}>
              <label htmlFor="">{t("Email Address")}</label>
              <input value={data.eSimData.email} onChange={(e) => {
                dataHandlerE("email", e.target.value)
              }} type="text" />
            </div>
          </div>
          <PlanCard data={data} plan={data?.eSimData?.selectedPlan} handlePlanSelect={() => { }} />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div className={styles2.info}>
            <img src={info} alt="" />
            <span>{t("Trouble buying an E-SIM?")}</span>
          </div>

          <div className={styles2.btns}>
            <span
              onClick={() => {
                dataHandler("step", data.step - 1)
                dataHandlerE("region", "")
              }}
              className={styles2.back}
            >
              {t("Back")}
            </span>
            <button onClick={() => {
              if (data.eSimData.phone) {
                verifyNumber()
              } else {
                dataHandler("step", data.step + 1)
              }
            }} disabled={(!data?.eSimData?.selectedPlan?.productId || (data.eSimData.email?.length > 0 && !emailRegex.test(data.eSimData.email)))} className={styles2.nxt}>
              {t("Next")}
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                <path d="M1.7876 1.5625L7.47528 6.97362C7.88959 7.36778 7.88959 8.02847 7.47528 8.42262L1.7876 13.8337" stroke="white" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepFour
