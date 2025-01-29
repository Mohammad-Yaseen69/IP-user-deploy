import { useState } from "react"
import { Check, Edit } from "react-feather"
import { VerticalTimelineElement } from "react-vertical-timeline-component"
import { Btn, H4 } from "../../AbstractElements"
import styles from "./styles/TimelineRecursive.module.scss"
import { Label } from "reactstrap"
import GradientButton from "../User/UserSettings/GradientButton"

const TimelineRecursive = ({ action, mobileView, setStepNumber, recursiveCycles, setRecursiveCycles, recursiveDay, setRecursiveDay, recursiveType, setRecursiveType, recursiveStart, setRecursiveStart, setUnlimitedCycles, unlimitedCycles }) => {
    const [completed, setCompleted] = useState(false)
    const [monthExceed, setMonthExceed] = useState(false)
    const [showDateError, setShowDateError] = useState(false)

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    const monthDayChange = (e) => {
        if (28 < e.target.value && e.target.value < 32) {
            // console.log("yes")
            setMonthExceed(true)
        } else {
            // console.log("no")
            setMonthExceed(false)
        }
        setRecursiveDay(e.target.value)
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
                            The payment will recursively occur on {recursiveDay} every {recursiveType} for {recursiveCycles} times.
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
                        <H4 attrH4={{ className: "vertical-timeline-element-subtitle" }}>Recursive Payment</H4>
                        <form className={styles.container} onSubmit={(e) => {
                            e.preventDefault()
                            if (action === "request") setStepNumber(9);
                            else setStepNumber(7);
                            setCompleted(true)
                        }}>
                            <div className={styles.top}>
                                <Btn attrBtn={{
                                    color: "primary",
                                    type: "button",
                                    // outline: recursiveType !== "Monthly" && true,
                                    // className: recursiveType !== "Monthly" && "btn-outline-primary",
                                    style: {
                                        fontSize: ".7rem",
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                        opacity: recursiveType !== "Monthly" ? .7 : 1
                                    },
                                    onClick: () => setRecursiveType("Monthly")
                                }}>
                                    Monthly
                                </Btn>
                                <Btn attrBtn={{
                                    color: "primary",
                                    type: "button",
                                    // outline: recursiveType !== "Weekly" && true,
                                    // className: recursiveType !== "Weekly" && "btn-outline-primary",
                                    style: {
                                        fontSize: ".7rem",
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                        opacity: recursiveType !== "Weekly" ? .7 : 1
                                    },
                                    onClick: () => setRecursiveType("Weekly")
                                }}>
                                    Weekly
                                </Btn>
                            </div>
                            <div style={{
                                display: "flex", gap: "1rem", width: "100%", flexDirection: mobileView ? "column" : "row"
                            }}>
                                {
                                    recursiveType === "Monthly"
                                        ?
                                        <div style={{ flex: 1, width: "100%" }}>
                                            <Label className="form-label">Day of Month <span className="req_star">*</span></Label>
                                            <input min={1} max={31} className="form-control" style={{ width: "100%" }} type="number" value={recursiveDay} onChange={monthDayChange} required title="Please enter a valid day." />
                                            {
                                                monthExceed
                                                &&
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    marginTop: ".3rem"
                                                }}>
                                                    <span style={{ fontSize: ".7rem", color: "red" }}>Some months doesn't have more than 28, 29, and 30 days.</span>
                                                    <span style={{ fontSize: ".7rem", marginTop: ".3rem" }}>Proceed the payment at:</span>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "1rem",
                                                        fontSize: ".7rem",
                                                        marginTop: ".2rem",
                                                        flexWrap: "wrap"
                                                    }}>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: ".3rem",
                                                            cursor: "pointer"
                                                        }}>
                                                            <input type="radio" id="month_end" name="payment_starts" required />
                                                            <label style={{
                                                                margin: 0,
                                                                padding: 0
                                                            }} className="form-label" htmlFor="month_end">End of these months</label>
                                                        </div>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: ".5rem",
                                                            cursor: "pointer"
                                                        }}>
                                                            <input type="radio" id="month_start" name="payment_starts" required />
                                                            <label style={{
                                                                margin: 0,
                                                                padding: 0
                                                            }} className="form-label" htmlFor="month_start">Start of next month</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        :
                                        <div style={{ flex: 1, width: "100%" }}>
                                            <Label className="form-label">Day of Week <span className="req_star">*</span></Label>
                                            <select className="form-control" style={{ width: "100%" }} type="number" value={recursiveDay} onChange={(e) => setRecursiveDay(e.target.value)} required>
                                                <option>Select Day</option>
                                                {
                                                    weekDays.map(day => <option value={day} key={day}>{day}</option>)
                                                }
                                            </select>
                                        </div>
                                }
                                <div style={{ flex: 1, width: "100%" }}>
                                    <Label className="form-label">Number of Cycles <span className="req_star">*</span></Label>
                                    <input className="form-control" style={{ width: "100%" }} type="number" value={recursiveCycles} onChange={(e) => setRecursiveCycles(e.target.value)} min={1} required={!unlimitedCycles} />
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: ".5rem",
                                        cursor: "pointer",
                                        fontSize: ".8rem",
                                        marginTop: ".3rem"
                                    }}>
                                        <input type="checkbox" id="cycle_unlimited" checked={unlimitedCycles} onChange={(e) => setUnlimitedCycles(e.target.checked)} />
                                        <label style={{
                                            margin: 0,
                                            padding: 0
                                        }} className="form-label" htmlFor="cycle_unlimited">{t("Until I stop")}</label>
                                    </div>
                                </div>
                                <div style={{ flex: 1, width: "100%" }}>
                                    <Label className="form-label">Starting from <span className="req_star">*</span></Label>
                                    <input className="form-control" style={{ width: "100%" }} type="date" value={recursiveStart}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            const currentDate = new Date();
                                            if (selectedDate < currentDate) {
                                                setShowDateError(true)
                                                // setRecursiveStart(currentDate.toISOString().slice(0, 10));
                                            } else {
                                                setRecursiveStart(e.target.value);
                                                setShowDateError(false)
                                            }
                                        }}
                                        required />
                                    {
                                        showDateError
                                        &&
                                        <span style={{ fontSize: ".7rem", color: "red", marginTop: ".3rem" }}>Past date is invalid for this field.</span>
                                    }
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

export default TimelineRecursive;