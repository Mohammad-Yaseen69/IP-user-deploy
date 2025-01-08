import { BsCalendarCheck } from "react-icons/bs";
import { Badges } from "../../AbstractElements";
import { TransactionData } from "./TransactionData";
import styles from "./styles/TransactionItem.module.scss"

const TransactionsBody = () => {

    return (
        <tbody>
            {TransactionData.map((item, id) => {
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
                    <tr key={id}>
                        <td style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem"
                        }}>
                            <img src={item.img} alt="bitcoin" style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "contain",
                                borderRadius: "50%"
                            }} />
                            <span style={{
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <span style={{
                                    margin: 0,
                                    padding: 0,
                                    fontWeight: 600,
                                }}>{item.title}</span>
                            </span>
                        </td>
                        <td>
                            <span style={{
                                // fontSize: "rem",
                                fontWeight: "400"
                            }}>{item.date}</span>
                        </td>
                        <td>
                            <span className={styles.amount}>{item.type === "sent" ? "-" : "+"}${item.amount.toLocaleString()}</span>
                        </td>
                        <td className="text-end">
                            <Badges attrBadge={{ color: statusColor, variant: "rounded", style: { fontSize: ".7rem" } }}>{item.status}</Badges>
                        </td>
                    </tr>
                )
            })}
        </tbody>
    );
};

export default TransactionsBody;