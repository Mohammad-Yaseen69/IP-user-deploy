import { useState } from "react";
import { X, Check, Edit } from "react-feather";
import styles from "./RequestsTable.module.scss"
import ActionModal from "./ActionModal";

const QTBActions = ({ status, sst, id, ssi }) => {
    const [itemStatus, setItemStatus] = useState(status)
    const [statusType, setStatusType] = useState("")
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("")
    const toggle = () => setModal(!modal);
    return (
        <td className={styles.lastItem}>
            {
                itemStatus === ""
                    ?
                    <>
                        <button title="Reject" className={`${styles.btn} ${styles.btn_danger}`} onClick={() => {
                            setModal(true)
                            setModalMessage("Are you sure, You want to decline this quotation?")
                            setStatusType("reject")
                        }}><X /></button>
                        <button title="Accept" className={`${styles.btn} ${styles.btn_success}`} onClick={() => {
                            setModal(true)
                            setModalMessage("Are you sure, You want to accept this quotation?")
                            setStatusType("accept")
                        }}><Check /></button>
                        <button title="Edit Quotation" className={styles.edit_quote} onClick={() => {
                            sst(true)
                            ssi(id)
                        }}><Edit /></button>
                        <ActionModal isOpen={modal} title="Confirm" toggler={toggle} buttonOneText="Cancel" buttonTwoText="Proceed" action={statusType} setStatus={setItemStatus}>
                            {modalMessage}
                        </ActionModal>
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