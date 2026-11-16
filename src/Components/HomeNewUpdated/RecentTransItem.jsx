import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardText } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { renderAccountName } from "../../utils/Functions/transactionHelpers";
import styles from "./styles/Recents.module.css";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Zap,
  Bitcoin,
  FileText,
  Smartphone,
} from "lucide-react";

function formatTime(createdAt) {
  const date = new Date(createdAt);

  if (!isNaN(date)) {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } else {
    return "Invalid date";
  }
}

const getTxnIcon = (transaction) => {
  const key = (transaction?.service_type || transaction?.payment_type || "").toLowerCase();
  const isCredit = transaction?.transaction_type?.toLowerCase() === "credit";

  if (key.includes("topup") || key.includes("top_up") || key.includes("top-up")) return Plus;
  if (key.includes("bill")) return Zap;
  if (key.includes("crypto")) return Bitcoin;
  if (key.includes("quot")) return FileText;
  if (key.includes("mobile")) return Smartphone;

  return isCredit ? ArrowDownLeft : ArrowUpRight;
};

const RecentTransItem = ({ transaction, transactions, i, windowWidth }) => {
  const { beneficiaries } = useContext(UserContext);
  const { t } = useTranslation();
  // console.log("sender", transaction)

  const getIconTheme = (type) =>
    type?.toLowerCase() === "credit"
      ? { bg: "#F0ECFF", color: "#5926F0" }
      : { bg: "#F3F4F6", color: "#6B7280" };

  const isCredit = transaction?.transaction_type?.toLowerCase() === "credit";
  const Icon = getTxnIcon(transaction);
  const iconTheme = getIconTheme(transaction?.transaction_type);

  const getAmountColor = (type) => (type?.toLowerCase() === "credit" ? "#1CB234" : "#1D1535");

  const badgeColor = useMemo(() => {
    switch (transaction?.status?.toLowerCase()) {
      case "initiated":
        return "#ADD8E6";
      case "completed":
        return "#28A745";
      case "success":
        return "#28A745";
      case "rejected":
        return "#DC3545";
      case "cancelled":
        return "#C82333";
      case "submitted":
        return "#FFA500";
      case "pending":
        return "#FFA500";
      case "available":
        return "#007BFF";
      case "confirmed":
        return "#218838";
      case "reversed":
        return "#FFC107";
      case "declined":
      case "failed":
        return "#C82333";
      case "processing":
        return "#ADD8E6";
      case "refunded":
        return "#9f83f2";
      default:
        break;
    }
  }, [transaction]);
  const internationalReceiver = useMemo(() => {
    if (!transaction?.beneficiary) return null;
    return (
      beneficiaries.filter((benef) => benef?._id === transaction?.beneficiary)?.[0] ||
      transaction?.beneficiaryDetails
    );
  }, [transaction, beneficiaries]);
  return (
    <>
      {transactions?.[i - 1]?.headerText === transaction?.headerText ? (
        ""
      ) : (
        <CardText
          className="text-muted"
          style={{ marginTop: i !== 0 ? ".75rem" : 0, marginBottom: ".5rem" }}
        >
          {t(transaction?.headerText)}:
        </CardText>
      )}
      <div key={transaction?._id} className={styles.recent_item} style={{ scrollbarWidth: "none" }}>
        <div className="d-flex gap-2 align-items-center">
          <div className={styles.left} style={{ background: iconTheme.bg }}>
            <Icon size={14} color={iconTheme.color} />
          </div>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* <h4 className={styles.head} style={{ marginBottom: 0 }}>{transaction?.receiver?.user?.first_name} {transaction?.receiver?.user?.last_name}</h4> */}
            <h4 className={styles.head} style={{ marginBottom: 0 }}>
              {renderAccountName(transaction, internationalReceiver)?.slice(0, 20)}
            </h4>
            <p
              className="text-muted"
              style={{
                marginBottom: 0,
                color: "rgba(128,128,128,.7)",
                fontSize: ".5rem",
                display: "flex",
                gap: ".3rem",
                alignItems: "center",
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}
            >
              {/* {formatTime(transaction?.createdAt)} */}
              {new Date(transaction?.createdAt).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            className={`ml-auto ${styles.head}`}
            style={{
              fontWeight: "700",
              color: getAmountColor(transaction?.transaction_type),
              whiteSpace: "nowrap",
            }}
          >
            {transaction?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}
            {transaction?.total
              ? transaction?.total?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : ""}
            {transaction?.currency?.code}{" "}
          </div>
          <div
            style={{
              marginBottom: 0,
              color: "rgba(128,128,128,.7)",
              fontSize: ".6rem",
              display: "flex",
              gap: ".3rem",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: badgeColor,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: badgeColor,
                  display: "inline-block",
                }}
              />
              {t(transaction?.status?.toUpperCase())}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentTransItem;
