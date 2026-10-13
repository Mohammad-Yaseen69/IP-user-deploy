import { useContext, useEffect, useMemo, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { FileText } from "react-feather";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import styles from "./statementModal.module.scss";
import logoImg from "../../../assets/images/logo/logo2.webp";
import { exportToExcel } from "../../../utils/Functions/csvExport";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";
import { UserContext } from "../../../Context/UserContext";
import { useVirtualIbans } from "../../../hooks/useVirtualIban";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { normalizeVirtualIban } from "../utils/virtualIban";

const PERIODS = ["This month", "Last month", "Last 90 days", "Custom"];

const FORMATS = [
  {
    id: "pdf",
    label: "PDF",
    sub: "Print-ready",
  },
  {
    id: "csv",
    label: "CSV",
    sub: "For spreadsheets",
  },
];

const FileBadge = ({ type }) => (
  <div className={styles.fileBadge}>
    <FileText size={18} />
    <span>{type}</span>
  </div>
);

const toBase64 = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = src;
  });

const renderRecipientName = (tx) => {
  if (tx?.virtual_iban?.account_holder_name)
    return tx.virtual_iban.account_holder_name;
  if (tx?.guest_details?.name) return tx.guest_details.name;
  if (tx?.recipient_name) return tx.recipient_name;
  if (tx?.account?.user?.first_name || tx?.account?.user?.last_name) {
    return `${tx.account.user.first_name || ""} ${tx.account.user.last_name || ""}`.trim();
  }
  if (tx?.sender?.user?.first_name || tx?.sender?.user?.last_name) {
    return `${tx.sender.user.first_name || ""} ${tx.sender.user.last_name || ""}`.trim();
  }
  return tx?.description || tx?.client_reference || "N/A";
};

const renderPaymentType = (item) => {
  if (item?.payment_type) {
    return service_name_formatter
      ? service_name_formatter(item.payment_type)
      : item.payment_type;
  }
  if (item?.type) {
    return item.type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "SEPA Transfer";
};

const getDateRange = (periodKey, customFrom, customTo) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (periodKey === "This month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date();
  } else if (periodKey === "Last month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (periodKey === "Last 90 days") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    endDate = new Date();
  } else if (periodKey === "Custom") {
    startDate = customFrom
      ? new Date(customFrom)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = customTo ? new Date(customTo + "T23:59:59") : new Date();
  }
  return { startDate, endDate };
};

const StatementModal = ({ isOpen, toggle, selectedIban }) => {
  const { t } = useTranslation();
  const { userDetails, selectedAccount } = useContext(UserContext);
  const { data: rawIbans = [] } = useVirtualIbans(userDetails?._id);

  const activeIban = useMemo(() => {
    if (selectedIban) return normalizeVirtualIban(selectedIban);
    if (!rawIbans.length) return null;
    const found =
      rawIbans.find((iban) => (iban?._id || iban?.id) === selectedAccount) ||
      rawIbans[0];
    return normalizeVirtualIban(found);
  }, [selectedIban, rawIbans, selectedAccount]);

  const [period, setPeriod] = useState("This month");
  const [format, setFormat] = useState("pdf");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownloadStatement = async () => {
    setDownloadError("");
    const ibanId = activeIban?._id || activeIban?.id;
    if (!ibanId) {
      toast.error(t("No active Virtual IBAN selected!"));
      return;
    }

    const { startDate, endDate } = getDateRange(period, customFrom, customTo);
    setIsDownloading(true);

    try {
      const res = await apiWrapper({
        endpoint: `/api/virtual-iban/transactions?iban_id=${ibanId}`,
        method: "GET",
      });
      console.log(res, "res");
      let rawList = [];
      if (Array.isArray(res)) rawList = res;
      else if (res && res.data && Array.isArray(res.data)) rawList = res.data;
      else if (res && Array.isArray(res.items)) rawList = res.items;
      const filteredTransactions = rawList.filter((tx) => {
        const rawDate = tx?.createdAt || tx?.date;
        const txDate = new Date(rawDate);

        console.log("CHECKING TRANSACTION:", {
          id: tx?._id,
          rawDate,
          txDate,
          startDate,
          endDate,
          isValidDate: !isNaN(txDate.getTime()),
          isInRange: txDate >= startDate && txDate <= endDate,
        });

        return (
          !isNaN(txDate.getTime()) && txDate >= startDate && txDate <= endDate
        );
      });

      if (filteredTransactions.length === 0) {
        setDownloadError(
          t("No transactions found within the selected period!"),
        );
        toast.warning(t("No transactions found for the selected date range."));
        setIsDownloading(false);
        return;
      }

      if (format === "pdf") {
        const tableStyles = { fontSize: 7 };
        const tableHeaderStyles = {
          fontSize: 8,
          fillColor: [89, 38, 240],
          textColor: [255, 255, 255],
        };

        const doc = new jsPDF({ orientation: "landscape" });

        try {
          const logoBase64 = await toBase64(logoImg);
          doc.addImage(logoBase64, "PNG", 14, 10, 46.5, 13);
        } catch (e) {
          doc.setFont("montserrat", "bold");
          doc.setFontSize(18);
          doc.text("InstaPay", 14, 20);
        }

        const currentDate = new Date();
        const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("montserrat", "normal");
        doc.setFontSize(8);
        doc.text(formattedDate, 220, 17.5);

        const userName = `${userDetails?.user?.first_name || userDetails?.first_name || userDetails?.company_name || userDetails?.companyName || userDetails?.name || "Valued Customer"}`;
        const userAddr =
          userDetails?.address || userDetails?.formattedAddress || "N/A";
        const ibanNum = activeIban?.iban || "N/A";
        const bicCode =
          activeIban?.bank?.bic ||
          activeIban?.swift_code ||
          activeIban?.bic ||
          "SYPLMTM2";

        doc.text(`IBAN: ${ibanNum}`, 14, 30);
        doc.text(`BIC / SWIFT: ${bicCode}`, 14, 35);
        doc.text(`Name: ${userName}`, 14, 40);
        doc.text(`Address: ${userAddr}`, 14, 45);
        doc.text(
          `Statement Duration: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          14,
          50,
        );

        if (doc.autoTable) {
          doc.autoTable({
            head: [["IBAN Number", "Currency", "Available Balance", "Status"]],
            body: [
              [
                ibanNum,
                activeIban?.currency || "EUR",
                `${Number(activeIban?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${activeIban?.currency || "EUR"}`,
                String(activeIban?.status || "ACTIVE").toUpperCase(),
              ],
            ],
            startY: 56,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
          });
        }

        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 65;

        const transactionsTable = {
          head: [
            [
              "Date & Time",
              "Transaction ID",
              "Payment Type",
              "Recipient / Description",
              "Type",
              "Amount",
              "Fee",
              "Total Amount",
              "Status",
            ],
          ],
          body: filteredTransactions.map((item) => {
            const isDebit =
              (item?.transaction_type ?? "")?.toLowerCase() === "debit";
            const currency = item?.currency || "EUR";

            const amtStr = `${isDebit ? "-" : "+"}${item?.amount ? Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} ${currency}`;

            const feeStr = `${Number(item?.fee ?? 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${currency}`;

            const totalStr = `${Number(item?.total ?? 0).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )} ${currency}`;

            return [
              new Date(item?.createdAt || item?.date)?.toLocaleString(),
              item?.reference_id ||
                item?.external_reference ||
                item?._id ||
                "N/A",
              renderPaymentType(item),
              item?.beneficiary?.name || renderRecipientName(item),
              (item?.transaction_type || "TRANSFER").toUpperCase(),
              amtStr,
              feeStr,
              totalStr,
              (item?.status || "COMPLETED").toUpperCase(),
            ];
          }),
          startY: startY,
          styles: tableStyles,
          headStyles: tableHeaderStyles,
        };

        if (doc.autoTable) {
          doc.autoTable(transactionsTable);
        }

        const cleanIban = (ibanNum || "document").replace(/\s/g, "_");
        doc.save(
          `IBAN_Statement_${cleanIban}_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.pdf`,
        );
        toast.success(t("Statement downloaded successfully!"));
      } else {
        await exportToExcel(filteredTransactions, userDetails, () => {}, false);
        toast.success(t("CSV Statement exported successfully!"));
      }

      toggle();
    } catch (error) {
      console.error("Statement download failed:", error);
      setDownloadError(t("Failed to fetch statement data. Please try again."));
      toast.error(t("Failed to download statement."));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      style={{ maxWidth: "816px", width: "calc(100% - 32px)" }}
    >
      <ModalBody className={styles.modalBody}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <FileText size={22} />
            </div>
            <h2>{t("Download statement")}</h2>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h3>{t("Period")}</h3>
              <div className={styles.periodTabs}>
                {PERIODS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`${styles.periodTab} ${period === item ? styles.activePeriod : ""}`}
                    onClick={() => setPeriod(item)}
                  >
                    {t(item)}
                  </button>
                ))}
              </div>

              {period === "Custom" && (
                <div className={styles.customRange}>
                  <label>
                    <span>{t("From")}</span>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>{t("To")}</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h3>{t("Format")}</h3>
              <div className={styles.formatGrid}>
                {FORMATS.map((item) => {
                  const isActive = format === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`${styles.formatCard} ${isActive ? styles.activeFormat : ""}`}
                      onClick={() => setFormat(item.id)}
                    >
                      <span className={styles.radio}>
                        {isActive && <span />}
                      </span>
                      <FileBadge type={item.label} />
                      <span className={styles.formatText}>
                        <strong>{t(item.label)}</strong>
                        <small>{t(item.sub)}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {downloadError && (
            <div
              style={{
                color: "red",
                fontSize: "13px",
                fontWeight: 500,
                marginTop: "12px",
              }}
            >
              {downloadError}
            </div>
          )}

          {isDownloading && (
            <div className={styles.downloadMessage}>
              <div className={styles.loader}></div>
              <h4>{t("Downloading Statement")}</h4>
              <p>
                {t("Your")} {format.toUpperCase()}{" "}
                {t("statement is being prepared. This may take a few seconds.")}
              </p>
            </div>
          )}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={toggle}
              disabled={isDownloading}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={styles.downloadBtn}
              disabled={
                isDownloading ||
                (period === "Custom" && (!customFrom || !customTo))
              }
              onClick={handleDownloadStatement}
            >
              {isDownloading ? t("Preparing...") : t("Download statement")}
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StatementModal;
