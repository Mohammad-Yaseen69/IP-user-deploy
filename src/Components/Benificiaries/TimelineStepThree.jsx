import { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, P } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepThree.module.scss"

const TimelineStepThree = ({ setStepNumber }) => {
    const [completed, setCompleted] = useState(false)

    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            icon={<div style={{
                background: completed ? "transparent" : "white",
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
                background: "white",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: completed && "translateY(-11px)"
            }}
        >
            {
                completed
                    ?
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        backgroundColor: "white"
                    }}>
                        <p style={{ margin: 0, padding: 0 }}>
                            You have confirmed the transaction details.
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
                        <div className={styles.container}>
                            <p className={styles.topHead}>You are sending (amount) to (recipient's name).</p>
                            <div className={styles.details}>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Sub Total</p>
                                    <p className={styles.itemAmount}>$110 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Fee</p>
                                    <p className={styles.itemAmount}>$105 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>You Pay</p>
                                    <p className={styles.itemAmount}>$1000 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Recipient Receives</p>
                                    <p className={styles.itemAmount}>$1000 USD</p>
                                </div>
                                <div className={styles.item}>
                                    <p className={styles.itemHead}>Receiving Time</p>
                                    <p className={styles.itemAmount}>Instant</p>
                                </div>
                            </div>
                            <div className={styles.bottom}>
                                <GradientButton value={"Continue"} size="sm" attr={{
                                    onClick: () => {
                                        setStepNumber(4)
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

export default TimelineStepThree