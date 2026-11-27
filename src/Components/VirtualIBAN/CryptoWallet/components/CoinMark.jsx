import styles from "../cryptoWallet.module.scss";

/** Circular coin badge. Placeholder for real coin artwork. */
const CoinMark = ({ symbol, color = "#8a90a2", size = "lg" }) => (
  <div
    className={`${styles.coin} ${size === "sm" ? styles.coinSm : styles.coinLg}`}
    style={{ background: color }}
    aria-hidden="true"
  >
    {symbol}
  </div>
);

export default CoinMark;
