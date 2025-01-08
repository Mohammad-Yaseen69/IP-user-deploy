import { useState } from "react";
import { X, Check, Edit } from "react-feather";
import styles from "./QuotationsTable.module.scss"

const QTBActions = ({ status }) => {
    const [itemStatus, setItemStatus] = useState(status)
    return (
        <td className={styles.lastItem}>
            {
                itemStatus === ""
                    ?
                    <>
                        <button title="Reject" className={`${styles.btn} ${styles.btn_danger}`} onClick={() => setItemStatus(false)}><X /></button>
                        <button title="Accept" className={`${styles.btn} ${styles.btn_success}`} onClick={() => setItemStatus(true)}><Check /></button>
                        <button title="Edit Quotation" className={styles.edit_quote}><Edit /></button>
                    </>
                    :
                    <>
                        {itemStatus !== false ? "Accepted" : "Rejected"}
                    </>
            }
        </td>
    )
}

export default QTBActions;