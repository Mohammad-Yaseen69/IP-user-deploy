import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Copy } from "react-feather";
import convertStyles from "../../VirtualIBAN/ConvertFundsModal/convertFunds.module.scss";
import styles from "./sendCrypto.module.scss";
import { getProtocolLabel } from "./cryptoProtocols";
import { formatCurrency } from "../../../Helper/AmountFormat";

const formatMoney = (value, currency) => {
  const amount = Number(value ?? 0);
  return `${Number.isFinite(amount) ? formatCurrency(amount, true) : value} ${currency}`;
};

const DoneStep = ({
  payoutResult,
  cryptoCurrency,
  protocol,
  address,
  beneficiaryName,
  onSendAgain,
  onClose,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const referenceId = payoutResult?.reference_id || "";
  const status = payoutResult?.status || "PROCESSING";
  const recipientCurrency = payoutResult?.recipient?.currency || cryptoCurrency;
  const totalCurrency = payoutResult?.total?.currency || cryptoCurrency;

  const handleCopyReference = () => {
    if (!referenceId) return;
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    toast.success(t("Reference copied to clipboard"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className={convertStyles.doneCard} style={{ background: "#f8f9fc" }}>
        <div className={convertStyles.doneIcon}>
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
        <div className={convertStyles.doneText}>
          <h3>{t("Crypto payout submitted")}</h3>
          <p>
            {payoutResult?.under_review
              ? t(payoutResult.review_message)
              : t("We will update this transaction once the network confirms it.")}
          </p>
        </div>
      </div>

      <div className={convertStyles.reviewTable}>
        {referenceId && (
          <div className={convertStyles.reviewRow}>
            <div className={convertStyles.reviewRowLabel}>{t("Reference")}</div>
            <div
              className={`${convertStyles.reviewRowValue} ${styles.monoValue}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onClick={handleCopyReference}
            >
              {referenceId}
              <Copy size={13} color={copied ? "#067647" : "#6e7687"} />
            </div>
          </div>
        )}

        <div className={convertStyles.reviewRow}>
          <div className={convertStyles.reviewRowLabel}>{t("Status")}</div>
          <div className={convertStyles.reviewRowValue}>{status}</div>
        </div>

        <div className={convertStyles.reviewRow}>
          <div className={convertStyles.reviewRowLabel}>{t("You sent")}</div>
          <div className={convertStyles.reviewRowValue}>
            {formatMoney(payoutResult?.total?.value, totalCurrency)}
          </div>
        </div>

        {/* A compliance hold reply carries no recipient amount yet. */}
        {payoutResult?.recipient && (
          <div className={convertStyles.reviewRow} style={{ background: "#f2eeff" }}>
            <div
              className={convertStyles.reviewRowLabel}
              style={{ fontWeight: 600, color: "#5926f0" }}
            >
              {t("Recipient receives")}
            </div>
            <div
              className={convertStyles.reviewRowValue}
              style={{ fontWeight: 700, color: "#5926f0", fontSize: "16px" }}
            >
              {formatMoney(payoutResult?.recipient?.value, recipientCurrency)}
            </div>
          </div>
        )}

        <div className={convertStyles.reviewRow}>
          <div className={convertStyles.reviewRowLabel}>{t("Beneficiary")}</div>
          <div className={convertStyles.reviewRowValue}>{beneficiaryName}</div>
        </div>

        <div className={convertStyles.reviewRow}>
          <div className={convertStyles.reviewRowLabel}>{t("Network")}</div>
          <div className={convertStyles.reviewRowValue}>
            <span className={styles.networkStrong}>{getProtocolLabel(protocol)}</span>
          </div>
        </div>

        <div className={convertStyles.reviewRow}>
          <div className={convertStyles.reviewRowLabel}>{t("Destination address")}</div>
          <div className={`${convertStyles.reviewRowValue} ${styles.monoValue}`}>{address}</div>
        </div>

        {payoutResult?.new_balance !== undefined && (
          <div className={convertStyles.reviewRow}>
            <div className={convertStyles.reviewRowLabel}>{t("New wallet balance")}</div>
            <div className={convertStyles.reviewRowValue}>
              {formatMoney(payoutResult?.new_balance, cryptoCurrency)}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="button" className={convertStyles.backBtn} onClick={onSendAgain}>
          {t("Send again")}
        </button>
        <button type="button" className={convertStyles.nextBtn} onClick={onClose}>
          {t("Done")}
        </button>
      </div>
    </div>
  );
};

export default DoneStep;
