import { useState } from 'react';
import { Copy, Info, PlusCircle, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import IBANDetails from '../IBAN/IBANDetails';
import styles from "../styles/RecentTransactions.module.css";
import { toast } from 'react-toastify';

const Empty = ({ selectedIban }) => {
    const [openModal, setOpenModal] = useState(false)
    const handleCopyIBAN = () => {
        const iban = selectedIban?.iban || selectedIban?.accountNumber || "";
        navigator.clipboard.writeText(iban);
        toast.success("IBAN copied to clipboard!");
    };
    const closeModal = () => setOpenModal(false)
    const ibanId = selectedIban?._id || selectedIban?.id

    const { t } = useTranslation()
    return (
        <div className={styles.emptyContainer}>
            <div className={styles.iconWrapper}>
                <Info size={32} className={styles.centerIcon} />
            </div>

            <div className={styles.textContent}>
                <h3 className={styles.title}>{t("No transactions yet")}</h3>
                <p className={styles.description}>
                    {t("Your virtual bank is ready to receive money. Send a SEPA transfer using your IBAN, top up by card, or move funds from another wallet to get started.")}
                </p>
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.secondaryButton} onClick={handleCopyIBAN}>
                    <Copy size={20} />
                    <span>{t("Copy IBAN to receive")}</span>
                </button>

                <button className={styles.primaryButton}
                    onClick={() => setOpenModal(true)}
                >
                    <PlusCircle size={20} />
                    <span>{t("Deposit")}</span>
                </button>
            </div>
            {openModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => closeModal("deposit")}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.closeBtn}
                            onClick={() => closeModal("deposit")}
                        >
                            <X />
                        </button>

                        <IBANDetails ibanId={ibanId} fallbackIban={selectedIban} />
                    </div>
                </div>
            )}
        </div>)
}

export default Empty
