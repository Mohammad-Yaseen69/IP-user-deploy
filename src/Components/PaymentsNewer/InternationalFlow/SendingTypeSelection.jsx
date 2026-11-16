import React, { useContext, useEffect } from "react";
import { UserContext } from "../../../Context/UserContext";
import { useTranslation } from "react-i18next";
import { User, Users, CheckCircle } from "react-feather";

const getAccountName = (userDetails) => {
  if (userDetails?.account_type === "business") {
    return userDetails?.company?.company_name || userDetails?.company?.name || "Business account";
  }
  return (
    `${userDetails?.user?.first_name || ""} ${userDetails?.user?.last_name || ""}`.trim() ||
    "My account"
  );
};

const SendingTypeSelection = ({ data, dataHandler }) => {
  const { userDetails } = useContext(UserContext);
  const { t } = useTranslation();

  const senderType = data?.senderType || "account";
  const selectedSendingType = data?.sendingType;
  const defaultType = userDetails?.account_type === "individual" ? "C" : "B";

  useEffect(() => {
    if (!data?.senderType) {
      dataHandler("senderType", "account");
    }
  }, [data?.senderType, dataHandler]);

  useEffect(() => {
    if (senderType === "account") {
      dataHandler("sendingType", defaultType);
      if (data?.transactionType) {
        dataHandler("flow", `${defaultType}2${data.transactionType}`);
      }
    }
  }, [senderType, defaultType, data?.transactionType, dataHandler]);

  const handleSenderTypeSelect = (type) => {
    dataHandler("senderType", type);
    if (type === "account") {
      dataHandler("sendingType", defaultType);
      if (data?.transactionType) {
        dataHandler("flow", `${defaultType}2${data.transactionType}`);
      }
    } else {
      dataHandler("sendingType", "");
    }
  };

  const handleSendingTypeSelect = (type) => {
    dataHandler("sendingType", type);
    if (data?.transactionType) {
      dataHandler("flow", `${type}2${data.transactionType}`);
    }
  };

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
    transition: "0.2s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%",
      }}
    >
      <div>
        <h5 style={{ margin: 0, color: "#5926F0", fontWeight: 800 }}>{t("Select Sender Type")}</h5>
        <p
          style={{
            margin: "6px 0 0",
            color: "#7A7A7A",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {t("Choose who is sending the payment.")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        <button
          type="button"
          onClick={() => handleSenderTypeSelect("account")}
          style={cardStyle(senderType === "account")}
        >
          <User size={22} color="#5926F0" />
          <span style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>
              {t("Use my own account")}
            </strong>
            <span
              style={{
                display: "block",
                color: "#777",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {getAccountName(userDetails)}
            </span>
          </span>
          {senderType === "account" ? <CheckCircle size={18} color="#5926F0" /> : null}
        </button>
        <button
          type="button"
          onClick={() => handleSenderTypeSelect("third-party")}
          style={cardStyle(senderType === "third-party")}
        >
          <Users size={22} color="#5926F0" />
          <span style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px" }}>
              {t("Third-party sender")}
            </strong>
            <span
              style={{
                display: "block",
                color: "#777",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {t("Select a saved sender or add a new one")}
            </span>
          </span>
          {senderType === "third-party" ? <CheckCircle size={18} color="#5926F0" /> : null}
        </button>
      </div>

      {senderType === "third-party" && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h5 style={{ fontWeight: 700, color: "#454545", margin: "10px 0 5px" }}>
            {t("Select Third-Party Type")}
          </h5>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => handleSendingTypeSelect("C")}
              style={cardStyle(selectedSendingType === "C")}
            >
              <User size={20} color="#5926F0" />
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "13px" }}>{t("Individual")}</strong>
              </span>
              {selectedSendingType === "C" ? <CheckCircle size={16} color="#5926F0" /> : null}
            </button>
            <button
              type="button"
              onClick={() => handleSendingTypeSelect("B")}
              style={cardStyle(selectedSendingType === "B")}
            >
              <Users size={20} color="#5926F0" />
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "13px" }}>{t("Business")}</strong>
              </span>
              {selectedSendingType === "B" ? <CheckCircle size={16} color="#5926F0" /> : null}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendingTypeSelection;
