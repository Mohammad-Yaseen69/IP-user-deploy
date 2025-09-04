import React, { useState } from "react"
import styles from "./styles/index.module.scss"
import { useTranslation } from "react-i18next"
import { MoreHorizontal, X } from "react-feather"
import { formatDateTime } from "./InvoiceTable"
import InvoiceItemDetails from "./UI/InvoiceItemDetails"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteInvoice } from "./queries"
import { SwipeableDrawer } from "@mui/material"
import useWindowWidth from "../../utils/useWindowWidth"
import { AnimatePresence, motion } from "framer-motion"



const InvoiceItem = ({ sn, inv, badgeClass, setEditModal }) => {
    const [menuOpenFor, setMenuOpenFor] = useState(null)
    const [expanded, setExpanded] = useState({})
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const width = useWindowWidth()

    const toggleExpand = (invoiceId) => {
        setExpanded(prev => ({ ...prev, [invoiceId]: !prev[invoiceId] }))
    }

    const { isPending, mutate } = useMutation({
        mutationFn: (invoiceId) => deleteInvoice(invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
        }
    })
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
                {width > 700 && <div className={styles.td}>{formatDateTime(inv.createdAt)}</div>}
                <div className={styles.td}>{inv.title}</div>
                {width > 450 && <div className={`${styles.td}`}>{inv.currency} {Number(inv.amount).toFixed(2)}</div>}
                {width > 700 && <div className={styles.td}>
                    <span className={`${styles.badge} ${badgeClass}`}>{t(inv.status)}</span>
                </div>}
                {width > 700 && <div className={styles.td}>{inv.receivingWallet?.wallet_id}</div>}
                <div className={`${styles.td} ${styles.actions}`} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={styles.threeDotsBtn}
                        onClick={() => setMenuOpenFor(menuOpenFor === inv.invoiceId ? null : inv.invoiceId)}
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {menuOpenFor === inv.invoiceId && (
                        <div className={styles.actionsMenu}>
                            <div
                                className={styles.menuItem}
                                onClick={() => { setMenuOpenFor(null); toggleExpand(inv.invoiceId); }}>
                                {t('View')}
                            </div>
                            <div
                                className={styles.menuItem}
                                onClick={() => {
                                    setEditModal({
                                        open: true,
                                        invoice: inv
                                    })
                                    setMenuOpenFor(null)
                                }}>
                                {t('Edit')}
                            </div>
                            <div className={styles.menuItem}
                                onClick={() => { }}
                            >
                                {t('Download')}
                            </div>
                            <div
                                className={`${styles.menuItem} ${styles.danger}`}
                                onClick={() => {
                                    setMenuOpenFor(null)
                                    setExpanded(prev => ({ ...prev, [inv.invoiceId]: false }))
                                    if (!isPending) {
                                        mutate(inv.invoiceId)
                                    }
                                }}>
                                {t('Delete')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded[inv.invoiceId] && (
                    <SwipeableDrawer
                        anchor={width < 600 ? "bottom" : "right"}
                        onClose={() => toggleExpand(inv.invoiceId)}
                        open={expanded[inv.invoiceId]}
                        PaperProps={{
                            component: motion.div,
                            initial: { [width < 600 ? "y" : "x"]: "100%", filter: "blur(5px)" },
                            animate: { [width < 600 ? "y" : "x"]: 0, filter: "blur(0px)" },
                            exit: { [width < 600 ? "y" : "x"]: "100%", filter: "blur(5px)" },
                            transition: { type: "spring", stiffness: 400, damping: 30 },
                        }}
                    >
                        <div style={{ width: width < 600 ? "100%" : "400px", height: width < 600 && "80vh" }}>
                            <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: "0px", left: "0px", background: "white", zIndex: 100 }}>
                                <h4>
                                    {t("Invoice Details")}
                                </h4>
                                <X onClick={() => toggleExpand(inv.invoiceId)} cursor={"pointer"} />
                            </div>
                            <InvoiceItemDetails inv={inv} />
                        </div>
                    </SwipeableDrawer>
                )}
            </AnimatePresence>


        </React.Fragment>
    )
}

export default InvoiceItem