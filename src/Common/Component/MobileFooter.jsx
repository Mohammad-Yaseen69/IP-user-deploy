import React from "react";
import { ChevronLeft } from "react-feather";
import styles from "./styles.module.css";

const MobileFooter = ({
  label,
  disabled,
  handleAction,
  handleBack,
}) => {
  return (
    <div
      className={styles.mobileFooter}
    >
      <button type="button" className={styles.backBtn} onClick={handleBack}>
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        className={styles.nextBtn}
        disabled={disabled}
        onClick={handleAction}
      >
        {label}
      </button>
    </div>
  );
};

export default MobileFooter;
