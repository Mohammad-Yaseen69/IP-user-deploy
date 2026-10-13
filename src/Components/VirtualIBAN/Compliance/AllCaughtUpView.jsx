import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./compliance.module.css";

const AllCaughtUpView = ({ lastReviewed }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.caughtUpContainer}>
      <div className={styles.successIconBox}>
        <span className={styles.checkIcon}>✓</span>
      </div>
      <h2 className={styles.caughtUpTitle}>
        {t("compliance.allCaughtUpTitle", "You're all caught up")}
      </h2>
      <p className={styles.caughtUpSubtitle}>
        {t(
          "compliance.allCaughtUpSubtitle",
          "No open compliance requests right now. We'll reach out here if we need anything else from you.",
        )}
      </p>
      {lastReviewed && (
        <div className={styles.lastReviewedBadge}>
          {t("compliance.lastReviewed", "Last reviewed")} {lastReviewed}
        </div>
      )}
    </div>
  );
};

export default AllCaughtUpView;
