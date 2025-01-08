import { useState } from "react"
import { Check, Edit } from "react-feather"
import { VerticalTimelineElement } from "react-vertical-timeline-component"
import { H4 } from "../../AbstractElements"
import PaymentsButton from "./PaymentsButton"
import da from "./d_a.gif"

const TimelineRequestMethod = ({ setRequestMethod, mobileView, requestMethod, setStepNumber }) => {
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
                marginLeft: mobileView ? "45px" : "60px"
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
                        <p style={{ margin: 0, padding: 0 }}>You opted {requestMethod} request{requestMethod === "bulk" && "s"}.</p>
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
                        <H4 attrH4={{
                            className: "vertical-timeline-element-subtitle",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: ".2rem",
                                flexWrap: "wrap"
                            }
                        }}>Select your preferred option below <img src={da} style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover"
                        }} /></H4>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem"
                        }}>
                            <div className='btn-showcase'>
                                <PaymentsButton
                                    value={"Single Request"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(1)
                                            setRequestMethod("single")
                                            setCompleted(true)
                                        },
                                    }}
                                />
                            </div>
                            <div className="btn-showcase">
                                <PaymentsButton
                                    value={"Bulk Requests"}
                                    size={"sm"}
                                    attr={{
                                        onClick: () => {
                                            setStepNumber(1)
                                            setRequestMethod("bulk")
                                            setCompleted(true)
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineRequestMethod;