import { Link } from "react-router-dom"
import styles from "./styles/RecentTransactions.module.scss"
import { IoIosArrowForward } from "react-icons/io"
import { TransactionData } from "./TransactionData"
import TransactionItem from "./TransactionItem"

const RecentTransactions = () => {
    return (
        <div className={styles.table}>
            <div className={styles.top}>
                <h2>Recent Transactions</h2>
                <Link to={"/"}>
                    View All
                    <IoIosArrowForward />
                </Link>
            </div>
            <div className={styles.table_body}>
                {
                    TransactionData.map((item, index) => {
                        return <TransactionItem key={index} item={item} />
                    })
                }
            </div>
        </div>
    )
}

export default RecentTransactions