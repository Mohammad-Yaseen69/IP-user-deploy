import React from "react";
import { ChevronLeft } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.css"

const MobileHeader = ({ handleAction, handleBack, title}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.mobileHeader}>
      <div className={styles.headerContent}>
        <ChevronLeft size={22} onClick={handleBack} />
        <span>{t(title)}</span>
      </div>
      {handleAction && <button className={styles.cancelButton} onClick={handleAction}>
        {t("Cancel")}
      </button>}
    </div>
  );
};

export default MobileHeader;
