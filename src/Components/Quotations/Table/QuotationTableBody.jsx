import QTBActions from "./QTB_Actions";
import styles from "./QuotationsTable.module.scss"



const QuotationTableBody = ({ data }) => {
    return (
        <tbody>
            {data.map((item) => {
                return (
                    <tr>
                        <td className="wider">
                            {item.name}
                        </td>
                        <td className={styles.hidden}>{item.date}</td>
                        <td className={styles.hidden}>{item.time}</td>
                        <td className={styles.hidden}>{item.transaction_id}</td>
                        <td /*className={styles.hidden}*/>{item.amount}</td>
                        <QTBActions status={item.status} />
                    </tr>
                )
            })}
        </tbody>
    );
};

export default QuotationTableBody
