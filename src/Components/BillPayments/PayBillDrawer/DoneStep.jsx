import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Check, Download, Mail, Printer, RefreshCw, Share2, X } from "react-feather";
import styles from "../billPayments.module.scss";
import { formatWalletAmount } from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import { useBillPaymentStatus } from "../hooks/useBillPaymentQueries";

const RECEIPT_ACTIONS = [
  { label: "Download", Icon: Download },
  { label: "Share", Icon: Share2 },
  { label: "Email", Icon: Mail },
  { label: "Print", Icon: Printer },
];

const FAILED_STATUSES = ["FAILED", "DECLINED", "CANCELLED", "REJECTED", "REVERSED"];

// The biller confirms asynchronously, so this starts as "submitted" and polls until it settles.
const DoneStep = ({ flow, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { receipt } = flow;
  const { data: payment } = useBillPaymentStatus(receipt?.reference_id);

  const status = payment?.status || receipt?.status;
  const isPaid = status === "COMPLETED";
  const isFailed = FAILED_STATUSES.includes(status);
  const statusLabel = isPaid
    ? t("Paid")
    : isFailed
      ? t("Not paid · refunded to your wallet")
      : t("Processing with the biller");

  return (
    <>
      <div className={styles.drawerBody}>
        <div className={styles.done}>
          <span className={styles.doneIcon}>
            {isFailed ? <X size={26} /> : <Check size={26} />}
          </span>
          <strong>
            {isPaid
              ? t("Payment complete")
              : isFailed
                ? t("Payment failed")
                : t("Payment submitted")}
          </strong>
          <div className={styles.bigAmount} style={{ fontSize: 32 }}>
            {formatWalletAmount(receipt?.total?.value)}
            <small>{receipt?.total?.currency}</small>
          </div>
          <div className={styles.muted}>
            {[flow.biller?.name, receipt?.product?.name, receipt?.account_number]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <span className={styles.soonTag}>{receipt?.reference_id}</span>
        </div>

        <div className={styles.actions}>
          {RECEIPT_ACTIONS.map(({ label, Icon }) => (
            <button type="button" key={label} className={styles.action} disabled>
              <span className={styles.iconBox}>
                <Icon size={16} />
              </span>
              {t(label)}
            </button>
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>{t("Status")}</span>
            <strong>{statusLabel}</strong>
          </div>
          {payment?.receipt?.operator_reference && (
            <div className={styles.summaryRow}>
              <span>{t("Biller reference")}</span>
              <strong>{payment.receipt.operator_reference}</strong>
            </div>
          )}
          {payment?.receipt?.pin?.code && (
            <div className={styles.summaryRow}>
              <span>{t("Token / PIN")}</span>
              <strong>{payment.receipt.pin.code}</strong>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>{t("Paid from")}</span>
            <strong>
              {flow.wallet?.currency?.code} {t("Wallet")}
            </strong>
          </div>
          <div className={styles.summaryRow}>
            <span>{t("Date")}</span>
            <strong>{new Date(receipt?.created_at || Date.now()).toLocaleString()}</strong>
          </div>
        </div>

        <div className={styles.walletHead} style={{ marginBottom: 0 }}>
          <span className={styles.iconBox}>
            <RefreshCw size={16} />
          </span>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>{t("Turn on autopay for this bill")}</div>
            <div className={styles.rowSub}>{t("Paid on its due date, with a reminder first")}</div>
          </div>
          <span className={styles.soonTag}>{t("Soon")}</span>
          <span className={styles.toggle} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.drawerFoot}>
        <button type="button" className={styles.ghostBtn} onClick={() => navigate("/transactions")}>
          {t("View transactions")}
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onClose}>
          {t("Back to Pay Bills")}
        </button>
      </div>
    </>
  );
};

export default DoneStep;
