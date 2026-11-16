import React, { useContext, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { X, UploadCloud } from "react-feather";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";

const KYC_KYB_ACCEPT = { pdf: ".pdf,application/pdf", image: "image/*", video: "video/*" };
const matchesKycKybType = (file, fileType) => {
  const type = String(fileType || "")
    .trim()
    .toLowerCase();
  if (type === "pdf") return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (type === "image" || type === "video") return file.type.startsWith(`${type}/`);
  return true;
};

const InquiryResponseModal = ({ isOpen, toggle, inquiry, onSuccess }) => {
  const { t } = useTranslation();
  const { verifyToken } = useContext(UserContext);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !inquiry) return null;

  const isKycKyb = inquiry.source === "kyc_kyb";
  const requiresFile = inquiry.inquiry_type === "FILE" || inquiry.inquiry_type === "BOTH";
  const requiresAnswer = inquiry.inquiry_type === "QUESTION";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Same limits the KYC/KYB settings upload enforces.
    if (isKycKyb && file.size > 5 * 1024 * 1024) {
      toast.error(t("File size cannot exceed 5MB"));
      e.target.value = "";
      return;
    }
    if (isKycKyb && !matchesKycKybType(file, inquiry.file_type)) {
      toast.error(
        `${t("Invalid file type. Please upload a")} ${String(inquiry.file_type).toUpperCase()} ${t("file.")}`,
      );
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const submitKycKyb = async () => {
    const formData = new FormData();
    if (requiresAnswer) {
      formData.append("text_value", userAnswer.trim());
      formData.append("file", userAnswer.trim());
    } else {
      formData.append("file", selectedFile);
      formData.append("file_type", selectedFile.type);
    }
    formData.append("file_id", inquiry._id);

    await apiWrapper({
      endpoint: inquiry.uploadEndpoint,
      method: "POST",
      payload: formData,
      isFormData: true,
      isDecrypted: false,
    });
    toast.success(t("Document uploaded successfully."));
    // KYC/KYB requests live on userDetails, so refresh it to move the item to "In review".
    if (verifyToken) verifyToken(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (requiresFile && !selectedFile) {
      toast.error(t("Please attach the requested document."));
      return;
    }

    if (requiresAnswer && !userAnswer.trim()) {
      toast.error(t("Please provide an answer to the inquiry."));
      return;
    }

    setLoading(true);
    try {
      if (isKycKyb) {
        await submitKycKyb();
        toggle();
        return;
      }

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

      toast.success(res?.message || t("Response submitted successfully."));
      if (onSuccess) onSuccess();
      toggle();
    } catch (error) {
      handlePaymentApiError({
        error,
        fallback: t("Failed to upload response."),
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
              {inquiry.title}
            </h4>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {isKycKyb
                ? t("KYC/KYB document request")
                : `${t("Compliance Inquiry")} · ${inquiry.inquiry_type}`}
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
                {t("Your Response")} {requiresAnswer && <span style={{ color: "#dc2626" }}>*</span>}
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t("Type your explanation or response here...")}
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
                {t("Attach Supporting Document")} <span style={{ color: "#dc2626" }}>*</span>
                {inquiry.file_type && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: "400",
                      marginLeft: "6px",
                    }}
                  >
                    ({t("Format")}: {inquiry.file_type})
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
                  {selectedFile ? selectedFile.name : t("Click to select a file")}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    isKycKyb
                      ? KYC_KYB_ACCEPT[String(inquiry.file_type || "").toLowerCase()]
                      : inquiry.file_type || "*"
                  }
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
              {t("Cancel")}
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
              {loading ? t("Submitting...") : t("Submit Response")}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default InquiryResponseModal;
