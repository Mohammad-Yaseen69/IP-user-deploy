import React, { useState } from "react";
import { MoreHorizontal, Plus } from "react-feather";
import styles from "../styles/AccountsSidebar.module.css";

const accounts = [
    {
        id: 1,
        flag: "🇬🇧",
        name: "Primary IBAN",
        currency: "GB-IBAN",
        badge: "Active",
        active: true,
    },
    {
        id: 2,
        flag: "🇪🇺",
        name: "Secondary IBAN",
        currency: "EU-IBAN",
        badge: null,
        active: false,
    },
];

const AccountsSidebar = ({ selectedAccount, onSelect }) => {
    return (
        <div className={styles.sidebar}>
            <p className={styles.label}>Your accounts <span> <MoreHorizontal /></span></p>

            <div className={styles.accountItemCon}>
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className={`${styles.accountItem} ${selectedAccount === acc.id ? styles.selected : ""
                            }`}
                        onClick={() => onSelect(acc.id)}
                    >
                        <div className={styles.flagBox}>
                            <span>{acc.flag}</span>
                        </div>
                        <div className={styles.accInfo}>
                            <span className={styles.accName}>{acc.name}</span>
                            <span className={styles.accCurrency}>{acc.currency}</span>
                        </div>
                        {acc.badge && (
                            <span className={styles.activeBadge}>{acc.badge}</span>
                        )}
                    </div>
                ))}

            </div>
            <div className={styles.openNew}>
                <div className={styles.plusIcon}>
                    <Plus size={14} />
                </div>
                <span>Open new IBAN</span>
            </div>
        </div>
    );
};

export default AccountsSidebar;