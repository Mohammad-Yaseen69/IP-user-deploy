import styles from "./styles/TransactionItem.module.scss"
import { BsCalendarCheck } from "react-icons/bs"
import { Badges } from "../../AbstractElements"

const TransactionItem = ({ item }) => {
    let statusColor;

    if (item.status == "completed") {
        statusColor = "success"
    }
    else if (item.status == "pending") {
        statusColor = "secondary"
    }
    else if (item.status == "cancelled") {
        statusColor = "danger"
    }

    return (
        <div className={styles.table_item}>
            <div className={styles.item_one}>
                <img src={item.img} alt="bitcoin" />
                <span>{item.title}</span>
            </div>
            <div className={styles.item_two}>
                <BsCalendarCheck color="grey" />
                <span>{item.date}</span>
            </div>
            <span className={styles.amount}>{item.type === "sent" ? "-" : "+"}${item.amount.toLocaleString()}</span>
            <div>
                <Badges attrBadge={{ color: statusColor, variant: "rounded", style: { fontSize: ".7rem" } }}>{item.status}</Badges>
            </div>
        </div>
    )
}

export default TransactionItem