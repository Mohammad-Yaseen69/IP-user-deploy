import { useRef, useState } from "react";
import { X, Download, Upload } from "react-feather";
import styles from "./styles/bulkPayment.module.css";
import TimelineBulkRequests from "../../Payments/TimelineBulkRequests";
import { ButtonForRequests } from "../../ReceiptInvoices/UI/FormElements";
import { useTranslation } from "react-i18next";

const SAMPLE_CSV =
    "Recipient Identifier,Amount to Send,Sending Currency,Recipient Currency\n" +
    "john@example.com,100,USD,PKR\n" +
    "+15551234567,50,EUR,GBP\n" +
    "username123,25,CHF,USD\n";

const parseCsv = (text) => {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (lines.length < 2) return [];

    return lines.slice(1).map((line, idx) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
            u_id: `bulk_${idx}_${Date.now()}`,
            ID: cols[0] ?? "",
            Amount: cols[1] ?? "",
            Currency: cols[2] ?? "",
            RecipientCurrency: cols[3] ?? "",
            Moded: "No",
            availableCurrencies: cols[2] ? [cols[2]] : [],
        };
    });
};

const BulkPaymentModal = ({ isOpen, onClose, onNext, initialRecipients = [] }) => {
    const fileInputRef = useRef(null);
    const [csvRows, setCsvRows] = useState(initialRecipients);
    const [fileName, setFileName] = useState("");
    const [parseError, setParseError] = useState("");
    const { t } = useTranslation()
    if (!isOpen) return null;


    const handleDownload = () => {
        const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bulk_payment_sample.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e) => {
        setParseError("");
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            setParseError("Please upload a .csv file only.");
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const rows = parseCsv(ev.target.result);
                if (rows.length === 0) {
                    setParseError("No data rows found. Please check your CSV format.");
                    return;
                }
                setCsvRows(rows);
            } catch {
                setParseError("Failed to parse CSV. Please use the sample format.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleNext = () => {
        if (onNext) onNext(csvRows);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h4>{t("Bulk Payment Upload")}</h4>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Instructions */}
                    <div className={styles.instructions}>
                        <h5>{t("Bulk Payment Upload Instructions")}</h5>
                        <p>
                            {t("Please prepare your CSV file using the exact format below. Each row represents one payment recipient.")}
                        </p>

                        <div className={styles.divider} />

                        <h5>{t("Required Columns")}</h5>

                        <div className={styles.colBlock}>
                            <h6>{t("Recipient Identifier")}</h6>
                            <p>{t("Enter the recipient&apos;s email address, phone number, or username.")}</p>
                            <p>
                                {t("Example:")}&nbsp;<code>john@example.com</code>&nbsp;&middot;&nbsp;
                                <code>+15551234567</code>&nbsp;&middot;&nbsp;<code>john_doe</code>
                            </p>
                        </div>

                        <div className={styles.colBlock}>
                            <h6>{t("Amount to Send")}</h6>
                            <ul>
                                <li>{t("Numbers only (no currency symbols)")}</li>
                                <li>{t("Use decimals if needed (e.g., 10.50)")}</li>
                            </ul>
                            <p>{t("Example:")}&nbsp;<code>10</code></p>
                        </div>

                        <div className={styles.colBlock}>
                            <h6>{t("Sending Currency")}</h6>
                            <p>{t("Enter the 3-letter currency code of the currency you are sending from.")}</p>
                            <p>{t("Example:")}&nbsp;<code>USD</code>, <code>CHF</code>, <code>EUR</code></p>
                        </div>

                        <div className={styles.colBlock}>
                            <h6>{t("Recipient Currency")}</h6>
                            <p>{t("Enter the 3-letter currency code the recipient should receive.")}</p>
                            <p>{t("Example:")}&nbsp;<code>PKR</code>, <code>EUR</code>, <code>GBP</code></p>
                        </div>

                        <div className={styles.divider} />

                        <h5>{t("Important Notes")}</h5>
                        <ul className={styles.noteList}>
                            <li>{t("Ensure there are no extra spaces in column names.")}</li>
                            <li>{t("Currency codes must be valid ISO 3-letter codes (e.g., USD, EUR, PKR).")}</li>
                            <li>{t("Amount must be greater than 0.")}</li>
                            <li>{t("File must be uploaded in .csv format only.")}</li>
                            <li>{t("Duplicate recipients in the same file may be processed as separate payments.")}</li>
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.downloadBtn} onClick={handleDownload}>
                            <div>
                                <Download size={14} />
                                {t("Download Sample CSV")}
                            </div>
                        </button>

                        <label className={styles.uploadLabel}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                            <div>
                                <Upload size={14} />
                                {csvRows.length > 0 ? "Re-upload CSV" : "Upload CSV"}
                            </div>
                        </label>
                    </div>

                    {fileName && (
                        <p className={styles.fileName}>{t("File")}: {fileName}</p>
                    )}

                    {parseError && (
                        <p style={{ color: "#D1245F", fontSize: "0.8rem", fontFamily: "Manrope, sans-serif", fontWeight: 600, margin: 0 }}>
                            {parseError}
                        </p>
                    )}

                    {csvRows.length > 0 ? (
                        <div className={styles.tableSection}>
                            <h6>{t("Recipients Preview")} ({csvRows.length} row{csvRows.length !== 1 ? "s" : ""})</h6>
                            <div className={styles.tableWrapper}>
                                <TimelineBulkRequests
                                    beneficiaries={csvRows}
                                    srr={setCsvRows}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.uploadHint}>
                            {t("Upload a CSV file to preview recipients here")}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        {t("Cancel")}
                    </button>
                    <ButtonForRequests
                        isLoading={csvRows.length === 0}
                        onClick={handleNext}
                        style={{
                            padding: "5px 15px"
                        }}
                    >
                        {t("Next")}
                    </ButtonForRequests>
                </div>
            </div>
        </div>
    );
};

export default BulkPaymentModal;
