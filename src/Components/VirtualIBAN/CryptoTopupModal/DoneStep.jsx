import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, Check } from "react-feather";
import styles from "../ConvertFundsModal/convertFunds.module.scss";

const DoneStep = ({ confirmData, selectedIban, onOpenCheckout }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const address = confirmData?.address || "";
  const checkoutUrl = confirmData?.checkout_url || "";
  const totalAmount = confirmData?.total?.value || 0;
  const recipientEUR = confirmData?.recipient?.value || 0;
  const refId = confirmData?.transaction_ref || confirmData?.transaction_id || "";

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success(t("Address copied to clipboard"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      onOpenCheckout?.(checkoutUrl);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className={styles.doneCard} style={{ background: "#f8f9fc" }}>
        <div className={styles.doneIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.doneText}>
          <h3>{t("Topup Request Created")}</h3>
          <p>{t("Complete your payment to credit your Virtual IBAN account.")}</p>
        </div>
      </div>

      <div className={styles.reviewTable}>
        {refId && (
          <div className={styles.reviewRow}>
            <div className={styles.reviewRowLabel}>{t("Transaction Reference")}</div>
            <div
              className={styles.reviewRowValue}
              style={{ fontSize: "12px", fontFamily: "monospace" }}
            >
              {refId}
            </div>
          </div>
        )}

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("Payable Amount")}</div>
          <div className={styles.reviewRowValue}>${totalAmount} USDT</div>
        </div>

        <div className={styles.reviewRow}>
          <div className={styles.reviewRowLabel}>{t("IBAN Receives")}</div>
          <div className={styles.reviewRowValue} style={{ color: "#10b981", fontWeight: 700 }}>
            €{recipientEUR} EUR
          </div>
        </div>

        {checkoutUrl && (
          <div className={styles.reviewRow} style={{ padding: "16px", background: "#f2eeff" }}>
            <div className={styles.reviewRowLabel} style={{ fontWeight: 600, color: "#5926f0" }}>
              {t("Payment Checkout")}
            </div>
            <button
              type="button"
              onClick={handleOpenCheckout}
              style={{
                background: "#5926f0",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {t("Open Checkout Page")}
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>

      {address && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7e7e7",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#6e7687" }}>
            {t("USDT Deposit Address")}
          </span>

          <div
            style={{
              padding: "8px",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <QRCodeSVG value={address} size={140} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f8f9fc",
              border: "1px solid #e1e5ee",
              borderRadius: "8px",
              padding: "8px 12px",
              width: "100%",
              maxWidth: "100%",
              wordBreak: "break-all",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                color: "#0c0a20",
                flex: 1,
              }}
            >
              {address}
            </span>
            <button
              type="button"
              onClick={handleCopyAddress}
              style={{
                background: "none",
                border: "none",
                color: copied ? "#10b981" : "#5926f0",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoneStep;
