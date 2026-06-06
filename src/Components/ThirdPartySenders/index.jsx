import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, Edit2, Plus, Search, Trash2, User } from "react-feather";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import TopRight from "../topRight";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { getExtractedPhone } from "../../utils/Functions";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import AddSenderFormModal from "../PaymentsNewer/InternationalFlow/AddSenderFormModal";
import {
    buildSelectedSender,
    buildSenderFormData,
    filterSendersBySearch,
    getSenderName,
    normalizeSenderList,
} from "../PaymentsNewer/InternationalFlow/senderHelpers";
import styles from "../Beneficiaries/styles/index.module.scss";

const typeFilters = [
    { value: "all", label: "All" },
    { value: "individual", label: "Individual" },
    { value: "business", label: "Business" },
];

const ThirdPartySenders = () => {
    const { t } = useTranslation();
    const { userDetails } = useContext(UserContext);
    const queryClient = useQueryClient();
    const can = usePermission();

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [showAddSenderModal, setShowAddSenderModal] = useState(false);
    const [showAddTypePicker, setShowAddTypePicker] = useState(false);
    const [addSenderAccountType, setAddSenderAccountType] = useState("individual");
    const [editingSender, setEditingSender] = useState(null);
    const [confirmDeleteSender, setConfirmDeleteSender] = useState(null);

    const senderQueryKey = ["userSenders", userDetails?._id];



    const { data: savedSenders = [], isLoading } = useQuery({
        queryKey: senderQueryKey,
        queryFn: () => apiWrapper({
            endpoint: `/api/sender/get-user-senders/${userDetails?._id}`,
            isDecrypted: true,
        }).then((res) => normalizeSenderList(res)),
        enabled: !!userDetails?._id,
        retry: 1,
    });

    const { mutateAsync: addSender, isPending: isAddingSender } = useMutation({
        mutationFn: (values) => apiWrapper({
            endpoint: "/api/sender/add",
            method: "POST",
            payload: buildSenderFormData(values),
            isFormData: true,
            isDecrypted: true,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: senderQueryKey });
            toast.success(t("Sender added successfully"));
            setShowAddSenderModal(false);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t("Unable to add sender. Please try again."));
        },
    });

    const { mutateAsync: updateSender, isPending: isUpdatingSender } = useMutation({
        mutationFn: ({ senderId, values }) => apiWrapper({
            endpoint: `/api/sender/update-sender/${senderId}`,
            method: "PUT",
            payload: buildSenderFormData(values),
            isFormData: true,
            isDecrypted: true,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: senderQueryKey });
            toast.success(t("Sender updated successfully"));
            setEditingSender(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t("Unable to update sender. Please try again."));
        },
    });

    const { mutateAsync: deleteSender, isPending: isDeletingSender } = useMutation({
        mutationFn: (sender) => apiWrapper({
            endpoint: `/api/sender/delete-sender/${sender?._id}/${userDetails?._id}`,
            method: "DELETE",
            isDecrypted: true,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: senderQueryKey });
            toast.success(t("Sender removed successfully"));
            setConfirmDeleteSender(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t("Unable to remove sender. Please try again."));
        },
    });

    const displayedSenders = useMemo(() => {
        let list = savedSenders.map((sender) => buildSelectedSender(sender, "saved"));

        if (typeFilter !== "all") {
            list = list.filter((sender) => sender.sender_type === typeFilter);
        }

        return filterSendersBySearch(list, searchQuery);
    }, [savedSenders, typeFilter, searchQuery]);

    const openAddSender = (accountType) => {
        setAddSenderAccountType(accountType);
        setShowAddTypePicker(false);
        setShowAddSenderModal(true);
    };

    const handleAddClick = () => {
        if (typeFilter === "all") {
            setShowAddTypePicker(true);
            return;
        }

        openAddSender(typeFilter);
    };

    const actionButtonStyle = {
        border: "1px solid #E8E8E8",
        borderRadius: "7px",
        background: "#fff",
        width: "32px",
        height: "32px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5926F0",
    };

    if (!userDetails?.isThirdPartyAllowed) {
        return <>
        </>
    }

    const renderSenderSummary = (sender) => (
        <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong style={{ display: "block", fontSize: "14px" }}>{sender.name || getSenderName(sender)}</strong>
                <span style={{ borderRadius: "999px", background: "rgba(89, 38, 240, 0.08)", color: "#5926F0", fontSize: "10px", fontWeight: 800, padding: "3px 8px" }}>
                    {sender.sender_type === "business" ? t("Business") : t("Individual")}
                </span>
                {sender.save_for_future === false || sender.hidden ?
                    <span style={{ borderRadius: "999px", background: "rgba(230, 64, 103, 0.1)", color: "#E64067", fontSize: "10px", fontWeight: 800, padding: "3px 8px" }}>
                        {t("This transfer only")}
                    </span>
                    : null}
            </span>
            <span style={{ display: "block", color: "#777", fontSize: "12px", fontWeight: 600, marginTop: "4px" }}>
                {[sender.city, sender.country_name || sender.country_iso_code].filter(Boolean).join(", ")}
            </span>
            {sender.email ?
                <span style={{ display: "block", color: "#909090", fontSize: "11px", fontWeight: 600 }}>{sender.email}</span>
                : null}
            {sender.phone ?
                <span style={{ display: "block", color: "#909090", fontSize: "11px", fontWeight: 600 }}>{sender.phone}</span>
                : null}
        </span>
    );

    const renderSenderActions = (sender) => (
        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {can("payments.send-as-third-party.edit") && (
                <button
                    type="button"
                    onClick={() => setEditingSender({
                        ...sender,
                        phone: getExtractedPhone({}, sender.country_iso_code, sender.phone),
                    })}
                    style={actionButtonStyle}
                    title={t("Edit")}
                >
                    <Edit2 size={15} />
                </button>
            )}
            {can("payments.send-as-third-party.delete") && (
                <button
                    type="button"
                    onClick={() => setConfirmDeleteSender(sender)}
                    style={{ ...actionButtonStyle, color: "#E64067" }}
                    title={t("Remove")}
                >
                    <Trash2 size={15} />
                </button>
            )}
        </span>
    );

    const renderTypeFilters = () => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {typeFilters.map((filter) => (
                <button
                    key={filter.value}
                    type="button"
                    onClick={() => setTypeFilter(filter.value)}
                    style={{
                        border: `1px solid ${typeFilter === filter.value ? "#5926F0" : "#E8E8E8"}`,
                        borderRadius: "999px",
                        background: typeFilter === filter.value ? "rgba(89, 38, 240, 0.08)" : "#fff",
                        color: typeFilter === filter.value ? "#5926F0" : "#606060",
                        padding: "8px 14px",
                        fontWeight: 800,
                        fontSize: "12px",
                    }}
                >
                    {t(filter.label)}
                </button>
            ))}
        </div>
    );

    const renderSenderList = () => {
        if (isLoading) {
            return (
                <div style={{ border: "1px dashed #D9D9D9", borderRadius: "12px", padding: "24px", background: "#FCFCFC", color: "#777", fontSize: "14px", fontWeight: 700 }}>
                    {t("Loading saved senders")}
                </div>
            );
        }

        if (displayedSenders.length === 0) {
            return (
                <div style={{ border: "1px dashed #D9D9D9", borderRadius: "12px", padding: "24px", background: "#FCFCFC", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ color: "#202020", fontWeight: 800 }}>{t("No saved senders yet")}</div>
                    <div style={{ color: "#777", fontSize: "13px", fontWeight: 600 }}>
                        {searchQuery ? t("No senders match your search.") : t("Add a third-party sender to save their details for the next transfer.")}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayedSenders.map((sender) => (
                    <div
                        key={sender._id}
                        style={{
                            border: "1px solid #E9E9E9",
                            background: "#fff",
                            borderRadius: "12px",
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        {sender.sender_type === "business" ? <Briefcase size={20} color="#5926F0" /> : <User size={20} color="#5926F0" />}
                        {renderSenderSummary(sender)}
                        {renderSenderActions(sender)}
                    </div>
                ))}
            </div>
        );
    };

    const renderToolbar = (isMobile = false) => (
        <div className={styles.table_header} style={isMobile ? { flexDirection: "column", alignItems: "stretch" } : { flexWrap: "wrap" }}>
            <div className={styles.search_field} style={isMobile ? { width: "100%" } : { flex: 1 }}>
                <Search />
                <Input
                    type="search"
                    placeholder={t("Search for senders")}
                    style={{ padding: ".5rem 1rem" }}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>
            {!isMobile && renderTypeFilters()}
            {can("payments.send-as-third-party.add") && (
                <Button color="transparent" className={styles.btn} style={{ padding: ".5rem 1rem" }} onClick={handleAddClick}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Plus size={16} />
                        {t("Add Sender")}
                    </span>
                </Button>
            )}
        </div>
    );

    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <h4>{t("Third-Party Senders")}</h4>
                    <p style={{ color: "#777", fontWeight: 600 }}>{t("Manage saved senders for third-party international transfers.")}</p>
                    <TopRight />
                </div>

                {renderToolbar()}

                <div style={{
                    maxHeight: "calc(100vh - 320px)",
                    overflowY: "auto",
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    padding: "1rem 0",
                    minHeight: "400px",
                }}>
                    {renderSenderList()}
                </div>
            </div>

            <div className={styles.mobile}>
                <div className={styles.top}>
                    <h4>{t("Third-Party Senders")}</h4>
                </div>
                <div className={styles.bottom}>
                    {renderToolbar(true)}
                    <div style={{ marginTop: "1rem" }}>{renderTypeFilters()}</div>
                    <div className={styles.table_body}>{renderSenderList()}</div>
                </div>
            </div>

            <AddSenderFormModal
                isOpen={showAddSenderModal}
                toggle={() => setShowAddSenderModal(false)}
                data={{}}
                senderAccountType={addSenderAccountType}
                onSubmit={addSender}
                isSubmitting={isAddingSender}
                addingFromMenu
            />

            <AddSenderFormModal
                isOpen={!!editingSender}
                toggle={() => setEditingSender(null)}
                data={{}}
                senderAccountType={editingSender?.sender_type || "individual"}
                editSender={editingSender}
                onSubmit={(values) => updateSender({ senderId: editingSender?._id, values })}
                isSubmitting={isUpdatingSender}
            />

            <Modal isOpen={showAddTypePicker} toggle={() => setShowAddTypePicker(false)} centered>
                <ModalHeader toggle={() => setShowAddTypePicker(false)}>{t("Add New Sender")}</ModalHeader>
                <ModalBody style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                        type="button"
                        onClick={() => openAddSender("individual")}
                        style={{ border: "1px solid #E9E9E9", borderRadius: "10px", background: "#fff", padding: "14px", display: "flex", alignItems: "center", gap: "12px", fontWeight: 800, color: "#202020" }}
                    >
                        <User size={18} color="#5926F0" />
                        {t("Individual Sender")}
                    </button>
                    <button
                        type="button"
                        onClick={() => openAddSender("business")}
                        style={{ border: "1px solid #E9E9E9", borderRadius: "10px", background: "#fff", padding: "14px", display: "flex", alignItems: "center", gap: "12px", fontWeight: 800, color: "#202020" }}
                    >
                        <Briefcase size={18} color="#5926F0" />
                        {t("Business Sender")}
                    </button>
                </ModalBody>
            </Modal>

            <Modal isOpen={!!confirmDeleteSender} toggle={() => setConfirmDeleteSender(null)} centered>
                <ModalHeader toggle={() => setConfirmDeleteSender(null)}>{t("Remove sender?")}</ModalHeader>
                <ModalBody>
                    {t("This sender will be permanently removed from your saved senders.")}
                </ModalBody>
                <ModalFooter style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" disabled={isDeletingSender} onClick={() => setConfirmDeleteSender(null)} style={{ border: "1px solid #DDD", borderRadius: "8px", background: "#fff", padding: "9px 14px", fontWeight: 800 }}>
                        {t("Cancel")}
                    </button>
                    <button type="button" disabled={isDeletingSender} onClick={() => deleteSender(confirmDeleteSender)} style={{ border: "none", borderRadius: "8px", background: "#E64067", color: "#fff", padding: "9px 14px", fontWeight: 800 }}>
                        {isDeletingSender ? t("Removing") : t("Remove")}
                    </button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ThirdPartySenders;
