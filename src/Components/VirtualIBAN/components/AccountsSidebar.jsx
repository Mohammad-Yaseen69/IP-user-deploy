import React, { useState } from "react";
import { MoreHorizontal, Plus } from "react-feather";
import styles from "../styles/AccountsSidebar.module.css";
import VirtualIbanModal from "../VirtualIbanModal";
import UK_Image from "../files/images/UK.svg"
import Malta_Image from "../files/images/Malta.svg"

const accounts = [
    {
        id: 1,
        flag: UK_Image,
        name: "Primary IBAN",
        currency: "GB-IBAN",
        badge: "Active",
        active: true,
    },
    {
        id: 2,
        flag: Malta_Image,
        name: "Secondary IBAN",
        currency: "EU-IBAN",
        badge: null,
        active: false,
    },
];

const AccountsSidebar = ({ selectedAccount, onSelect, setShowGetIBAN }) => {
    const [showModal, setShowModal] = useState(false)

    const handleOpenModal = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }


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
                        <input
                            type="radio"
                            name="accountSelection"
                            checked={selectedAccount === acc.id}
                            onChange={() => onSelect(acc.id)}
                        />

                        <div className={styles.flagBox}>
                            <img src={acc?.flag} alt="" />
                        </div>

                        <div className={styles.accInfo}>
                            <span className={styles.accName}>{acc.name}</span>
                            <span className={styles.accCurrency}>{acc.currency}</span>
                        </div>
                    </div>
                ))}

            </div>
            <div className={styles.openNew} onClick={handleOpenModal}>
                <div className={styles.plusIcon}>
                    <Plus size={14} />
                </div>
                <div className={styles.accInfo}>

                    <span>Open new IBAN</span>
                    <span className={styles.accCurrency}>{("MT · GB · DE jurisdictions")}</span>
                </div>

            </div>

            <VirtualIbanModal
                isOpen={showModal}
                toggle={handleCloseModal}
            />



        </div>
    );
};

export default AccountsSidebar;