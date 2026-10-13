import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./styles/OtherBalances.module.css";
import { UserContext } from "../../Context/UserContext";

const OtherBalance = () => {
  const { t } = useTranslation();
  const {
    available,
    blocked,
    balanceLoading: loading,
  } = useContext(UserContext);

  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        <span>{t("Blocked balance")}</span>
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" color="primary" role="status">
              <span className="sr-only">{t("Loading...")}</span>
            </div>
          </div>
        ) : (
          <p>
            $
            {blocked?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>
      <div className={styles.sub}>
        <span>{t("Available balance")}</span>
        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" color="primary" role="status">
              <span className="sr-only">{t("Loading...")}</span>
            </div>
          </div>
        ) : (
          <p>
            $
            {(available - blocked)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default OtherBalance;
