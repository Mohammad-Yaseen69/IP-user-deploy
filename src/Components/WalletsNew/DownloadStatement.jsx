import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import calendar from "./files/calendar.svg";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import jsPDF from "jspdf";
import img from "../../assets/images/logo/logo2.webp";
import { toast } from "react-toastify";
import "jspdf-autotable";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { exportToExcel } from "../../utils/Functions/csvExport";

const DownloadStatement = ({
  showModal,
  setShowModal,
  wallet,
  isTransection,
}) => {
  const { userDetails, authHeader, beneficiaries } = useContext(UserContext);
  const { t } = useTranslation();
  const [dateString, setDateString] = useState("");
  const [fileType, setFileType] = useState("");
  const [downlaoding, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [apiDates, setApiDates] = useState(null);
  const handleChange = (ranges) => {
    if (ranges.selection) {
      const startDate = new Date(ranges.selection.startDate);
      startDate.setDate(startDate.getDate() + 1);

      const endDate = new Date(ranges.selection.endDate);
      endDate.setDate(endDate.getDate() + 1);

      const formattedDateRange = {
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      };
      setDateString(
        `Selected from "${startDate.toDateString()}" to "${endDate.toDateString()}"`,
      );
      setApiDates(formattedDateRange);
      setDateRange(ranges.selection);
    }
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      setShowDatePicker(false);
    }
  }, []);

  const handleDatePickerClick = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const getTransactions = (callback) => {
    setDownloadError("");
    const data = {
      ...apiDates,
      query: "",
    };
    const encrypted = encryptData(data);

    let request;

    if (!isTransection) {
      request = axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${wallet?.wallet_id}/0/0?isSenderExtraInfoRequired=${["usharellc", "spmfrance", "yaseen123"].includes(userDetails?.username) ? true : ""}`,
        { data: encrypted },
        { headers: authHeader },
      );
    } else {
      request = axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${wallet?._id}/1/99999999999`,
        { data: encrypted },
        { headers: authHeader },
      );
    }

    request
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        callback(decrypted.transactionList, userDetails, () => {}, false);
        setShowModal(false);
        setApiDates(null);
        setFileType("");
        setDateString("");
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        console.log(decrypted);
        setDownloadError("No transactions found within the date range!");
        toast.error(decrypted?.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  const renderRecipientName = (item, internationalReceiver) => {
    if (item?.guest_details?.name && item?.guest_details) {
      return item?.guest_details?.name ?? "";
    }

    if (item?.service_type === "airtime") {
      return item?.airtime_number ?? "";
    }

    if (item?.payment_type === "conversion") {
      return item?.wallet_id ?? "";
    }

    const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit";
    if (isDebit) {
      if (item?.service_type === "withdraw_by_admin") return "Admin";
      if (item?.service_type === "kyc_verification") return "InstaPay";
      if (item?.service_type === "withdrawal") {
        const first =
          item?.sender?.user?.first_name ?? item?.sender?.company?.company_name;
        const last = item?.sender?.user?.last_name ?? "";
        return [first, last].filter(Boolean).join(" ");
      }
      if (item?.receiver?.user) {
        const first =
          item?.receiver?.user?.first_name ??
          item?.receiver?.company?.company_name;
        const last = item?.receiver?.user?.last_name ?? "";
        return [first, last].filter(Boolean).join(" ");
      }

      const first =
        internationalReceiver?.first_name ??
        item?.account?.user?.first_name ??
        internationalReceiver?.company_name ??
        item?.account?.company?.company_name;
      const last =
        internationalReceiver?.last_name ??
        item?.account?.user?.last_name ??
        "";
      return [first, last].filter(Boolean).join(" ");
    }

    if (item?.service_type === "topup") {
      const first = item?.receiver?.user?.first_name;
      const last = item?.receiver?.user?.last_name;
      return [first, last].filter(Boolean).join(" ");
    }

    const first =
      item?.sender?.user?.first_name ??
      item?.mastercard?.account?.first_name ??
      item?.sender?.company?.company_name;
    const last =
      item?.sender?.user?.last_name ??
      item?.mastercard?.account?.last_name ??
      "";
    return [first, last].filter(Boolean).join(" ");
  };

  const renderPaymentType = (item) => {
    if (
      item?.service_type === "withdraw_by_admin" ||
      item?.service_type === "deposite_by_admin"
    ) {
      return "Admin Funds";
    }
    if (item?.payment_type?.includes("bank")) {
      return "Bank Transfer";
    }
    if (item?.payment_type?.includes("mobile")) {
      return "Mobile Money";
    }
    return service_name_formatter(item?.payment_type);
  };

  const generatePDF = () => {
    setDownloading(true);
    const tableStyles = {
      fontSize: 5.5,
    };
    const tableHeaderStyles = {
      fontSize: 7,
      fillColor: [89, 38, 240],
      textColor: [255, 255, 255],
    };

    // Set landscape orientation by passing parameters to jsPDF
    const doc = new jsPDF({ orientation: "landscape" });

    doc.addImage(img, "png", 14, 10, 46.5, 13);
    // doc.setFont("montserrat", "normal", "bolder");
    // doc.setFontSize(20);
    // doc.text("InstaPay", 14, 25);

    doc.setFont("montserrat", "normal");
    doc.setFontSize(8);
    !isTransection
      ? doc.text(`Wallet ID: INSTA - ${wallet?.wallet_id}`, 14, 32)
      : null;

    doc.text(
      `Name: ${userDetails?.user?.first_name ?? userDetails?.company_name} ${userDetails?.user?.last_name ?? ""} `,
      14,
      38,
    );
    // doc.text(`Address: ${userDetails?.address ?? "N/A"} `, 14, 44);
    doc.text(
      `Statement Duration: ${apiDates?.from} to ${apiDates?.to} `,
      14,
      44,
    );

    if (!isTransection && doc.autoTable) {
      doc.autoTable({
        head: [
          ["Wallet ID", "Wallet Currency", "Current Balance", "Wallet Status"],
        ],
        body: [
          [
            `INSTA - ${wallet?.wallet_id}`,
            wallet?.currency?.code,
            `${Number(wallet?.balance?.available)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${wallet?.currency?.code}`,
            wallet?.status?.toUpperCase(),
          ],
        ],
        startY: 60,
        styles: tableStyles,
        headStyles: tableHeaderStyles,
      });
    }

    // Current Time and Date
    const currentDate = new Date();
    const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()} `;
    doc.setFont("montserrat", "normal", "bold");
    doc.setFontSize(8);
    doc.text(formattedDate, 160, 17.5);

    const callback = (arr) => {
      const transactionsTable = {
        head: [
          [
            "Date & Time",
            "Transaction ID",
            "Payment Type",
            "Recipient",
            "Sender Email",
            "Sender Phone",
            "Type",
            "Amount",
            "Payment Reference",
            "Status",
          ],
        ],
        body: arr.map((item) => {
          const internationalReceiver =
            beneficiaries.filter(
              (benef) => benef?._id === item?.beneficiary,
            )?.[0] || item?.beneficiaryDetails;

          return [
            new Date(item?.createdAt)?.toLocaleString(),
            item?.reference_id,
            renderPaymentType(item),
            renderRecipientName(item, internationalReceiver),
            item?.guest_details?.email || item?.sender?.email || "--",
            item?.guest_details?.phone || item?.sender?.phone || "--",
            service_name_formatter(item?.service_type),
            `${item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}${item?.total ? Number(item?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""} ${item?.currency?.code} `,
            item?.client_reference || "--",
            item?.status,
          ];
        }),
        startY: isTransection ? 60 : doc.lastAutoTable.finalY + 5,
        styles: tableStyles,
        headStyles: tableHeaderStyles,
      };

      if (doc?.autoTable) {
        doc?.autoTable(transactionsTable);
      }

      doc.save(
        `${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()} _transactions.pdf`,
      );
    };
    getTransactions(callback);
  };

  return (
    <Modal
      className="removeAllOverflowHidden"
      style={{ overflow: "visible", margin: "0 auto" }}
      isOpen={showModal}
    >
      <ModalHeader toggle={() => setShowModal(!showModal)}>
        {t("Download Statement")}
      </ModalHeader>
      <ModalBody style={{ overflow: "visible" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            position: "relative",
            marginBottom: ".5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "90%",
              overflowX: "auto",
              padding: "1rem",
              background: "rgb(240,240,240)",
              borderRadius: "7px",
              whiteSpace: "nowrap",
            }}
          >
            {dateString}
          </div>
          <img src={calendar} alt="i" onClick={handleDatePickerClick} />
          {showDatePicker && (
            <div
              ref={datePickerRef}
              style={{
                position: "absolute",
                top: "50px",
                right: "0px",
                zIndex: 9999999,
              }}
            >
              <DateRangePicker
                maxDate={new Date()}
                ranges={[dateRange]}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
        {downloadError && (
          <div
            style={{
              color: "red",
              fontSize: ".65rem",
              fontWeight: 500,
              margin: ".5rem 0",
            }}
          >
            {downloadError}
          </div>
        )}
        <Input
          type="select"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        >
          <option value="">{t("-Select-File-Type-")}</option>
          <option value="PDF">{t("PDF")}</option>
          <option value="CSV">{t("CSV")}</option>
        </Input>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={!fileType || !apiDates || downlaoding}
          onClick={() => {
            if (fileType === "PDF") {
              generatePDF();
            } else if (fileType === "CSV") {
              getTransactions(exportToExcel);
            }
          }}
          style={{
            border: "none",
            outline: "none",
            background:
              " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
            backgroundBlendMode: "overlay, normal",
            boxShadow:
              "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {downlaoding ? t("Downloading") + "..." : t("Download Now")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadStatement;
