import React from "react";
import { Copy, ArrowUpRight } from "react-feather";
import styles from "../styles/BalanceHeader.module.css";

const BalanceHeader = () => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.card}>
      <div className={styles.topBar}>
        <div className={styles.leftInfo}>
          <span className={styles.accountTag}>Primary Account - GB IBAN</span>
          <span className={styles.activeBadge}>Active</span>
        </div>

        <div className={styles.rightActions}>
          <button className={styles.iconBtn}>
            <span>Virtual bank details</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className={styles.balanceSection}>
        <h1 className={styles.balance}>€0.00</h1>
        <span className={styles.growth}>+0.00%</span>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.item}>
          <span className={styles.label}>IBAN</span>
          <span className={styles.value}>GB89 3704 0044 0532 0130 00</span>
          <Copy
            size={16}
            className={styles.copyIcon}
            onClick={() => handleCopy("GB89 3704 0044 0532 0130 00")}
          />
        </div>

        <div className={styles.item}>
          <span className={styles.label}>BIC</span>
          <span className={styles.value}>IPT22A5</span>
          <Copy
            size={16}
            className={styles.copyIcon}
            onClick={() => handleCopy("IPT22A5")}
          />
        </div>

        <div className={styles.currency}>
          <span className={styles.flagIcon}>🇪🇺</span>
          <span className={styles.currencyText}>Euro - EUR</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceHeader;