import React, { useRef } from 'react'
import styles from "./styles/RecipientCard.module.scss"
// import { Check } from 'react-feather'

const RecipientCard = ({ user, bulkPayments = false }) => {
    const checkRef = useRef(null)
    return (
        <>
            <input type="checkbox" ref={checkRef} hidden={!bulkPayments} />
            <div className={styles.card} onClick={() => bulkPayments ? checkRef.current.checked = true : // console.log("change later")}>
                <div className={styles.left}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "25px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        color: "white",
                        fontSize: "1.4rem",
                        fontWeight: 800
                    }}>{user?.beneficiary_type === "individual" ? user?.first_name[0]?.toUpperCase() : user?.company ? user?.company_name[0]?.toUpperCase() : ""}</div>
                    <div>
                        <div className={styles.top}>
                            {
                                user?.beneficiary_type === "individual"
                                &&
                                <p className={styles.name}>{user?.first_name} {user?.last_name}</p>
                            }
                            {
                                user?.beneficiary_type === "business"
                                &&
                                user?.company
                                &&
                                <p className={styles.name}>{user?.company_name.split(" ")[0].slice(0, 10)}</p>
                            }
                            {/* <p className={styles.verify}><span><Check size={12} color="white" /></span>{user?.isVerified ? "Verified" : ""}</p> */}
                        </div>
                        {/* <p className={styles.bottom}>{user?.beneficiary_type}</p> */}
                        <p className={styles.bottom}>{user?.account_type.join(", ")}</p>
                        {/* {
                            user?.account_type.some(item => item === "Bank")
                            &&
                            <p className={styles.bottom}>{user?.bank_name.slice(0, 14)}{user?.bank_name.length > 14 && ".."}</p>
                        } */}
                        {/* {
                            user?.account_type.some(item => item === "Mobile")
                            &&
                            <p className={styles.bottom}>{user?.mobile_wallet_name.slice(0, 14)}{user?.mobile_wallet_name.length > 14 && ".."}</p>
                        } */}
                    </div>
                </div>
                <div className={styles.right}>
                    {/* <div> */}
                    {/* <p className={styles.id}>ID {user?.id < 10 ? `0${user?.id}` : user?.id}</p> */}
                    {/* <p className={styles.acc}>(AC {user?.bank_account_number})</p> */}
                    {/* <p className={styles.acc}>(Address: {user?.address})</p> */}
                    {/* </div> */}
                    <span><i className="fa fa-angle-right"></i></span>
                </div>
            </div >
        </>
    )
}

export default RecipientCard