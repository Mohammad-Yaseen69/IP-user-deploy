import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { apiWrapper } from '../../../utils/Functions/apiWrapper';
import styles from "../styles/table.module.css";
import DeleteConfirmModal from './DeleteConfirmModal';
import { useState } from 'react';
import ViewDetailModal from './ViewDetailModal';

function TableItem({ setMenuOpenFor, width, item, index, menuOpenFor, isRole, setEditData, setShowModal }) {
    const { t } = useTranslation()
    const isPhone = width <= 700;
    const queryClient = useQueryClient()
    const [isDeleteModal, setIsDeleteModal] = useState(false)
    const [isViewModal, setIsViewModal] = useState(false)
    const ellipsisStyle = {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const truncate = (text, max) => {
        if (!text) return "—";
        return text.length > max ? `${text.slice(0, max)}...` : text;
    };
    const { mutate: deleteRole, isPending: isDeleting } = useMutation({
        mutationFn: () =>
            apiWrapper({
                endpoint: `/api/business-agents/roles/${item?._id}`,
                method: "DELETE",
                isEncrypted: false,
                isDecrypted: true
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            setIsDeleteModal(false)
            setMenuOpenFor(null)
        },
        onError: (err) => {
            console.error("Delete Error:", err)
        }
    })
    const { mutate: deleteAgents, isPending: isDeletingAgents } = useMutation({
        mutationFn: () =>
            apiWrapper({
                endpoint: `/api/business-agents/agents/${item?._id}`,
                method: "DELETE",
                isEncrypted: false,
                isDecrypted: true
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] })
            setIsDeleteModal(false)
            setMenuOpenFor(null)
        },
        onError: (err) => {
            console.error("Delete Error:", err)
        }
    })

    console.log(item,"itemdata")
    return (
        <div
            className={`${styles.tr} ${styles.dataRow}`}
            onClick={() => setMenuOpenFor(null)}
        >
            {isRole ? (
                <>
                    {width > 700 && (
                        <div style={{ flex: 0.05, textAlign: "center" }} className={`${styles.td} ${styles.serial}`}>
                            {index + 1}
                        </div>
                    )}

                    <div style={{ flex: isPhone ? 0.40 : 0.30, ...ellipsisStyle }} className={styles.td}>
                        {truncate(item?.title, 15) || "—"}
                    </div>

                    {width > 700 && (
                        <div style={{ flex: 0.35, ...ellipsisStyle }} className={styles.td}>
                            {truncate(item?.description, 35)}
                        </div>
                    )}

                    <div style={{ flex: isPhone ? 0.35 : 0.25 }} className={styles.td}>
                        <span style={{
                            background: "#f0f0f0",
                            color: "#444",
                            padding: "2px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                        }}>
                            {item?.permissions?.length ?? 0} {t("permissions")}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    {width > 700 && (
                        <div style={{ flex: 0.05, textAlign: "center" }} className={`${styles.td} ${styles.serial}`}>
                            {index + 1}
                        </div>
                    )}

                    <div style={{ flex: isPhone ? 0.25 : 0.18, ...ellipsisStyle }} className={styles.td}>
                        {item?.first_name + item?.last_name || "—"}
                    </div>

                    <div style={{ flex: isPhone ? 0.40 : 0.18, ...ellipsisStyle }} className={styles.td}>
                        {item?.phone || "—"}
                    </div>

                    {width > 700 && (
                        <div style={{ flex: 0.26, ...ellipsisStyle }} className={styles.td}>
                            {item?.email || "—"}
                        </div>
                    )}

                    <div style={{ flex: isPhone ? 0.20 : 0.12 }} className={`${styles.td} ${styles.amount}`}>
                        {truncate(item?.role?.title, 15) || "—"}
                    </div>

                    {width > 700 && (
                        <div style={{ flex: 0.17 }} className={styles.td}>
                            <span style={{
                                background: item?.status === "active" ? "#e6f9ed" : "#ffeaea",
                                color: item?.status === "active" ? "#1a8a3c" : "#c0392b",
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                textTransform: "capitalize"
                            }}>
                                {item?.status || "—"}
                            </span>
                        </div>
                    )}
                </>
            )}

            <div
                style={{ flex: isPhone ? 0.15 : 0.1, display: "flex", justifyContent: "flex-end" }}
                className={`${styles.td} ${styles.actions}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.threeDotsBtn}
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenFor((prev) => prev === item?._id ? null : item?._id);
                    }}
                >
                    <MoreHorizontal size={18} />
                </button>

                {menuOpenFor === item?._id && (
                    <div className={styles.actionsMenu} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.menuItem} onClick={() => {
                            setIsViewModal(true)
                            setMenuOpenFor(null)
                        }}>
                            {t("View")}
                        </div>
                        <div className={styles.menuItem} onClick={() => {
                            setMenuOpenFor(null);
                            setEditData(item);
                            setShowModal(true);
                        }}>
                            {t("Edit")}
                        </div>
                        <div className={`${styles.menuItem} ${styles.danger}`} onClick={() => {
                            setIsDeleteModal(true)
                            setMenuOpenFor(null)
                        }}>
                            {isDeleting ? t("Deleting...") : t("Delete")}
                        </div>
                    </div>
                )}

                {isDeleteModal && (
                    <DeleteConfirmModal
                        isOpen={isDeleteModal}
                        toggle={() => setIsDeleteModal(false)}
                        onConfirm={() => isRole ? deleteRole() : deleteAgents()}
                        itemName={item?.title || item?.name}
                    />
                )}
                {isViewModal && (
                    <ViewDetailModal
                        isOpen={isViewModal}
                        toggle={() => setIsViewModal(false)}
                        item={item}
                        isRole={isRole}
                    />
                )}
            </div>
        </div>
    )
}

export default TableItem