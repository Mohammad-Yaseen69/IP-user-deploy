import React from 'react'
import styles from "../styles/RecentTransactions.module.css";
import { Copy, Info, Plus } from 'react-feather';

const Empty = () => {
    const handleCopyIBAN = () => {
        navigator.clipboard.writeText("YOUR_IBAN_HERE");
        alert("IBAN copied to clipboard!");
    };
    return (
        <div className={styles.emptyContainer}>
            <div className={styles.iconWrapper}>
                <Info size={32} className={styles.centerIcon} />
            </div>

            <div className={styles.textContent}>
                <h3 className={styles.title}>No transactions yet</h3>
                <p className={styles.description}>
                    Your virtual bank is ready to receive money. Send a SEPA transfer using
                    your IBAN, top up by card, or move funds from another wallet to get started.
                </p>
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.secondaryButton} onClick={handleCopyIBAN}>
                    <Copy size={20} />
                    <span>Copy IBAN to receive</span>
                </button>

                <button className={styles.primaryButton}>
                    <Plus size={20} />
                    <span>Add funds</span>
                </button>
            </div>
        </div>)
}

export default Empty
