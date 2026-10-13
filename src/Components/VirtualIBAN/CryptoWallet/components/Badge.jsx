import styles from "../cryptoWallet.module.scss";

const Badge = ({ children, accent = false }) => (
  <span className={`${styles.badge} ${accent ? styles.badgeAccent : ""}`}>
    {children}
  </span>
);

export default Badge;
