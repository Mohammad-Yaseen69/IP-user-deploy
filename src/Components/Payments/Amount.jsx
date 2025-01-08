import React from 'react'
import styles from "./styles/Amount.module.scss"

const Amount = ({ amount, title, currency, setAmount, setCurrency }) => {
    return (
        <div className={styles.container}>
            <p className={styles.title}>{title}</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="999" />
            {
                title.toLowerCase().split(" ")[0] === "benificiary"
                    ?
                    <p className={styles.currency}>{currency}</p>
                    :
                    <select value={currency} className={styles.currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
            }
        </div>
    )
}

export default Amount