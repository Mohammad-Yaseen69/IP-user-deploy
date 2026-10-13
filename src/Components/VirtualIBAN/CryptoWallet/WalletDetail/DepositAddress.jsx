import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, Copy } from "react-feather";
import { QRCodeSVG } from "qrcode.react";
import styles from "../cryptoPage.module.scss";

/** QR + address + wrong-network warning for the selected network. */
const DepositAddress = ({ currencyCode, network }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!network?.address) return;
    navigator.clipboard.writeText(network.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.addressPanel}>
      {network?.address ? (
        <div className={styles.qrBox}>
          <QRCodeSVG value={network.address} size={120} />
        </div>
      ) : null}

      <div className={styles.addressMain}>
        <div className={styles.sectionLabel}>
          {currencyCode} {t("Deposit Address")} ({network?.network}
          {network?.protocol ? ` / ${network.protocol}` : ""})
        </div>

        <div className={styles.addressRow}>
          <span className={styles.addressText}>{network?.address || t("Address unavailable")}</span>
          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
            onClick={copy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? t("Copied") : t("Copy")}</span>
          </button>
        </div>

        <div className={`${styles.notice} ${styles.noticeWarning}`}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <strong>{t("Important")}: </strong>
            {t("Send only")} <strong>{currencyCode}</strong>{" "}
            {t("to this deposit address using the")}{" "}
            <strong>
              {network?.network}
              {network?.protocol ? ` (${network.protocol})` : ""}
            </strong>{" "}
            {t(
              "network. Sending any other currency or using the wrong network will result in irreversible loss of funds.",
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositAddress;
