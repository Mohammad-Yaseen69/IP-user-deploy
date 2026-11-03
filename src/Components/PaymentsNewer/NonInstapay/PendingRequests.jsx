import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./styles/pendingRequests.module.scss";
import { useEffect, useMemo, useState } from "react";
import GeneralNoticeModal from "../GeneralNoticeModal";
import { Modal, ModalBody } from "reactstrap";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";

const ExpiresIn = ({ createdAt }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const expirationDate = new Date(createdAt);
      expirationDate.setDate(expirationDate.getDate() + 40);
      const now = new Date();
      const difference = expirationDate - now;

      if (difference <= 0) {
        setTimeLeft(t("Will expire soon"));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}days ${hours}hours`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}hours ${minutes}minutes`);
      } else {
        setTimeLeft(`${minutes}minutes`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [createdAt, t]);

  return <>{timeLeft}</>;
};

const PendingRequests = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: "/api/pre-wallet/get-requests",
        method: "GET",
      });
      return res;
    },
    cacheTime: 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { mutate: expireRequest, isPending } = useMutation({
    mutationFn: async (requestId) => {
      return await apiWrapper({
        endpoint: `/api/pre-wallet/expire-request/${requestId}`,
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingRequests"]);
      toast.success("Request expired successfully");
      setShowDetailsModal(false);
      setShowConfirmCancelModal(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to expire request");
      setShowConfirmCancelModal(false);
    },
  });

  const requests = useMemo(() => {
    return (requestsData?.response?.requests || []).filter(
      (req) => req.status === "pending" || req.status === "pending_limits",
    );
  }, [requestsData]);

  if (isLoading || requests.length === 0) return null;

  const badgeColor = (request) => {
    switch (request?.status?.toLowerCase()) {
      case "paid":
        return "#28A745";
      case "expired":
        return "#C82333";
      case "pending":
        return "rgb(213 162 10)";
      case "pending_limits":
        return "rgb(213 162 10)";
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h4>{t("PREVIOUS TRANSACTIONS")}</h4>
      </div>

      <div className={styles.transCont}>
        {requests.map((request) => {
          const createdAt = new Date(request.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div key={request._id} className={styles.trans}>
              <div className={styles.top}>
                <div>
                  <span className={styles.label}>{t("Phone")}</span>
                  <h4>{request.to.identifier}</h4>
                </div>
                <div
                  style={{ background: badgeColor(request), color: "white" }}
                  className={styles.statusBadge}
                >
                  {t("Unclaimed")}
                </div>
              </div>

              <div className={styles.bottom}>
                <div className={styles.leftSection}>
                  <h4>
                    {/* <span className={styles.details}>{t("Details")}</span> - */}
                    {createdAt}
                  </h4>
                  <h4 className={styles.amount}>
                    {request.originalReceivingFunds.currency}{" "}
                    {request.originalReceivingFunds.amount.toFixed(2)}
                  </h4>
                  <span className={styles.expiresIn}>
                    {t("Expires in")}: <ExpiresIn createdAt={request.createdAt} />
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDetailsModal(true);
                  }}
                  className={styles.expireBtn}
                >
                  {t("Details")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showDetailsModal && selectedRequest && (
        <Modal isOpen={showDetailsModal} toggle={() => setShowDetailsModal(false)} centered>
          <ModalBody>
            <div className={styles.modalHeader}>
              <h5>{t("Transaction Details")}</h5>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailRow}>
                <span>{t("Recipient")}</span>
                <span>{selectedRequest.to.identifier}</span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Sending Amount")}</span>
                <span>
                  {selectedRequest.transactionId.amount}{" "}
                  {selectedRequest.transactionId.currency.code}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Fee")}</span>
                <span>
                  {selectedRequest.transactionId.fee} {selectedRequest.transactionId.currency.code}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Total")}</span>
                <span>
                  {selectedRequest.transactionId.total}{" "}
                  {selectedRequest.transactionId.currency.code}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Payment Type")}</span>
                <span>{service_name_formatter(selectedRequest.transactionId.payment_type)}</span>
              </div>

              <div className={styles.detailRow}>
                <span>{t("Recipient Receives")}</span>
                <span>
                  {selectedRequest.originalReceivingFunds.amount.toFixed(2)}{" "}
                  {selectedRequest.originalReceivingFunds.currency}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Reference ID")}</span>
                <span>{selectedRequest.transactionId.reference_id}</span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Date")}</span>
                <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span>{t("Expires In")}</span>
                <span style={{ color: "#dc3545" }}>
                  <ExpiresIn createdAt={selectedRequest.createdAt} />
                </span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelPaymentBtn}
                onClick={() => setShowConfirmCancelModal(true)}
                disabled={isPending}
              >
                {isPending ? t("Cancelling...") : t("Cancel this payment")}
              </button>
              <button className={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>
                {t("Close")}
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
      {showConfirmCancelModal && (
        <GeneralNoticeModal
          isOpen={showConfirmCancelModal}
          toggle={() => setShowConfirmCancelModal(false)}
          message={t("Are you sure you want to cancel this payment?")}
          buttonText={t("Yes, Cancel")}
          onConfirm={() => {
            if (selectedRequest) {
              expireRequest(selectedRequest._id);
            }
          }}
        />
      )}
    </div>
  );
};

export default PendingRequests;
