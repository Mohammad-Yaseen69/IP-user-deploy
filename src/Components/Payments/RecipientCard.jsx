import React, { useRef } from 'react'
import styles from "./styles/RecipientCard.module.scss"
import { Check } from 'react-feather'

const RecipientCard = ({ user, bulkPayments, setStepNumber, setCompleted, setSendBeneficiaries }) => {
    const checkRef = useRef(null)
    return (
        <>
            <input type="checkbox" ref={checkRef} hidden={!bulkPayments} />
            <div className={styles.card} onClick={() => {
                if (bulkPayments) {
                    checkRef.current.checked = true
                    setSendBeneficiaries(prev => [...prev, user.name])
                } else {
                    setSendBeneficiaries([user.name])
                    setStepNumber(9)
                    setCompleted(true)
                }


            }}>
                <div className={styles.left}>
                    <img src={user.avatar} alt="img" />
                    <div>
                        <div className={styles.top}>
                            <p className={styles.name}>{user.name}</p>
                            <p className={styles.verify}><span><Check size={12} color="white" /></span>{user.isVerified ? "Verified" : ""}</p>
                        </div>
                        <p className={styles.bottom}>{user.bank}</p>
                    </div>
                </div>
                <div className={styles.right}>
                    <div>
                        <p className={styles.id}>ID {user.id < 10 ? `0${user.id}` : user.id}</p>
                        <p className={styles.acc}>(AC {user.acc_num})</p>
                    </div>
                    <span><i className="fa fa-angle-right"></i></span>
                </div>
            </div >
        </>
    )
}

export default RecipientCard