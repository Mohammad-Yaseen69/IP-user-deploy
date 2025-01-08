import styles from "./styles/PWizard.module.scss"
import { Minus, Check } from "react-feather";

const PWizard = ({ subStep, totalCount = 4 }) => {
    return (
        <div style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            width: "fit-content",
        }}>
            <div className={styles.sm_cir}></div>

            <div className={styles.dotted}></div>

            {
                Array(totalCount).fill("").map((item, index) => (
                    <>
                        <div className={styles.big_cir}
                            style={{
                                background: subStep >= index + 1 ? "linear-gradient(6.05deg, #E64067, #5926F0, #4828A0), #D9D9D9" : "#CFCFCF"
                                // background: "linear-gradient(6deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9"
                            }}
                        >
                            {subStep < index + 1 && <Minus size={16} color="grey" />}
                            {subStep === index + 1 && <span style={{ color: "white", fontWeight: "700", fontSize: ".7rem", fontFamily: "Manrope" }}>!</span>}
                            {subStep > index + 1 && <Check size={12} color="white" />}
                        </div>
                        <div className={styles.dotted}></div>
                    </>
                ))
            }

            <div className={styles.sm_cir}></div>

        </div>
    )
}

export default PWizard;