import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import review from "./review.png";
import styles from "./ReviewModal.module.css";
import Rating from "react-rating";
import { useContext, useEffect, useState } from "react";
import { CheckCircle, MoreHorizontal } from "react-feather";
import { AiTwotoneLike } from "react-icons/ai";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import replyStyles from "../PendingNew/ReviewModal.module.css";
import { useTranslation } from "react-i18next";
import InstaPayLoader from "../Loader";

const ReviewModal = ({
  title = "Review History",
  isOpen,
  toggle,
  item,
  type,
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { authHeader } = useContext(UserContext);
  const [step, setStep] = useState(item?.buyer_comment ? 2 : 1);
  const [sellerMessage, setSellerMessage] = useState("");
  const [sellerRating, setSellerRating] = useState("");
  const [sellerStep, setSellerStep] = useState(item?.seller_comment ? 2 : 1);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sellerReply, setSellerReply] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replied, setReplied] = useState(false);

  // const seller ratings
  const [sellerOverallRating, setSellerOverallRating] = useState(0);
  const [sellerOverallRatingCount, setSellerOverallRatingCount] = useState(0);

  // review create msg
  const [reviewMessage, setReviewMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(
          `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-request-reviews/${item?._id}`,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          setSellerOverallRating(decrypted?.averageRating?.toFixed() ?? 0.0);
          setSellerOverallRatingCount(decrypted?.count ?? 0);
          // console.log(decrypted)
          if (decrypted?.reviews?.length > 0) {
            setMessage(decrypted?.reviews?.[0]?.comment);
            setRating(decrypted?.reviews?.[0]?.rating);
            setStep(2);
            if (decrypted?.reviews?.length > 1) {
              setSellerMessage(decrypted?.reviews?.[1]?.comment);
              setSellerRating(decrypted?.reviews?.[1]?.rating);
              setSellerStep(2);
              setReplied(decrypted?.reviews?.[0]?.reply ? true : false);
              if (decrypted?.reviews?.[0]?.reply) {
                setSellerReply(decrypted?.reviews?.[0]?.reply);
                setSellerStep(3);
                setStep(3);
              }
            }
          }
        })
        .catch((err) => {
          // console.log(decryptData(err.response.data.data))
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const createInitialReview = () => {
    setIsSaving(true);
    const data = {
      comment: message,
      rating,
      type: "instant",
      request_id: item._id,
    };
    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/add-buyer-to-seller-review`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        setIsSaving(false);
        setStep(2);
        setReviewMessage(true);

        setTimeout(() => setReviewMessage(false), 3000);
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
        setIsSaving(false);
      });
  };

  const createSellerReview = () => {
    setIsSaving(true);
    const data = {
      comment: sellerMessage,
      rating: sellerRating,
      type: "instant",
      request_id: item._id,
    };
    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/add-seller-to-buyer-review`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        setIsSaving(false);
        setSellerStep(2);
        setReviewMessage(true);

        setTimeout(() => setReviewMessage(false), 3000);
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
        setIsSaving(false);
      });
  };

  const createReplyToBuyerReview = () => {
    setIsSavingReply(true);
    const data = {
      buyer_comment_id: item?.buyer_comment,
      reply: sellerReply,
    };
    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/reply-to-buyer`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        setIsSavingReply(false);
        setSellerStep(3);
        setShowReplyForm(false);
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
        setIsSavingReply(false);
      });
  };

  // modal resize
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const calculateScaleFactor = () => {
      const screenWidth = window.innerWidth;
      const baseScreenWidth = 1920; // You can adjust this based on your design

      // Calculate the scaling factor
      const calculatedScaleFactor = screenWidth / baseScreenWidth;

      // Set the scale factor in state
      setScaleFactor(calculatedScaleFactor);
    };

    // Calculate the initial scale factor
    calculateScaleFactor();

    // Update the scale factor on window resize
    window.addEventListener("resize", calculateScaleFactor);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", calculateScaleFactor);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      style={{
        minWidth: window.innerWidth > 1150 ? "1150px" : "90vw",
        transform:
          window.innerWidth > 1000 ? `scale(${scaleFactor})` : "scale(1)",
      }}
    >
      <ModalHeader toggle={toggle}>{t(title)}</ModalHeader>
      <ModalBody
        style={{
          display: "flex",
          gap: "24px",
          padding: window.innerWidth > 1000 ? "24px" : "10px",
          overflow: "hidden",
        }}
      >
        <div className={styles.left_rm}>
          <img src={review} alt={t("Leave A Review")} />
        </div>
        {loading ? (
          <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
            <InstaPayLoader />
          </div>
        ) : (
          type === "Received" && (
            <div className={styles.right_rm}>
              <Card
                className={styles.rating_container}
                style={{ marginBottom: 0 }}
              >
                <CardBody className={styles.rating_body}>
                  <div className={styles.left}>
                    <p></p>
                    <h4>{sellerOverallRating}/5</h4>
                    <div>
                      <Rating
                        initialRating={4.5}
                        emptySymbol="fa fa-star-o fa-2x"
                        fullSymbol="fa fa-star fa-2x"
                        readonly
                      ></Rating>
                    </div>
                    <span>
                      {sellerOverallRatingCount} {t("ratings")}
                    </span>
                  </div>
                  <Card style={{ marginBottom: 0 }} className={styles.right}>
                    <CardBody className={styles.right_body}>
                      <div className={styles.rb_top}>
                        <span>
                          {step > 1
                            ? t("You Rated") + ":"
                            : t("Leave A Review") + ":"}{" "}
                        </span>
                        {reviewMessage && (
                          <Button
                            color="success"
                            style={{
                              display: "Flex",
                              alignItems: "center",
                              gap: ".4rem",
                            }}
                          >
                            <CheckCircle size={18} />
                            {t("Review Created")}
                          </Button>
                        )}
                        {step < 2 && (
                          <button
                            disabled={
                              rating == 0 || !message || isSaving || step > 1
                            }
                            onClick={createInitialReview}
                          >
                            {isSaving ? "Posting Review" : t("Save And Post")}
                          </button>
                        )}
                      </div>
                      <div className={styles.rb_rating}>
                        <Rating
                          initialRating={rating}
                          onChange={(e) => setRating(e)}
                          emptySymbol="fa fa-star-o fa-2x"
                          fullSymbol="fa fa-star fa-2x"
                          readonly={step > 1}
                        ></Rating>
                      </div>
                      <Input
                        type="textarea"
                        className="form-control"
                        placeholder={t("Write Review Message")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        readOnly={step > 1}
                      />
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>
              <div
                style={{
                  maxHeight: "330px",
                  overflowY: "auto",
                  marginTop: "1.5rem",
                }}
              >
                {item?.seller_comment && (
                  <div className={styles.reviews}>
                    <h5>{t("Seller Review:")}</h5>
                    <div className={styles.reviews_body}>
                      <div className={styles.review_card}>
                        <div className={styles.rc_top}>
                          <div className={styles.rct_left}>
                            <div className={styles.rctl_dp}>
                              {item?.sender?.user?.first_name?.[0] ||
                                item?.sender?.user?.company_name?.[0]}
                            </div>
                            <div className={styles.rctl_dets}>
                              <h5>
                                {item?.sender?.user?.first_name ||
                                  item?.sender?.user?.company_name}{" "}
                                {item?.sender?.user?.last_name || ""}
                              </h5>
                              <span>{item?.sender?.account_type}</span>
                            </div>
                          </div>
                          {/* <MoreHorizontal size={30} /> */}
                        </div>
                        <div className={styles.rc_rating}>
                          <Rating
                            initialRating={sellerRating}
                            emptySymbol="fa fa-star-o fa-2x"
                            fullSymbol="fa fa-star fa-2x"
                            readonly
                          ></Rating>
                        </div>
                        <p>{sellerMessage}</p>
                        <div className={styles.rc_bottom}>
                          {/* <div className={styles.rc_b_badge}>Publicly Reply</div> */}
                          {/* <div className={styles.rc_b_helpful} style={{ justifySelf: "flex-end" }}>
                                                    <span>Helpful</span>
                                                    <AiTwotoneLike size={21} color="black" />
                                                </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {sellerReply && (
                  <div className={styles.reviews}>
                    <h5>{t("Seller Reply:")}</h5>
                    <div className={styles.reviews_body}>
                      <div className={styles.review_card}>
                        <div className={styles.rc_top}>
                          <div className={styles.rct_left}>
                            <div className={styles.rctl_dp}>
                              {item?.sender?.user?.first_name?.[0] ||
                                item?.sender?.company?.company_name?.[0]}
                            </div>
                            <div className={styles.rctl_dets}>
                              <h5>
                                {item?.sender?.user?.first_name ||
                                  item?.sender?.company?.company_name}{" "}
                                {item?.sender?.user?.last_name || ""}
                              </h5>
                              <span>{item?.sender?.account_type}</span>
                            </div>
                          </div>
                          {/* <MoreHorizontal size={30} /> */}
                        </div>
                        <p>{sellerReply}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {type === "Send" && (
          <div className={styles.right_rm}>
            <Card
              className={styles.rating_container}
              style={{ marginBottom: 0 }}
            >
              <CardBody className={styles.rating_body}>
                <div className={styles.left}>
                  <p style={{ maxWidth: "15ch", textAlign: "center" }}>
                    {item?.receiver?.user?.first_name}{" "}
                    {t("has left the review.")}
                  </p>
                  <span style={{ maxWidth: "15ch", textAlign: "center" }}>
                    {t("Rate and Review them to reveal their review.")}
                  </span>
                </div>
                <Card style={{ marginBottom: 0 }} className={styles.right}>
                  <CardBody className={styles.right_body}>
                    <div className={styles.rb_top}>
                      <span>
                        {sellerStep > 1
                          ? t("You Rated") + ":"
                          : t("Leave A Review") + ":"}{" "}
                      </span>
                      {reviewMessage && (
                        <Button
                          color="success"
                          style={{
                            display: "Flex",
                            alignItems: "center",
                            gap: ".4rem",
                          }}
                        >
                          <CheckCircle size={18} />
                          {t("Review Created")}
                        </Button>
                      )}
                      {sellerStep < 2 && (
                        <button
                          disabled={
                            sellerRating == 0 ||
                            !sellerMessage ||
                            isSaving ||
                            sellerStep > 1
                          }
                          onClick={createSellerReview}
                        >
                          {isSaving ? "Posting Review" : t("Save And Post")}
                        </button>
                      )}
                    </div>
                    <div className={styles.rb_rating}>
                      <Rating
                        initialRating={sellerRating}
                        onChange={(e) => setSellerRating(e)}
                        emptySymbol="fa fa-star-o fa-2x"
                        fullSymbol="fa fa-star fa-2x"
                        readonly={sellerStep > 1}
                      ></Rating>
                    </div>
                    <Input
                      type="textarea"
                      className="form-control"
                      placeholder="write review message"
                      value={sellerMessage}
                      onChange={(e) => setSellerMessage(e.target.value)}
                      readOnly={sellerStep > 1}
                    />
                  </CardBody>
                </Card>
              </CardBody>
            </Card>
            {sellerStep > 1 && (
              <div className={styles.reviews}>
                {item?.buyer_comment && <h5>{t("Buyer Review:")}</h5>}
                <div className={styles.reviews_body}>
                  <div className={styles.review_card}>
                    <div className={styles.rc_top}>
                      <div className={styles.rct_left}>
                        <div className={styles.rctl_dp}>
                          {item?.receiver?.user?.first_name?.[0] ||
                            item?.receiver?.company?.company_name?.[0]}
                        </div>
                        <div className={styles.rctl_dets}>
                          <h5>
                            {item?.receiver?.user?.first_name ||
                              item?.receiver?.company?.company_name}{" "}
                            {item?.receiver?.user?.last_name || ""}
                          </h5>
                          <span>{item?.receiver?.account_type}</span>
                        </div>
                      </div>
                      {/* <MoreHorizontal size={30} /> */}
                    </div>
                    <div className={styles.rc_rating}>
                      <Rating
                        initialRating={rating}
                        emptySymbol="fa fa-star-o fa-2x"
                        fullSymbol="fa fa-star fa-2x"
                        readonly
                      ></Rating>
                    </div>
                    <p>{message}</p>
                    {showReplyForm ? (
                      <div className={styles.rc_reply_form}>
                        <Input
                          type="textarea"
                          className="form-control"
                          placeholder="Write a reply to buyer's review"
                          value={sellerReply}
                          onChange={(e) => setSellerReply(e.target.value)}
                          readOnly={sellerStep > 2}
                        />
                        <div>
                          <Button onClick={() => setShowReplyForm(false)}>
                            {t("Cancel")}
                          </Button>
                          <Button
                            onClick={createReplyToBuyerReview}
                            disabled={!sellerReply || isSavingReply}
                          >
                            {isSavingReply ? "Posting Reply" : "Post Reply"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.rc_bottom}>
                        <div
                          className={styles.rc_b_badge}
                          onClick={() => {
                            if (sellerStep < 3) {
                              setShowReplyForm(true);
                            }
                          }}
                          style={{ opacity: sellerStep < 3 ? 1 : 0.7 }}
                        >
                          {t("Publicly Reply")}
                        </div>
                        {/* <div className={styles.rc_b_helpful}>
                                                        <span>Helpful</span>
                                                        <AiTwotoneLike size={21} color="black" />
                                                    </div> */}
                      </div>
                    )}
                    {sellerStep === 3 && (
                      <div className={replyStyles.reply_review_card}>
                        <div className={replyStyles.rc_top}>
                          <div className={replyStyles.rct_left}>
                            <div className={replyStyles.rctl_top}>
                              <span>{t("Replied to")} </span>
                              <div>
                                {item?.receiver?.user?.first_name ||
                                  item?.receiver?.user?.company_name}
                              </div>
                            </div>
                            <div className={replyStyles.rctl_bottom}>
                              <div className={replyStyles.rctl_dp}>
                                {item?.sender?.user?.first_name?.[0] ||
                                  item?.sender?.user?.company_name?.[0]}
                              </div>
                              <div className={replyStyles.rctl_dets}>
                                <div className={replyStyles.seller_res_badge}>
                                  {t("Seller Response")}
                                </div>
                                <h5>
                                  {item?.sender?.user?.first_name ||
                                    item?.sender?.user?.company_name}{" "}
                                  {item?.sender?.user?.last_name || ""}
                                </h5>
                                <span>{item?.sender?.account_type}</span>
                              </div>
                            </div>
                          </div>
                          {/* <MoreHorizontal size={30} /> */}
                        </div>
                        <p>{sellerReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ReviewModal;
