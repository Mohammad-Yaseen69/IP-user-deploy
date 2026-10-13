import styles from "../cryptoWallet.module.scss";
import CoinMark from "./CoinMark";

/** Compact "what you picked so far" row with a Change action. */
const SelectionSummary = ({ symbol, color, title, subtitle, onChange, changeLabel = "Change" }) => (
  <div className={styles.summary}>
    <CoinMark symbol={symbol} color={color} size="sm" />
    <div className={styles.summaryMain}>
      <div className={styles.summaryTitle}>{title}</div>
      {subtitle ? <p className={styles.summarySub}>{subtitle}</p> : null}
    </div>
    {onChange ? (
      <button type="button" className={styles.linkBtn} onClick={onChange}>
        {changeLabel}
      </button>
    ) : null}
  </div>
);

export default SelectionSummary;
