import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { X, Send } from "react-feather";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";

const InquiryMessageModal = ({ isOpen, toggle, inquiry, onSuccess }) => {
  const { t } = useTranslation();
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !inquiry) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!userMessage.trim()) {
      toast.error(t("Please write a message before sending."));
      return;
    }

    setLoading(true);
    try {
      const res = await apiWrapper({
        endpoint: `/api/compliance/inquiry/message/${inquiry._id}`,
        method: "PUT",
        payload: { user_message: userMessage.trim() },
        isEncrypted: true,
        isDecrypted: true,
      });

      toast.success(res?.message || t("Message sent to compliance team."));
      if (onSuccess) onSuccess();
      toggle();
    } catch (error) {
      handlePaymentApiError({
        error,
        fallback: t("Failed to send message."),
        setError: (message) => toast.error(message),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalBody
        style={{
          padding: "24px",
          background: "#ffffff",
          borderRadius: "16px",
          overflowWrap: "anywhere",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {t("Message Compliance Team")}
            </h4>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {t("Regarding")}: {inquiry.title}
            </span>
          </div>
          <button
            type="button"
            onClick={toggle}
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#9ca3af",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              {t("Your Message")} <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={t("Provide context, question, or updates to the compliance team...")}
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "13.5px",
                color: "#1f2937",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              onClick={toggle}
              disabled={loading}
              style={{
                background: "#f3f4f6",
                color: "#4b5563",
                border: "none",
                padding: "9px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#4f46e5",
                color: "#ffffff",
                border: "none",
                padding: "9px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={14} />
              {loading ? t("Sending...") : t("Send Message")}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default InquiryMessageModal;
