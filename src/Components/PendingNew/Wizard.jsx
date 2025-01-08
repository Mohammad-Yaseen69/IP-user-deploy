import styles from "../PaymentsNewer/styles/PWizard.module.scss"
import { Minus, Check } from "react-feather";

const Wizard = ({ subStep }) => {
    return (
        <div style={{
            display: "flex",
            gap: "23px",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            width: "fit-content",
        }}>
            <div className={styles.sm_cir}></div>

            <div className={styles.dotted}></div>

            <div className={styles.big_cir}
                style={{
                    background: subStep >= 1 ? "linear-gradient(6.05deg, #E64067, #5926F0, #4828A0), #D9D9D9" : "#CFCFCF"
                    // background: "linear-gradient(6deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                }}
            >
                {subStep < 1 && <Minus size={16} color="grey" />}
                {subStep === 1 && <span style={{ color: "white", fontWeight: "700", fontSize: ".7rem", fontFamily: "Manrope" }}>!</span>}
                {subStep > 1 && <Check size={12} color="white" />}
            </div>

            <div className={styles.dotted}></div>

            <div className={styles.big_cir}
                style={{
                    background: subStep >= 2 ? "linear-gradient(6.05deg, #E64067, #5926F0, #4828A0), #D9D9D9" : "#CFCFCF"
                    // background: "linear-gradient(6deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                }}
            >
                {subStep < 2 && <Minus size={16} color="grey" />}
                {subStep === 2 && <span style={{ color: "white", fontWeight: "700", fontSize: ".7rem", fontFamily: "Manrope" }}>!</span>}
                {subStep > 2 && <Check size={12} color="white" />}
            </div>


            <div className={styles.dotted}></div>

            <div className={styles.sm_cir}></div>

        </div>
    )
}

export default Wizard;