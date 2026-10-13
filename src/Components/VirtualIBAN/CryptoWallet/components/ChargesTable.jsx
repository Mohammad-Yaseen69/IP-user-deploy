import styles from "../cryptoWallet.module.scss";

/**
 * rows: [{ label, value, strikethrough }]
 * total: { label, value, free }
 */
const ChargesTable = ({ heading, rows = [], total }) => (
  <div className={styles.charges}>
    {heading ? <div className={styles.chargesHeading}>{heading}</div> : null}

    {rows.map((row) => (
      <div className={styles.chargeRow} key={row.label}>
        <span>{row.label}</span>
        <span className={styles.chargeValue}>
          {row.strikethrough ? <span className={styles.strike}>{row.strikethrough}</span> : null}
          {row.value}
        </span>
      </div>
    ))}

    {total ? (
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{total.label}</span>
        <span className={`${styles.totalValue} ${total.free ? styles.totalFree : ""}`}>
          {total.value}
        </span>
      </div>
    ) : null}
  </div>
);

export default ChargesTable;
