import { Fragment, useEffect, useRef, useState } from "react"
import styles from "./styles/StepTwo.module.scss"
import { Btn } from "../../AbstractElements"
import PaymentsButton from "../Payments/PaymentsButton"

const StepTwo = ({ setStepNumber, setShowModal, st }) => {
    const inputRefs = useRef([])
    const [resendTimer, setResendTimer] = useState(90)


    const handleKeyUp = (index, e) => {
        const input = inputRefs.current[index]
        if (e.target.value && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus()
        }
        if (!e.target.value && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus()
        }
    }

    useEffect(() => {
        if (st > 0 && resendTimer > 0) {
            setTimeout(() => {
                setResendTimer(prev => prev - 1)
            }, 1000);
        }
    }, [resendTimer, st])

    return (
        <div className={`${styles.container} card`}>
            <div className={styles.wrapper}>
                <form className={styles.form}>
                    <span className={styles.top}>Code has been sent to (number)</span>
                    <div className={styles.inputs}>
                        {[...Array(6)].map((_, index) => (
                            <Fragment key={index}>
                                <input
                                    required
                                    type="text"
                                    placeholder='X'
                                    maxLength={1}
                                    ref={(ref) => inputRefs.current[index] = ref}
                                    onKeyUp={(e) => handleKeyUp(index, e)}
                                />
                                {index !== 5 && <span>-</span>}
                            </Fragment>
                        ))}
                    </div>
                    {
                        resendTimer > 0
                            ?
                            `Resend will be available in ${resendTimer} seconds.`
                            :
                            <>
                                Didn't receive code yet? <span style={{ fontWeight: 700, cursor: "pointer" }} onClick={_ => setResendTimer(90)}>Resend</span>
                            </>
                    }
                    <div style={{
                        marginTop: "1.5rem",
                        alignSelf: "flex-end"
                    }}>
                    </div>
                </form>
                <div className={styles.bottom}>
                    <PaymentsButton value={"Back"} size={"m"} attr={{
                        onClick: () => setStepNumber(0)
                    }} />
                    <PaymentsButton value={"Confirm"} size={"m"} attr={{
                        onClick: () => setShowModal(true)
                    }} />
                </div>
            </div>
        </div>
    )
}

export default StepTwo