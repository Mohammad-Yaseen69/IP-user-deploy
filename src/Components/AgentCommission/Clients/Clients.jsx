import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Edit2 } from "react-feather";
import { useTranslation } from "react-i18next";
import useWindowWidth from "../../../utils/useWindowWidth";
import TopRight from "../../topRight";
import styles from "../styles/clients.module.css";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UpdateFeePackModal from "../UpdateFeePackModal";

const Clients = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [editingFeePackClient, setEditingFeePackClient] = useState(null);
  const limit = 10;

  const queryParams = new URLSearchParams({
    search: search.trim(),
    status: statusFilter,
    account_type: typeFilter,
    sortBy,
    sortOrder,
    page: page.toString(),
    limit: limit.toString(),
  }).toString();

  const {
    data: responseData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["agent-clients", search, statusFilter, typeFilter, sortBy, sortOrder, page],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/iban-fees/agent-clients?${queryParams}`,
        method: "GET",
        isEncrypted: false,
        isDecrypted: true,
      }),
    keepPreviousData: true,
  });

  const clientsList = responseData?.data?.clients || [];
  const pagination = responseData?.data?.pagination || {
    totalClients: 0,
    totalPages: 1,
    currentPage: 1,
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Referred Clients")}</h1>
          <p>{t("View and manage all clients registered using your referral fee code.")}</p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <div
          className={styles.controlsRow}
          style={{ flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}
        >
          <div className={styles.searchWrapper} style={{ minWidth: "260px", flex: 1 }}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder={t("Search by name, email, company, code...")}
              className={styles.searchInput}
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className={styles.actionGroup} style={{ gap: "10px", flexWrap: "wrap" }}>
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className={styles.filterSelect}
            >
              <option value="all">{t("All Account Types")}</option>
              <option value="business">{t("Business")}</option>
              <option value="individual">{t("Individual")}</option>
            </select>

            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className={styles.filterSelect}
            >
              <option value="all">{t("All Statuses")}</option>
              <option value="active">{t("Active")}</option>
              <option value="pending">{t("Pending")}</option>
              <option value="blocked">{t("Blocked")}</option>
            </select>

            <select value={sortBy} onChange={handleSortChange} className={styles.filterSelect}>
              <option value="createdAt">{t("Sort by Date")}</option>
              <option value="company_name">{t("Sort by Name")}</option>
              <option value="status">{t("Sort by Status")}</option>
            </select>

            <button
              type="button"
              onClick={toggleSortOrder}
              className={`${styles.secondaryBtn} ${styles.sortToggleBtn}`}
              title={t("Toggle Sort Order")}
            >
              {sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{sortOrder.toUpperCase()}</span>
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderRow}>
            <div>{t("CLIENT")}</div>
            <div>{t("ACCOUNT TYPE")}</div>
            <div>{t("REGION / COUNTRY")}</div>
            <div>{t("FEE PACK")}</div>
            <div>{t("IBAN STATUS")}</div>
            <div>{t("ACCOUNT STATUS")}</div>
            <div>{t("REGISTERED DATE")}</div>
            <div style={{ textAlign: "center" }}>{t("ACTIONS")}</div>
          </div>

          {isFetching && !isLoading && (
            <div
              style={{
                position: "absolute",
                top: "0",
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                backdropFilter: "blur(1px)",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <div style={{ padding: "30px", textAlign: "center", color: "#666" }}>
                {t("Updating list...")}
              </div>
            </div>
          )}
          {isLoading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#666" }}>
              {t("Loading clients list...")}
            </div>
          ) : isError ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#dc2626" }}>
              {t("Failed to load clients. Please try again.")}
            </div>
          ) : clientsList.length > 0 ? (
            clientsList.map((client, idx) => {
              const isBusiness = client.account_type === "business";
              const avatarColor =
                idx % 3 === 0
                  ? styles.avatarPurple
                  : idx % 3 === 1
                    ? styles.avatarBlue
                    : styles.avatarGreen;
              const ibanStatusUpper = client.ibanStatus
                ? client.ibanStatus.toUpperCase()
                : "NOT REQUESTED";
              const statusUpper = client.status ? client.status.toUpperCase() : "ACTIVE";
              const feePackName = client.fee_pack?.name || t("Standard Plan");
              const feePackSummary = client.fee_pack?.pricing_summary || feePackName;

              return (
                <div key={client._id || idx} className={styles.tableDataRow}>
                  <div className={styles.clientCell}>
                    <span className={`${styles.avatar} ${avatarColor}`}>{client.initials}</span>
                    <div>
                      <span
                        className={styles.clientName}
                        style={{ display: "block", fontWeight: 600 }}
                      >
                        {client.name}
                      </span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{client.email}</span>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: isBusiness ? "#E0E7FF" : "#F3E8FF",
                        color: isBusiness ? "#3730A3" : "#6B21A8",
                      }}
                    >
                      {isBusiness ? t("Business") : t("Individual")}
                    </span>
                  </div>

                  <div style={{ fontWeight: 500, color: "#374151" }}>
                    {client.country || "Europe"}
                  </div>

                  <div>
                    <span
                      className={styles.feePackBadge}
                      onClick={() => setEditingFeePackClient(client)}
                      title={feePackSummary}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {feePackName}
                      </span>
                      <Edit2 size={11} style={{ opacity: 0.7, flexShrink: 0 }} />
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor:
                          ibanStatusUpper === "APPROVED"
                            ? "#DCFCE7"
                            : ibanStatusUpper === "PENDING"
                              ? "#FEF9C3"
                              : "#F3F4F6",
                        color:
                          ibanStatusUpper === "APPROVED"
                            ? "#166534"
                            : ibanStatusUpper === "PENDING"
                              ? "#854D0E"
                              : "#4B5563",
                      }}
                    >
                      {ibanStatusUpper}
                    </span>
                  </div>

                  <div>
                    <span
                      className={statusUpper === "ACTIVE" ? styles.badgePaid : styles.badgePending}
                    >
                      {statusUpper}
                    </span>
                  </div>

                  <div style={{ color: "#6B7280", fontSize: "13px" }}>
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      type="button"
                      className={styles.actionEditBtn}
                      onClick={() => setEditingFeePackClient(client)}
                      title={t("Update Fee Pack")}
                    >
                      <Edit2 size={12} />
                      <span>{t("Edit")}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "#666" }}>
              {t("No clients found matching the selected criteria.")}
            </div>
          )}
        </div>

        {!isLoading && pagination.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              padding: "12px 16px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: "14px", color: "#4B5563" }}>
              {t("Showing page")} <strong>{pagination.currentPage}</strong> {t("of")}{" "}
              <strong>{pagination.totalPages}</strong> ({pagination.totalClients}{" "}
              {t("total clients")})
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid #D1D5DB",
                  backgroundColor: page <= 1 ? "#F3F4F6" : "#FFFFFF",
                  color: page <= 1 ? "#9CA3AF" : "#374151",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <ChevronLeft size={16} />
                {t("Previous")}
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid #D1D5DB",
                  backgroundColor: page >= pagination.totalPages ? "#F3F4F6" : "#FFFFFF",
                  color: page >= pagination.totalPages ? "#9CA3AF" : "#374151",
                  cursor: page >= pagination.totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                <ChevronRight size={16} />
                {t("Next")}
              </button>
            </div>
          </div>
        )}
      </div>

      <UpdateFeePackModal
        isOpen={Boolean(editingFeePackClient)}
        onClose={() => setEditingFeePackClient(null)}
        target={{ type: "client", data: editingFeePackClient }}
      />
    </div>
  );
};

export default Clients;
