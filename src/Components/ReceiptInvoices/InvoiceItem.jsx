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
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from "reactstrap"
import { ButtonForRequests } from "./UI/FormElements"



const InvoiceItem = ({ sn, inv, badgeClass, setEditModal }) => {
    const [menuOpenFor, setMenuOpenFor] = useState(null)
    const [expanded, setExpanded] = useState({})
    const [showConfirm, setShowConfirm] = useState(false)
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const width = useWindowWidth()

    const toggleExpand = (invoiceId) => {
        setExpanded(prev => ({ ...prev, [invoiceId]: !prev[invoiceId] }))
    }

    const { isPending, mutateAsync } = useMutation({
        mutationFn: (invoiceId) => deleteInvoice(invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] })
        }
    })
    const truncate = (text, max) => {
        if (!text) return "";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    }
    const ellipsisStyle = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
    const isPhone = width <= 700;
    return (
        <React.Fragment key={inv.invoiceId}>
            <div
                className={`${styles.tr} ${styles.dataRow}`}
                onClick={() => {
                    setMenuOpenFor(null)
                    toggleExpand(inv.invoiceId)
                }}
            >
                {width > 700 && <div style={{ textAlign: "justify", flex: .050 }} className={`${styles.td} ${styles.serial}`}>{sn}</div>}
                <div style={{ flex: isPhone ? .28 : .18 }} className={styles.td}>{formatDateTime(inv.createdAt)}</div>
                <div style={{ flex: isPhone ? .62 : .24, ...ellipsisStyle }} className={styles.td}>{truncate(inv.title, 50)}</div>
                {width > 700 && <div style={{ flex: .26, ...ellipsisStyle }} className={styles.td}>{truncate(inv.description, 30)}</div>}
                {width > 700 && <div style={{ flex: .12 }} className={`${styles.td}`}>{inv.currency} {Number(inv.amount).toFixed(2)}</div>}
                {width > 700 && <div style={{ flex: .17, ...ellipsisStyle }} className={styles.td}>{inv.receivingWallet?.wallet_id}</div>}
                {width > 700 && <div style={{ flex: .13 }} className={styles.td}>
                    <span className={`${styles.badge} ${badgeClass}`}>{t(inv.status)}</span>
                </div>
                }
                <div style={{ flex: .1, display: "flex", justifyContent: "flex-end" }} className={`${styles.td} ${styles.actions}`} onClick={(e) => e.stopPropagation()}>
                    <button
                        className={styles.threeDotsBtn}
                        style={{ display: "flex", justifySelf: "flex-end", justifyContent: "center", alignItems: "center" }}
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
                                    setShowConfirm(true)
                                }}>
                                {t('Delete')}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={showConfirm} toggle={() => setShowConfirm(false)}>
                <ModalHeader toggle={() => setShowConfirm(false)}>
                    {t('Confirm Deletion')}
                </ModalHeader>
                <ModalBody>
                    {t('Are you sure you want to delete this invoice?')}
                </ModalBody>
                <ModalFooter>
                    <button toggle={() => setShowConfirm(false)} style={{ background: "none", border: "none", outline: "none", fontWeight: 600, fontSize: "14px" }}>
                        {t("Cancel")}
                    </button>
                    <ButtonForRequests
                        onClick={() => {
                            if (!isPending) {
                                mutateAsync(inv.invoiceId).finally(() => {
                                    setShowConfirm(false)
                                })
                            }
                        }}
                        isLoading={isPending}
                    >
                        {t("Delete")}
                    </ButtonForRequests>
                </ModalFooter>
            </Modal>

            <AnimatePresence>
                {expanded[inv.invoiceId] && (
                    <SwipeableDrawer
                        anchor={width < 750 ? "bottom" : "right"}
                        onClose={() => toggleExpand(inv.invoiceId)}
                        open={expanded[inv.invoiceId]}
                        PaperProps={{
                            component: motion.div,
                            initial: { [width < 750 ? "y" : "x"]: "100%", filter: "blur(5px)" },
                            animate: { [width < 750 ? "y" : "x"]: 0, filter: "blur(0px)" },
                            exit: { [width < 750 ? "y" : "x"]: "100%", filter: "blur(5px)" },
                            transition: { type: "spring", stiffness: 400, damping: 30 },
                        }}
                    >
                        <div style={{ width: width < 750 ? "100%" : "550px", height: width < 750 && "80vh" }}>
                            <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: "0px", left: "0px", background: "white", zIndex: 100 }}>
                                <h4 style={{ width: "90%", wordWrap: "break-word" }}>
                                    {inv.title}
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