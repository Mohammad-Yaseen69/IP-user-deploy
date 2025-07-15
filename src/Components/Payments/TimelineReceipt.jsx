import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepFive.module.scss"
import banner from "./receipt_banner.png"
import { useTranslation } from 'react-i18next'

const TimelineReceipt = ({ mobileView, action, setStepNumber }) => {
    const [completed, setCompleted] = useState(false)
    const { t } = useTranslation()

    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            icon={<div style={{
                borderRadius: "100%",
                height: "100%",
                width: "100%"
            }}>{completed && <Check />}</div>}
            iconStyle={{
                boxShadow: "none",
                padding: "5px",
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
            }}
            contentStyle={{
                background: "transparent",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: completed && "translateY(-11px)",
                marginLeft: mobileView ? "45px" : "60px",
            }}
        >
            {
                completed
                    ?
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }
                    } >
                        <p style={{ margin: 0, padding: 0 }}>
                            Transaction completed.
                        </p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div >
                    :
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>{t("Receipt")}</H4>
                        <img src={banner} draggable="false" style={{
                            width: "100%",
                            marginTop: "1rem"
                        }} />
                        <div className={styles.container}>
                            <div className={styles.top}>
                                <Check size={65} color="white" />
                            </div>
                            <h4 className='text-center mb-2'>{t("Confirmation")}</h4>
                            <div className={styles.details}>
                                {/* <div className={styles.item}>
                        <p className={styles.itemHead}>Transaction ID</p>
                        <p className={styles.itemAmount}>1287897291</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>From</p>
                        <p className={styles.itemAmount}>USD</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>To</p>
                        <p className={styles.itemAmount}>Euro</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead} style={{ fontWeight: 800 }}>
                            {action === "send" ? "Amount Sent" : ""}
                            {action === "request" ? "Amount Requested" : ""}
                            {action === "quote" ? "Quotation Send" : ""}
                        </p>
                        <p className={styles.itemAmount} style={{ fontWeight: 800 }}>$1,000 USD</p>
                    </div>
                    {
                        action !== "request"
                        &&
                        <>
                            {
                                action !== "quote"
                                &&
                                <div className={styles.item}>
                                    <p className={styles.itemHead} style={{ fontWeight: 800 }}>Amount Received</p>
                                    <p className={styles.itemAmount} style={{ fontWeight: 800 }}>$910 EUR</p>
                                </div>
                            }
                            <div className={styles.item}>
                                <p className={styles.itemHead} style={{ fontWeight: 800 }}>Charges</p>
                                <p className={styles.itemAmount} style={{ fontWeight: 800 }}>$110</p>
                            </div>
                        </>
                    }
                    <div className={styles.item}>
                        <p className={styles.itemHead}>Recipients:</p>
                        <p className={styles.itemAmount}>Imtiaz, Zaitmi, Miz</p>
                    </div> */}
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Transaction ID")}</p>
                                    <p className={styles.itemAmount}>1287897291</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Payment Type")}</p>
                                    <p className={styles.itemAmount}>{t("International Money Transfer")}</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead} style={{ fontWeight: "800" }}>{t("You Pay")}</p>
                                    <p className={styles.itemAmount} style={{ fontWeight: "800" }}>$1,000 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Purpose")}</p>
                                    <p className={styles.itemAmount}>{t("Family Support")}</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Commission")}:</p>
                                    <p className={styles.itemAmount}>$5</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Exchange Rate:")}</p>
                                    <p className={styles.itemAmount}>$1.10</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Total Amount:")}</p>
                                    <p className={styles.itemAmount}>$330</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Recipient")}:</p>
                                    <p className={styles.itemAmount}>Imtiaz, Zaitmi, Miz</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Account Number:")}</p>
                                    <p className={styles.itemAmount}>1111 2222 3333 4444</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>{t("Country:")}</p>
                                    <p className={styles.itemAmount}>Pakistan</p>
                                </div>
                            </div>
                            <div className={styles.bottom}>
                                <GradientButton value={t("Done")} size="sm" attr={{
                                    onClick: () => {
                                        setStepNumber(12)
                                        setCompleted(true)
                                    }
                                }} />
                            </div>
                        </div>
                    </>
            }

        </VerticalTimelineElement>
    )
}

export default TimelineReceipt