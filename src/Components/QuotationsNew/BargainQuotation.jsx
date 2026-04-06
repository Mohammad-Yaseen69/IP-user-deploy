import { Modal, ModalBody } from "reactstrap"
import styles from "./styles/BargainQuotation.module.css"
import { useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../Context/UserContext"
import bargain from "./files/bargain.svg"
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import ins from "./files/ins.svg"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem"
import { Link } from "react-router-dom"
import int_styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import paym_styles from "../PaymentsNewer/InternationalFlow/styles/index.module.css"
import recent from "../PaymentsNewer/Mobile/files/recent.svg"
import success from "../PaymentsNewer/InternationalFlow/files/success.gif"
import { capitalizeStatus } from "../PendingNew/ItemMobile"

const counterTypes = ["10", "25", "50", "75", "Custom Amount"];
let timeout;

const BargainQuotation = ({ item, isOpen, toggle, type = "bargain", badgeColor = "" }) => {
    const { t } = useTranslation()
    const { authHeader, verifyToken } = useContext(UserContext)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const [counterType, setCounterType] = useState("")
    const [counterAmount, setCounterAmount] = useState(item?.amount)
    const [error, setError] = useState("")

    useEffect(() => {
        setCounterAmount(item?.amount)
    }, [item])

    useEffect(() => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            if (counterAmount) {
                let value = counterAmount;
                if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
                    return;
                }
                else {
                    if (!String(value).includes(".")) {
                        value = `${value}.00`
                    }
                    if (String(value).endsWith(".")) {
                        value = `${value}00`
                    }
                    if (String(value).split(".")?.[1]?.length === 1) {
                        value = `${value}0`
                    }
                    setCounterAmount(value)
                }
            }
        }, 700)

        return () => {
            clearTimeout(timeout)
        }
    }, [counterAmount])


    const counterOffer = async () => {
        setSaving(true)
        try {
            const data = {
                revised_amount: counterAmount,
                quotation_id: item?._id
            }
            const encrypted = encryptData(data)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/quotation/${type}`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const decrypted = decryptData(response.data.data)
            console.log(decrypted)
            setStep(2)
        } catch (error) {
            console.log(error)
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            if (dec?.message?.startsWith("s")) {
                setError("Your sending limit has been reached!")
            }
            else if (dec?.message?.startsWith("r")) {
                setError("Receiver's receiving limit has been reached!")
            }
            else {
                setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
            }
        }
        finally {
            setSaving(false)
        }
    }
    const inputRef = useRef(null)
    return (
        window.innerWidth > 1000
            ?
            <Modal isOpen={isOpen} style={{ width: "100vw", maxWidth: step === 1 ? "900px" : "1200px" }}>
                <ModalBody className={styles.body}>
                    <div className={styles.left}>
                        <img src={bargain} alt="" />
                        <h4>{step === 1 ? t("Bargain Offer").replace("Bargain", service_name_formatter(type)) : t("Then Offer is Sent!")}</h4>
                    </div>
                    <div className={styles.right}>
                        {
                            step === 1
                            &&
                            <>
                                <div className={styles.amount}>
                                    <div className={styles.top}>
                                        <span>
                                            {t("Amount")}
                                        </span>
                                        <div className={styles.badge} style={{ background: badgeColor }}>
                                            {t(capitalizeStatus(item?.status))}
                                        </div>
                                    </div>
                                    <h5>
                                        {Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.amount_reciever_currency?.currency?.code}
                                    </h5>
                                </div>
                                <div className={styles.inp_amount}>
                                    <div className={styles.top}>
                                        <span>
                                            {t("Enter Counter Amount")}
                                        </span>
                                        <div className={styles.badge} style={{ background: badgeColor }}>
                                            {counterType.includes("Custom") ? "" : "-"}{counterType}{counterType.includes("Custom") ? "" : "%"} Applied
                                        </div>
                                    </div>
                                    <h5 style={{ display: "flex", gap: ".7rem" }}>
                                        {item?.amount_reciever_currency?.currency?.code}
                                        <input
                                            type="number"
                                            value={counterAmount}
                                            onChange={(e) => {
                                                if (e.target.value < 0) return;
                                                setCounterType("Enter Custom")
                                                setCounterAmount(e.target.value)
                                            }}
                                            ref={inputRef}
                                        />
                                    </h5>
                                </div>
                                <div className={styles.counters}>
                                    {
                                        counterTypes.map(it => (
                                            <div
                                                className={`${styles.counter} ${counterType === it ? styles.c_a : ""} ${it?.includes("Custom") ? styles.wide : ""}`}
                                                key={it}
                                                onClick={() => {
                                                    if (it?.includes("Custom")) {
                                                        setCounterType(it)
                                                        inputRef?.current?.focus()
                                                        setCounterAmount("")
                                                        return;
                                                    }
                                                    const percentage = Number(it) / 100;
                                                    console.log(percentage)
                                                    const calculatedAmount = item?.amount * percentage;
                                                    console.log(calculatedAmount)
                                                    console.log(item?.amount)
                                                    setCounterAmount(Number(item?.amount - calculatedAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                                    setCounterType(it)
                                                }}
                                            >
                                                <span>{it?.includes("Custom") ? it : `-${it}%`}</span>
                                                {/* {it?.includes("Custom") ? <span>"%"</span> : ""} */}
                                            </div>
                                        ))
                                    }
                                </div>

                                <div className={styles.bottom}>
                                    <p>{error}</p>
                                    <div className={styles.btns}>
                                        <button disabled={saving} onClick={toggle} className={styles.trs}>{t("Cancel")}</button>
                                        <button disabled={saving || !counterAmount} onClick={counterOffer} className={styles.cou}>
                                            {t("Send the offer")}
                                            <ChevronRight
                                                color="white"
                                                size={20}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </>
                        }
                        {
                            step === 2
                            &&
                            <>
                                <div className={styles.top_2}>
                                    <img src={ins} alt="" />
                                </div>
                                <div className={styles.inp_amount}>
                                    <div className={styles.top}>
                                        <span>
                                            {t("Countered Offer")}
                                        </span>
                                        <div className={styles.badge} style={{ background: badgeColor }}>
                                            {counterType.includes("Custom") ? "" : "-"}{counterType}{counterType.includes("Custom") ? "" : "%"} Applied
                                        </div>
                                    </div>
                                    <h5>
                                        {item?.amount_reciever_currency?.currency?.code}  {counterAmount}
                                    </h5>
                                </div>
                                <div className={styles.bottom} style={{ justifyContent: "flex-end" }}>
                                    <button disabled={saving} onClick={() => {
                                        verifyToken()
                                        toggle()
                                    }} className={styles.trs}>{t("Back")}</button>
                                </div>
                            </>
                        }
                    </div>
                </ModalBody>
            </Modal>
            :
            <div className={styles.payment_flow_mobile}>
                <div className={int_styles.container}>
                    <div className={int_styles.top}>
                        <button className={int_styles.back_btn} onClick={toggle}>
                            <ChevronLeft />
                        </button>
                        <h5>{t("")}</h5>
                        <div>
                            <img src={recent} alt="" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                        </div>
                    </div>

                    <div className={paym_styles.mobile}>
                        <div className={paym_styles.m_top}>
                            <h2 style={{ display: "flex", alignItems: "center", gap: ".75rem", justifyContent: "center" }}>
                                <img src={bargain} alt="" style={{ height: "26px", width: "26px", objectFit: "contain" }} />
                                {t("Bargain Offer")}
                            </h2>
                        </div>
                    </div>
                    <div className={paym_styles.flow}>
                        <div className={paym_styles.flow_com} style={{ minHeight: "60vh" }}>
                            {
                                step === 1
                                &&
                                <div className={styles.step_one_m}>
                                    <div className={styles.amount}>
                                        <div className={styles.top}>
                                            <span>
                                                {t("Amount")}
                                            </span>
                                            <div className={styles.badge} style={{ background: badgeColor }}>
                                                {t(capitalizeStatus(item?.status))}
                                            </div>
                                        </div>
                                        <h5>
                                            {Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.amount_reciever_currency?.currency?.code}
                                        </h5>
                                    </div>
                                    <div className={styles.inp_amount}>
                                        <div className={styles.top}>
                                            <span>
                                                {t("Enter Counter Amount")}
                                            </span>
                                            <div className={styles.badge} style={{ background: badgeColor }}>
                                                -{counterType}% Applied
                                            </div>
                                        </div>
                                        <h5 style={{ display: "flex", gap: ".7rem" }}>
                                            {item?.amount_reciever_currency?.currency?.code}
                                            <input
                                                type="number"
                                                value={counterAmount}
                                                onChange={(e) => {
                                                    setCounterType("Enter Custom")
                                                    setCounterAmount(e.target.value)
                                                }}
                                            />
                                        </h5>
                                    </div>
                                    <div className={styles.counters}>
                                        {
                                            counterTypes.map(it => (
                                                <div
                                                    className={`${styles.counter} ${counterType === it ? styles.c_a : ""} ${it?.includes("Custom") ? styles.wide : ""}`}
                                                    key={it}
                                                    onClick={() => {
                                                        if (it?.includes("Custom")) {
                                                            setCounterType(it)
                                                            return;
                                                        }
                                                        const percentage = Number(it) / 100;
                                                        console.log(percentage)
                                                        const calculatedAmount = item?.amount * percentage;
                                                        console.log(calculatedAmount)
                                                        console.log(item?.amount)
                                                        setCounterAmount(Number(item?.amount - calculatedAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                                        setCounterType(it)
                                                    }}
                                                >
                                                    <span>{it?.includes("Custom") ? it : `-${it}%`}</span>
                                                    {it?.includes("Custom") ? <span>"%"</span> : ""}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            }
                            {
                                step === 2
                                &&
                                <>
                                    <div className={styles.top_2}>
                                        <img src={ins} alt="" />
                                    </div>
                                    <div className={styles.success}>
                                        <h2>{t("The Offer is Sent!")}</h2>
                                        <img src={success} alt="" />
                                    </div>
                                    <div className={styles.inp_amount}>
                                        <div className={styles.top}>
                                            <span>
                                                {t("Countered Offer")}
                                            </span>
                                            <div className={styles.badge} style={{ background: badgeColor }}>
                                                -{counterType}% Applied
                                            </div>
                                        </div>
                                        <h5>
                                            {item?.amount_reciever_currency?.currency?.code}  {counterAmount}
                                        </h5>
                                    </div>
                                </>
                            }
                        </div>
                        {
                            step === 1
                            &&
                            <div className={paym_styles.bottom} style={{ flexDirection: "column-reverse", margin: "2rem 0", gap: "1.5rem" }}>
                                <Link to={"https://insta-pay.ch/faqs"} target="_blank" style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                    <HelpCircle size={16} />
                                    {t("Trouble Sending Money")}
                                </Link>
                                <div className={paym_styles?.buttons}>
                                    <button disabled={saving} onClick={toggle}>
                                        <ChevronLeft />
                                    </button>
                                    <button disabled={saving || !counterAmount} onClick={counterOffer} className={paym_styles.full}>
                                        {t("Send the offer")}
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
    )
}

export default BargainQuotation