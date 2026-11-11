import { ICONS } from "../files/icons";
import { ChevronDown } from "react-feather";
import styles from "./Exchange.module.css";

const FLAG_COLORS = ["#5926f0", "#e64067", "#1f2029", "#0ea5e9", "#16a34a", "#f59e0b"];

const getSymbol = (code) => {
  try {
    const part = new Intl.NumberFormat("en", { style: "currency", currency: code })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? code;
  } catch {
    return code;
  }
};

const getColor = (code = "") => {
  const hash = [...code].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FLAG_COLORS[hash % FLAG_COLORS.length];
};

const CurrencySelect = ({ value, options, onChange }) => (
  <label className={styles.select}>
    <span className={styles.flag} style={{ background: getColor(value) }}>
      {getSymbol(value)}
    </span>
    <span className={styles.code}>{value}</span>
    <ChevronDown size={16} className={styles.chevron} />
    <select
      className={styles.nativeSelect}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  </label>
);

const ExchangeCard = ({
  title = "Exchange",
  subtitle = "Between currencies in this wallet",
  fromCode,
  fromOptions,
  onFromChange,
  amountValue,
  onAmountChange,
  onAmountKeyUp,
  onAmountBlur,
  fromBalance,
  toCode,
  toOptions,
  onToChange,
  receiveValue,
  toBalance,
  rateText,
  feeText,
  errorText,
  onSwap,
  submitLabel,
  submitIcon = ICONS.convert,
  submitDisabled,
  onSubmit,
  children,
}) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>

    <div className={styles.box}>
      <div className={styles.boxTop}>
        <span className={styles.label}>You send</span>
        <span className={styles.balance}>Balance {fromBalance}</span>
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          inputMode="decimal"
          value={amountValue}
          onChange={(e) => onAmountChange(e.target.value)}
          onKeyUp={onAmountKeyUp}
          onBlur={onAmountBlur}
          placeholder="Enter Amount"
        />
        <CurrencySelect value={fromCode} options={fromOptions} onChange={onFromChange} />
      </div>
    </div>

    <div className={styles.swapWrap}>
      <button
        type="button"
        className={styles.swapBtn}
        onClick={onSwap}
        aria-label="swap currencies"
      >
        ⇅
      </button>
    </div>

    <div className={styles.box}>
      <div className={styles.boxTop}>
        <span className={styles.label}>You get</span>
        <span className={styles.balance}>Balance {toBalance}</span>
      </div>
      <div className={styles.row}>
        <div className={`${styles.input} ${styles.muted}`}>{receiveValue}</div>
        <CurrencySelect value={toCode} options={toOptions} onChange={onToChange} />
      </div>
    </div>

    <div className={styles.details}>
      <div className={styles.detailRow}>
        <span>Rate</span>
        <span>{rateText}</span>
      </div>
      <div className={styles.detailRow}>
        <span>Fee</span>
        <span>{feeText}</span>
      </div>
      {errorText && <p className={styles.error}>{errorText}</p>}
    </div>

    <button type="button" className={styles.submit} disabled={submitDisabled} onClick={onSubmit}>
      <span className={styles.icon}>{submitIcon}</span>
      {submitLabel}
    </button>

    {children}
  </div>
);

export default ExchangeCard;
