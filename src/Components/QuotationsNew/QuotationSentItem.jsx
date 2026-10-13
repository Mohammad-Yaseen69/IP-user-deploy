import React, { useEffect, useMemo, useState } from "react";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import { useTranslation } from "react-i18next";
import { ChevronRight, ChevronDown } from "react-feather";
import { useLocation } from "react-router";

import accept from "./files/accept.svg";
import bargain from "./files/bargain.svg";
import decline from "./files/decline.svg";
import QuoteDetails from "./QuoteDetails";
import DeclineQuotation from "./DeclineQuotation";
import BargainQuotation from "./BargainQuotation";
import AcceptQuotation from "./AcceptQuotation";
import AcceptBargainedAmount from "./AcceptBaragainedAmount";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const QuotationSentItem = ({ item, activeItem, setActiveItem, index }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(item?.status);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const can = usePermission();
  const canAcceptQuotation = can("quotations.accept");

  const canBargainQuotation = can("quotations.bargain");

  const canDeclineQuotation = can("quotations.decline");
  useEffect(() => {
    setStatus(item?.status);
  }, [item]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const _id = queryParams.get("_id");
  const type = queryParams.get("type");

  useEffect(() => {
    if (_id === item?._id) {
      if (type === "bargain") {
        setShowReviseModal(true);
      } else {
        setShowDetails(true);
      }
    }
  }, [_id, type, item]);

  const badgeColor = useMemo(() => {
    switch (item?.status?.toLowerCase()) {
      case "initiated":
      case "sent":
        return "#FFA500";
      case "accepted":
        return "#28A745";
      case "declined":
        return "#DC3545";
      // case "cancelled":
      //     return "#C82333"
      // case "submitted":
      //     return "#FFA500"
      // case "available":
      //     return "#007BFF"
      // case "confirmed":
      //     return "#218838"
      // case "reversed":
      //     return "#FFC107"
      // case "declined":
      //     return "#C82333"
      default:
        return "#FFA500";
        break;
    }
  }, [item]);

  function capitalizeStatus(str) {
    return str.toLowerCase() === "bargain-accepted"
      ? "Bargain-Accepted"
      : str
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
  }

  return (
    <div>
      {showAcceptModal && (
        <AcceptBargainedAmount
          isOpen={showAcceptModal}
          item={item}
          toggle={() => setShowAcceptModal(false)}
          badgeColor={badgeColor}
          type="send"
        />
      )}

      {showReviseModal && (
        <BargainQuotation
          isOpen={showReviseModal}
          item={item}
          toggle={() => setShowReviseModal(false)}
          badgeColor={badgeColor}
          type="revise"
        />
      )}

      {showDeleteModal && (
        <DeclineQuotation
          isOpen={showDeleteModal}
          toggle={() => setShowDeleteModal(false)}
          item={item}
        />
      )}

      <div
        className={styles.body_item}
        onClick={() => {
          if (!activeItem || activeItem !== index + 1) {
            setActiveItem(index + 1);
          } else {
            setActiveItem(0);
          }
        }}
      >
        <div>{item?.reference_id}</div>
        <div>{new Date(item?.createdAt)?.toLocaleString()}</div>
        <div>
          {item?.reciever?.account_type === "individual"
            ? `${item?.reciever?.user?.first_name} ${item?.reciever?.user?.last_name}`?.slice(
                0,
                window.innerWidth < 1500 ? 16 : 20,
              ) + ".."
            : item?.reciever?.company?.company_name}
        </div>
        <div>
          {item?.amount_reciever_currency?.currency?.code}{" "}
          {item?.amount
            ? item?.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : ""}
        </div>
        <div>
          {item?.revised_amount
            ? `${item?.amount_reciever_currency?.currency?.code} ${item?.revised_amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : t("None")}
        </div>
        <div>
          <div
            style={{
              background: badgeColor,
              fontSize: "12px",
              color: "white",
              width: "100px",
              margin: "0 auto",
              padding: "5px",
              borderRadius: "30px",
              textAlign: "center",
            }}
          >
            {t(capitalizeStatus(item?.status))}
          </div>
        </div>
        {status?.toLowerCase() !== "accepted" && status?.toLowerCase() !== "declined" ? (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item?.bargain && item?.status === "bargain" && (
              <>
                {canAcceptQuotation && (
                  <img
                    style={{
                      cursor: "pointer",
                      height: "30px",
                      width: "30px",
                      objectFit: "contain",
                    }}
                    title="Accept quotation"
                    src={accept}
                    alt=""
                    onClick={(w) => {
                      w.stopPropagation();
                      setShowAcceptModal(true);
                    }}
                  />
                )}
                {canBargainQuotation && (
                  <img
                    style={{
                      cursor: "pointer",
                      height: "30px",
                      width: "30px",
                      objectFit: "contain",
                    }}
                    title="Bargain quotation"
                    src={bargain}
                    alt=""
                    onClick={(w) => {
                      w.stopPropagation();
                      setShowReviseModal(true);
                    }}
                  />
                )}
              </>
            )}
            {canDeclineQuotation && (
              <img
                style={{
                  cursor: "pointer",
                  height: "30px",
                  width: "30px",
                  objectFit: "contain",
                }}
                title="Decline quotation"
                src={decline}
                alt=""
                onClick={(w) => {
                  w.stopPropagation();
                  setShowDeleteModal(true);
                }}
              />
            )}
          </div>
        ) : (
          <div>{t("No Actions")}</div>
        )}
        <div style={{ maxWidth: "15px" }}>
          {activeItem === index + 1 ? <ChevronDown /> : <ChevronRight />}
        </div>
      </div>
      {activeItem === index + 1 && <QuoteDetails item={item} key={item?._id} type="send" />}
    </div>
  );
};

export default QuotationSentItem;
