import React from 'react'
import styles from "./styles/receipt.module.scss"
import ipLogo from './files/iplogo.svg'
import eSimBanner from './files/eSimBanner.svg'
import receiptBg from "../AirtimeFlow/files/rec_bg.png"
import styles2 from "../AirtimeFlow/styles/steptwo.module.css"
import useWindowWidth from '../../../utils/useWindowWidth'
import { useTranslation } from 'react-i18next'

const Receipt = ({ data, dataHandler, createTransaction }) => {
  const {t} = useTranslation()

  const width = useWindowWidth()

  const detsJSX = (label, val, purple) => (
    <div className={`${styles.dets}  ${purple ? styles.purple : ""}`}>
      <span>{label}</span>
      <span>{val}</span>
    </div>
  )

  return (
    <div>

      <div style={{ width: "100%", overflow: "hidden" }}>
        <img style={{ maxWidth: "100%" }} src={eSimBanner} alt="" />
      </div>

      <div style={{ flexDirection: width < 700 && 'column' }} className={styles.cont}>

        <div style={{ width: width < 700 && '100%' }} className={styles.receipt}>
          <div style={{ background: `url(${receiptBg})`, }} className={styles.top}>
            <img src={ipLogo} alt="" />
          </div>


          <div className={styles.middle}>
            <h3>{t("eSIM QR Code Receipt")}</h3>
            <div className={styles.qrBox}>
              <div>
                <h3>{t("Scan this OR code to install the eSIM")}</h3>
                <p>{t("When you arrive at your destination, remember to turn on data roaming in your device settings")}</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
                  <path d="M2.70711 2.02727C2.31658 1.63674 1.68342 1.63674 1.29289 2.02727C0.902369 2.41779 0.902369 3.05096 1.29289 3.44148L2.70711 2.02727ZM10.0087 11.7431C10.561 11.7431 11.0087 11.2954 11.0087 10.7431L11.0087 1.7431C11.0087 1.19081 10.561 0.743099 10.0087 0.743099C9.45644 0.743099 9.00872 1.19081 9.00872 1.7431V9.7431H1.00872C0.456439 9.7431 0.00872362 10.1908 0.00872362 10.7431C0.00872362 11.2954 0.456439 11.7431 1.00872 11.7431L10.0087 11.7431ZM1.29289 3.44148L9.30162 11.4502L10.7158 10.036L2.70711 2.02727L1.29289 3.44148Z" fill="#5926F0" />
                </svg>
              </div>
            </div>

            {data.eSimData.phone &&
              detsJSX(t("Your eSIM Phone Number:"), data.eSimData.phone, true)
            }
            {detsJSX(t("Plan"), data.eSimData.selectedPlan.name)}
            {detsJSX(t("Operator"), data.eSimData.selectedPlan.operator)}
            {/* {detsJSX("Country", data.eSimData.selectedPlan.country)}
            {detsJSX("Plan", "1 GB 7 days Europe")} */}
          </div>

          <div className={styles.bottom}>
            <h4>{t("©2024 | KEMIT KINGDOM SA")}</h4>
            <p>{t("If you encounter any problems, please contact us at")}</p>
            <h4>{t("support@insta-pay.ch")}</h4>
          </div>
        </div>

        <div className={styles.transaction_details}>
          <div>
            <span>{t("Sending")}</span>
            <span> {data.package_details?.data?.sending?.currency} {data.package_details?.data?.sending?.value}</span>
          </div>
          <div>
            <span>{t("Transfer Fees")}</span>
            <span> {data.package_details?.data?.fee?.currency} {data.package_details?.data?.fee?.value}</span>
          </div>
          <div>
            <span>{t("Estimated Time")}</span>
            <span>{t("Within Minutes")}</span>
          </div>
          <div>
            <span>{t("Total Amount")}</span>
            <span> {data.package_details?.data?.total?.currency} {data.package_details?.data?.total?.value}</span>
          </div>
        </div>


      </div>


      <div className={styles2.btns} style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
        <span
          onClick={() => {
            dataHandler("step", data.step - 1)
          }}
          className={styles2.back}
        >
          {t("Back")}
        </span>
        <button
          onClick={() => createTransaction()}
          className={styles2.nxt}
          disabled={data.loading}
        >
          {t("Next")}
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M1.7876 1.5625L7.47528 6.97362C7.88959 7.36778 7.88959 8.02847 7.47528 8.42262L1.7876 13.8337" stroke="white" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Receipt
