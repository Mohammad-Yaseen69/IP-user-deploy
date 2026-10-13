import { useTranslation } from "react-i18next";
import { getExchangeRate } from "../../../stateMachines/convertFunds";
import styles from "./convertFunds.module.scss";

const WALLET_COLORS = {
  EUR: "#5926F0",
  USD: "#E64067",
  GBP: "#2D9CDB",
  INR: "#F2994A",
};

const SwapArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M4 10L8 14L12 10"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2V14"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WalletStep = ({
  fromWallet,
  setFromWallet,
  toWallet,
  setToWallet,
  wallets,
}) => {
  const { t } = useTranslation();

  const handleSwap = () => {
    const temp = fromWallet;
    setFromWallet(toWallet);
    setToWallet(temp);
  };

  const rateInfo =
    fromWallet && toWallet && fromWallet !== toWallet
      ? getExchangeRate(fromWallet, toWallet)
      : null;

  return (
    <div>
      <div className={styles.sectionLabel}>{t("From")}</div>
      <div className={styles.walletGrid}>
        {wallets.map((w) => {
          const isSelected = fromWallet === w.code;
          const isDisabled = toWallet === w.code;
          return (
            <div
              key={`from-${w.code}`}
              className={`${styles.walletOption} ${isSelected ? styles.selected : ""} ${isDisabled ? styles.disabled : ""}`}
              onClick={() => !isDisabled && setFromWallet(w.code)}
            >
              <div className={styles.radioBtn} />
              <div className={styles.walletInfo}>
                <div
                  className={styles.walletColorDot}
                  style={{ background: WALLET_COLORS[w.code] || "#999" }}
                />
                <div className={styles.walletDetails}>
                  <h4>
                    {w.code} {t("Wallet")}
                  </h4>
                  <p>{w.walletId}</p>
                </div>
              </div>
              <div className={styles.walletBalance}>
                <h4>{w.balance}</h4>
                <p>{t("Available")}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.swapRow}>
        <button type="button" className={styles.swapBtn} onClick={handleSwap}>
          <SwapArrowIcon />
        </button>
      </div>

      <div className={styles.sectionLabel}>{t("To")}</div>
      <div className={styles.walletGrid}>
        {wallets.map((w) => {
          const isSelected = toWallet === w.code;
          const isDisabled = fromWallet === w.code;
          return (
            <div
              key={`to-${w.code}`}
              className={`${styles.walletOption} ${isSelected ? styles.selected : ""} ${isDisabled ? styles.disabled : ""}`}
              onClick={() => !isDisabled && setToWallet(w.code)}
            >
              <div className={styles.radioBtn} />
              <div className={styles.walletInfo}>
                <div
                  className={styles.walletColorDot}
                  style={{ background: WALLET_COLORS[w.code] || "#999" }}
                />
                <div className={styles.walletDetails}>
                  <h4>
                    {w.code} {t("Wallet")}
                  </h4>
                  <p>{w.walletId}</p>
                </div>
              </div>
              <div className={styles.walletBalance}>
                <h4>{w.balance}</h4>
                <p>{t("Available")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {rateInfo && (
        <div className={styles.rateBox}>
          <span className={styles.rateText}>
            1 {fromWallet} = {rateInfo.rate} {toWallet}
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletStep;
