import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import InstaPayLoader from "../Loader";
import styles from "./styles/index.module.scss";
import { ChevronDown, ChevronRight, XCircle } from "react-feather";
import useCancelSubscription from "../../hooks/GeneralUse/useCancelSubscription";
import PaymentsConfirmationModal from "../Payments/PaymentsConfirmationModal";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
      return { bg: "#DCFCE7", color: "#166534" };
    case "cancelled":
    case "canceled":
      return { bg: "#FEE2E2", color: "#991B1B" };
    case "paused":
      return { bg: "#FEF3C7", color: "#92400E" };
    default:
      return { bg: "#F3F4F6", color: "#374151" };
  }
};

const txStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "#15bd43";
    case "PENDING":
    case "PROCESSING":
      return "rgba(89, 38, 240, 0.55)";
    case "FAILED":
    case "CANCELLED":
      return "#ed1d1d";
    default:
      return "#848484";
  }
};

const LIMIT = 10;

const PlanSubscriptionTable = ({ searchQuery = "" }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const [expandedId, setExpandedId] = useState(null);
  const loaderRef = useRef(null);
  const mobileLoaderRef = useRef(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["planSubscriptions", userDetails?._id, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      apiWrapper({
        endpoint: `/api/plans/get-user-subscriptions/${userDetails._id}/${pageParam}/${LIMIT}${searchQuery ? `?search=${searchQuery}` : ""}`,
        method: "GET",
      }),
    getNextPageParam: (lastPage, allPages) => {
      const items = lastPage?.data || [];
      if (items.length < LIMIT) return undefined;
      return allPages.length + 1;
    },
    enabled: !!userDetails?._id,
  });

  const subscriptions = data?.pages?.flatMap((p) => p?.data || []) || [];

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    if (mobileLoaderRef.current) observer.observe(mobileLoaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver, loaderRef.current, mobileLoaderRef.current]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const {
    requestCancel,
    confirmCancel,
    closeModal,
    isPending: isCancelling,
    isModalOpen,
  } = useCancelSubscription("subscriber", ["planSubscriptions"]);

  return (
    <div>
      {/* Desktop Table */}
      <div style={{ overflowX: "auto" }}>
        {/* Table Header */}
        <div className={styles.table_header} style={{ minWidth: "900px" }}>
          <div>{t("Start Date")}</div>
          <div>{t("Next Billing")}</div>
          <div>{t("Subscription ID")}</div>
          <div>{t("Plan Name")}</div>
          <div>{t("Billing Cycle")}</div>
          <div>{t("Status")}</div>
          <div style={{ maxWidth: "30px" }}></div>
        </div>

        {/* Table Body */}
        <div className={styles.table_body} style={{ minWidth: "900px" }}>
          {isLoading ? (
            <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
              <InstaPayLoader />
            </div>
          ) : subscriptions.length > 0 ? (
            <>
              {subscriptions.map((sub) => {
                const isOpen = expandedId === sub._id;
                const sc = statusColor(sub.status);
                return (
                  <div key={sub._id}>
                    <div
                      className={styles.body_item}
                      onClick={() => toggleExpand(sub._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>{formatDate(sub.startDate)}</div>
                      <div style={{ color: "#5926F0", fontWeight: 600 }}>
                        {formatDate(sub.nextBillingDate)}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "12px" }}>
                        {sub.subscriptionId || "-"}
                      </div>
                      <div style={{ fontWeight: 600 }}>{sub.plan?.title || "-"}</div>
                      <div>{t(sub.billingCycle)}</div>
                      <div>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {t(sub.status)}
                        </span>
                      </div>
                      <div
                        style={{
                          maxWidth: "30px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isOpen && (
                      <div
                        className={styles.item_description}
                        style={{ flexDirection: "column", gap: "20px" }}
                      >
                        {/* Subscription Info Cards */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          <InfoCard label={t("Plan Name")} value={sub.plan?.title || "-"} />
                          <InfoCard
                            label={t("Plan Price")}
                            value={`${sub.plan?.receivingWallet?.currency?.code} ${sub.plan?.price?.toLocaleString() || "-"}`}
                          />
                          <InfoCard label={t("Billing Cycle")} value={t(sub.billingCycle)} />
                          <InfoCard label={t("Total Payments")} value={sub.totalPayments} />
                          <InfoCard
                            label={t("Total Amount Paid")}
                            value={`${sub.plan?.receivingWallet?.currency?.code} ${sub.totalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
                          />
                          <InfoCard
                            label={t("Last Payment Method")}
                            value={sub.lastPaymentMethod || sub.paymentMethod || "-"}
                          />
                          <InfoCard label={t("Start Date")} value={formatDate(sub.startDate)} />
                          <InfoCard label={t("End Date")} value={formatDate(sub.endDate)} />
                          <InfoCard
                            label={t("Next Billing")}
                            value={formatDate(sub.nextBillingDate)}
                          />
                        </div>

                        {sub.status?.toLowerCase() === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestCancel(sub._id);
                            }}
                            disabled={isCancelling}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "#FEE2E2",
                              color: "#991B1B",
                              border: "1px solid #FECACA",
                              borderRadius: "10px",
                              padding: "8px 20px",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: isCancelling ? "not-allowed" : "pointer",
                              opacity: isCancelling ? 0.6 : 1,
                              alignSelf: "flex-start",
                            }}
                          >
                            <XCircle size={16} />
                            {t("Cancel Subscription")}
                          </button>
                        )}

                        {/* Transaction History */}
                        <div>
                          <h5
                            style={{
                              fontWeight: 700,
                              marginBottom: "12px",
                              fontSize: "16px",
                              background:
                                "linear-gradient(3.1deg, #E64067 -102.47%, #5926F0 25.82%, #4828A0 128.05%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {t("Transaction History")} ({sub.transactions?.length || 0})
                          </h5>
                          <div style={{ overflowX: "auto" }}>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "700px",
                                fontSize: "13px",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: "2px solid #f0f0f0",
                                    textAlign: "left",
                                    color: "#666",
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Date")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Reference ID")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Description")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Amount")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Fee")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Total")}
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px 8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {t("Status")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sub.transactions?.length > 0 ? (
                                  sub.transactions
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .map((tx) => (
                                      <tr
                                        key={tx._id}
                                        style={{
                                          borderBottom: "1px solid #f5f5f5",
                                          transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.background = "#FAFAFA")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.background = "transparent")
                                        }
                                      >
                                        <td style={{ padding: "10px 8px" }}>
                                          {formatDateTime(tx.createdAt)}
                                        </td>
                                        <td
                                          style={{
                                            padding: "10px 8px",
                                            fontFamily: "monospace",
                                            fontSize: "11px",
                                          }}
                                        >
                                          {tx.reference_id || "-"}
                                        </td>
                                        <td style={{ padding: "10px 8px" }}>
                                          {tx.description || t("Plan Payment")}
                                        </td>
                                        <td
                                          style={{
                                            padding: "10px 8px",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {tx.currency?.code}{" "}
                                          {tx.amount?.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                        <td style={{ padding: "10px 8px" }}>
                                          {tx.currency?.code}{" "}
                                          {tx.fee?.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                        <td
                                          style={{
                                            padding: "10px 8px",
                                            fontWeight: 700,
                                          }}
                                        >
                                          {tx.currency?.code}{" "}
                                          {tx.total?.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                        <td style={{ padding: "10px 8px" }}>
                                          <span
                                            style={{
                                              background: txStatusColor(tx.status),
                                              color: "white",
                                              padding: "3px 10px",
                                              borderRadius: "20px",
                                              fontSize: "10px",
                                              fontWeight: 700,
                                              textTransform: "uppercase",
                                            }}
                                          >
                                            {t(tx.status)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      style={{
                                        textAlign: "center",
                                        padding: "20px",
                                        color: "#999",
                                      }}
                                    >
                                      {t("No transactions found")}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {hasNextPage && (
                <div
                  ref={loaderRef}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    padding: "1rem 0",
                  }}
                >
                  <div style={{ width: "200px" }}>
                    <InstaPayLoader />
                  </div>
                </div>
              )}
            </>
          ) : (
            <span
              style={{
                textAlign: "center",
                marginTop: "2rem",
                display: "block",
              }}
            >
              {t("No subscriptions found")}
            </span>
          )}
        </div>
      </div>

      <div className={styles.table_body_mobile}>
        {isLoading ? (
          <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
            <InstaPayLoader />
          </div>
        ) : subscriptions.length > 0 ? (
          <>
            {subscriptions.map((sub) => {
              const isOpen = expandedId === sub._id;
              const sc = statusColor(sub.status);
              return (
                <div
                  key={sub._id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 2px 12px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => toggleExpand(sub._id)}
                    style={{
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "15px",
                          marginBottom: "4px",
                        }}
                      >
                        {sub.plan?.title || "-"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        {sub.subscriptionId} • {t(sub.billingCycle)}
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {t(sub.status)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#5926F0",
                          marginTop: "2px",
                        }}
                      >
                        {t("Next")}: {formatDate(sub.nextBillingDate)}
                      </div>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 16px 16px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        <MobileInfoItem label={t("Start Date")} value={formatDate(sub.startDate)} />
                        <MobileInfoItem label={t("End Date")} value={formatDate(sub.endDate)} />
                        <MobileInfoItem
                          label={t("Plan Price")}
                          value={sub.plan?.price?.toLocaleString() || "-"}
                        />
                        <MobileInfoItem label={t("Total Payments")} value={sub.totalPayments} />
                        <MobileInfoItem
                          label={t("Total Paid")}
                          value={
                            sub.totalAmount?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"
                          }
                        />
                        <MobileInfoItem
                          label={t("Last Method")}
                          value={sub.lastPaymentMethod || sub.paymentMethod || "-"}
                        />
                        <MobileInfoItem label={t("Billing Cycle")} value={t(sub.billingCycle)} />
                      </div>

                      {sub.status?.toLowerCase() === "active" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestCancel(sub._id);
                          }}
                          disabled={isCancelling}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#FEE2E2",
                            color: "#991B1B",
                            border: "1px solid #FECACA",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontWeight: 600,
                            fontSize: "12px",
                            cursor: isCancelling ? "not-allowed" : "pointer",
                            opacity: isCancelling ? 0.6 : 1,
                            marginTop: "10px",
                            width: "100%",
                            justifyContent: "center",
                          }}
                        >
                          <XCircle size={14} />
                          {t("Cancel Subscription")}
                        </button>
                      )}

                      <h6
                        style={{
                          fontWeight: 700,
                          marginTop: "16px",
                          fontSize: "14px",
                        }}
                      >
                        {t("Transaction History")} ({sub.transactions?.length || 0})
                      </h6>
                      {sub.transactions
                        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((tx) => (
                          <div
                            key={tx._id}
                            style={{
                              background: "#FAFAFA",
                              borderRadius: "8px",
                              padding: "10px",
                              marginTop: "8px",
                              fontSize: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                              }}
                            >
                              <span style={{ color: "#888" }}>{formatDateTime(tx.createdAt)}</span>
                              <span
                                style={{
                                  background: txStatusColor(tx.status),
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "20px",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {t(tx.status)}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {tx.currency?.code} {tx.amount?.toFixed(2)}
                              </span>
                              <span style={{ color: "#999" }}>
                                {t("Fee")}: {tx.currency?.code} {tx.fee?.toFixed(2)}
                              </span>
                            </div>
                            <div style={{ fontWeight: 700, marginTop: "2px" }}>
                              {t("Total")}: {tx.currency?.code} {tx.total?.toFixed(2)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile infinite scroll loader */}
            {hasNextPage && (
              <div
                ref={mobileLoaderRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div style={{ width: "200px" }}>
                  <InstaPayLoader />
                </div>
              </div>
            )}
          </>
        ) : (
          <span style={{ textAlign: "center", marginTop: "2rem", display: "block" }}>
            {t("No subscriptions found")}
          </span>
        )}
      </div>

      <PaymentsConfirmationModal
        isOpen={isModalOpen}
        onCancel={closeModal}
        title={t("Cancel Subscription")}
        message={t(
          "Are you sure you want to cancel this subscription? This action cannot be undone.",
        )}
        onConfirm={confirmCancel}
        btnOneText={t("No, Keep it")}
        btnTwoText={isCancelling ? t("Cancelling...") : t("Yes, Cancel")}
      />
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div
    style={{
      borderRadius: "12px",
      background: "#F0F0F0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: ".75rem 1rem",
    }}
  >
    <span
      style={{
        color: "#000",
        fontWeight: 600,
        lineHeight: "150%",
        fontSize: "13px",
      }}
    >
      {label}
    </span>
    <h5
      style={{
        marginBottom: 0,
        color: "#000",
        textAlign: "right",
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "150%",
      }}
    >
      {value}
    </h5>
  </div>
);

const MobileInfoItem = ({ label, value }) => (
  <div
    style={{
      background: "#F5F5F5",
      borderRadius: "8px",
      padding: "8px 10px",
    }}
  >
    <div style={{ fontSize: "10px", color: "#888", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: "13px", fontWeight: 700 }}>{value}</div>
  </div>
);

export default PlanSubscriptionTable;
