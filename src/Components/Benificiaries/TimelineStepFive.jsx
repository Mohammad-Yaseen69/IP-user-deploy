import { useState } from 'react'
import { Check } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, P } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepFive.module.scss"

const TimelineStepFIve = ({ sst }) => {
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
            <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Transaction Details</H4>
            <div className={styles.container}>
                <div className={styles.top}>
                    <Check size={65} color="white" />
                </div>
                <div className={styles.details}>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>From</p>
                        <p className={styles.itemAmount}>USD</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>To</p>
                        <p className={styles.itemAmount}>Euro</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>Amount Sent</p>
                        <p className={styles.itemAmount}>$1000 USD</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>Amount Received</p>
                        <p className={styles.itemAmount}>$910 EUR</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>Charges</p>
                        <p className={styles.itemAmount}>$110</p>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <GradientButton value={"Done"} size="sm" attr={{
                        onClick: () => {
                            sst(false)
                        }
                    }} />
                </div>
            </div>

        </VerticalTimelineElement>
    )
}

export default TimelineStepFIve