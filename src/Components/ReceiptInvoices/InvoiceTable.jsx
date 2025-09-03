import React from "react"
import styles from "./styles/index.module.scss"
import { useTranslation } from "react-i18next"
import InvoiceItem from "./InvoiceItem"


export const formatDateTime = (iso) => {
    try {
        return new Date(iso).toLocaleString()
    } catch (_) {
        return iso
    }
}



const InvoiceTable = ({ filteredInvoices }) => {
    const { t } = useTranslation()

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={`${styles.tr} ${styles.thead}`}>
                    <div style={{ textAlign: "justify" }} className={`${styles.th} ${styles.serial}`}>{t('S.No')}</div>
                    <div className={styles.th}>{t('Date and Time')}</div>
                    <div className={styles.th}>{t('Title')}</div>
                    <div className={`${styles.th} ${styles.amount}`}>{t('Amount')}</div>
                    <div className={styles.th}>{t('Status')}</div>
                    <div className={styles.th}>{t('Recurring')}</div>
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
                        <InvoiceItem sn={sn} badgeClass={badgeClass} inv={inv} idx={idx} />
                    )
                })}
            </div>
        </div>
    )
}

export default InvoiceTable