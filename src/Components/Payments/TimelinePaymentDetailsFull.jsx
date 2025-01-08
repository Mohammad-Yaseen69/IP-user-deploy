import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepThree.module.scss"
import banner from "./receipt_banner.png"

const TimelinePaymentDetailsFull = ({ action, mobileView, setStepNumber, paymentType, scheduleDate, recursiveStart, amount, sendBeneficiaries }) => {
    const [completed, setCompleted] = useState(false)

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
                    }}>
                        <p style={{ margin: 0, padding: 0 }}>
                            Transaction details with Recipients Info.
                        </p>
                        <span style={{
                            cursor: "pointer",
                            padding: 0,
                            margin: 0
                        }} onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
                    :
                    <>
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Payment Details</H4>
                        <img src={banner} draggable="false" style={{
                            width: "100%",
                            marginTop: "1rem"
                        }} />
                        <div className={styles.container}>
                            <p className={styles.topHead}>You are {action == "send" ? "sending" : ""}{action == "request" ? "requesting" : ""}{action == "quote" ? "quoting" : ""} (amount) {action == "send" ? "to" : "from"} (recipient's name).</p>
                            <div className={styles.details}>
                                {/* <div className={styles.item}>
                                    <p className={styles.itemHead}>Transaction ID</p>
                                    <p className={styles.itemAmount}>1287897291</p>
                                </div>
                                {
                                    action !== "request"
                                    &&
                                    <>
                                        <div className={styles.item}>
                                            <p className={styles.itemHead} style={{ fontWeight: "800" }}>Sub Total</p>
                                            <p className={styles.itemAmount} style={{ fontWeight: "800" }}>$110 USD</p>
                                        </div>
                                        <div className={styles.item}>
                                            <p className={styles.itemHead}>Fee</p>
                                            <p className={styles.itemAmount}>$105 USD</p>
                                        </div>
                                    </>
                                }
                                <div className={styles.item}>
                                    <p className={styles.itemHead} style={{ fontWeight: "800" }}>
                                        {action === "send" ? "You Pay" : ""}
                                        {action === "request" ? "You Requested" : ""}
                                        {action === "quote" ? "Quotation Amount" : ""}
                                    </p>
                                    <p className={styles.itemAmount} style={{ fontWeight: "800" }}>$1,000 USD</p>
                                </div>
                                {
                                    action !== "request"
                                    &&
                                    <div className={styles.item}>
                                        <p className={styles.itemHead}>Recipient Receives</p>
                                        <p className={styles.itemAmount}>$1,000 USD</p>
                                    </div>
                                }
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Receiving Time</p>
                                    <p className={styles.itemAmount}>
                                        {paymentType === "instant" ? "Instant" : ""}
                                        {paymentType === "scheduled" ? scheduleDate : ""}
                                        {paymentType === "recursive" ? recursiveStart : ""}
                                    </p>
                                </div> */}
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Commission:</p>
                                    <p className={styles.itemAmount}>$5</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Exchange Rate:</p>
                                    <p className={styles.itemAmount}>$1.10</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Total Amount:</p>
                                    <p className={styles.itemAmount}>$330</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Recipients:</p>
                                    <p className={styles.itemAmount}>Imtiaz, Zaitmi, Miz</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Account Number:</p>
                                    <p className={styles.itemAmount}>1111 2222 3333 4444</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Country:</p>
                                    <p className={styles.itemAmount}>Pakistan</p>
                                </div>
                            </div>
                            <div className={styles.bottom}>
                                <GradientButton value={"Confirm"} size="sm" attr={{
                                    onClick: () => {
                                        setStepNumber(10)
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

export default TimelinePaymentDetailsFull