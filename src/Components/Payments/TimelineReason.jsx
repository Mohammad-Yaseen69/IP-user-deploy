import React, { useState } from 'react'
import { Edit, Check, ChevronDown } from 'react-feather'
import { VerticalTimelineElement } from 'react-vertical-timeline-component'
import { H4, LI, UL } from '../../AbstractElements'
import styles from "./styles/TimelineOne.module.scss"
import { Card, Col, FormGroup, Input, Label } from 'reactstrap'
import GradientButton from '../User/UserSettings/GradientButton'
import "./reasonspan.css"


const TimelineReason = ({ action, mobileView, setStepNumber }) => {
    const [completed, setCompleted] = useState(false)
    const [userReason, setUserReason] = useState("")
    const [showDropDown, setShowDropDown] = useState(false)
    // reasons
    const reasons = [
        "--Select the reason--",
        "Family Support",
        "Trade-Related",
        "Operating Expenses",
        "Goods",
        "Services",
        "Charity Donation",
        "Other"
    ]

    const selectReason = (e) => {
        e.preventDefault()

        if (action === "quote") {
            setStepNumber(9)
        } else {
            setStepNumber(5)
        }
        setCompleted(true)
    }

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
                !completed
                    ?
                    <>
                        {/* <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>
                            Reason for {action === "send" ? "Sending" : ""}{action === "request" ? "Requesting" : ""}{action === "quote" ? "Quoting" : ""}
                        </H4> */}
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>
                            Select the purpose of your transfer from the options below
                        </H4>
                        <form style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            marginTop: "1.5rem"
                        }} onSubmit={selectReason}>
                            <Col sn="12" xl="12">
                                <Card className='basic-dropdown' style={{ boxShadow: "none" }}>
                                    <UL attrUL={{
                                        className: 'd-flex flex-row flex-wrap',
                                        onClick: () => setShowDropDown(!showDropDown)
                                    }}>
                                        <LI attrLI={{ className: 'onhover-dropdown' }}>
                                            <span className='reason'>{userReason ? userReason : "--Select the reason--"}</span>
                                            <span>
                                                <ChevronDown className='ms-2 middle' />
                                            </span>
                                            <UL attrUL={{
                                                className: 'left-dropdown',
                                                style: {
                                                    boxShadow: "0 0 20px rgba(89, 102, 122, 0.1)",
                                                    transform: showDropDown ? "translateY(0px)" : "translateY(30px)",
                                                    opacity: showDropDown ? 1 : 0,
                                                    visibility: showDropDown ? "visible" : "hidden",
                                                    position: "absolute",
                                                    background: "var(--bs-list-group-bg)"
                                                }
                                            }}>
                                                {
                                                    reasons.map(reason => (
                                                        <LI attrLI={{ style: { width: "fit-content" } }}>
                                                            <span onClick={() => setUserReason(reason)} className={styles.hoverSpan}>{reason}</span>
                                                        </LI>
                                                    ))
                                                }
                                            </UL>
                                        </LI>
                                    </UL>
                                </Card>
                            </Col>
                            <FormGroup>
                                <Label className="form-label">Note</Label>
                                {/* <Input type="textarea" className="form-control" rows="3" placeholder="Enter the reason" required /> */}
                                <Input className="form-control" type="text" placeholder='Explain your reason.' />
                            </FormGroup>
                            <FormGroup>
                                <Label className="form-label">Attach a file</Label>
                                <Input className="form-control" type="file" />
                            </FormGroup>
                            <div style={{ width: "fit-content", alignSelf: "flex-end", marginTop: ".5rem" }}>
                                <GradientButton value={"Confirm"} size="sm" attr={{ disabled: !userReason }} />
                            </div>
                        </form>
                    </>
                    :
                    <div className={styles.amountDet}>
                        <p style={{ margin: 0 }}>{userReason}.</p>
                        <span onClick={() => setCompleted(false)}>
                            <Edit />
                        </span>
                    </div>
            }
        </VerticalTimelineElement>
    )
}

export default TimelineReason