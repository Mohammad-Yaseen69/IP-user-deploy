import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, Spinner } from "reactstrap";
import { X, Check, Shield } from "react-feather";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiWrapper } from "../../utils/Functions/apiWrapper";

const UpdateFeePackModal = ({ isOpen, onClose, target }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const isClient = target?.type === "client";
  const targetData = target?.data || {};

  const displayName =
    targetData.company_name ||
    targetData.name ||
    `${targetData.first_name || ""} ${targetData.last_name || ""}`.trim() ||
    targetData.username ||
    t("Unnamed Entity");
  const displayEmail = targetData.email || targetData.phone || "—";
  const currentPackName =
    targetData.fee_pack?.name || targetData.fee_pack_name || t("Standard Plan");
  const currentPackId = targetData.fee_pack?._id || targetData.fee_pack_id || "";

  const [selectedPackId, setSelectedPackId] = useState("");

  const { data: feePacks = [], isLoading: loadingPacks } = useQuery({
    queryKey: ["agentApprovedFeePacksList"],
    queryFn: async () => {
      const dec = await apiWrapper({
        endpoint: "/api/agent-leads/fee-packs",
        method: "GET",
        isDecrypted: true,
      });
      const list = Array.isArray(dec) ? dec : Array.isArray(dec?.data) ? dec.data : [];
      return list;
    },
    enabled: Boolean(isOpen),
  });

  useEffect(() => {
    if (isOpen) {
      if (currentPackId) {
        setSelectedPackId(currentPackId);
      } else if (feePacks.length > 0) {
        setSelectedPackId(feePacks[0]._id);
      } else {
        setSelectedPackId("");
      }
    }
  }, [isOpen, currentPackId, feePacks]);

  const selectedPack = feePacks.find((p) => p._id === selectedPackId) || null;

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPackId) {
        throw new Error(t("Please select a fee pack"));
      }

      const targetId = targetData._id;
      const endpoint = isClient
        ? `/api/agent-leads/client/${targetId}/fee-pack`
        : `/api/agent-leads/${targetId}/fee-pack`;

      return await apiWrapper({
        endpoint,
        method: "PUT",
        payload: { feePackId: selectedPackId },
        isDecrypted: true,
      });
    },
    onSuccess: () => {
      toast.success(t("Fee pack updated successfully!"));
      queryClient.invalidateQueries({ queryKey: ["agent-clients"] });
      queryClient.invalidateQueries({ queryKey: ["agentLeads"] });
      queryClient.invalidateQueries({ queryKey: ["agentAnalytics"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.message || t("Failed to update fee pack"));
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };
  const agentFeePacks = feePacks.filter((pack) => pack.status === "approved");
  // console.log(agentFeePacks, "requests")
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="md">
      <ModalBody
        style={{
          padding: "24px",
          background: "#FFFFFF",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E5E7EB",
            paddingBottom: "14px",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "18px",
                color: "#111827",
              }}
            >
              {t("Update Attached Fee Pack")}
            </h4>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              {t("Assign an approved fee model to this ")}
              {isClient ? t("client") : t("lead")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: isClient ? "#EEF2FF" : "#F0FDF4",
                color: isClient ? "#4F46E5" : "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#1E293B" }}>
                {displayName}
              </div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>{displayEmail}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: isClient ? "#E0E7FF" : "#DCFCE7",
                color: isClient ? "#3730A3" : "#166534",
                display: "inline-block",
                marginBottom: "4px",
              }}
            >
              {isClient ? t("Client") : t("Lead")}
            </span>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              {t("Current")}: <strong style={{ color: "#0F172A" }}>{currentPackName}</strong>
            </div>
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            {t("Select New Fee Pack")}
          </label>

          {loadingPacks ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>
              <Spinner size="sm" color="primary" /> {t("Loading fee packs...")}
            </div>
          ) : feePacks.length === 0 ? (
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FEE2E2",
                color: "#991B1B",
                fontSize: "13px",
              }}
            >
              {t(
                "No approved fee packs available. Request a custom fee model from the Fee Requests tab first.",
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "240px",
                overflowY: "auto",
              }}
            >
              {agentFeePacks.length > 0 ? (
                agentFeePacks.map((pack) => {
                  const isSelected = pack._id === selectedPackId;
                  const isCurrentlyAttached = pack._id === currentPackId;

                  return (
                    <div
                      key={pack._id}
                      onClick={() => setSelectedPackId(pack._id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: `1.5px solid ${isSelected ? "#4F46E5" : "#E2E8F0"}`,
                        backgroundColor: isSelected ? "#F5F3FF" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "#4F46E5" : "#CBD5E1"}`,
                            backgroundColor: isSelected ? "#4F46E5" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && <Check size={12} color="#FFFFFF" />}
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#0F172A",
                              }}
                            >
                              {pack.name}
                            </span>
                            {isCurrentlyAttached && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                  backgroundColor: "#E2E8F0",
                                  color: "#475569",
                                  fontWeight: 600,
                                }}
                              >
                                {t("Active")}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748B",
                              marginTop: "2px",
                            }}
                          >
                            {pack.pricing_summary || t("Standard pricing schedule")}
                          </div>
                        </div>
                      </div>

                      {(pack.model_code || pack.feePackCode) && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                            backgroundColor: "#EDE9FE",
                            color: "#5B21B6",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontWeight: 600,
                          }}
                        >
                          {pack.model_code || pack.feePackCode}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6B7280",
                  }}
                >
                  {t("No agent fee packs available.")}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedPack && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              fontSize: "12px",
              color: "#166534",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <Shield size={14} /> {t("New Pricing Summary:")}
            </div>
            <div>
              {selectedPack.pricing_summary ||
                t(
                  "All fees will be calculated based on this custom fee schedule upon next transaction or onboarding.",
                )}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              backgroundColor: "#FFFFFF",
              color: "#374151",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("Cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              !selectedPackId ||
              updateMutation.isPending ||
              (selectedPackId === currentPackId && Boolean(currentPackId))
            }
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#4F46E5",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor:
                !selectedPackId ||
                updateMutation.isPending ||
                (selectedPackId === currentPackId && Boolean(currentPackId))
                  ? "not-allowed"
                  : "pointer",
              opacity:
                !selectedPackId ||
                updateMutation.isPending ||
                (selectedPackId === currentPackId && Boolean(currentPackId))
                  ? 0.6
                  : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {updateMutation.isPending && <Spinner size="sm" color="light" />}
            <span>{updateMutation.isPending ? t("Updating...") : t("Save & Update")}</span>
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UpdateFeePackModal;
