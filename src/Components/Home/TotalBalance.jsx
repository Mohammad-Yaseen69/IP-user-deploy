import styles from "./styles/TotalBalance.module.scss"
import { BsThreeDotsVertical } from "react-icons/bs"
import { TbArrowZigZag } from "react-icons/tb"

const TotalBalance = () => {
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <p>Total Balance</p>
                <BsThreeDotsVertical color="grey" style={{ cursor: "pointer" }} />
            </div>
            <div className={styles.center}>
                <h2>$15,4000</h2>
                <span>USD</span>
            </div>
            <div className={styles.bottom}>
                <p>
                    <TbArrowZigZag />
                    <span>2.05%</span>
                </p>
                <p>
                    {Date.now().toLocaleString()}
                </p>
            </div>
        </div>
    )
}

export default TotalBalance;