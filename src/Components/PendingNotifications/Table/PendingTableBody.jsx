import { useTranslation } from "react-i18next";
import QTBActions from "./QTB_Actions";
import RTBActions from "./RTB_Actions";
import styles from "./RequestsTable.module.scss"



const PendingTableBody = ({ data, sst, ssi }) => {
    const { t } = useTranslation()
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
                        <td className={styles.hidden}>{t(item.type)}</td>
                        {/* <td className={styles.hidden}>{item.time}</td> */}
                        <td className={styles.hidden}>{item.transaction_id}</td>
                        <td /*className={styles.hidden}*/>${item.amount.toLocaleString()}.00</td>
                        {
                            item.transaction_id.includes("QUO")
                                ?
                                <QTBActions status={item.status} id={item.id} ssi={ssi} sst={sst} />
                                :
                                <RTBActions status={item.status} />
                        }
                    </tr>
                )
            })}
        </tbody>
    );
};

export default PendingTableBody