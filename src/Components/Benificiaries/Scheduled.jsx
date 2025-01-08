import React, { useState } from "react";
import GradientButton from "../User/UserSettings/GradientButton";
import styles from "./styles/Schedule.module.scss";

const Schedule = () => {
    return (
        <div className={styles.container}>
            <h3>Schedule The Payment</h3>
            <div className={styles.picker}>
                <div>
                    <label htmlFor="">Select Date</label>
                    <input type="date" value={Date.now().toLocaleString()} />
                </div>
                <div>
                    <label htmlFor="">Select Time</label>
                    <input type="time" />
                </div>
            </div>
            <div className={styles.button}>
                <GradientButton value={"Continue"} size="m" />
            </div>
        </div>
    )
}

export default Schedule;