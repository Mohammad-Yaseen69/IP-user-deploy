import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../ConvertFundsModal/convertFunds.module.scss";
import ibanToCrypto from "../IbanToCryptoModal/ibanToCrypto.module.scss";
import local from "./ibanCryptoPayout.module.scss";
import { getProtocolLabel } from "../../WalletsNew/SendCryptoModal/cryptoProtocols";

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.25" stroke="#5926F0" strokeWidth="1.5" />
    <path
      d="M8 4.5V8L10.5 9.5"
      stroke="#5926F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = ({ spin }) => (
  <svg
    className={spin ? styles.spinIcon : undefined}
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.0537 2 11.8724 3.03057 12.9554 4.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13 2V5H10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatMoney = (value, currency, maxDigits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return `${currency ?? ""} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: maxDigits })}`.trim();
};

const formatClock = (seconds) => {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
};

const boundaryAddress = (address) => {
  const value = String(address || "");
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}......${value.slice(-6)}`;
};

const ReviewStep = ({
  feeDetails,
  quoteExpiresAt,
  iban,
  beneficiaryName,
  address,
  protocol,
  asset,
  confirmedNetwork,
  setConfirmedNetwork,
  onRefreshQuote,
  isRefreshing,
}) => {
  const { t } = useTranslation();
  const remaining = () =>
    Math.round(((quoteExpiresAt || 0) - Date.now()) / 1000);
  const [secondsLeft, setSecondsLeft] = useState(remaining);

  useEffect(() => {
    if (!quoteExpiresAt) return undefined;
    setSecondsLeft(remaining());
    const timer = setInterval(() => setSecondsLeft(remaining()), 1000);
    return () => clearInterval(timer);
  }, [quoteExpiresAt]);

  const expired = !!quoteExpiresAt && secondsLeft <= 0;
  useEffect(() => {
    if (expired && !isRefreshing) onRefreshQuote?.();
  }, [expired]);

  const recipient = feeDetails?.recipient;
  const rate = feeDetails?.exchanged_rate;
  const ibanCurrency = feeDetails?.total?.currency || iban?.currency || "EUR";
  const networkLabel = getProtocolLabel(protocol);

  return (
    <div>
      <div className={styles.reviewLabel}>{t("Review & Confirm")}</div>

      <div className={styles.quoteTimerBox}>
        <div className={styles.timerContent}>
          <ClockIcon />
          <span className={styles.timerText}>
            {isRefreshing ? (
              t("Getting a new quote...")
            ) : (
              <>
                {t("Quote valid for")}{" "}
                <strong className={styles.timerSeconds}>
                  {formatClock(secondsLeft)}
                </strong>
              </>
            )}
          </span>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={onRefreshQuote}
          disabled={isRefreshing}
        >
          <RefreshIcon spin={isRefreshing} />
          {t("Refresh")}
        </button>
      </div>

      <div className={ibanToCrypto.receiveCard}>
        <span className={ibanToCrypto.receiveLabel}>
          {t("Recipient receives (estimate)")}
        </span>
        <span className={ibanToCrypto.receiveValue}>
          ≈ {formatMoney(recipient?.value, recipient?.currency || asset, 6)}
        </span>
        <span className={ibanToCrypto.receiveNote}>
          {t(
            "The rate locks when the payout executes, so the final on-chain amount may differ slightly.",
          )}
        </span>
      </div>

      <div className={styles.reviewTable}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("From")}</span>
          <span className={styles.reviewRowValue}>
            {ibanCurrency} {t("Virtual IBAN")}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>
            {t("Debited from your IBAN")}
          </span>
          <span className={styles.reviewRowValue}>
            {formatMoney(feeDetails?.total?.value, feeDetails?.total?.currency)}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Fee")}</span>
          <span className={styles.reviewRowValue}>
            {formatMoney(feeDetails?.fee?.value, feeDetails?.fee?.currency)}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Network fee")}</span>
          <span className={styles.reviewRowValue}>
            {formatMoney(
              feeDetails?.network_fee?.value,
              feeDetails?.network_fee?.currency,
            )}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Amount converted")}</span>
          <span className={styles.reviewRowValue}>
            {formatMoney(
              feeDetails?.sending?.value,
              feeDetails?.sending?.currency,
            )}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Exchange rate")}</span>
          <span className={styles.reviewRowValue}>
            1 {rate?.from || ibanCurrency} ≈{" "}
            {Number(rate?.value || 0).toLocaleString("en-US", {
              maximumFractionDigits: 6,
            })}{" "}
            {rate?.to || recipient?.currency || asset}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Beneficiary")}</span>
          <span className={styles.reviewRowValue}>{beneficiaryName}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>{t("Network")}</span>
          <span className={styles.reviewRowValue}>
            <strong>{networkLabel}</strong>
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewRowLabel}>
            {t("Destination address")}
          </span>
          <span className={`${styles.reviewRowValue} ${local.mono}`}>
            {boundaryAddress(address)}
          </span>
        </div>
      </div>

      <div className={local.dangerBox}>
        {t(
          "Crypto sends are irreversible. Funds sent to a wrong address or wrong network cannot be recovered.",
        )}
      </div>

      <label className={local.confirmRow}>
        <input
          type="checkbox"
          checked={confirmedNetwork}
          onChange={(event) => setConfirmedNetwork(event.target.checked)}
        />
        <span>
          {t("I confirm the recipient supports")}{" "}
          <strong>{recipient?.currency || asset}</strong> {t("on")}{" "}
          <strong>{networkLabel}</strong>
        </span>
      </label>
    </div>
  );
};

export default ReviewStep;
