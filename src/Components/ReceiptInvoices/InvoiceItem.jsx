import React, { useState } from "react"
import styles from "./styles/index.module.scss"
import { useTranslation } from "react-i18next"
import { MoreHorizontal } from "react-feather"
import { Toggle } from "../MyMasterCard/CardPurchased"
import { formatDateTime } from "./InvoiceTable"
import InvoiceItemDetails from "./UI/InvoiceItemDetails"



const InvoiceItem = ({ sn, inv, badgeClass }) => {
    const [menuOpenFor, setMenuOpenFor] = useState(null)
    const [expanded, setExpanded] = useState({})
    const { t } = useTranslation()


    const toggleExpand = (invoiceId) => {
        setExpanded(prev => ({ ...prev, [invoiceId]: !prev[invoiceId] }))
    }
    return (
        <React.Fragment key={inv.invoiceId}>
            <div
                className={`${styles.tr} ${styles.dataRow}`}
                onClick={() => {
                    setMenuOpenFor(null)
                    toggleExpand(inv.invoiceId)
                }}
            >
                <div style={{ textAlign: "justify" }} className={`${styles.td} ${styles.serial}`}>{sn}</div>
                <div className={styles.td}>{formatDateTime(inv.createdAt)}</div>
                <div className={styles.td}>{inv.title}</div>
                <div className={`${styles.td}`}>{inv.currency} {Number(inv.amount).toFixed(2)}</div>
                <div className={styles.td}>
                    <span className={`${styles.badge} ${badgeClass}`}>{t(inv.status)}</span>
                </div>
                <div className={styles.td} onClick={(e) => e.stopPropagation()}>
                    <Toggle
                        checked={!!inv.recurring}
                    />
                </div>
                <div className={`${styles.td} ${styles.actions}`} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={styles.threeDotsBtn}
                        onClick={() => setMenuOpenFor(menuOpenFor === inv.invoiceId ? null : inv.invoiceId)}
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {menuOpenFor === inv.invoiceId && (
                        <div className={styles.actionsMenu}>
                            <div className={styles.menuItem} onClick={() => { setMenuOpenFor(null); toggleExpand(inv.invoiceId); }}>{t('View')}</div>
                            <div className={styles.menuItem} onClick={() => { navigator.clipboard?.writeText(inv.invoiceId); setMenuOpenFor(null); }}>{t('Copy ID')}</div>
                            <div className={styles.menuItem} onClick={() => { setMenuOpenFor(null); }}>{t('Download')}</div>
                            <div className={`${styles.menuItem} ${styles.danger}`} onClick={() => { setMenuOpenFor(null); }}>{t('Delete')}</div>
                        </div>
                    )}
                </div>
            </div>

            {expanded[inv.invoiceId] && (
                <InvoiceItemDetails inv={inv} />
            )}
        </React.Fragment>
    )
}

export default InvoiceItem