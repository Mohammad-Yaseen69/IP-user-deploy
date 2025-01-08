import { useState } from "react"
import { Btn } from "../../AbstractElements"
import RecipientCard from "./RecipientCard"
import styles from "./styles/RecipientsTable.module.scss"

const RecipientsTable = ({ sst }) => {
    const [bulkPayments, setBulkPayments] = useState(false)

    const data = [
        {
            id: 1,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 2,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 3,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 4,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 5,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 6,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 7,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
        {
            id: 8,
            avatar: "https://img.freepik.com/free-icon/user_318-159711.jpg",
            name: "Imtiaz",
            bank: "HBL Limited",
            acc_num: "0000 1111 2222 3333",
            isVerified: true
        },
    ]

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <h3>Your Contacts</h3>
                    <form>
                        <input type="text" className="form-control" placeholder='Search contacts' style={{ maxWidth: "200px", margin: 0 }} />
                    </form>
                </div>

                <Btn attrBtn={{
                    color: 'primary',
                    outline: !bulkPayments && true,
                    className: `${!bulkPayments ? "btn-outline-primary" : ""}`,
                    style: { fontSize: ".7rem" },
                    onClick: () => setBulkPayments(!bulkPayments)
                }}>Bulk Payments</Btn>
            </div>
            <div className={styles.table}>
                {
                    data.map(userData => (
                        <div className={styles.recItem}>
                            <RecipientCard user={userData} sst={sst} bulkPayments={bulkPayments} />
                        </div>
                    ))
                }
            </div>
            {
                bulkPayments
                &&
                <div className={styles.button} style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <Btn attrBtn={{
                        color: 'primary', type: 'submit', style: { fontSize: ".7rem" }, onClick: () => {
                            setBulkPayments(!bulkPayments)
                            sst(true)
                        }
                    }}>Continue</Btn>
                </div>
            }
        </div >
    )
}

export default RecipientsTable