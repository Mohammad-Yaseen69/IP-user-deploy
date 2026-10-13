import { ChevronDown, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import styles from "./MobileTransactionItem.module.css";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { UserContext } from "../../Context/UserContext";

const MobileTransactionItem = ({ item, activeItem, setActiveItem, index, cardNo }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  const badgeColor = () => {
    switch (item?.status?.toLowerCase()) {
      case "completed":
        return "#15bd43";
      case "pending":
        return "rgba(89, 38, 240, 0.55)";
      case "cancelled":
        return "#ed1d1d";
      default:
        return "#848484";
    }
  };

  console.log(item, "item");
  return (
    <div className={styles.item}>
      <div
        className={styles.top}
        onClick={() => setActiveItem(activeItem === index + 1 ? 0 : index + 1)}
      >
        <div className={styles.left}>
          <div className={styles.dp}>
            {item?.senderCard?.account?.first_name && item?.senderCard?.account?.last_name
              ? (item?.senderCard?.account?.first_name +
                  " " +
                  item?.senderCard?.account?.last_name)[0]
              : item?.receiverCard?.account?.first_name && item?.receiverCard?.account?.last_name
                ? (item?.receiverCard?.account?.first_name +
                    " " +
                    item?.receiverCard?.account?.last_name)[0]
                : item?.receiverWallet?.account?.first_name &&
                    item?.receiverWallet?.account?.last_name
                  ? (item?.receiverWallet?.account?.first_name +
                      " " +
                      item?.receiverWallet?.account?.last_name)[0]
                  : ((userDetails?.first_name ?? userDetails?.company_name) +
                      " " +
                      (userDetails?.last_name ?? ""))[0]}
          </div>
          <div className={styles.t_details}>
            <h5
              style={{
                width: activeItem === index + 1 ? "fit-content" : "30vw",
              }}
            >
              {item?.senderCard?.account?.first_name && item?.senderCard?.account?.last_name
                ? item?.senderCard?.account?.first_name + " " + item?.senderCard?.account?.last_name
                : item?.receiverCard?.account?.first_name && item?.receiverCard?.account?.last_name
                  ? item?.receiverCard?.account?.first_name +
                    " " +
                    item?.receiverCard?.account?.last_name
                  : item?.receiverWallet?.account?.first_name &&
                      item?.receiverWallet?.account?.last_name
                    ? item?.receiverWallet?.account?.first_name +
                      " " +
                      item?.receiverWallet?.account?.last_name
                    : (userDetails?.first_name ?? userDetails?.company_name) +
                        " " +
                        (userDetails?.last_name ?? "") || "Transaction"}
            </h5>
            <span>{new Date(item?.createdAt)?.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.right}>
          <div
            style={{
              display: activeItem === index + 1 ? "none" : "flex",
              alignItems: "flex-end",
              gap: ".5rem",
              flexDirection: "column",
            }}
          >
            <h5
              className={styles.amount}
              style={{
                color: item?.type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234",
                display: activeItem === index + 1 ? "none" : "inherit",
              }}
            >
              {item?.type?.toLowerCase() === "debit" ? "-" : "+"}
              {item?.currency || "$"}{" "}
              {(item?.amount || item?.billAmount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h5>
            <div
              style={{
                fontSize: "9px",
                color: badgeColor(),
                padding: "3px 5px",
                borderRadius: "7px",
                textAlign: "center",
                fontWeight: 800,
              }}
            >
              {t(item?.status || "Unknown")}
            </div>
          </div>
          {activeItem !== index + 1 ? <ChevronRight /> : <ChevronDown />}
        </div>
      </div>

      {activeItem === index + 1 && (
        <div className={styles.tm_details}>
          <div className={styles.tmdr_item}>
            <span>{t("Transaction ID")}</span>
            <h4>{item?.transactionId || "N/A"}</h4>
          </div>
          <div className={styles.tmdr_item}>
            <span>{t("Card No")}</span>
            <h4>{`•• ${cardNo?.slice(-4)}`}</h4>
          </div>
          <div className={styles.tmdr_item}>
            <span>{t("Type")}</span>
            <h4>{(item?.type && item?.type[0]?.toUpperCase() + item?.type?.slice(1)) || "N/A"}</h4>
          </div>
          <div className={styles.tmdr_item}>
            <span>{t("Transaction Type")}</span>
            <h4>
              {t(service_name_formatter(item?.transaction_type)).replace("Mastercard", "") || "N/A"}
            </h4>
          </div>
          {item?.reason && (
            <div className={styles.tmdr_item}>
              <span>{t("Reason")}</span>
              <h4>{item?.reason || "N/A"}</h4>
            </div>
          )}
          <div className={styles.tmdr_item}>
            <span>{t("Total Amount")}</span>
            <h4>
              {item?.billCurrency ? item?.billCurrency : item?.currency || "$"}{" "}
              {(item?.billAmount ? item?.billAmount : item?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>

          <div className={styles.tmdr_item}>
            <span>{t("Fees")}</span>
            <h4>
              {item?.billCurrency ? item?.billCurrency : item?.currency || "$"}{" "}
              {(item?.fee ?? 0)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>

          <div className={styles.tmdr_item}>
            <span>{t("Transact Amount")}</span>
            <h4>
              {item?.currency || "$"}{" "}
              {item?.txAmount?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>

          <div className={styles.tmdr_item}>
            <span>{t("Status")}</span>
            <h4 style={{ color: badgeColor() }}>{t(item?.status || "Unknown")}</h4>
          </div>
          <div className={styles.tmdr_item}>
            <span>{t("Date & Time")}</span>
            <h4>{new Date(item?.createdAt)?.toLocaleString()}</h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTransactionItem;
