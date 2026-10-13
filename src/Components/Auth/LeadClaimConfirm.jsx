import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { CheckCircle, XCircle, UserCheck, Shield } from "react-feather";
import logo from "../../logo.svg";

const LeadClaimConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [statusMessage, setStatusMessage] = useState(null);

  const {
    data: claimDetails,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leadClaimDetails", token],
    queryFn: async () => {
      if (!token) throw new Error("Missing confirmation token.");
      return await apiWrapper({
        endpoint: `/api/agent-leads/claim-details/${token}`,
        method: "GET",
        isPublic: true,
        isDecrypted: true,
      });
    },
    enabled: !!token,
  });

  const confirmMutation = useMutation({
    mutationFn: async (action) => {
      return await apiWrapper({
        endpoint: `/api/agent-leads/confirm-claim/${token}`,
        method: "POST",
        payload: { action },
        isPublic: true,
        isDecrypted: true,
      });
    },
    onSuccess: (data, action) => {
      if (action === "accept") {
        setStatusMessage({
          type: "success",
          title: "Agent Assignment Confirmed!",
          text: "Your InstaPay account has been successfully linked with your agent. You can now log in to view your updated fee schedule.",
        });
      } else {
        setStatusMessage({
          type: "info",
          title: "Assignment Request Declined",
          text: "You have declined this agent assignment request.",
        });
      }
    },
    onError: (err) => {
      setStatusMessage({
        type: "error",
        title: "Action Failed",
        text: err?.message || "Failed to process request. Please try again.",
      });
    },
  });

  if (!token) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: "#d32f2f", marginBottom: "12px" }}>
            Invalid Request
          </h2>
          <p style={{ color: "#666" }}>
            No confirmation token was provided in the URL.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ color: "#555" }}>Loading agent assignment details...</p>
        </div>
      </div>
    );
  }

  if (isError || !claimDetails) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <XCircle size={48} color="#d32f2f" style={{ marginBottom: "16px" }} />
          <h2 style={{ color: "#333", marginBottom: "12px" }}>
            Link Expired or Invalid
          </h2>
          <p style={{ color: "#666" }}>
            This confirmation request link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (statusMessage) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {statusMessage.type === "success" ? (
            <CheckCircle
              size={56}
              color="#10B981"
              style={{ marginBottom: "16px" }}
            />
          ) : (
            <Shield
              size={56}
              color="#6366F1"
              style={{ marginBottom: "16px" }}
            />
          )}
          <h2
            style={{
              color: "#111827",
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            {statusMessage.title}
          </h2>
          <p
            style={{
              color: "#4B5563",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            {statusMessage.text}
          </p>
          <button onClick={() => navigate("/login")} style={primaryBtnStyle}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const details = claimDetails?.data || claimDetails || {};

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#EEF2FF",
            color: "#4F46E5",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          <UserCheck size={16} />
          Agent Lead Assignment Request
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Confirm Agent Introduction
        </h1>

        <p
          style={{
            color: "#4B5563",
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          Agent <strong>{details.agent_name || "Your Agent"}</strong> is
          requesting to add your account to their introduced client group on
          InstaPay with custom pricing.
        </p>

        <div style={detailsBoxStyle}>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Agent Name:</span>
            <span style={detailValueStyle}>{details.agent_name || "—"}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Client Name:</span>
            <span style={detailValueStyle}>
              {details.client_name || details.company_name || "—"}
            </span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Contact Email:</span>
            <span style={detailValueStyle}>{details.email || "—"}</span>
          </div>
          <div style={{ ...detailRowStyle, borderBottom: "none" }}>
            <span style={detailLabelStyle}>Proposed Fee Pack:</span>
            <span
              style={{ ...detailValueStyle, color: "#4F46E5", fontWeight: 600 }}
            >
              {details.fee_pack_name || "Custom Fee Pack"}{" "}
              {details.fee_pack_summary ? `(${details.fee_pack_summary})` : ""}
            </span>
          </div>
        </div>

        <div style={btnGroupStyle}>
          <button
            onClick={() => confirmMutation.mutate("accept")}
            disabled={confirmMutation.isPending}
            style={primaryBtnStyle}
          >
            {confirmMutation.isPending
              ? "Processing..."
              : "Accept Agent Assignment"}
          </button>
          <button
            onClick={() => confirmMutation.mutate("decline")}
            disabled={confirmMutation.isPending}
            style={secondaryBtnStyle}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline CSS Styles for clean presentation
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F3F4F6",
  padding: "20px",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "36px 32px",
  maxWidth: "480px",
  width: "100%",
  textAlign: "center",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const logoStyle = {
  height: "40px",
  marginBottom: "24px",
};

const detailsBoxStyle = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "24px",
  textAlign: "left",
};

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #F3F4F6",
  fontSize: "13px",
};

const detailLabelStyle = {
  color: "#6B7280",
  fontWeight: 500,
};

const detailValueStyle = {
  color: "#111827",
  fontWeight: 600,
};

const btnGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const primaryBtnStyle = {
  width: "100%",
  padding: "12px 20px",
  backgroundColor: "#4F46E5",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const secondaryBtnStyle = {
  width: "100%",
  padding: "12px 20px",
  backgroundColor: "transparent",
  color: "#4B5563",
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

export default LeadClaimConfirm;
