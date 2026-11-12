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
      <h2 className={styles.caughtUpTitle}>{t("You're all caught up")}</h2>
      <p className={styles.caughtUpSubtitle}>
        {t(
          "No open compliance requests right now. We'll reach out here if we need anything else from you.",
        )}
      </p>
      {lastReviewed && (
        <div className={styles.lastReviewedBadge}>
          {t("Last reviewed")} {lastReviewed}
        </div>
      )}
    </div>
  );
};

export default AllCaughtUpView;
