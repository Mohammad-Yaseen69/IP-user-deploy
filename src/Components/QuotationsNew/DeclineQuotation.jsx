import React, { useContext, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import decline from "./files/decline.svg"
import { useTranslation } from 'react-i18next'
import styles from "./styles/DeclineQuotation.module.css"
import { ChevronLeft, ChevronRight, HelpCircle } from 'react-feather'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import ins from "./files/ins.svg"
import { UserContext } from '../../Context/UserContext'
import { Link } from 'react-router-dom'
import int_styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import paym_styles from "../PaymentsNewer/InternationalFlow/styles/index.module.css"
import recent from "../PaymentsNewer/Mobile/files/recent.svg"

const DeclineQuotation = ({ item, isOpen, toggle }) => {
    const { t } = useTranslation()
    const [isDeleting, setIsDeleting] = useState(false)
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")

    const { authHeader, verifyToken } = useContext(UserContext)

    const declineQuotation = async () => {
        setIsDeleting(true)
        try {
            const response = await axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/quotation/decline-quotation/${item?._id}`, {
                headers: authHeader
            })

            const decrypted = decryptData(response.data.data)
            setStep(2)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
        }
        finally {
            setIsDeleting(false)
        }
    }

    return (
        window.innerWidth > 1000
            ?
            <Modal isOpen={isOpen} style={{ width: "100vw", maxWidth: step === 1 ? "980px" : "700px", transition: "500ms" }}>
                <ModalBody style={{ padding: "2rem" }} className={styles.body}>
                    {
                        step === 1
                        &&
                        <>
                            <img src={decline} style={{ height: "36px", width: "36px", objectFit: "contain" }} />
                            <h4>{t("Decline Offer")}</h4>
                            <p>Are you sure that you want to decline the offer?</p>
                            <div className={styles.bottom}>
                                <p>{error}</p>
                                <div className={styles.btns}>
                                    <button disabled={isDeleting} className={styles.trs} onClick={toggle}>{t("Cancel")}</button>
                                    <button onClick={declineQuotation} disabled={isDeleting} className={styles.dec}>
                                        {t("Decline the offer")}
                                        <ChevronRight color='white' size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    }
                    {
                        step === 2
                        &&
                        <>
                            <div className={styles.top}>
                                <img src={ins} alt="" />
                            </div>
                            <img src={decline} style={{ height: "36px", width: "36px", objectFit: "contain" }} />
                            <h4>{t("Offer Declined")}</h4>
                            <button onClick={() => {
                                verifyToken()
                                toggle()
                            }} className={styles.close}>{t("Close")}</button>
                        </>
                    }
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
                                <img src={decline} alt="" style={{ height: "26px", width: "26px", objectFit: "contain" }} />
                                {t("Decline Offer")}
                            </h2>
                        </div>
                    </div>
                    <div className={paym_styles.flow}>
                        <div className={paym_styles.flow_com} style={{ minHeight: "60vh" }}>
                            {
                                step === 1
                                &&
                                <p className={styles.p}>Are you sure that you want to decline the offer?</p>
                            }
                            {
                                step === 2
                                &&
                                <div className={styles.m_s_2}>
                                    <h2>Your quotation is declined</h2>
                                    <span>Thanks for Using InstaPay</span>
                                </div>
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
                                    <button disabled={isDeleting} onClick={toggle}>
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        onClick={declineQuotation}
                                        disabled={isDeleting}
                                        className={paym_styles.full}
                                        style={{
                                            background: "linear-gradient(352deg, #C5123C 6.49%, #F02629 120.74%), linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)",
                                            backgroundBlendMode: "normal, overlay, normal",
                                            boxShadow: "0px 10px 10.797px -6.748px rgba(89, 38, 240, 0.17)"
                                        }}
                                    >
                                        {t("Decline the offer")}
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
    )
}

export default DeclineQuotation