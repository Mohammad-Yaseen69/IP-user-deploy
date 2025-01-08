import RTBActions from "./RTB_Actions";
import styles from "./RequestsTable.module.scss"



const PendingReqTableBody = ({ data }) => {
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
                        <RTBActions status={item.status} />
                    </tr>
                )
            })}
        </tbody>
    );
};

export default PendingReqTableBody
