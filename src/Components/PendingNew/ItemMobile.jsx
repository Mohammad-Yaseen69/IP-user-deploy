import { ChevronDown, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import styles from "./Item.module.css";
import { Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import AcceptModal from "./AcceptModal";
import ReviewModal from "./ReviewModal";
import ImagePreviewModal from "../ImagePreviewModal.jsx";
import t_styles from "../TransactionsNewApi/Mobile/TransactionItemMobile.module.css";
import PendingItemDetails from "./PendingItemDetails.jsx";

export function capitalizeStatus(str) {
  return str.toLowerCase() === "bargain-accepted"
    ? "Bargain-Accepted"
    : str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

const ItemMobile = ({ item, activeItem, setActiveItem, index, type }) => {
  const { t } = useTranslation();
  const { verifyToken, authHeader } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const badgeColor = useMemo(() => {
    switch (item?.status?.toLowerCase()) {
      case "initiated":
        return "#ADD8E6";
      case "completed":
        return "#28A745";
      case "rejected":
        return "#DC3545";
      case "cancelled":
        return "#C82333";
      case "submitted":
        return "#FFA500";
      case "available":
        return "#007BFF";
      case "confirmed":
        return "#218838";
      case "reversed":
        return "#FFC107";
      case "declined":
        return "#C82333";
      default:
        return "#ADD8E6";
        return "#6C757D";
    }
  }, [item]);

  const rejectRequest = () => {
    setIsSaving(true);
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/decline-payment-request/${item.reference_id}`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        navigate("/payment-requests");
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
      })
      .finally(() => {
        verifyToken(true);
        setIsSaving(false);
      });
  };

  const [allRating, setAllRating] = useState(0);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    if (activeItem === index + 1) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-seller-reviews/${item?.sender?._id}/0/0`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          // console.log(decrypted)
          if (decrypted?.reviews?.length > 0) {
            const overAllRating = decrypted.reviews?.reduce((acc, rat) => (acc += rat.rating), 0);
            setAllRating(overAllRating / decrypted?.reviewsCount);
            // console.log(decrypted)
            setAllReviews(decrypted?.reviews);
          }
        })
        .catch((err) => {
          // console.log(err)
          // console.log(decryptData(err.response.data.data))
        });
    }
  }, [activeItem]);

  return (
    <div className={styles.item}>
      <div
        className={styles.top}
        onClick={() => {
          setActiveItem(activeItem === index + 1 ? 0 : index + 1);
        }}
      >
        <div className={styles.left}>
          {type === "receive" ? (
            <>
              {item?.sender?.profileImage?.url ? (
                <img
                  src={item?.sender?.profileImage?.url}
                  alt="dp"
                  className={styles.dp}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={styles.dp}>
                  {item?.sender?.user?.first_name?.[0] ||
                    item?.sender?.company?.company_name?.[0] ||
                    item?.sender?.company_name?.[0]}
                </div>
              )}
            </>
          ) : (
            <>
              {item?.receiver?.profileImage?.url ? (
                <img
                  src={item?.receiver?.profileImage?.url}
                  alt="dp"
                  className={styles.dp}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={styles.dp}>
                  {item?.receiver?.user?.first_name?.[0] ||
                    item?.receiver?.company?.company_name?.[0]}
                </div>
              )}
            </>
          )}
          <div className={styles.t_details}>
            <h5>
              {type === "receive"
                ? `${item?.sender?.user?.first_name || item?.sender?.company?.company_name || item?.sender?.company_name} ${item?.sender?.user?.last_name ?? ""}`
                : `${item?.receiver?.user?.first_name || item?.receiver?.company?.company_name || item?.receiver?.company_name} ${item?.receiver?.user?.last_name ?? ""}`}
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
                color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234",
                display: activeItem === index + 1 ? "none" : "inherit",
              }}
            >
              {item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}
              {item?.currency?.code}{" "}
              {item?.amount
                ? item?.amount?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : ""}
            </h5>
            <div
              style={{
                fontSize: "9px",
                color: badgeColor,
                padding: "3px 5px",
                borderRadius: "7px",
                textAlign: "center",
                fontWeight: 800,
              }}
            >
              {t(capitalizeStatus(item?.status))}
            </div>
          </div>
          {activeItem !== index + 1 ? <ChevronRight /> : <ChevronDown />}
        </div>
      </div>

      {activeItem === index + 1 &&
        (type === "send" ? (
          <div className={styles.tm_details}>
            <div className={styles.tmd_row}>
              <div className={styles.tmdr_item}>
                <span>{t("Amount")}</span>
                <h4>
                  {item?.currency?.code}{" "}
                  {item?.amount
                    ? item?.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </h4>
              </div>
              <div className={styles.tmdr_item}>
                <span>{t("Total")}:</span>
                <h4>
                  {item?.currency?.code}{" "}
                  {item?.total
                    ? item?.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : item?.amount
                      ? item?.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                </h4>
              </div>
            </div>
            <div className={styles.tmd_row}>
              <div className={styles.tmdr_item}>
                <span>{t("Fess")}:</span>
                <h4>
                  {item?.currency?.code}{" "}
                  {item?.fee
                    ? item?.fee.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </h4>
              </div>
              <div className={styles.tmdr_item}>
                <span>{t("Transaction ID")}:</span>
                <h4>{item?.reference_id ?? "None"}</h4>
              </div>
            </div>
            <div className={styles.tmd_row}>
              <div className={styles.tmdr_item}>
                <span>{t("Payment Type")}:</span>
                <h4>{service_name_formatter(item?.service_type)}</h4>
              </div>
              <div className={styles.tmdr_item}>
                <span>{t("Status")}:</span>
                <h4
                  style={{
                    color: badgeColor,
                  }}
                >
                  {service_name_formatter(item?.status)}
                </h4>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "1rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {item?.description && (
                <div className={t_styles.t_item}>
                  <span>{t("Note")}:</span>
                  <div>
                    <h5>{item?.description}</h5>
                  </div>
                </div>
              )}
              {item?.attachments?.length > 0 && (
                <div className={t_styles.t_item}>
                  <span>{t("Attachments")}:</span>
                  <div
                    style={{
                      display: "flex",
                      gap: ".75rem",
                      overflowX: "auto",
                    }}
                  >
                    {item?.attachments?.map((it) => (
                      <img
                        key={it?.key}
                        src={it?.url}
                        alt=""
                        style={{
                          height: "100px",
                          width: "100px",
                          objectFit: "cover",
                        }}
                        onClick={() =>
                          setCurrentImage({
                            src: it?.url,
                            index: it?.key,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              {currentImage && (
                <ImagePreviewModal
                  currentImage={currentImage}
                  isOpen={currentImage}
                  toggle={() => setCurrentImage("")}
                />
              )}
            </div>
            {/* {
                        type !== "send"
                        &&
                        <>
                            {
                                item?.status === "completed"
                                &&
                                <div className={styles.smr_right}>
                                    <span>How was your experience?</span>
                                    <Button onClick={() => setShowReviewModal(!showReviewModal)}>
                                        Leave a review
                                    </Button>
                                </div>
                            }
                            <ReviewModal isOpen={showReviewModal} toggle={() => setShowReviewModal(!showReviewModal)} item={item} type="Received" />
                        </>
                    } */}
            {/* <AcceptModal
                                isOpen={showAcceptModal}
                                toggle={() => setShowAcceptModal(!showAcceptModal)}
                                item={item}
                            /> */}
          </div>
        ) : (
          <PendingItemDetails
            item={item}
            key={item?._id}
            allRating={allRating}
            allReviews={allReviews}
            badgeColor={badgeColor}
            type={type}
          />
        ))}
      {type === "send" && (
        <div className={styles.smr_right}>
          <span>
            {item?.seller_comment ? t("You Left A Review") : t("How Was Your Experience?")}
          </span>
          <Button onClick={() => setShowReviewModal(!showReviewModal)}>
            {item?.seller_comment || item?.seller_reply ? t("Check Now") : t("Leave A Review")}
          </Button>
          <ReviewModal
            isOpen={showReviewModal}
            toggle={() => setShowReviewModal(!showReviewModal)}
            item={item}
            type="Send"
          />
        </div>
      )}
      {/* {
                type !== "send"
                &&
                item?.status === "pending"
                &&
                <div className={styles.tmd_row} style={{ alignItems: "flex-end", marginTop: "1.5rem" }}>
                    <div></div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <Button color="danger" style={{ padding: "3px 18px" }} disabled={isSaving} onClick={rejectRequest}>{t("Cancel")}</Button>
                        <Button color="success" style={{ padding: "3px 18px" }} disabled={isSaving} onClick={() => setShowAcceptModal(true)}>{t("Accept")}</Button>
                    </div>
                </div>
            } */}
      {/* {
                type !== "send"
                &&
                <>
                    {
                        item?.status === "completed"
                        &&
                        <>
                            {
                                item?.buyer_comment
                                    ?
                                    <div className={styles.smr_right}>
                                        <span>Check Review History: </span>
                                        <Button onClick={() => setShowReviewModal(!showReviewModal)}>
                                            Show Review
                                        </Button>
                                    </div>
                                    :
                                    <div className={styles.smr_right}>
                                        <span>
                                            {
                                                item?.buyer_comment
                                                    ?
                                                    "You left a review"
                                                    :
                                                    item?.seller_reply
                                                        ?
                                                        "Seller left a reply"
                                                        :
                                                        "How was your experience?"
                                            }
                                        </span>
                                        <Button onClick={() => setShowReviewModal(!showReviewModal)}>
                                            {
                                                item?.buyer_comment || item?.seller_reply
                                                    ?
                                                    "Check Now"
                                                    :
                                                    "Leave a review"
                                            }
                                        </Button>
                                    </div>
                            }
                        </>
                    }
                    <ReviewModal isOpen={showReviewModal} toggle={() => setShowReviewModal(!showReviewModal)} item={item} type="Received" />
                </>
            } */}

      {/* <AcceptModal
                isOpen={showAcceptModal}
                toggle={() => setShowAcceptModal(!showAcceptModal)}
                item={item}
            /> */}
    </div>
  );
};

export default ItemMobile;
