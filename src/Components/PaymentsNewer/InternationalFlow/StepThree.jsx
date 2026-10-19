import { useTranslation } from "react-i18next";
import styles from "./styles/stepthree.module.css";
import thunesReasons from "./thunesReasons.json";
import file from "../files/file.svg";
import { useEffect, useMemo, useState } from "react";
import useWindowWidth from "../../../utils/useWindowWidth";

// Documents a Thunes payer can ask for (get-required-fields -> required_documents)
const REQUIRED_DOCUMENTS = {
  invoice: {
    label: "Invoice",
    hint: "Upload the invoice for this payment.",
  },
  purchase_order: {
    label: "Purchase order",
    hint: "Upload the purchase order linked to this payment.",
  },
  contract: {
    label: "Contract",
    hint: "Upload the signed contract covering this payment.",
  },
};

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const humanizeCode = (code = "") => {
  const text = String(code).toLowerCase().replaceAll("_", " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const StepThree = ({ data, dataHandler, purposeCodes, requiredDocuments = [] }) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [documentErrors, setDocumentErrors] = useState({});
  const width = useWindowWidth();

  const documents = requiredDocuments.map((doc) => ({
    name: doc.name,
    label: REQUIRED_DOCUMENTS[doc.name]?.label || humanizeCode(doc.name),
    hint: REQUIRED_DOCUMENTS[doc.name]?.hint,
  }));
  const documentFiles = data.requiredDocFiles || {};

  const handleDocumentChange = (name, e) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    const isAllowedType = selected.type.startsWith("image/") || selected.type === "application/pdf";
    if (!isAllowedType || selected.size > MAX_DOCUMENT_SIZE) {
      setDocumentErrors((prev) => ({
        ...prev,
        [name]: t("Please upload a PDF or image file of up to 10 MB."),
      }));
      return;
    }

    setDocumentErrors((prev) => ({ ...prev, [name]: "" }));
    dataHandler("requiredDocFiles", { ...documentFiles, [name]: selected });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let totalSize = 0;
    let imageCount = 0;
    let videoCount = 0;

    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
      if (files[i].type.startsWith("image/")) {
        imageCount += 1;
      } else if (files[i].type.startsWith("video/")) {
        videoCount += 1;
      }
    }

    if (imageCount > 4 || videoCount > 1 || files.length > 5 || totalSize > 20 * 1024 * 1024) {
      setError(
        t(
          "You can upload a maximum of 4 images, 1 video, and the total size should not exceed 20 MB.",
        ),
      );
    } else {
      setError("");
      dataHandler("files", files);
    }
  };

  const dynamicReasons = useMemo(() => {
    if (purposeCodes?.length > 0) {
      return Object.fromEntries(
        purposeCodes.map((code) => [code, thunesReasons[code] || humanizeCode(code)]),
      );
    }
    if (data?.payoutChannel?.vendor === "thunes" || !data.neemaReasons) {
      return thunesReasons;
    }
    return data.neemaReasons;
  }, [data?.payoutChannel, data.neemaReasons, purposeCodes]);

  // A reason picked earlier (or for another payer) may not be accepted by this payer.
  useEffect(() => {
    if (purposeCodes?.length > 0 && data.reason && !purposeCodes.includes(data.reason)) {
      dataHandler("reason", "");
    }
  }, [purposeCodes, data.reason]);

  return (
    <>
      <div></div>
      <div
        style={
          width < 1000
            ? {
                [documents.length > 0 ? "minHeight" : "height"]: "55vh",
                display: "flex",
                justifyContent: "center",
              }
            : {}
        }
        className={styles.container}
      >
        <select value={data.reason} onChange={(e) => dataHandler("reason", e.target.value)}>
          <option value="" disabled>
            {t("Select Purpose of Payment")}
          </option>
          {Object.keys(dynamicReasons).map((item) => (
            <option value={item} key={item}>
              {t(dynamicReasons[item])}
            </option>
          ))}
        </select>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
          className={styles.comment_files}
        >
          <textarea
            type="text"
            placeholder={t("Transfer Note")}
            value={data.comment}
            onChange={(e) => {
              if (e.target.value.length <= 120) dataHandler("comment", e.target.value);
            }}
            maxLength={120}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                textAlign: "right",
                fontSize: ".8rem",
                color: data.comment.length === 120 ? "#E64067" : "#888",
              }}
            >
              {data.comment.length}/120
            </div>
            <label htmlFor="files" className={styles.files}>
              <span style={{ whiteSpace: "nowrap" }}>{t("Attach Files")}</span>
              <img src={file} alt="" />
              <input
                type="file"
                id="files"
                hidden
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}

        {documents.length > 0 && (
          <div className={styles.required_docs}>
            <p className={styles.required_note}>
              {t("This payer requires the following documents for this transfer.")}
            </p>
            {documents.map((doc) => {
              const inputId = `required-doc-${doc.name}`;
              const selected = documentFiles[doc.name];
              return (
                <div key={doc.name} className={styles.required_doc}>
                  <div className={styles.required_doc_info}>
                    <strong>
                      {t(doc.label)} <span className={styles.required_star}>*</span>
                    </strong>
                    <span className={styles.required_doc_hint}>
                      {selected ? selected.name : doc.hint ? t(doc.hint) : t("PDF or image")}
                    </span>
                    {documentErrors[doc.name] && (
                      <span className={styles.error}>{documentErrors[doc.name]}</span>
                    )}
                  </div>
                  <label htmlFor={inputId} className={styles.files}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      {selected ? t("Replace") : t("Upload")}
                    </span>
                    <img src={file} alt="" />
                    <input
                      type="file"
                      id={inputId}
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocumentChange(doc.name, e)}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.files_prev}>
          {data.files.length > 0
            ? data.files.map((item, idx) => (
                <span key={idx}>
                  <strong>{t("File Name")}</strong>: {item?.name}
                </span>
              ))
            : ""}
        </div>
      </div>
    </>
  );
};

export default StepThree;
