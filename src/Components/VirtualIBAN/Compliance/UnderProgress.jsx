import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./compliance.module.css";

const UnderProgress = ({ requests = [] }) => {
  const { t } = useTranslation();
  const inProgressList = requests.filter(
    (req) => req.status === "UPLOADED" || req.status === "in_progress",
  );

  if (inProgressList.length === 0) return null;

  const formatDueDate = (item) => {
    if (!item?.deadline) return null;
    if (typeof item.deadline === "string") return item.deadline.replace("Due ", "");
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
    <div className={styles.section}>
      <h3 className={styles.sectionHeading}>
        {t("compliance.inProgressSection", "In review")} ({inProgressList.length})
      </h3>
      <div className={styles.cardsGrid}>
        {inProgressList.map((item) => {
          const dueDate = formatDueDate(item);
          return (
            <div key={item._id || item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>{item.title}</h4>
                <span className={styles.badgeInProgress}>
                  {t("compliance.inReviewBadge", "In review")}
                </span>
              </div>
              <p className={styles.cardDesc}>{item.description}</p>
              {dueDate && (
                <p className={styles.deadline}>
                  {t("compliance.dueLabel", "Due")}{" "}
                  <span className={styles.dateValYellow}>{dueDate}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnderProgress;
