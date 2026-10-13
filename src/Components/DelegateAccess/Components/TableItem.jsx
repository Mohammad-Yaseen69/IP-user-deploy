import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "react-feather";
import { useTranslation } from "react-i18next";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import styles from "../styles/table.module.css";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useState } from "react";
import ViewDetailModal from "./ViewDetailModal";
import { toast } from "react-toastify";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";

function TableItem({
  setMenuOpenFor,
  width,
  item,
  index,
  menuOpenFor,
  isRole,
  setEditData,
  setShowModal,
}) {
  const { t } = useTranslation();
  const isPhone = width <= 700;
  const queryClient = useQueryClient();
  const hasPermission = usePermission();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const ellipsisStyle = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const truncate = (text, max) => {
    if (!text) return "—";
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };
  const {
    mutate: deleteRole,
    isPending: isDeleting,
    isSuccess: deleteRoleSuccess,
    isError: deleteRoleError,
  } = useMutation({
    mutationFn: () =>
      apiWrapper({
        endpoint: `/api/business-agents/roles/${item?._id}`,
        method: "DELETE",
        isEncrypted: false,
        isDecrypted: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setMenuOpenFor(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
    },
  });
  const {
    mutate: deleteAgents,
    isPending: isDeletingAgents,
    isSuccess: deleteAgentsSuccess,
    isError: deleteAgentsError,
  } = useMutation({
    mutationFn: () =>
      apiWrapper({
        endpoint: `/api/business-agents/agents/${item?._id}`,
        method: "DELETE",
        isEncrypted: false,
        isDecrypted: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setMenuOpenFor(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
    },
  });
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (newStatus) =>
      apiWrapper({
        endpoint: `/api/business-agents/agents/${item?._id}/status`,
        method: "PUT",
        payload: { status: newStatus },
        isEncrypted: false,
        isDecrypted: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (err) => {
      console.error("Status Update Error:", err);
    },
  });
  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: () =>
      apiWrapper({
        endpoint: `/api/business-agents/agents/${item?._id}/resend-password-email`,
        method: "POST",
        isEncrypted: false,
        isDecrypted: true,
      }),
    onSuccess: (res) => {
      toast.success(res?.message || t("Email resent successfully"));
      setMenuOpenFor(null);
    },
    onError: (err) => {
      console.error("Resend Error:", err);
      toast.error(err?.response?.data?.message || t("Failed to resend email"));
    },
  });

  return (
    <div className={`${styles.tr} ${styles.dataRow}`} onClick={() => setMenuOpenFor(null)}>
      {width > 700 ? (
        isRole ? (
          <>
            {width > 700 && (
              <div
                style={{ flex: 0.05, textAlign: "center" }}
                className={`${styles.td} ${styles.serial}`}
              >
                {index + 1}
              </div>
            )}

            <div style={{ flex: isPhone ? 0.4 : 0.25, ...ellipsisStyle }} className={styles.td}>
              {truncate(item?.title, 15) || "—"}
            </div>

            {width > 700 && (
              <div style={{ flex: 0.35, ...ellipsisStyle }} className={styles.td}>
                {truncate(item?.description, 35)}
              </div>
            )}

            <div style={{ flex: isPhone ? 0.35 : 0.25 }} className={styles.td}>
              <span
                style={{
                  background: "#f0f0f0",
                  color: "#444",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {item?.permissions?.length ?? 0} {t("permissions")}
              </span>
            </div>
          </>
        ) : (
          <>
            {width > 700 && (
              <div
                style={{
                  flex: 0.05,
                  textAlign: "center",
                  color: "#9AA3B2",
                  fontWeight: 500,
                }}
              >
                {index + 1}
              </div>
            )}

            <div style={{ flex: isPhone ? 0.25 : 0.18, ...ellipsisStyle }} className={styles.td}>
              {item?.first_name + " " + item?.last_name || "—"}
            </div>

            <div style={{ flex: isPhone ? 0.4 : 0.18, ...ellipsisStyle }} className={styles.td}>
              {item?.phone || "—"}
            </div>

            {width > 700 && (
              <div style={{ flex: 0.26, ...ellipsisStyle }} className={styles.td}>
                {truncate(item?.email, 20) || "—"}
              </div>
            )}

            <div style={{ flex: isPhone ? 0.2 : 0.12 }} className={`${styles.td} ${styles.amount}`}>
              {truncate(item?.role?.title, 15) || "—"}
            </div>

            {width > 700 && (
              <div style={{ flex: 0.17 }} className={styles.td}>
                {isUpdatingStatus ? (
                  <span style={{ fontSize: "12px" }}>{t("Updating...")}</span>
                ) : (
                  <select
                    disabled={
                      item?.status === "pending" ||
                      !hasPermission("delegate-access.agents.status.update")
                    }
                    value={item?.status || ""}
                    onChange={(e) => updateStatus(e.target.value)}
                    style={{
                      background:
                        item?.status === "pending"
                          ? "#e0e0e0"
                          : item?.status === "active"
                            ? "#EDFAF0"
                            : item?.status === "inactive"
                              ? "#ffeaea"
                              : item?.status === "suspended"
                                ? "#fff3e0"
                                : "#f0f0f0",

                      color:
                        item?.status === "pending"
                          ? "#888"
                          : item?.status === "active"
                            ? "#097224"
                            : item?.status === "inactive"
                              ? "#c0392b"
                              : item?.status === "suspended"
                                ? "#e67e22"
                                : "#444",

                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      outline: "none",
                      cursor:
                        item?.status === "pending" ||
                        !hasPermission("delegate-access.agents.status.update")
                          ? "not-allowed"
                          : "pointer",
                      textTransform: "capitalize",
                      width: "100%",
                      opacity:
                        item?.status === "pending" ||
                        !hasPermission("delegate-access.agents.status.update")
                          ? 0.7
                          : 1,
                    }}
                  >
                    <option value="pending">{t("Pending")}</option>
                    <option value="active">{t("Active")}</option>
                    <option value="inactive">{t("Inactive")}</option>
                    <option value="suspended">{t("Suspended")}</option>
                  </select>
                )}
              </div>
            )}
          </>
        )
      ) : isRole ? (
        <>
          <div className={styles.td}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Title")}</div>{" "}
            {truncate(item?.title, 15) || "—"}
          </div>
          <div className={styles.td}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Description")}</div>{" "}
            {truncate(item?.description, 35)}
          </div>

          <div className={styles.td}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Permissions")}</div>
            <span
              style={{
                background: "#f0f0f0",
                color: "#444",
                padding: "2px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {item?.permissions?.length ?? 0} {t("permissions")}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.td}>
            <div> {item?.first_name + " " + item?.last_name || "—"}</div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <div>
                {isUpdatingStatus ? (
                  <span style={{ fontSize: "12px" }}>{t("Updating...")}</span>
                ) : (
                  <select
                    disabled={
                      item?.status === "pending" ||
                      !hasPermission("delegate-access.agents.status.update")
                    }
                    value={item?.status || ""}
                    onChange={(e) => updateStatus(e.target.value)}
                    style={{
                      background:
                        item?.status === "pending"
                          ? "#e0e0e0"
                          : item?.status === "active"
                            ? "#EDFAF0"
                            : item?.status === "inactive"
                              ? "#ffeaea"
                              : item?.status === "suspended"
                                ? "#fff3e0"
                                : "#f0f0f0",

                      color:
                        item?.status === "pending"
                          ? "#888"
                          : item?.status === "active"
                            ? "#097224"
                            : item?.status === "inactive"
                              ? "#c0392b"
                              : item?.status === "suspended"
                                ? "#e67e22"
                                : "#444",

                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      outline: "none",
                      cursor:
                        item?.status === "pending" ||
                        !hasPermission("delegate-access.agents.status.update")
                          ? "not-allowed"
                          : "pointer",
                      textTransform: "capitalize",
                      width: "100%",
                      opacity:
                        item?.status === "pending" ||
                        !hasPermission("delegate-access.agents.status.update")
                          ? 0.7
                          : 1,
                    }}
                  >
                    <option value="pending">{t("Pending")}</option>
                    <option value="active">{t("Active")}</option>
                    <option value="inactive">{t("Inactive")}</option>
                    <option value="suspended">{t("Suspended")}</option>
                  </select>
                )}
              </div>
              <div className={`${styles.actions}`} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.threeDotsBtn}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenFor((prev) => (prev === item?._id ? null : item?._id));
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuOpenFor === item?._id && (
                  <div className={styles.actionsMenu} onClick={(e) => e.stopPropagation()}>
                    {hasPermission(
                      isRole
                        ? "delegate-access.roles.view-details"
                        : "delegate-access.agents.view-details",
                    ) && (
                      <div
                        className={styles.menuItem}
                        onClick={() => {
                          setIsViewModal(true);
                          setMenuOpenFor(null);
                        }}
                      >
                        {t("View")}
                      </div>
                    )}
                    {hasPermission(
                      isRole ? "delegate-access.roles.edit" : "delegate-access.agents.edit",
                    ) && (
                      <div
                        className={styles.menuItem}
                        onClick={() => {
                          setMenuOpenFor(null);
                          setEditData(item);
                          setShowModal(true);
                        }}
                      >
                        {t("Edit")}
                      </div>
                    )}
                    {!isRole &&
                      item?.status === "pending" &&
                      hasPermission("delegate-access.agents.email.resend") && (
                        <div className={styles.menuItem} onClick={() => resendEmail()}>
                          {isResending ? t("Resending...") : t("Resend Email")}
                        </div>
                      )}
                    {hasPermission(
                      isRole ? "delegate-access.roles.delete" : "delegate-access.agents.delete",
                    ) && (
                      <div
                        className={`${styles.menuItem} ${styles.danger}`}
                        onClick={() => {
                          setIsDeleteModal(true);
                          setMenuOpenFor(null);
                        }}
                      >
                        {isDeleting ? t("Deleting...") : t("Delete")}
                      </div>
                    )}
                  </div>
                )}

                {isDeleteModal && (
                  <DeleteConfirmModal
                    isOpen={isDeleteModal}
                    toggle={() => setIsDeleteModal(false)}
                    onConfirm={() => (isRole ? deleteRole() : deleteAgents())}
                    itemName={item?.title || item?.name || item?.first_name}
                    isLoading={isDeleting || isDeletingAgents}
                    isSuccess={isRole ? deleteRoleSuccess : deleteAgentsSuccess}
                    isError={isRole ? deleteRoleError : deleteAgentsError}
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
          </div>

          <div className={styles.td}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Phone")}</div>
            <div> {item?.phone || "—"}</div>
          </div>

          <div className={styles.td}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Email")}</div>
            <div>{truncate(item?.email, 20) || "—"}</div>
          </div>

          <div className={`${styles.td}`}>
            <div style={{ color: "#6E7687", fontWeight: "500" }}>{t("Role")}</div>
            <div> {truncate(item?.role?.title, 15) || "—"}</div>
          </div>
        </>
      )}

      {width > 700 && (
        <div
          style={{
            flex: isPhone ? 0.15 : 0.1,
            display: "flex",
            justifyContent: "flex-end",
          }}
          className={`${styles.td} ${styles.actions}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.threeDotsBtn}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenFor((prev) => (prev === item?._id ? null : item?._id));
            }}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpenFor === item?._id && (
            <div className={styles.actionsMenu} onClick={(e) => e.stopPropagation()}>
              {hasPermission(
                isRole
                  ? "delegate-access.roles.view-details"
                  : "delegate-access.agents.view-details",
              ) && (
                <div
                  className={styles.menuItem}
                  onClick={() => {
                    setIsViewModal(true);
                    setMenuOpenFor(null);
                  }}
                >
                  {t("View")}
                </div>
              )}
              {hasPermission(
                isRole ? "delegate-access.roles.edit" : "delegate-access.agents.edit",
              ) && (
                <div
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpenFor(null);
                    setEditData(item);
                    setShowModal(true);
                  }}
                >
                  {t("Edit")}
                </div>
              )}
              {!isRole &&
                item?.status === "pending" &&
                hasPermission("delegate-access.agents.email.resend") && (
                  <div className={styles.menuItem} onClick={() => resendEmail()}>
                    {isResending ? t("Resending...") : t("Resend Email")}
                  </div>
                )}
              {hasPermission(
                isRole ? "delegate-access.roles.delete" : "delegate-access.agents.delete",
              ) && (
                <div
                  className={`${styles.menuItem} ${styles.danger}`}
                  onClick={() => {
                    setIsDeleteModal(true);
                    setMenuOpenFor(null);
                  }}
                >
                  {isDeleting ? t("Deleting...") : t("Delete")}
                </div>
              )}
            </div>
          )}

          {isDeleteModal && (
            <DeleteConfirmModal
              isOpen={isDeleteModal}
              toggle={() => setIsDeleteModal(false)}
              onConfirm={() => (isRole ? deleteRole() : deleteAgents())}
              itemName={item?.title || item?.name || item?.first_name}
              isLoading={isDeleting || isDeletingAgents}
              isSuccess={isRole ? deleteRoleSuccess : deleteAgentsSuccess}
              isError={isRole ? deleteRoleError : deleteAgentsError}
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
      )}
    </div>
  );
}

export default TableItem;
