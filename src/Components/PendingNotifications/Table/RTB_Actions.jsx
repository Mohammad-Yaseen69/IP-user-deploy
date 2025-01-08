import { useState } from "react";
import { X, Check } from "react-feather";
import styles from "./RequestsTable.module.scss"
import ActionModal from "./ActionModal";

const RTBActions = ({ status }) => {
    const [itemStatus, setItemStatus] = useState(status)
    const [statusType, setStatusType] = useState("")
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("")
    const toggle = () => setModal(!modal);
    return (
        <td className={styles.lastItem} style={{ marginRight: "42px" }}>
            {
                itemStatus === ""
                    ?
                    <>
                        <button title="Reject" className={`${styles.btn} ${styles.btn_danger}`} onClick={() => {
                            setModal(true)
                            setModalMessage("Are you sure, You want to decline this request?")
                            setStatusType("reject")
                        }}><X /></button>
                        <button title="Accept" className={`${styles.btn} ${styles.btn_success}`} onClick={() => {
                            setModal(true)
                            setModalMessage("Are you sure, You want to accept this request?")
                            setStatusType("accept")
                        }}><Check /></button>
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

export default RTBActions;