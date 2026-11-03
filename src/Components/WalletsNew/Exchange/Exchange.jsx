import { useEffect, useState } from "react";
import { ICONS } from "../files/icons";
import styles from "./Exchange.module.css";
import { useExchange } from "./useExchange";

const FEE_RATE = 0.01;

const FLAG_COLORS = ["#5926f0", "#e64067", "#1f2029", "#0ea5e9", "#16a34a", "#f59e0b"];

const formatAmount = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

const Exchange = ({ onExchange }) => {
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1000");

  const { balances, currencies, rate, loading } = useExchange(from, to);
  const codes = currencies.map((c) => c.code).filter(Boolean);

  useEffect(() => {
    if (codes.length >= 2 && !codes.includes(from)) {
      setFrom(codes[0]);
      setTo(codes[1]);
    }
  }, [codes.join(",")]);

  const numericAmount = Number(amount) || 0;
  const safeRate = rate ?? 0;
  const receive = numericAmount * safeRate;
  const fee = numericAmount * FEE_RATE;
  const insufficient = numericAmount + fee > (balances[from] ?? 0);
  const disabled = numericAmount <= 0 || insufficient || from === to || loading || !rate;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleExchange = () => {
    if (disabled) return;
    onExchange?.({ from, to, amount: numericAmount, receive, fee });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Exchange</h3>
        <p className={styles.subtitle}>Between currencies in this wallet</p>
      </div>

      <div className={styles.box}>
        <div className={styles.boxTop}>
          <span className={styles.label}>You send</span>
          <span className={styles.balance}>
            Balance {formatAmount(balances[from])} {from}
          </span>
        </div>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <CurrencySelect value={from} options={codes} onChange={setFrom} />
        </div>
      </div>

      <div className={styles.swapWrap}>
        <button
          type="button"
          className={styles.swapBtn}
          onClick={swap}
          aria-label="swap currencies"
        >
          ⇅
        </button>
      </div>

      <div className={styles.box}>
        <div className={styles.boxTop}>
          <span className={styles.label}>You get</span>
          <span className={styles.balance}>
            Balance {formatAmount(balances[to])} {to}
          </span>
        </div>
        <div className={styles.row}>
          <div className={`${styles.input} ${styles.muted}`}>{formatAmount(receive)}</div>
          <CurrencySelect value={to} options={codes} onChange={setTo} />
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span>Rate</span>
          <span>{loading ? "Loading..." : `1 ${from} = ${safeRate.toFixed(4)} ${to}`}</span>
        </div>
        <div className={styles.detailRow}>
          <span>Fee</span>
          <span>
            {formatAmount(fee)} {from}
          </span>
        </div>
        {insufficient && <p className={styles.error}>Insufficient {from} balance</p>}
      </div>

      <button type="button" className={styles.submit} disabled={disabled} onClick={handleExchange}>
        <span className={styles.icon}>{ICONS.convert}</span>
        Exchange {from} to {to}
      </button>
    </div>
  );
};

const CurrencySelect = ({ value, options, onChange }) => {
  return (
    <label className={styles.select}>
      <span className={styles.flag} style={{ background: getColor(value) }}>
        {getSymbol(value)}
      </span>
      <span className={styles.code}>{value}</span>
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
};

export default Exchange;
