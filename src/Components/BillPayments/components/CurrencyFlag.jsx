import { useState } from "react";
import styles from "../billPayments.module.scss";

// Currencies whose first two letters are not a country code.
const FLAG_OVERRIDES = { EUR: "eu", XAF: "cm", XOF: "sn", XCD: "ag", XPF: "pf", ANG: "cw" };

const CurrencyFlag = ({ code = "", size = 24 }) => {
  const [failed, setFailed] = useState(false);
  const country = FLAG_OVERRIDES[code] || code.slice(0, 2).toLowerCase();

  if (!code || failed) {
    return (
      <span className={styles.flagFallback} style={{ width: size, height: size }}>
        {code.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      className={styles.flag}
      src={`https://flagcdn.com/w80/${country}.png`}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

export default CurrencyFlag;
