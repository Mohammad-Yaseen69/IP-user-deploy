import QTBActions from "./QTB_Actions";
import styles from "./QuotationsTable.module.scss"



const PendingQuotationTableBody = ({ data }) => {
    return (
        <tbody>
            {data.map((item) => {
                return (
                    <tr>
                        <td className="wider">
                            {item.name}
                        </td>
                        <td className={styles.hidden} style={{ display: "flex", flexDirection: "column", gap: ".1rem" }}>
                            <span>{item.date}</span>
                            <span>{item.time}</span>
                        </td>
                        {/* <td className={styles.hidden}>{item.type}</td> */}
                        {/* <td className={styles.hidden}>{item.time}</td> */}
                        <td className={styles.hidden}>{item.transaction_id}</td>
                        <td /*className={styles.hidden}*/>{item.amount}</td>
                        <QTBActions status={item.status} />
                    </tr>
                )
            })}
        </tbody>
    );
};

export default PendingQuotationTableBody
