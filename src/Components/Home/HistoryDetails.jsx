import { FormGroup, Input } from "reactstrap";
import styles from "./styles/HistoryDetails.module.scss"

const HistoryDetails = () => {
    return (
        <div className={`${styles.container} card`} style={{
            marginBottom: 0
        }}>
            <div className={styles.item}>
                <Input type='select' name="status" placeholder="Select Status" className="form-control form-select" >
                    <option>Last 07 Days</option>
                    <option>This Month</option>
                    <option>This Year</option>
                    <option>Life Time</option>
                </Input>
            </div>
            <div className={styles.item}>
                <h3>Number of Transactions</h3>
                <span>78</span>
            </div>
            <div className={styles.item}>
                <h3>Total Sent</h3>
                <span>$6,300</span>
            </div>
            <div className={styles.item}>
                <h3>Total Receive</h3>
                <span>$200</span>
            </div>
            <div className={styles.item}>
                <h3>Number of Refunds</h3>
                <span>20</span>
            </div>
        </div>
    )
}

export default HistoryDetails;