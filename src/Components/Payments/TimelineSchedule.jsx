import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4 } from '../../AbstractElements'
import GradientButton from '../User/UserSettings/GradientButton'
import { Label } from 'reactstrap'

const TimelineSchedule = ({ action, mobileView, setStepNumber, scheduleDate, scheduleTime, setScheduleDate, setScheduleTime }) => {
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
                            You have scheduled the payment for {scheduleDate} at {scheduleTime}.
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
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Schedule Payment</H4>
                        <form style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }} onSubmit={(e) => {
                            e.preventDefault()
                            if (action === "request") setStepNumber(9);
                            else setStepNumber(7);
                            setCompleted(true)
                        }}>
                            <div style={{ display: "flex", gap: "1rem", width: "100%", flexDirection: mobileView ? "column" : "row" }}>
                                <div style={{ flex: 1, width: "100%" }}>
                                    <Label className="form-label">Enter Date <span className="req_star">*</span></Label>
                                    <input required className="form-control" style={{ width: "100%" }} type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                                </div>
                                <div style={{ flex: 1, width: "100%" }}>
                                    <Label className="form-label">Enter Time <span className="req_star">*</span></Label>
                                    <input required className="form-control" style={{ width: "100%" }} type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                                </div>
                            </div>
                            <div style={{
                                marginTop: "1.5rem",
                                alignSelf: "flex-end"
                            }}>
                                <GradientButton value={"Continue"} size="sm" attr={{
                                    type: "submit"
                                }} />
                            </div>
                        </form>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineSchedule