import styles from "./styles/onboard.module.scss"
import CardIcon from "./files/card.svg"
import { useState } from "react"
import success from "./files/success_creation.png"

const Stepfour = () => {
    return (
        <div style={{ display: "flex", gap: "8px", marginBottom: "7px", flexDirection: "column", maxWidth: "100%" }}>
            <div className={styles.top}>
                <h2>Your InstaPay Card is Ready! 🎉</h2>
                <p>Your payment was successful, and your card is now active.</p>
            </div>

            <img src={success} alt="" />


        </div>
    )
}

export default Stepfour