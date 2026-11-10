import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
} from "reactstrap";
import {
  CheckCircle,
  XCircle,
  UploadCloud,
  FileText,
  ExternalLink,
  Eye,
  Type,
  AlertCircle,
} from "react-feather";
import { AiOutlineClockCircle } from "react-icons/ai";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";

const getAllowedAccept = (fileType) => {
  if (!fileType) return undefined;
  const type = fileType.trim().toLowerCase();
  if (type === "pdf") return ".pdf,application/pdf";
  if (type === "image") return "image/*";
  if (type === "video") return "video/*";
  return undefined;
};

const validateFileType = (file, fileType) => {
  if (!file || !fileType) return true;
  const type = fileType.trim().toLowerCase();
  if (type === "pdf") {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  }
  if (type === "image") {
    return file.type.startsWith("image/");
  }
  if (type === "video") {
    return file.type.startsWith("video/");
  }
  return true;
};

const getStatusBadge = (status, t) => {
  if (!status) return null;
  const lowerStatus = status.trim().toLowerCase();

  if (lowerStatus === "approved") {
    return (
      <Badge
        color="success"
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <CheckCircle size={12} /> {t("Approved")}
      </Badge>
    );
  }
  if (lowerStatus === "uploaded") {
    return (
      <Badge
        color="success"
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <CheckCircle size={12} /> {t("Uploaded")}
      </Badge>
    );
  }
  if (lowerStatus === "needs-review" || lowerStatus === "needs_review") {
    return (
      <Badge
        color="warning"
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <AiOutlineClockCircle size={12} /> {t("Needs Review")}
      </Badge>
    );
  }
  if (lowerStatus === "requested") {
    return (
      <Badge
        color="info"
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {t("Requested")}
      </Badge>
    );
  }
  if (lowerStatus === "declined" || lowerStatus === "decline") {
    return (
      <Badge
        color="danger"
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <XCircle size={12} /> {t("Declined")}
      </Badge>
    );
  }
  const displayName = status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, " ");
  return (
    <Badge
      color="secondary"
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {t(displayName)}
    </Badge>
  );
};

const isActionableStatus = (status) => {
  const lowerStatus = status ? status.toLowerCase() : "";
  return lowerStatus === "requested" || lowerStatus === "decline" || lowerStatus === "declined";
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #e64067 0%, #5926f0 50%, #4828a0 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "5px 12px",
  fontSize: "11px",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#f1f5f9",
  color: "#334155",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  margin: 0,
  transition: "all 0.15s ease",
};

const AdditionalFilesSection = ({ files, uploadEndpoint }) => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [uploadingStates, setUploadingStates] = useState({});
  const [textInputs, setTextInputs] = useState({});
  const [detailsItemId, setDetailsItemId] = useState(null);
  const { authHeader, verifyToken } = useContext(UserContext);

  // Resolve from props so the modal reflects status changes after an upload.
  const detailsItem = detailsItemId ? files.find((f) => f._id === detailsItemId) : null;

  const closeDetails = () => setDetailsItemId(null);

  const handleFileChange = (itemId, file, allowedType, inputId) => {
    if (!file) return;

    const resetInput = () => {
      const inputEl = document.getElementById(inputId);
      if (inputEl) {
        inputEl.value = "";
      }
    };

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("File size cannot exceed 5MB"));
      resetInput();
      return;
    }

    if (allowedType) {
      const isValid = validateFileType(file, allowedType);
      if (!isValid) {
        toast.error(
          `${t("Invalid file type. Please upload a")} ${allowedType.toUpperCase()} ${t("file.")}`,
        );
        resetInput();
        return;
      }
    }

    setSelectedFiles((prev) => ({ ...prev, [itemId]: file }));
    if (file.type.startsWith("image/")) {
      setFilePreviews((prev) => ({
        ...prev,
        [itemId]: URL.createObjectURL(file),
      }));
    } else {
      setFilePreviews((prev) => ({ ...prev, [itemId]: null }));
    }
  };

  const handleTextChange = (itemId, val) => {
    setTextInputs((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleRemoveFile = (itemId) => {
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    setFilePreviews((prev) => {
      const updated = { ...prev };
      if (updated[itemId]) {
        URL.revokeObjectURL(updated[itemId]);
        delete updated[itemId];
      }
      return updated;
    });
  };

  const handleUploadSingle = async (item) => {
    const file = selectedFiles[item._id];
    const textVal = textInputs[item._id];

    if (item.input_type !== "text" && !file) return;
    if (item.input_type === "text" && !textVal?.trim()) return;

    setUploadingStates((prev) => ({ ...prev, [item._id]: true }));
    try {
      const formdata = new FormData();
      if (item.input_type === "text") {
        formdata.append("text_value", textVal);
        formdata.append("file", textVal);
      } else {
        formdata.append("file", file);
        formdata.append("file_type", file.type);
      }
      formdata.append("file_id", item._id);

      await axios.post(uploadEndpoint, formdata, { headers: authHeader });

      toast.success(t("Document uploaded successfully."));
      if (item.input_type === "text") {
        setTextInputs((prev) => {
          const updated = { ...prev };
          delete updated[item._id];
          return updated;
        });
      } else {
        handleRemoveFile(item._id);
      }
      if (verifyToken) {
        verifyToken(true);
      }
    } catch (error) {
      const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : null;
      const errMsg =
        dec?.message || error?.response?.data?.message || t("Upload failed. Please try again.");
      toast.error(errMsg);
    } finally {
      setUploadingStates((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  // Text responses are only entered from the details modal (textarea + submit).
  const renderTextControls = (item) => {
    const uploading = uploadingStates[item._id];
    const value = textInputs[item._id] || "";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "8px",
          width: "100%",
        }}
      >
        <textarea
          value={value}
          onChange={(e) => handleTextChange(item._id, e.target.value)}
          placeholder={t("Enter text response...")}
          rows={5}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "13px",
            outline: "none",
            width: "100%",
            resize: "vertical",
            minHeight: "110px",
            lineHeight: "1.5",
            color: "#1e293b",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => handleUploadSingle(item)}
            disabled={uploading || !value.trim()}
            style={{
              ...primaryButtonStyle,
              padding: "8px 18px",
              fontSize: "12px",
              opacity: uploading || !value.trim() ? 0.6 : 1,
            }}
          >
            {uploading ? t("Submitting...") : t("Submit")}
          </button>
        </div>
      </div>
    );
  };

  const renderFileControls = (item, variant) => {
    const file = selectedFiles[item._id];
    const preview = filePreviews[item._id];
    const uploading = uploadingStates[item._id];
    const inputId = `file-input-${variant}-${item._id}`;
    const isModal = variant === "modal";

    return (
      <div
        style={{
          display: isModal ? "flex" : "inline-flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        {!file ? (
          <>
            <label htmlFor={inputId} style={secondaryButtonStyle}>
              <UploadCloud size={14} />
              {t("Select File")}
            </label>
            <input
              type="file"
              id={inputId}
              accept={getAllowedAccept(item.file_type)}
              onChange={(e) =>
                handleFileChange(item._id, e.target.files[0], item.file_type, inputId)
              }
              style={{ display: "none" }}
            />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "4px 8px",
                borderRadius: "6px",
                maxWidth: isModal ? "100%" : "240px",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FileText size={14} style={{ color: "#4f46e5" }} />
              )}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#334155",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: isModal ? "260px" : "120px",
                }}
              >
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(item._id)}
                style={{
                  border: "none",
                  background: "none",
                  color: "#ef4444",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <XCircle size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleUploadSingle(item)}
              disabled={uploading}
              style={{
                ...primaryButtonStyle,
                ...(isModal ? { padding: "8px 18px", fontSize: "12px" } : {}),
              }}
            >
              {uploading ? t("Uploading...") : t("Upload")}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSubmittedText = (item, variant) => {
    const value = item.text_value || item.file_link || "";
    if (variant === "modal") {
      return (
        <textarea
          value={value || t("Submitted")}
          readOnly
          rows={5}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "13px",
            width: "100%",
            resize: "vertical",
            minHeight: "110px",
            lineHeight: "1.5",
            color: "#334155",
            backgroundColor: "#f8fafc",
            outline: "none",
          }}
        />
      );
    }
    return (
      <span
        style={{
          fontSize: "12px",
          color: "#64748b",
          fontStyle: "italic",
          maxWidth: "200px",
          display: "inline-block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value || t("Submitted")}
      </span>
    );
  };

  const renderSubmittedFile = (item) =>
    item.file_link ? (
      <a
        href={item.file_link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#5926f0",
          fontSize: "12px",
          fontWeight: "600",
          textDecoration: "none",
        }}
      >
        {t("View Document")}
        <ExternalLink size={12} />
      </a>
    ) : null;

  const renderResponse = (item, variant) => {
    // The table only ever shows the "View Details" button; every response
    // control (inputs, upload, submitted answer, document link) lives in the modal.
    if (variant !== "modal") return null;
    const actionable = isActionableStatus(item.status);
    if (actionable) {
      return item.input_type === "text"
        ? renderTextControls(item)
        : renderFileControls(item, variant);
    }
    return item.input_type === "text"
      ? renderSubmittedText(item, variant)
      : renderSubmittedFile(item);
  };

  const formatLabel = (item) =>
    item.input_type === "text" ? t("Text") : item.file_type || t("Any Format");

  const hasPendingRequired = files.some(
    (item) => item.isRequired && isActionableStatus(item.status),
  );

  return (
    <Col md="12" className="mb-4" id="additional-files-section">
      <Card
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <CardHeader
          className="border-bottom-0 pb-0"
          style={{ backgroundColor: "#fff", borderRadius: "12px 12px 0 0" }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
            }}
          >
            {t("Additional Information")}
          </h4>
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            {t(
              "Please check the files requested by the administration below and upload the corresponding documents.",
            )}
          </p>
          {hasPendingRequired && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: "10px",
                padding: "10px 12px",
                marginTop: "12px",
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: "#e11d48", flexShrink: 0, marginTop: "1px" }}
              />
              <span style={{ fontSize: "12px", color: "#9f1239", lineHeight: "1.5" }}>
                {t(
                  "Items marked as Required must be submitted before you can continue using the rest of InstaPay.",
                )}
              </span>
            </div>
          )}
        </CardHeader>
        <CardBody style={{ padding: "20px" }}>
          <div className="table-responsive">
            <Table style={{ verticalAlign: "middle", margin: 0 }}>
              <thead>
                <tr
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>
                    {t("Document details")}
                  </th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>{t("Allowed Format")}</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>{t("Status")}</th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: "600",
                      textAlign: "right",
                    }}
                  >
                    {t("Action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px", maxWidth: "300px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: 0,
                          }}
                        >
                          <span
                            title={item.document_type}
                            style={{
                              fontWeight: "600",
                              fontSize: "14px",
                              color: "#1e293b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "220px",
                            }}
                          >
                            {item.document_type}
                          </span>
                          {item.isRequired && (
                            <span
                              style={{
                                backgroundColor: "#fee2e2",
                                color: "#ef4444",
                                fontWeight: "600",
                                fontSize: "9px",
                                padding: "3px 9px",
                                borderRadius: "999px",
                                border: "1px solid #fecaca",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}
                            >
                              {t("Required")}
                            </span>
                          )}
                        </div>
                        {item.desc && (
                          <span
                            title={item.desc}
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              lineHeight: "1.4",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "268px",
                              display: "block",
                            }}
                          >
                            {item.desc}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          backgroundColor: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontWeight: "600",
                          color: "#334155",
                          fontSize: "11px",
                          textTransform: "uppercase",
                        }}
                      >
                        {formatLabel(item)}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>{getStatusBadge(item.status, t)}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {renderResponse(item, "table")}
                        <button
                          type="button"
                          onClick={() => setDetailsItemId(item._id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "none",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#5926f0",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={12} />
                          {t("View Details")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal centered isOpen={!!detailsItem} toggle={closeDetails} size="md">
        {detailsItem && (
          <>
            <ModalHeader toggle={closeDetails} className="border-bottom-0 pb-0">
              <span style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a" }}>
                {t("Request Details")}
              </span>
            </ModalHeader>
            <ModalBody style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4f46e5",
                    flexShrink: 0,
                  }}
                >
                  {detailsItem.input_type === "text" ? <Type size={18} /> : <FileText size={18} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#1e293b",
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                    }}
                  >
                    {detailsItem.document_type}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "6px",
                    }}
                  >
                    {getStatusBadge(detailsItem.status, t)}
                    <span
                      style={{
                        backgroundColor: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        color: "#334155",
                        fontSize: "11px",
                        textTransform: "uppercase",
                      }}
                    >
                      {formatLabel(detailsItem)}
                    </span>
                    {detailsItem.isRequired && (
                      <span
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                          fontWeight: "600",
                          fontSize: "9px",
                          padding: "3px 9px",
                          borderRadius: "999px",
                          border: "1px solid #fecaca",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Required")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  {t("Description")}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#334155",
                    lineHeight: "1.5",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    maxHeight: "160px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {detailsItem.desc || (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      {t("No description provided.")}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  {isActionableStatus(detailsItem.status)
                    ? t("Your Response")
                    : t("Submitted Response")}
                </div>
                {renderResponse(detailsItem, "modal") || (
                  <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                    {t("Submitted")}
                  </span>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </Modal>
    </Col>
  );
};

export default AdditionalFilesSection;
