import styles from "../cryptoWallet.module.scss";
import Badge from "./Badge";

/**
 * Selectable row used by the account / asset / network steps.
 * `disabled` renders the "already in your portfolio" read-only variant.
 */
const OptionRow = ({
  leading,
  title,
  badge,
  badgeAccent,
  description,
  price,
  priceNote,
  asideNote,
  selected = false,
  disabled = false,
  onSelect,
}) => {
  const classes = [
    styles.option,
    selected ? styles.optionSelected : "",
    disabled ? styles.optionDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role={disabled ? undefined : "radio"}
      aria-checked={disabled ? undefined : selected}
      tabIndex={disabled ? undefined : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {!disabled && (
        <span className={`${styles.radio} ${selected ? styles.radioOn : ""}`} />
      )}

      {leading}

      <div className={styles.optionMain}>
        <div className={styles.optionTitleRow}>
          <span className={styles.optionTitle}>{title}</span>
          {badge ? <Badge accent={badgeAccent}>{badge}</Badge> : null}
        </div>
        {description ? (
          <p className={styles.optionDesc}>{description}</p>
        ) : null}
      </div>

      <div className={styles.optionAside}>
        {price ? <div className={styles.optionPrice}>{price}</div> : null}
        {priceNote ? (
          <p className={styles.optionPriceNote}>{priceNote}</p>
        ) : null}
        {asideNote ? (
          <span className={styles.optionOwned}>{asideNote}</span>
        ) : null}
      </div>
    </div>
  );
};

export default OptionRow;
