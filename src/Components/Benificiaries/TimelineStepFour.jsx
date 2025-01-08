import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepFour.module.scss"

const TimelineStepFour = ({ setStepNumber }) => {
    const [completed, setCompleted] = useState(false)

    const otpConfirmation = (e) => {
        e.preventDefault()
        setStepNumber(5)
        setCompleted(true)
    }

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
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Enter OTP Code</H4>
                        <form className={styles.form} onSubmit={otpConfirmation}>
                            <span className={styles.top}>Code has been sent to (number)</span>
                            <div className={styles.inputs}>
                                <input type="text" placeholder='X' maxLength={1} />
                                <span>-</span>
                                <input type="text" placeholder='X' maxLength={1} />
                                <span>-</span>
                                <input type="text" placeholder='X' maxLength={1} />
                                <span>-</span>
                                <input type="text" placeholder='X' maxLength={1} />
                                <span>-</span>
                                <input type="text" placeholder='X' maxLength={1} />
                                <span>-</span>
                                <input type="text" placeholder='X' maxLength={1} />
                            </div>
                            <span className={styles.bottom}>Didn't receive code yet? <span>Resend</span></span>
                            <div style={{
                                marginTop: "1.5rem",
                                alignSelf: "flex-end"
                            }}>
                                <GradientButton value={"Verify"} size="sm" attr={{
                                    type: "submit"
                                }} />
                            </div>
                        </form>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineStepFour