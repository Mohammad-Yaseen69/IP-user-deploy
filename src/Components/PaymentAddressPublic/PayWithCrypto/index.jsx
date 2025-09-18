import React, { useEffect, useMemo, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import styles from "./styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import { ButtonForRequests, Select, TextInput } from '../../ReceiptInvoices/UI/FormElements'
import PhoneInput from '../../PhoneInput'
import { reasons } from '../../PaymentsNewer/AmountAndCurrency'
import clockSvg from './clock.svg'
import copy from "./copy.svg"
import qr from "./qr.png"
import { toast } from "react-toastify"
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { formatCurrency } from '../../../Helper/AmountFormat'

const PayWithCrypto = ({ user, data, dataHandler }) => {
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [secondsLeft, setSecondsLeft] = useState(30 * 60)
    const [usdtAmount, setUsdtAmount] = useState(null)
    const [amtLoading, setAmtLoading] = useState(false)

    useEffect(() => {
        if (step !== 2) return;
        if (secondsLeft <= 0) return;
        const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
        return () => clearInterval(id)
    }, [step, secondsLeft])

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const ss = s % 60
        return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    }





    useEffect(() => {
        let cancelled = false
        const fetchAmount = async () => {
            try {
                setAmtLoading(true)
                const url = `${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${data.currentWallet?.currency?.code || data.currencyCode}&to=${"USD"}&amount=${data?.amount}`
                const res = await axios.get(url)
                const dec = decryptData(res?.data?.data)
                if (!cancelled) setUsdtAmount(dec?.exchangeRate?.exchanged_amount ?? 0)
            } catch (_) {
                if (!cancelled) setUsdtAmount(0)
            } finally {
                if (!cancelled) setAmtLoading(false)
            }
        }
        if (data?.amount && (data.currentWallet?.currency?.code || data.currencyCode)) {
            fetchAmount()
        }
        return () => { cancelled = true }
    }, [data.currentWallet?.currency?.code, data.currencyCode, data.amount])

    return (
        <Modal isOpen={data.showCryptoModal} style={{ minWidth: "800px" }} toggle={() => dataHandler("showCryptoModal", false)} >
            <ModalBody>
                <div className={styles.container}>
                    <div className={styles.left}>
                        <h3>
                            {t("Pay as Crypto")}
                        </h3>
                        <span>
                            {t("By sending a payment. You agree to InstaPay:")}
                            {" "}
                            <a href="https://insta-pay.ch/terms-and-conditions" target="_blank" rel="noreferrer">
                                {t("Terms and conditions")}
                            </a>.
                        </span>
                    </div>
                    <div className={styles.right}>
                        {
                            step === 1 &&
                            <div>
                                <h3>
                                    {t("Personal details")}
                                </h3>
                                <p>
                                    {t("Please finalize your payment by entering the required personal information.")}
                                </p>

                                <div>
                                    <label htmlFor="name">{t("Full Name")}{"*:"}</label>
                                    <TextInput
                                        styles={{ background: "#f7f7f7" }}
                                        id='name'
                                        placeholder={"Enter your Name"}
                                        value={data?.cryptoDetails?.name}
                                        onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="">{t("Phone Number with country code")}{"*:"}</label>
                                    <PhoneInput
                                        phone={data?.cryptoDetails?.phone}
                                        setPhone={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, phone: e })}
                                        country={localStorage.getItem("ip_country") ?? "USA"}
                                        setCountry={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, country: e })}
                                        customStyles={{
                                            background: "#f7f7f7",
                                            boxShadow: "none",
                                            border: "1px solid rgb(229, 231, 235)",
                                            padding: "12px"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email">{t("Email (Optional)")}</label>
                                    <TextInput
                                        styles={{ background: "#f7f7f7" }}
                                        id='email'
                                        placeholder={"eg: info@google.com"}
                                        value={data?.cryptoDetails?.email}
                                        onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email">{t("Payment Purpose")}{"*:"}</label>
                                    <Select
                                        placeholder={t("Select Purpose of Payment")}
                                        value={data?.cryptoDetails?.reason}
                                        onChange={(e) => dataHandler("cryptoDetails", { ...data.cryptoDetails, reason: e.target.value })}
                                        options={Object.keys(reasons).map(i => (
                                            {
                                                value: i,
                                                label: t(reasons[i])
                                            }
                                        ))}
                                        style={{
                                            background: "#f7f7f7"
                                        }}
                                    />
                                </div>
                            </div>
                        }

                        {step === 2 && (
                            <div style={{ width: "100%" }}>

                                <div className={styles.timer}>
                                    <img src={clockSvg} alt="clock" width={16} height={16} />
                                    {formatTime(secondsLeft)} {t("Left")}
                                </div>

                                <div className={styles.amount}>
                                    <div style={{ padding: "0px" }} className={styles.left}>
                                        <span>{t("Total amount to pay")}</span>
                                        <div>
                                            <h2>{amtLoading ? "..." : (formatCurrency(usdtAmount) ?? 0)}</h2>
                                            <span>USDT(TRC20)</span>
                                        </div>
                                    </div>
                                    <div className={styles.qr}>
                                        <img src={qr} alt="" />
                                        <p>{t("Scan to pay")}</p>
                                    </div>
                                </div>

                                <p style={{ margin: "20px 0 10px 0", fontWeight: 700, color: "black", textAlign: "center" }}>TRC20 Network only</p>
                                <div className={styles.id}>
                                    <span id="crypto-address" style={{ flex: 1, wordBreak: "break-all" }}>TKBYYHJmpQjkBELSJTpmiEJE78K7F9ov7f</span>
                                    <img
                                        src={copy}
                                        alt="copy"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            const addr = document.getElementById("crypto-address")?.textContent || ""
                                            if (!addr) return
                                            navigator.clipboard.writeText(addr)
                                                .then(() => toast.success(t("Copied to clipboard")))
                                                .catch(() => toast.error(t("Failed to copy")))
                                        }}
                                    />
                                </div>

                                <div className={styles.statusDiv}>
                                    <div>
                                        <p>{t("Status")}</p>
                                        <span>{t("Not Completed")}</span>
                                    </div>
                                    <div>
                                        <p>{t("Payment purpose")}</p>
                                        <p style={{ marginBottom: 0 }}>{reasons[data.cryptoDetails?.reason]}</p>
                                    </div>
                                </div>
                            </div>
                        )}


                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%" }}>
                            <button
                                style={{
                                    width: "100%",
                                    background: "#e9ecef",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "4px",
                                    padding: "12px"
                                }}
                                onClick={() => (step === 2 ? setStep(1) : dataHandler("showCryptoModal", false))}
                            >
                                {step === 2 ? t("Back") : t("Cancel")}
                            </button>
                            {
                                step === 1 ? (
                                    <ButtonForRequests style={{ borderRadius: "4px" }} onClick={() => setStep(2)} isLoading={!data.cryptoDetails?.reason || !data.cryptoDetails?.phone || !data.cryptoDetails?.name}>
                                        {t("Next")}
                                    </ButtonForRequests>
                                ) : (
                                    <ButtonForRequests style={{ borderRadius: "4px" }} onClick={() => dataHandler("showCryptoModal", false)}>
                                        {t("Next")}
                                    </ButtonForRequests>
                                )
                            }
                        </div>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PayWithCrypto
