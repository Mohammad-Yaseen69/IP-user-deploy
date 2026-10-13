import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { X, UploadCloud } from "react-feather";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";

const InquiryResponseModal = ({ isOpen, toggle, inquiry, onSuccess }) => {
  const { t } = useTranslation();
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !inquiry) return null;

  const requiresFile = inquiry.inquiry_type === "FILE" || inquiry.inquiry_type === "BOTH";
  const requiresAnswer = inquiry.inquiry_type === "QUESTION";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (requiresFile && !selectedFile) {
      toast.error(t("compliance.fileRequired", "Please attach the requested document."));
      return;
    }

    if (requiresAnswer && !userAnswer.trim()) {
      toast.error(t("compliance.answerRequired", "Please provide an answer to the inquiry."));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (userAnswer.trim()) {
        formData.append("user_answer", userAnswer.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await apiWrapper({
        endpoint: `/api/compliance/inquiry/upload/${inquiry._id}`,
        method: "PUT",
        payload: formData,
        isFormData: true,
        isDecrypted: true,
      });

      toast.success(
        res?.message || t("compliance.uploadSuccess", "Response submitted successfully."),
      );
      if (onSuccess) onSuccess();
      toggle();
    } catch (error) {
      handlePaymentApiError({
        error,
        fallback: t("compliance.uploadError", "Failed to upload response."),
        setError: (message) => toast.error(message),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalBody style={{ padding: "24px", background: "#ffffff", borderRadius: "16px" }}>
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
              {inquiry.title}
            </h4>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {t("compliance.inquiryType", "Compliance Inquiry")} · {inquiry.inquiry_type}
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

        {inquiry.description && (
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #f3f4f6",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "#4b5563",
              lineHeight: "1.5",
            }}
          >
            {inquiry.description}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {(inquiry.inquiry_type === "QUESTION" || inquiry.inquiry_type === "BOTH") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {t("compliance.yourAnswer", "Your Response")}{" "}
                {requiresAnswer && <span style={{ color: "#dc2626" }}>*</span>}
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t(
                  "compliance.answerPlaceholder",
                  "Type your explanation or response here...",
                )}
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
          )}

          {requiresFile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {t("compliance.attachDocument", "Attach Supporting Document")}{" "}
                <span style={{ color: "#dc2626" }}>*</span>
                {inquiry.file_type && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: "400",
                      marginLeft: "6px",
                    }}
                  >
                    ({t("compliance.allowedType", "Format")}: {inquiry.file_type})
                  </span>
                )}
              </label>
              <label
                style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: "10px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  background: selectedFile ? "#f0fdf4" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <UploadCloud size={24} color={selectedFile ? "#059669" : "#6b7280"} />
                <span
                  style={{
                    fontSize: "13px",
                    color: selectedFile ? "#059669" : "#4b5563",
                    fontWeight: selectedFile ? "600" : "500",
                    textAlign: "center",
                  }}
                >
                  {selectedFile
                    ? selectedFile.name
                    : t("compliance.chooseFile", "Click to select a file")}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={inquiry.file_type || "*"}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}

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
              {t("compliance.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#4f46e5",
                color: "#ffffff",
                border: "none",
                padding: "9px 22px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? t("compliance.submitting", "Submitting...")
                : t("compliance.submitResponse", "Submit Response")}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default InquiryResponseModal;
