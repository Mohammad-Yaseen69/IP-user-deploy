import React, { useState, useContext } from "react";
import useWindowWidth from "../../../utils/useWindowWidth";
import { useTranslation } from "react-i18next";
import styles from "../styles/leads.module.css";
import TopRight from "../../topRight";
import {
  AlertTriangle,
  Search,
  Send,
  Trash2,
  X,
  UserPlus,
  Eye,
  Edit2,
} from "react-feather";
import LeadModal from "./LeadModal";
import AddByNameModal from "./AddByNameModal";
import UpdateFeePackModal from "../UpdateFeePackModal";
import { Modal, ModalBody } from "reactstrap";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { UserContext } from "../../../Context/UserContext";

const formatCountryName = (countryVal) => {
  if (!countryVal) return "—";
  const str = String(countryVal).trim();
  if (/^[0-9a-fA-F]{24}$/.test(str)) {
    return "—";
  }
  return str;
};

const truncateStr = (str, max = 20) => {
  if (!str) return "—";
  const s = String(str).trim();
  return s.length > max ? s.slice(0, max) + "..." : s;
};

const Leads = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const queryClient = useQueryClient();
  const { userDetails } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddByNameOpen, setIsAddByNameOpen] = useState(false);
  const [initialEntityType, setInitialEntityType] = useState("business");
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingFeePackLead, setEditingFeePackLead] = useState(null);

  const isManager = Boolean(
    userDetails?.isInstapayAgent && userDetails?.isInstapayManager,
  );

  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState(null);

  const handleOpenModal = (type = "business") => {
    setInitialEntityType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const { data: leadsData = { leads: [], totalPages: 1 }, isLoading: loading } =
    useQuery({
      queryKey: ["agentLeads", search, selectedStage, page],
      queryFn: async () => {
        const queryParams = new URLSearchParams({
          search,
          stage: selectedStage,
          page: String(page),
          limit: "10",
        }).toString();

        const dec = await apiWrapper({
          endpoint: `/api/agent-leads?${queryParams}`,
          method: "GET",
          isDecrypted: true,
        });

        return dec?.data || dec || { leads: [], totalPages: 1 };
      },
    });

  const resendInviteMutation = useMutation({
    mutationFn: async (leadId) => {
      return await apiWrapper({
        endpoint: `/api/agent-leads/resend-invite/${leadId}`,
        method: "POST",
        isDecrypted: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLeads"] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId) => {
      return await apiWrapper({
        endpoint: `/api/agent-leads/${leadId}`,
        method: "DELETE",
        isDecrypted: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentLeads"] });
    },
  });

  const stageTabs = [
    { label: "All", value: "all" },
    { label: "Not Registered", value: "not-registered" },
    { label: "Onboarding Pending", value: "iban-onboarding-pending" },
    { label: "IBAN in Review", value: "iban-in-review" },
    { label: "KYC/KYB in Review", value: "kyc-kyb-in-review" },
    { label: "IBAN Generated", value: "iban-generated" },
    { label: "Registered (Lost)", value: "registered-lost" },
  ];

  const getStageBadgeClass = (stageKey) => {
    switch (stageKey) {
      case "iban-generated":
        return styles.stageBlue;
      case "kyc-kyb-in-review":
        return styles.stagePurple;
      case "iban-in-review":
        return styles.stageOrange;
      case "iban-onboarding-pending":
        return styles.stageOrange;
      case "registered-lost":
        return styles.statusOrange;
      case "not-registered":
      default:
        return styles.statusGray;
    }
  };

  const getStageLabel = (stageKey) => {
    switch (stageKey) {
      case "iban-generated":
        return t("IBAN Generated");
      case "kyc-kyb-in-review":
        return t("KYC/KYB in Review");
      case "iban-in-review":
        return t("IBAN in Review");
      case "iban-onboarding-pending":
        return t("Onboarding Pending");
      case "registered-lost":
        return t("Registered (Lost)");
      case "not-registered":
      default:
        return t("Not Registered");
    }
  };

  const leads = leadsData.leads || [];
  const totalPages = leadsData.totalPages || 1;

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Leads")}</h1>
          <p>
            {t(
              "Introduce clients and track them from onboarding to IBAN activation.",
            )}
          </p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.headercontent}>
          <p>
            {t(
              "You're an introducer: submit a lead and send a secure self-onboarding invite. You get read-only visibility of each prospect's KYC/KYB status and any compliance request - no need to contact the operator. You never collect or handle your client's documents.",
            )}
          </p>
        </div>

        <div className={styles.buttons}>
          {stageTabs.map((tab) => (
            <button
              key={tab.value}
              className={`${styles.button} ${selectedStage === tab.value ? styles.pageActive : ""}`}
              onClick={() => {
                setSelectedStage(tab.value);
                setPage(1);
              }}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder={t("Search by name, email, phone...")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.actionGroup}>
            {isManager && (
              <button
                className={styles.secondaryBtn}
                onClick={() => setIsAddByNameOpen(true)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <UserPlus size={15} />
                <span>{t("Add by Name")}</span>
              </button>
            )}
            <button
              className={styles.primaryBtn}
              onClick={() => handleOpenModal("business")}
            >
              <span>+ {t("Add new lead")}</span>
            </button>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.thCell}>{t("Client / Lead")}</th>
                <th className={styles.thCell}>{t("Type")}</th>
                <th className={styles.thCell}>{t("Country")}</th>
                <th className={styles.thCell}>{t("Stage")}</th>
                <th className={styles.thCell}>{t("Contact")}</th>
                <th className={styles.thCell}>{t("Fee Pack")}</th>
                <th className={styles.thCell}>{t("Actions")}</th>
              </tr>
            </thead>

            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <th
                    colSpan={7}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    {t("Loading leads...")}
                  </th>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <th
                    colSpan={7}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    {t("No leads found.")}
                  </th>
                </tr>
              ) : (
                leads.map((row) => {
                  const displayName =
                    row.company_name ||
                    `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                    t("Unnamed Lead");
                  const avatarText = displayName.substring(0, 2).toUpperCase();
                  const feePackName = row.fee_pack?.name || t("Standard");
                  const feePackSummary =
                    row.fee_pack?.pricing_summary || feePackName;

                  return (
                    <tr key={row._id} className={styles.tableDataRow}>
                      <td className={styles.tdCell} title={displayName}>
                        <div className={styles.clientCell}>
                          <div
                            className={`${styles.avatar} ${styles.avatarBlue}`}
                          >
                            {avatarText}
                          </div>
                          <span className={styles.clientName}>
                            {truncateStr(displayName, 22)}
                          </span>
                        </div>
                      </td>

                      <td className={styles.tdCell}>
                        <span style={{ textTransform: "capitalize" }}>
                          {t(row.leadType)}
                        </span>
                      </td>

                      <td
                        className={styles.tdCell}
                        title={formatCountryName(row.country)}
                      >
                        {formatCountryName(row.country)}
                      </td>

                      <td className={styles.tdCell}>
                        <span
                          className={`${styles.badge} ${getStageBadgeClass(row.stage)}`}
                        >
                          {getStageLabel(row.stage)}
                        </span>
                      </td>

                      <td
                        className={styles.tdCell}
                        title={row.email || row.phone || "—"}
                      >
                        <span style={{ fontSize: "13px", color: "#555" }}>
                          {truncateStr(row.email || row.phone || "—", 22)}
                        </span>
                      </td>

                      <td
                        className={styles.tdCell}
                        title={feePackSummary}
                        style={{ cursor: "pointer" }}
                        onClick={() => setEditingFeePackLead(row)}
                      >
                        <span
                          className={`${styles.textIndicator} ${styles.statusGreen}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {truncateStr(feePackName, 18)}
                          <Edit2 size={11} style={{ opacity: 0.7 }} />
                        </span>
                      </td>

                      <td
                        className={styles.tdCell}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          onClick={() => setSelectedLead(row)}
                          className={styles.secondaryBtn}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                          title={t("View Details")}
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={() => setEditingFeePackLead(row)}
                          className={styles.secondaryBtn}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                          title={t("Update Fee Pack")}
                        >
                          <Edit2 size={13} />
                        </button>

                        {!row.addedByManager &&
                          (row.stage === "not-registered" ||
                            row.stage === "claim-pending") && (
                            <button
                              onClick={() =>
                                resendInviteMutation.mutate(row._id)
                              }
                              disabled={resendInviteMutation.isPending}
                              className={styles.secondaryBtn}
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title={t("Resend Invitation")}
                            >
                              <Send size={12} />
                              {resendInviteMutation.isPending
                                ? t("Sending...")
                                : t("Resend")}
                            </button>
                          )}

                        <button
                          onClick={() => setDeleteConfirmLead(row)}
                          disabled={deleteLeadMutation.isPending}
                          className={styles.secondaryBtn}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            color: "#d32f2f",
                            borderColor: "#ffcdd2",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title={t("Delete Lead")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className={styles.paginationRow}>
              <tr>
                <td colSpan={7}>
                  <div className={styles.paginationPages}>
                    <button
                      className={styles.pageArrow}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      &lt;
                    </button>
                    <span
                      className={styles.pageNumber}
                      style={{ padding: "0 8px", fontSize: "14px" }}
                    >
                      {t("Page")} {page} {t("of")} {totalPages}
                    </span>
                    <button
                      className={styles.pageArrow}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <LeadModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialEntityType={initialEntityType}
      />

      <AddByNameModal
        open={isAddByNameOpen}
        onClose={() => setIsAddByNameOpen(false)}
      />

      <Modal
        isOpen={!!selectedLead}
        toggle={() => setSelectedLead(null)}
        centered
        size="lg"
      >
        <ModalBody
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            borderRadius: "16px",
            background: "#FFF",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#EEF2FF",
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyCenter: "center",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                {(
                  selectedLead?.company_name ||
                  `${selectedLead?.first_name || ""} ${selectedLead?.last_name || ""}`.trim() ||
                  "L"
                )
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {selectedLead?.company_name ||
                    `${selectedLead?.first_name || ""} ${selectedLead?.last_name || ""}`.trim() ||
                    t("Lead Details")}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      background: "#F1F5F9",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      color: "#475569",
                    }}
                  >
                    {t(selectedLead?.leadType || "business")}
                  </span>
                  <span
                    className={`${styles.badge} ${getStageBadgeClass(selectedLead?.stage)}`}
                    style={{ fontSize: "11px" }}
                  >
                    {getStageLabel(selectedLead?.stage)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
                padding: "4px",
              }}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("Contact & Location")}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Email Address")}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1E293B",
                  }}
                >
                  {selectedLead?.email || "—"}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Phone Number")}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1E293B",
                  }}
                >
                  {selectedLead?.phone || "—"}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Country")}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1E293B",
                  }}
                >
                  {formatCountryName(selectedLead?.country)}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Lead Creation Method")}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: selectedLead?.addedByManager ? "#5926F0" : "#0284C7",
                  }}
                >
                  {selectedLead?.addedByManager
                    ? t("Manager Mode (Direct / Name Search)")
                    : t("Standard Self-Onboarding Invite")}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("Commercial & Account Details")}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Assigned Fee Model")}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#15803D",
                    }}
                  >
                    {selectedLead?.fee_pack?.name || "Standard"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedLead;
                      setSelectedLead(null);
                      setEditingFeePackLead(current);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#4F46E5",
                      backgroundColor: "#EEF2FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} /> {t("Change")}
                  </button>
                </div>
                {selectedLead?.fee_pack?.pricing_summary && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748B",
                      marginTop: "2px",
                    }}
                  >
                    {selectedLead.fee_pack.pricing_summary}
                  </div>
                )}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Current Lifecycle Stage")}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1E293B",
                  }}
                >
                  {getStageLabel(selectedLead?.stage)}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Created Date")}
                </span>
                <span style={{ fontSize: "12px", color: "#475569" }}>
                  {selectedLead?.createdAt
                    ? new Date(selectedLead.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    display: "block",
                  }}
                >
                  {t("Claim Status")}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color:
                      selectedLead?.claimStatus === "accepted"
                        ? "#16A34A"
                        : "#D97706",
                  }}
                >
                  {selectedLead?.claimStatus || "pending"}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "8px",
              borderTop: "1px solid #F1F5F9",
              paddingTop: "14px",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                background: "#F9FAFB",
                color: "#374151",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {t("Close")}
            </button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={!!deleteConfirmLead}
        toggle={() => setDeleteConfirmLead(null)}
        centered
      >
        <ModalBody
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#DC2626",
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <button
              onClick={() => setDeleteConfirmLead(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6B7280",
                padding: "4px",
              }}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 8px 0",
              }}
            >
              {t("Delete Lead")}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#4B5563",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {t("Are you sure you want to delete")}{" "}
              <strong>
                {deleteConfirmLead?.company_name ||
                  `${deleteConfirmLead?.first_name || ""} ${deleteConfirmLead?.last_name || ""}`.trim() ||
                  t("this lead")}
              </strong>
              ? {t("This action cannot be undone.")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              onClick={() => setDeleteConfirmLead(null)}
              disabled={deleteLeadMutation.isPending}
              style={{
                flex: 1,
                height: "42px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                backgroundColor: "#FFFFFF",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              type="button"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={() => {
                if (deleteConfirmLead) {
                  deleteLeadMutation.mutate(deleteConfirmLead._id, {
                    onSettled: () => setDeleteConfirmLead(null),
                  });
                }
              }}
              disabled={deleteLeadMutation.isPending}
              style={{
                flex: 1,
                height: "42px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              type="button"
            >
              {deleteLeadMutation.isPending ? t("Deleting...") : t("Delete")}
            </button>
          </div>
        </ModalBody>
      </Modal>

      <UpdateFeePackModal
        isOpen={Boolean(editingFeePackLead)}
        onClose={() => setEditingFeePackLead(null)}
        target={{ type: "lead", data: editingFeePackLead }}
      />
    </div>
  );
};

export default Leads;
