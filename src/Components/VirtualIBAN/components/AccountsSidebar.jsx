import { useState } from "react"
import { MoreHorizontal, Plus } from "react-feather"
import styles from "../styles/AccountsSidebar.module.css"
import VirtualIbanModal from "../VirtualIbanModal"
import UK_Image from "../files/images/UK.svg"
import Malta_Image from "../files/images/Malta.svg"

const getIbanCountry = (iban = "") => iban.slice(0, 2).toUpperCase()

const AccountsSidebar = ({ selectedAccount, onSelect, accounts = [], isLoading }) => {
    const [showModal, setShowModal] = useState(false)

    const handleOpenModal = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    return (
        <div className={styles.sidebar}>
            <p className={styles.label}>
                Your accounts <span><MoreHorizontal /></span>
            </p>

            <div className={styles.accountItemCon}>
                {isLoading && <div className={styles.accCurrency}>Loading accounts...</div>}
                {
                    !isLoading && accounts.length === 0 && (
                        <div className={styles.accCurrency}>No virtual IBANs yet</div>
                    )
                }

                {
                    accounts.map((acc, index) => {
                        const id = acc?._id || acc?.id
                        const country = getIbanCountry(acc?.iban)

                        return (
                            <div
                                key={id}
                                className={`${styles.accountItem} ${selectedAccount === id ? styles.selected : ""}`}
                                onClick={() => onSelect(id)}
                            >
                                <input type="radio" checked={selectedAccount === id} readOnly />
                                <div className={styles.flagBox}>
                                    <span>{country || "--"}</span>
                                </div>
                                <div className={styles.accInfo}>
                                    <span className={styles.accName}>
                                        {index === 0 ? "Primary IBAN" : `IBAN ${index + 1}`}
                                    </span>
                                    <span className={styles.accCurrency}>{acc?.currency} IBAN</span>
                                </div>
                            </div>
                        )
                    })
                }
            </div >

            <div className={styles.openNew} onClick={handleOpenModal}>
                <div className={styles.plusIcon}>
                    <Plus size={14} />
                </div>
                <div className={styles.accInfo}>
                    <span>Open new IBAN</span>
                    <span className={styles.accCurrency}>MT jurisdictions</span>
                </div>
            </div>

            <VirtualIbanModal
                isOpen={showModal}
                toggle={handleCloseModal}
            />
        </div >
    )
}

export default AccountsSidebar
