import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepThree.module.scss"
import banner from "./receipt_banner.png"

const TimelinePaymentDetails = ({ mobileView, setStepNumber, paymentType, scheduleDate, recursiveStart }) => {
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
                    }
                    } >
                        <p style={{ margin: 0, padding: 0 }}>
                            Transaction details.
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
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Payment Details</H4>
                        <img src={banner} draggable="false" style={{
                            width: "100%",
                            marginTop: "1rem"
                        }} />
                        <div className={styles.container}>
                            {/* <p className={styles.topHead}>You are sending (amount) to (recipient's name).</p> */}
                            <div className={styles.details}>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Transaction ID</p>
                                    <p className={styles.itemAmount}>1287897291</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Payment Type</p>
                                    <p className={styles.itemAmount}>International Money Transfer</p>
                                </div>
                                {/* <div className={styles.item}>
                                    <p className={styles.itemHead} style={{ fontWeight: "800" }}>Sub Total</p>
                                    <p className={styles.itemAmount} style={{ fontWeight: "800" }}>$110 USD</p>
                                </div> */}
                                {/* <div className={styles.item}>
                                    <p className={styles.itemHead}>Fee</p>
                                    <p className={styles.itemAmount}>$105 USD</p>
                                </div> */}
                                <div className={styles.item}>
                                    <p className={styles.itemHead} style={{ fontWeight: "800" }}>You Pay</p>
                                    <p className={styles.itemAmount} style={{ fontWeight: "800" }}>$1,000 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Purpose </p>
                                    <p className={styles.itemAmount}>Family Support</p>
                                </div>
                                {/* <div className={styles.item}>
                                    <p className={styles.itemHead}>Receiving Time</p>
                                    <p className={styles.itemAmount}>
                                        {paymentType === "instant" ? "Instant" : ""}
                                        {paymentType === "scheduled" ? scheduleDate : ""}
                                        {paymentType === "recursive" ? recursiveStart : ""}
                                    </p>
                                </div> */}
                            </div>
                            <div className={styles.bottom}>
                                <GradientButton value={"Confirm"} size="sm" attr={{
                                    onClick: () => {
                                        setStepNumber(8)
                                        setCompleted(true)
                                    }
                                }} />
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement >
    )
}

export default TimelinePaymentDetails