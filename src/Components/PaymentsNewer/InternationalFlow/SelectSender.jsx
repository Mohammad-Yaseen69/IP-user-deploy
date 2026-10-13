import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, CheckCircle, Edit2, Plus, Save, Trash2, User, Users } from "react-feather";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import AddSenderFormModal from "./AddSenderFormModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { toast } from "react-toastify";
import { getExtractedPhone } from "../../../utils/Functions";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import {
  buildSelectedSender,
  buildSenderFormData,
  getSenderName,
  normalizeAddedSender,
  normalizeSenderList,
} from "./senderHelpers";

const SelectSender = ({ data, dataHandler }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const queryClient = useQueryClient();
  const can = usePermission();
  const [showAddSenderModal, setShowAddSenderModal] = useState(false);
  const [editingSender, setEditingSender] = useState(null);
  const [pendingSavedSender, setPendingSavedSender] = useState(null);
  const [confirmDeleteSender, setConfirmDeleteSender] = useState(null);
  const senderAccountType = data?.sendingType === "B" ? "business" : "individual";
  const selectedSavedSenderId = data?.senderType === "third-party" ? data?.selectedSender?._id : "";
  const selectedSender = data?.senderType === "third-party" ? data?.selectedSender : null;
  const hasCreatedSenderSelected = selectedSender?.source === "created-in-flow";

  // useQuery({
  //     queryKey: ["requiredFields", data?.country?.alpha3, data?.payoutChannel?.id, data?.flow, senderAccountType],
  //     queryFn: () => apiWrapper({
  //         endpoint: `/api/payment/get-required-fields/${data?.country?.alpha3}/${data.payoutChannel?.id}/${data.flow}`
  //     }).then(res => res.data),
  //     enabled: !!data?.country?.alpha3 && !!data?.payoutChannel?.id && !!data?.flow,
  // })

  const [createdSenders, setCreatedSenders] = useState([]);

  const senderQueryKey = ["userSenders", userDetails?._id];
  const { data: savedSenders = [], isLoading: isLoadingSenders } = useQuery({
    queryKey: senderQueryKey,
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/sender/get-user-senders/${userDetails?._id}`,
        isDecrypted: true,
      }).then((res) => normalizeSenderList(res, senderAccountType)),
    enabled: !!userDetails?._id,
    retry: 1,
  });

  const { mutateAsync: addSender, isPending: isAddingSender } = useMutation({
    mutationFn: (values) =>
      apiWrapper({
        endpoint: "/api/sender/add",
        method: "POST",
        payload: buildSenderFormData(values),
        isFormData: true,
        isDecrypted: true,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: senderQueryKey });
      toast.success(t("Sender added successfully"));
      handleNewSender(normalizeAddedSender(res));
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || t("Unable to add sender. Please try again."));
    },
  });

  const { mutateAsync: updateSender, isPending: isUpdatingSender } = useMutation({
    mutationFn: ({ senderId, values }) =>
      apiWrapper({
        endpoint: `/api/sender/update-sender/${senderId}`,
        method: "PUT",
        payload: buildSenderFormData(values),
        isFormData: true,
        isDecrypted: true,
      }),
    onSuccess: (res) => {
      const updatedSender = normalizeAddedSender(res);
      queryClient.invalidateQueries({ queryKey: senderQueryKey });
      toast.success(t("Sender updated successfully"));

      if (selectedSender?._id === (updatedSender?._id || editingSender?._id)) {
        dataHandler(
          "selectedSender",
          buildSelectedSender(updatedSender || { ...editingSender }, selectedSender.source),
        );
      }

      setEditingSender(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("Unable to update sender. Please try again."),
      );
    },
  });

  const { mutateAsync: deleteSender, isPending: isDeletingSender } = useMutation({
    mutationFn: (sender) =>
      apiWrapper({
        endpoint: `/api/sender/delete-sender/${sender?._id}/${userDetails?._id}`,
        method: "DELETE",
        isDecrypted: true,
      }),
    onSuccess: (_, sender) => {
      queryClient.invalidateQueries({ queryKey: senderQueryKey });
      toast.success(t("Sender removed successfully"));

      if (selectedSender?._id === sender?._id) {
        dataHandler("selectedSender", null);
      }

      setConfirmDeleteSender(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("Unable to remove sender. Please try again."),
      );
    },
  });

  const filteredSavedSenders = useMemo(
    () =>
      savedSenders.filter((sender) => {
        const isMatchingType = sender.sender_type === senderAccountType;
        return isMatchingType;
      }),
    [savedSenders, senderAccountType],
  );

  const displayedSenders = useMemo(() => {
    let list = [...createdSenders];

    filteredSavedSenders.forEach((sender) => {
      if (!list.some((item) => item._id === sender._id)) {
        list.push(buildSelectedSender(sender, "saved"));
      }
    });

    if (selectedSender?._id && !list.some((item) => item._id === selectedSender._id)) {
      list.unshift(selectedSender);
    }

    return list;
  }, [filteredSavedSenders, createdSenders, selectedSender]);

  const selectOwnAccount = () => {
    dataHandler("senderType", "account");
    dataHandler("selectedSender", null);
  };

  const startThirdParty = () => {
    dataHandler("senderType", "third-party");
    dataHandler("selectedSender", null);
  };

  const selectSavedSender = (sender) => {
    // if (hasCreatedSenderSelected) {
    //     // setPendingSavedSender(sender);
    //     return;
    // }

    console.log(sender);

    dataHandler("senderType", "third-party");
    dataHandler("selectedSender", buildSelectedSender(sender, sender.source || "saved"));
  };

  const confirmSavedSenderSelection = () => {
    if (!pendingSavedSender) return;

    dataHandler("senderType", "third-party");
    dataHandler(
      "selectedSender",
      buildSelectedSender(pendingSavedSender, pendingSavedSender.source || "saved"),
    );
    setPendingSavedSender(null);
  };

  const handleNewSender = (sender) => {
    const selected = buildSelectedSender(sender, "created-in-flow");
    setCreatedSenders((prev) => [selected, ...prev]);

    dataHandler("senderType", "third-party");
    dataHandler("selectedSender", selected);
    setShowAddSenderModal(false);
  };

  const renderSenderSummary = (sender) => (
    <span style={{ flex: 1 }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ display: "block", fontSize: "13px" }}>
          {sender.name || getSenderName(sender)}
        </strong>
        {sender.save_for_future === false || sender.hidden ? (
          <span
            style={{
              borderRadius: "999px",
              background: "rgba(230, 64, 103, 0.1)",
              color: "#E64067",
              fontSize: "10px",
              fontWeight: 800,
              padding: "3px 8px",
            }}
          >
            {t("This transfer only")}
          </span>
        ) : null}
      </span>
      <span
        style={{
          display: "block",
          color: "#777",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {[sender.city, sender.country_iso_code].filter(Boolean).join(", ")}
      </span>
      {sender.phone ? (
        <span
          style={{
            display: "block",
            color: "#909090",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {sender.phone}
        </span>
      ) : null}
    </span>
  );

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

  const renderSenderActions = (sender) => (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {can("payments.send-as-third-party.edit") && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setEditingSender({
              ...sender,
              phone: getExtractedPhone({}, sender.country_iso_code, sender.phone),
            });
          }}
          style={actionButtonStyle}
          title={t("Edit")}
        >
          <Edit2 size={15} />
        </button>
      )}
      {can("payments.send-as-third-party.delete") && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setConfirmDeleteSender(sender);
          }}
          style={{ ...actionButtonStyle, color: "#E64067" }}
          title={t("Remove")}
        >
          <Trash2 size={15} />
        </button>
      )}
    </span>
  );

  const cardStyle = (active) => ({
    border: `1px solid ${active ? "#5926F0" : "#E9E9E9"}`,
    background: active ? "rgba(89, 38, 240, 0.06)" : "#fff",
    borderRadius: "8px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    color: "#202020",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        height: "100%",
        overflow: "auto",
        paddingRight: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h5 style={{ margin: 0, color: "#5926F0", fontWeight: 800 }}>{t("Select Sender")}</h5>
          <p
            style={{
              margin: "6px 0 0",
              color: "#7A7A7A",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {t("Choose who is sending this transfer.")}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #EEE",
            borderRadius: "999px",
            padding: "6px 10px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#5926F0",
            height: "fit-content",
          }}
        >
          {senderAccountType === "business" ? t("Business sender") : t("Individual sender")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#202020",
            fontWeight: 800,
          }}
        >
          <Save size={16} color="#5926F0" />
          {t("Saved Senders")}
        </div>
        {filteredSavedSenders.length > 0 && can("payments.send-as-third-party.add") && (
          <button
            type="button"
            onClick={() => setShowAddSenderModal(true)}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#5926F0",
              color: "#fff",
              padding: "10px 14px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={16} />
            {t("Add New Sender")}
          </button>
        )}
      </div>

      {isLoadingSenders ? (
        <div
          style={{
            border: "1px dashed #D9D9D9",
            borderRadius: "8px",
            padding: "18px",
            background: "#FCFCFC",
            color: "#777",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {t("Loading saved senders")}
        </div>
      ) : displayedSenders.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
          {displayedSenders.map((sender) => {
            return (
              <div
                key={sender._id}
                role="button"
                tabIndex={0}
                onClick={() => selectSavedSender(sender)}
                onKeyDown={(event) => (event.key === "Enter" ? selectSavedSender(sender) : null)}
                style={cardStyle(selectedSavedSenderId === sender._id)}
              >
                {sender.sender_type === "business" ? (
                  <Briefcase size={20} color="#5926F0" />
                ) : (
                  <User size={20} color="#5926F0" />
                )}
                {renderSenderSummary(sender)}
                {renderSenderActions(sender)}
                {selectedSavedSenderId === sender._id ? (
                  <CheckCircle size={18} color="#5926F0" />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            border: "1px dashed #D9D9D9",
            borderRadius: "8px",
            padding: "18px",
            background: "#FCFCFC",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ color: "#202020", fontWeight: 800 }}>{t("No saved senders yet")}</div>
          <div style={{ color: "#777", fontSize: "13px", fontWeight: 600 }}>
            {t("Add a third-party sender to save their details for the next transfer.")}
          </div>
          {can("payments.send-as-third-party.add") && (
            <button
              type="button"
              onClick={() => setShowAddSenderModal(true)}
              style={{
                border: "none",
                borderRadius: "8px",
                background: "#5926F0",
                color: "#fff",
                padding: "10px 14px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "fit-content",
              }}
            >
              <Plus size={16} />
              {t("Add New Sender")}
            </button>
          )}
        </div>
      )}

      <AddSenderFormModal
        isOpen={showAddSenderModal}
        toggle={() => setShowAddSenderModal((prev) => !prev)}
        data={data}
        senderAccountType={senderAccountType}
        onSubmit={addSender}
        isSubmitting={isAddingSender}
      />

      <AddSenderFormModal
        isOpen={!!editingSender}
        toggle={() => setEditingSender(null)}
        data={data}
        senderAccountType={editingSender?.sender_type || senderAccountType}
        editSender={editingSender}
        onSubmit={(values) => updateSender({ senderId: editingSender?._id, values })}
        isSubmitting={isUpdatingSender}
      />

      <Modal isOpen={!!pendingSavedSender} toggle={() => setPendingSavedSender(null)} centered>
        <ModalHeader toggle={() => setPendingSavedSender(null)}>
          {t("Change selected sender?")}
        </ModalHeader>
        <ModalBody>
          {t(
            "You already selected a newly added sender. Selecting a saved sender will remove that selected sender from this transfer, and you will need to add it again if you want to use it.",
          )}
        </ModalBody>
        <ModalFooter style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setPendingSavedSender(null)}
            style={{
              border: "1px solid #DDD",
              borderRadius: "8px",
              background: "#fff",
              padding: "9px 14px",
              fontWeight: 800,
            }}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={confirmSavedSenderSelection}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#5926F0",
              color: "#fff",
              padding: "9px 14px",
              fontWeight: 800,
            }}
          >
            {t("Use Saved Sender")}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!confirmDeleteSender} toggle={() => setConfirmDeleteSender(null)} centered>
        <ModalHeader toggle={() => setConfirmDeleteSender(null)}>{t("Remove sender?")}</ModalHeader>
        <ModalBody>
          {t(
            "This sender will be removed. If it is selected for this transfer, the selection will also be cleared.",
          )}
        </ModalBody>
        <ModalFooter style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={isDeletingSender}
            onClick={() => setConfirmDeleteSender(null)}
            style={{
              border: "1px solid #DDD",
              borderRadius: "8px",
              background: "#fff",
              padding: "9px 14px",
              fontWeight: 800,
            }}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            disabled={isDeletingSender}
            onClick={() => deleteSender(confirmDeleteSender)}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#E64067",
              color: "#fff",
              padding: "9px 14px",
              fontWeight: 800,
            }}
          >
            {isDeletingSender ? t("Removing") : t("Remove")}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SelectSender;
