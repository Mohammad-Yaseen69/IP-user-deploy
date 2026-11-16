import { useTranslation } from "react-i18next";
import styles from "./PID.module.css";
import Rating from "react-rating";
import arrow from "../TransactionsNewApi/./files/arrow.svg";
import file from "../TransactionsNewApi/./files/file.svg";
import location from "../TransactionsNewApi/./files/location.svg";
import ImageSwiperView from "../ImageSwiperView";
import { useState } from "react";
import PaymentsFlow from "./PaymentsFlow/index";
import { Button } from "reactstrap";
import ReviewModal from "./ReviewModal";

const PendingItemDetails = ({ item, allRating, allReviews, badgeColor, type = "received" }) => {
  const { t } = useTranslation();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImgPreview, setShowImgPreview] = useState(false);

  function capitalizeStatus(str) {
    return str.toLowerCase() === "bargain-accepted"
      ? "Bargain-Accepted"
      : str
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
  }
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.amount}>
          <div className={styles.top}>
            <span>{t("Total Amount")}</span>
            <div className={styles.badge} style={{ background: badgeColor }}>
              {t(capitalizeStatus(item?.status))}
            </div>
          </div>
          <h5>
            {Number(item?.amount)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {item?.currency?.code}
          </h5>
        </div>
        <div className={styles.over_all}>
          <div className={styles.oac_left}>
            <span>{t("Overall Ratings")}</span>
            <h4>{allRating}/5</h4>
          </div>
          <div className={styles.oac_right}>
            <Rating
              initialRating={allRating.toFixed(1)}
              emptySymbol="fa fa-star-o fa-2x"
              fullSymbol="fa fa-star fa-2x"
              readonly
              className={styles.rating}
            />
            <span className={styles.rating_count}>
              {allReviews.length} {t("ratings")}
            </span>
          </div>
        </div>

        <div className={styles.reviews}>
          {allReviews?.length > 0 ? (
            allReviews?.map((item) => (
              <div key={item?._id} className={styles.review_card}>
                <div className={styles.rc_top}>
                  <div className={styles.rct_left}>
                    <div className={styles.rctl_dp}>
                      {item?.buyer?.user?.first_name?.[0] || item?.buyer?.user?.company_name?.[0]}
                    </div>
                    <div className={styles.rctl_dets}>
                      <h5>
                        {item?.buyer?.user?.first_name ?? item?.buyer?.user?.company_name}{" "}
                        {item?.buyer?.user?.last_name}
                      </h5>
                      <span>{item?.buyer?.account_type}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.rc_rating}>
                  <Rating
                    initialRating={item.rating}
                    emptySymbol="fa fa-star-o fa-2x"
                    fullSymbol="fa fa-star fa-2x"
                    readonly
                  ></Rating>
                </div>
                <p>{item.comment}</p>
              </div>
            ))
          ) : (
            <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No Reviews")}</div>
          )}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.row}>
          <div className={styles.row_left}>
            <div className={styles.r_item}>
              <span>
                {item?.payment_type === "conversion" || item?.service_type === "withdrawal"
                  ? t("Wallet ID")
                  : t("Recipient")}
                :{" "}
              </span>
              <div className={styles.recipient}>
                {item?.sender?.profileImage?.url ? (
                  <img
                    src={item?.sender?.profileImage?.url}
                    alt={item?.sender?.user?.first_name || item?.sender?.user?.company_name}
                    className={styles.dp}
                    style={{ background: "none" }}
                  />
                ) : (
                  <div className={styles.dp}>
                    {type === "received"
                      ? `${item?.sender?.user?.first_name || item?.sender?.user?.company_name} ${item?.sender?.user?.last_name}`.slice(
                          0,
                          24,
                        )?.[0]
                      : `${item?.receiver?.user?.first_name || item?.receiver?.user?.company_name} ${item?.receiver?.user?.last_name}`.slice(
                          0,
                          24,
                        )?.[0]}
                  </div>
                )}
                <div className={styles.r_details}>
                  <h5>
                    {type === "received"
                      ? `${item?.sender?.user?.first_name || item?.sender?.user?.company_name} ${item?.sender?.user?.last_name}`.slice(
                          0,
                          24,
                        )
                      : `${item?.receiver?.user?.first_name || item?.receiver?.user?.company_name} ${item?.receiver?.user?.last_name}`.slice(
                          0,
                          24,
                        )}
                  </h5>
                  <p>
                    {t("INSTA-")}
                    {item?.currency?.code}{" "}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.r_item}>
              <span>{t("Note")}: </span>
              <p className={styles.p_type}>{item?.note}</p>
            </div>
            <div className={styles.files}>
              <span>{t("Attached Files")}</span>
              <div className={styles.files_count}>
                <img src={file} alt="" />
                <span>
                  {item?.attachments?.length} {t("File")}
                </span>
              </div>
              {item?.attachments && item?.attachments?.length > 0 ? (
                <>
                  <span className={styles.open_btn} onClick={() => setShowImgPreview(true)}>
                    {t("Open")}
                  </span>
                  {showImgPreview && (
                    <ImageSwiperView
                      isOpen={showImgPreview}
                      toggle={() => setShowImgPreview(false)}
                      images={item?.attachments}
                    />
                  )}
                </>
              ) : (
                ""
              )}
            </div>
          </div>
          {item?.display_name && item?.lat && item?.long ? (
            <div className={styles.row_right}>
              <div className={styles.map}>
                <div className={styles.top}>
                  <span>{t("Transaction Map")}:</span>
                  <img src={arrow} alt="" />
                </div>
                <div className={styles.address} style={{ alignItems: "center" }}>
                  <img src={location} alt="" />
                  <span>{item?.display_name}</span>
                </div>
                <iframe
                  src={`//maps.google.com/maps?q=${item?.lat},${item?.long}&z=15&output=embed`}
                  className={styles.map_img}
                  title="Google Map"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        {item?.status?.toLowerCase() !== "completed" &&
        item?.status?.toLowerCase() !== "cancelled" ? (
          <PaymentsFlow item={item} key={item?._id} />
        ) : (
          <div
            className={styles.r_item}
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span>
              {item?.buyer_comment
                ? t("You Left A Review")
                : item?.seller_reply
                  ? t("Seller Left A reply")
                  : t("How Was Your Experience?")}
              :{" "}
            </span>
            <Button onClick={() => setShowReviewModal(!showReviewModal)}>
              {item?.buyer_comment || item?.seller_reply ? t("Check Now") : t("Leave A Review")}
            </Button>
            <ReviewModal
              isOpen={showReviewModal}
              toggle={() => setShowReviewModal(!showReviewModal)}
              item={item}
              type="Received"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingItemDetails;
