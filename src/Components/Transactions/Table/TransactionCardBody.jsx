// import { transactions } from "./TransactionData";
import { useTranslation } from "react-i18next";
import { Badges } from "../../../AbstractElements";
import styles from "./TranTable.module.scss"



const TransactionCardsBody = ({ transactions }) => {
    const { t } = useTranslation()
    return (
        <tbody>
            {transactions.map((item) => {
                let statusColor, amountSign;


                if (item.status.toLowerCase() === "pending") {
                    statusColor = "secondary"
                } else if (item.status.toLowerCase() === "completed") {
                    statusColor = "success"
                } else if (item.status.toLowerCase() === "cancelled") {
                    statusColor = "danger"
                }

                if (item.type.toLowerCase() === "send" || item.type.toLowerCase() === "quote") {
                    amountSign = "-"
                } else if (item.type.toLowerCase() === "receive" || item.type.toLowerCase() === "request") {
                    amountSign = "+"
                }

                return (
                    <tr>
                        <td className="wider">
                            <div>{item.beneficiary}</div>
                            <div className={styles.show} style={{ fontSize: ".7rem", fontWeight: "400" }}>{item.date}</div>
                        </td>
                        <td className={styles.hidden}>{item.date}</td>
                        <td className={styles.hidden}>{t(item.type)}</td>
                        <td className={styles.hidden}>{item.transactionTime}</td>
                        <td className={styles.hidden}>{t(item.paymentType)}</td>
                        <td className={styles.hidden}>{item.transactionId}</td>
                        <td>{`${amountSign}${item.amount}`}</td>
                        <td>
                            <div className={styles.hidden}>
                                <Badges attrBadge={{ color: statusColor, variant: "rounded", style: { fontSize: ".7rem" } }}>{t(item.status)}</Badges>
                            </div>
                            <div className={styles.show} style={{ textAlign: "center" }}>
                                {
                                    statusColor === "success"
                                    &&
                                    <i className="fa fa-check-circle-o"
                                        style={{
                                            backgroundColor: "green",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            padding: ".5rem",
                                            borderRadius: "10px"
                                        }}></i>
                                }
                                {
                                    statusColor === "secondary"
                                    &&
                                    <i className="fa fa-circle-o"
                                        style={{
                                            backgroundColor: "orange",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            padding: ".5rem",
                                            borderRadius: "10px"
                                        }}></i>
                                }
                                {
                                    statusColor === "danger"
                                    &&
                                    <i className="fa fa-times-circle-o"
                                        style={{
                                            backgroundColor: "red",
                                            color: "white",
                                            fontSize: "1.1rem",
                                            padding: ".5rem",
                                            borderRadius: "10px"
                                        }}></i>
                                }
                            </div>
                        </td>
                    </tr>
                )
            })}
        </tbody>
    );
};

export default TransactionCardsBody
