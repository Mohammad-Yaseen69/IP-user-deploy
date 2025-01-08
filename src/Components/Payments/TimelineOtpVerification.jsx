import React, { useEffect, useRef, useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import styles from "./styles/TimelineStepFour.module.scss"

const TimelineOtpVerification = ({ mobileView, setStepNumber, st }) => {
    const [completed, setCompleted] = useState(false)
    const [resendTimer, setResendTimer] = useState(90)
    const inputRefs = useRef([])

    const otpConfirmation = (e) => {
        e.preventDefault()
        setStepNumber(11)
        setCompleted(true)
    }
    const handleKeyUp = (index, e) => {
        const input = inputRefs.current[index]
        if (e.target.value && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus()
        }
        if (!e.target.value && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus()
        }
    }

    useEffect(() => {
        if (st > 9 && resendTimer > 0) {
            setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000);
        }
    }, [resendTimer, st])

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
                            OTP Confirmed.
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
                                {[...Array(6)].map((_, index) => (
                                    <React.Fragment key={index}>
                                        <input
                                            required
                                            type="text"
                                            placeholder='X'
                                            maxLength={1}
                                            style={{
                                                height: mobileView ? "30px" : "40px",
                                                width: mobileView ? "30px" : "40px",
                                                fontSize: mobileView ? "1.1rem" : "2rem",
                                            }}
                                            ref={(ref) => inputRefs.current[index] = ref}
                                            onKeyUp={(e) => handleKeyUp(index, e)}
                                        />
                                        {index !== 5 && <span>-</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                            <span>
                                {
                                    resendTimer > 0
                                        ?
                                        `Resend will be available in ${resendTimer} seconds.`
                                        :
                                        <>
                                            Didn't receive code yet? <span style={{ fontWeight: 700, cursor: "pointer" }} onClick={_ => setResendTimer(90)}>Resend</span>
                                        </>
                                }
                            </span>
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

export default TimelineOtpVerification