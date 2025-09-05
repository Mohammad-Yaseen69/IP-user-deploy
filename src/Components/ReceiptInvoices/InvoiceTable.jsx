import React from "react"
import styles from "./styles/index.module.scss"
import { useTranslation } from "react-i18next"
import InvoiceItem from "./InvoiceItem"
import useWindowWidth from "../../utils/useWindowWidth"


export const formatDateTime = (iso, dateOrTime = "both") => {
    try {
        if (dateOrTime === "time") {
            return new Date(iso).toLocaleTimeString()
        } else if (dateOrTime === "date") {
            return new Date(iso).toLocaleDateString()
        }
        else {
            return new Date(iso).toLocaleString()
        }
    } catch (_) {
        return iso
    }
}



const InvoiceTable = ({ filteredInvoices, setEditModal }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={`${styles.tr} ${styles.thead}`}>
                    <div style={{ textAlign: "justify" }} className={`${styles.th} ${styles.serial}`}>{t('S.No')}</div>
                    {width > 700 && < div className={styles.th}>{t('Date and Time')}</div>}
                    <div className={styles.th}>{t('Title')}</div>
                    {width > 450 && <div className={`${styles.th} ${styles.amount}`}>{t('Amount')}</div>}
                    {width > 700 && <div className={styles.th}>{t('Receiving Wallet')}</div>}
                    {width > 700 && <div className={styles.th}>{t('Status')}</div>}
                    <div className={`${styles.th} ${styles.actions}`}>{t('Actions')}</div>
                </div>

                {filteredInvoices.map((inv, idx) => {
                    const sn = idx + 1
                    const badgeClass = inv.status === 'Accepted'
                        ? styles.badgeAccepted
                        : inv.status === 'Declined'
                            ? styles.badgeDeclined
                            : styles.badgeRequested

                    return (
                        <InvoiceItem setEditModal={setEditModal} sn={sn} badgeClass={badgeClass} inv={inv} idx={idx} />
                    )
                })}
            </div>
        </div >
    )
}

export default InvoiceTable