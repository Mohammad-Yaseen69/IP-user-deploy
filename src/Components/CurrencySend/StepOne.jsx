// import { ArrowRight } from "react-feather"
import styles from "./styles/StepOne.module.scss"
import { Btn } from "../../AbstractElements"
import { BsArrowRight } from "react-icons/bs"
import { useNavigate } from "react-router"
import PaymentsButton from "../Payments/PaymentsButton"

const StepOne = ({ setStepNumber }) => {
    const navigate = useNavigate()
    return (
        <div className={`${styles.container} card`}>
            <div className={styles.wrapper}>
                <div className={styles.top}>
                    <span className={styles.currency}>
                        $
                    </span>
                    <div className={styles.Arrow}>
                        {/* <ArrowRight /> */}
                        <BsArrowRight size={30} />
                    </div>
                    <span className={styles.amount}>$12,000</span>
                    <div className={styles.Arrow}>
                        {/* <ArrowRight /> */}
                        <BsArrowRight size={30} />
                    </div>
                    <span className={styles.currency}>
                        #
                    </span>
                    <div className={styles.Arrow}>
                        {/* <ArrowRight /> */}
                        <BsArrowRight size={30} />
                    </div>
                    <span className={styles.amount}>#30,00</span>
                </div>
                <div className={styles.details}>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>Charges</p>
                        <p className={styles.itemAmount}>$120</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>From Wallet Currency Type</p>
                        <p className={styles.itemAmount}>USD</p>
                    </div>
                    <div className={styles.item}>
                        <p className={styles.itemHead}>To Wallet Currency Type</p>
                        <p className={styles.itemAmount}>EUR</p>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <PaymentsButton value={"Back"} size={"m"} attr={{
                        onClick: () => navigate(-1)
                    }} />
                    <PaymentsButton value={"Next"} size={"m"} attr={{
                        onClick: () => setStepNumber(1)
                    }} />
                </div>
            </div>
        </div>
    )
}

export default StepOne