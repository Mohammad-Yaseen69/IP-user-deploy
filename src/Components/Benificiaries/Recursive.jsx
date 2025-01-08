import React, { useState } from "react";
import { Btn } from "../../AbstractElements";
import GradientButton from "../User/UserSettings/GradientButton";
import styles from "./styles/Recursive.module.scss";


const Recursive = () => {
    const [timeSpan, setTimeSpan] = useState("monthly")
    const [selectedDay, setSelectedDay] = useState("Monday")

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    return (
        <div className={styles.container}>
            <h3>Pay Recursively</h3>
            <div className={styles.buttons}>
                <Btn attrBtn={{ color: "primary", type: "button", outline: timeSpan !== "monthly" && true, className: timeSpan !== "monthly" && "btn-outline-primary", style: { fontSize: ".7rem" }, onClick: () => setTimeSpan("monthly") }}>
                    Monthly
                </Btn>
                <Btn attrBtn={{ color: "primary", type: "button", outline: timeSpan !== "weekly" && true, className: timeSpan !== "weekly" && "btn-outline-primary", style: { fontSize: ".7rem" }, onClick: () => setTimeSpan("weekly") }}>
                    Weekly
                </Btn>
            </div>
            <div className={styles.picker} style={{
                maxWidth: timeSpan === "monthly" ? "450px" : "700px"
            }}>
                {
                    timeSpan === "monthly"
                        ?
                        <>
                            <div>
                                <label htmlFor="">Pay Date</label>
                                <input type="date" />
                            </div>
                            <div>
                                <label htmlFor="">Pay Until</label>
                                <input type="date" />
                            </div>
                        </>
                        :
                        <>
                            <div>
                                <label>Choose A Day</label>
                                <div className={styles.days}>
                                    {
                                        days.map(day => (
                                            <Btn
                                                attrBtn={{
                                                    color: "primary",
                                                    type: "button",
                                                    outline: selectedDay !== day && true,
                                                    className: selectedDay !== day && "btn-outline-primary",
                                                    style: { fontSize: ".6rem" },
                                                    onClick: () => setSelectedDay(day)
                                                }}>
                                                {day}
                                            </Btn>
                                        ))
                                    }
                                </div>
                            </div>
                            <div>
                                <label htmlFor="">Pay Until</label>
                                <input type="date" />
                            </div>
                        </>
                }
            </div>
            <div className={styles.button}>
                <GradientButton value={"Continue"} size="m" />
            </div>
        </div>
    )
}

export default Recursive