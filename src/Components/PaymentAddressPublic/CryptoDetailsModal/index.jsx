import { useState, useEffect } from "react";
import { Modal, ModalBody } from "reactstrap";
import styles from "./styles/index.module.scss";
import { useTranslation } from "react-i18next";
import usePlainFx from "../../../hooks/Payments/usePlainFx";
import { formatCurrency } from "../../../Helper/AmountFormat";

const CRYPTO_INFO = {
  currency: "USDT",
  network: "TRC20",
  walletAddress: "TVjV9jUEg3UNrLEJpxvvArMFwVCJVuBAXz",
};

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CryptoDetailsModal = ({
  isOpen,
  toggle,
  amount,
  currency,
  paymentReference,
}) => {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const { getExchangeRate, isPending: isFxLoading } = usePlainFx();

  useEffect(() => {
    if (isOpen && amount && currency) {
      const rawAmount = String(amount).replaceAll(",", "");
      if (currency === "USD" || currency === "USDT") {
        setConvertedAmount(rawAmount);
      } else {
        getExchangeRate(
          currency === "USDT" ? "USD" : currency,
          "USD",
          rawAmount,
        )
          .then((result) => setConvertedAmount(result))
          .catch(() => setConvertedAmount(null));
      }
    }
  }, [isOpen, amount, currency]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const displayAmount = convertedAmount
    ? `${formatCurrency(convertedAmount, true)} USDT`
    : null;

  return (
    <Modal
      centered
      isOpen={isOpen}
      toggle={toggle}
      style={{ maxWidth: "680px", margin: "0px auto" }}
    >
      <ModalBody style={{ padding: "20px" }}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h3>{t("Crypto Payment Details")}</h3>
            <p>{t("Send the exact amount to the wallet address below")}</p>
          </div>

          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <p className={styles.detailLabel}>{t("Amount (USDT)")}</p>
              <p className={styles.amountValue}>
                {isFxLoading ? t("Converting...") : displayAmount || "—"}
              </p>
            </div>
            {currency && currency !== "USD" && amount && (
              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>{t("Original Amount")}</p>
                <p className={styles.detailValue}>
                  {currency} {formatCurrency(amount, true)}
                </p>
              </div>
            )}

            {/* Currency */}
            <div className={styles.detailRow}>
              <p className={styles.detailLabel}>{t("Currency")}</p>
              <p className={styles.detailValue}>{CRYPTO_INFO.currency}</p>
            </div>

            {/* Network */}
            <div className={styles.detailRow}>
              <p className={styles.detailLabel}>{t("Network")}</p>
              <p className={styles.detailValue}>{CRYPTO_INFO.network}</p>
            </div>

            {/* Wallet Address */}
            <div className={styles.walletRow}>
              <p className={styles.detailLabel}>{t("Wallet Address")}</p>
              <div className={styles.walletAddress}>
                <span>{CRYPTO_INFO.walletAddress}</span>
                <button
                  className={`${styles.copyBtn} ${copiedField === "wallet" ? styles.copied : ""}`}
                  onClick={() =>
                    handleCopy(CRYPTO_INFO.walletAddress, "wallet")
                  }
                >
                  {copiedField === "wallet" ? (
                    <>
                      <CheckIcon /> {t("Copied")}
                    </>
                  ) : (
                    <>
                      <CopyIcon /> {t("Copy")}
                    </>
                  )}
                </button>
              </div>
            </div>
            {paymentReference && (
              <div className={styles.walletRow}>
                <p className={styles.detailLabel}>{t("Payment Reference")}</p>
                <div className={styles.walletAddress}>
                  <span>{paymentReference?.replace("keabank_", "")}</span>
                  <button
                    className={`${styles.copyBtn} ${copiedField === "reference" ? styles.copied : ""}`}
                    onClick={() => handleCopy(paymentReference, "reference")}
                  >
                    {copiedField === "reference" ? (
                      <>
                        <CheckIcon /> {t("Copied")}
                      </>
                    ) : (
                      <>
                        <CopyIcon /> {t("Copy")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.importantNote}>
            <WarningIcon />
            <p>
              {t(
                "After sending the Exact amount USDT plus network fee, please email the transaction hash (TXID) and the reference code above to",
              )}{" "}
              <a
                href="mailto:support@insta-pay.ch"
                style={{
                  color: "#5926F0",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {t("support@insta-pay.ch")}
              </a>{" "}
              {t("for verification.")}
            </p>
          </div>

          <button className={styles.closeBtn} onClick={toggle}>
            {t("Close")}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CryptoDetailsModal;
