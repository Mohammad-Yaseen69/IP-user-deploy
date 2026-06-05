import React from "react";
import { RefreshCw, Edit2, Copy, ArrowRight } from "react-feather";
import styles from "../styles/BalanceHeader.module.css";

const BalanceHeader = () => {
  return (
    <div className={styles.card}>
      
      <div className={styles.topBar}>
        <span className={styles.accountTag}>Primary Account - GB IBAN</span>

        <div className={styles.rightActions}>
         
          <button className={styles.iconBtn}>My vIBAN details <ArrowRight /></button>
        </div>
      </div>

      <div className={styles.balanceSection}>
        <h1 className={styles.balance}>EUR 53,180.07</h1>
        <span className={styles.growth}>+2.03%</span>
      </div>

      <div className={styles.infoBox}>
        
        <div className={styles.item}>
          <span className={styles.label}>IBAN</span>
          <span className={styles.value}>GB89 3704 0044 0532 0130 00</span>
          <Copy size={14} className={styles.copyIcon} />
        </div>

        <div className={styles.item}>
          <span className={styles.label}>BIC / SWIFT</span>
          <span className={styles.value}>IPT22A5</span>
          <Copy size={14} className={styles.copyIcon} />
        </div>

        <div className={styles.currency}>
          🇪🇺 <span>Euro - EUR</span>
        </div>

      </div>

    </div>
  );
};

export default BalanceHeader;