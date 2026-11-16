import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ActionView.module.css";
import UnderProgress from "./UnderProgress";
import InquiryResponseModal from "./InquiryResponseModal";
import InquiryMessageModal from "./InquiryMessageModal";

const ActionNeededView = ({ bannerMessage, requests = [], refetch }) => {
  const { t } = useTranslation();
  const [uploadInquiry, setUploadInquiry] = useState(null);
  const [messageInquiry, setMessageInquiry] = useState(null);

  const actionNeededList = requests.filter(
    (req) => req.status === "REQUESTED" || req.status === "action_needed",
  );

  const formatDeadline = (item) => {
    if (!item?.deadline) return null;
    if (typeof item.deadline === "string") return item.deadline;
    if (item.deadline.isSet && item.deadline.date) {
      try {
        return new Date(item.deadline.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return String(item.deadline.date);
      }
    }
    return null;
  };

  return (
    <div className={styles.complianceContainer}>
      {bannerMessage && (
        <div className={styles.warningBanner}>
          <span className={styles.redDot}></span>
          <p className={styles.bannerText}>
            {t("We keep compliance clear and reassuring.")}{" "}
            <span className={styles.bannerHighlight}>
              {t("Responding promptly keeps payments flowing")}
            </span>{" "}
            {t("- failure to respond may restrict account activity.")}
          </p>
        </div>
      )}

      {actionNeededList.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>
            {t("Action needed")} - {actionNeededList.length} {t("requests")}
          </h3>
          <div className={styles.cardsGrid}>
            {actionNeededList.map((item) => {
              const deadlineStr = formatDeadline(item);
              const isQuestionOnly = item.inquiry_type === "QUESTION";

              return (
                <div key={item._id || item.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>{item.title}</h4>
                    <span className={styles.badgeActionNeeded}>{t("Action needed")}</span>
                  </div>
                  <p className={styles.cardDesc}>{item.description}</p>
                  {deadlineStr && (
                    <p className={styles.deadline}>
                      {t("Deadline")} <span className={styles.dateVal}>{deadlineStr}</span>
                    </p>
                  )}
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => setUploadInquiry(item)}
                    >
                      {isQuestionOnly ? t("Answer question") : t("Upload documents")}
                    </button>
                    {/* Messaging is an inquiry-only endpoint; KYC/KYB requests have no thread. */}
                    {item.source !== "kyc_kyb" && (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setMessageInquiry(item)}
                      >
                        {t("Message compliance")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <UnderProgress requests={requests} />

      {uploadInquiry && (
        <InquiryResponseModal
          isOpen={!!uploadInquiry}
          toggle={() => setUploadInquiry(null)}
          inquiry={uploadInquiry}
          onSuccess={() => {
            if (refetch) refetch();
          }}
        />
      )}

      {messageInquiry && (
        <InquiryMessageModal
          isOpen={!!messageInquiry}
          toggle={() => setMessageInquiry(null)}
          inquiry={messageInquiry}
          onSuccess={() => {
            if (refetch) refetch();
          }}
        />
      )}
    </div>
  );
};

export default ActionNeededView;
