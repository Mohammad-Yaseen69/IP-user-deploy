import React, { useState } from 'react'
import { Check, Edit } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { Btn, H4 } from '../../AbstractElements'

const TimelineInit = ({ setStepNumber, action, setAction }) => {
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
                        <p style={{ margin: 0, padding: 0 }}>You opted to {action} an amount.</p>
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
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Choose Action</H4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            background: "white",
                            padding: "1rem"
                        }}>
                            <Btn
                                attrBtn={{
                                    color: "primary",
                                    type: "button",
                                    outline: action !== "send" && true,
                                    className: action !== "send" ? "btn-outline-primary" : "",
                                    style: {
                                        fontSize: ".7rem",
                                    },
                                    onClick: () => {
                                        setStepNumber(1)
                                        setAction("send")
                                        setCompleted(true)
                                    }
                                }}
                            >
                                Send
                            </Btn>

                            <Btn
                                attrBtn={{
                                    color: "primary",
                                    type: "button",
                                    outline: action !== "request" && true,
                                    className: action !== "request" ? "btn-outline-primary" : "",
                                    style: {
                                        fontSize: ".7rem",
                                    },
                                    onClick: () => {
                                        setStepNumber(1)
                                        setAction("request")
                                        setCompleted(true)
                                    }
                                }}
                            >
                                Request
                            </Btn>

                            <Btn
                                attrBtn={{
                                    color: "primary",
                                    type: "button",
                                    outline: action !== "quote" && true,
                                    className: action !== "quote" ? "btn-outline-primary" : "",
                                    style: {
                                        fontSize: ".7rem",
                                    },
                                    onClick: () => {
                                        setStepNumber(1)
                                        setAction("quote")
                                        setCompleted(true)
                                    }
                                }}
                            >
                                Quote
                            </Btn>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineInit