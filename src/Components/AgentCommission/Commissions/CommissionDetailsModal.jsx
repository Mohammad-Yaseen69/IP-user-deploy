import { X } from "react-feather";
import { Modal, ModalBody } from "reactstrap";
import styles from "../styles/commissionDetails.module.css";

const asObject = (value) => (value && typeof value === "object" ? value : {});

const displayValue = (value) => (value == null || value === "" ? "-" : String(value));

const getCurrency = (currency) => {
  if (typeof currency === "string") return currency;

  return currency?.code || currency?.symbol || "";
};

const formatAmount = (value, currency) => {
  if (value == null || value === "") return "-";

  const amount = Number(value);

  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(value);

  const code = getCurrency(currency);

  return code ? `${formatted} ${code}` : formatted;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const DetailSection = ({ title, items }) => (
  <section className={styles.section}>
    <h3 className={styles.sectionTitle}>{title}</h3>

    <div className={styles.detailGrid}>
      {items.map(([label, value]) => (
        <div className={styles.detailItem} key={label}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{displayValue(value)}</span>
        </div>
      ))}
    </div>
  </section>
);

const CommissionDetailsModal = ({ isOpen, commission, onClose, t }) => {
  const client = asObject(commission?.user);

  const clientName = client.company_name || client.name || client.username || client.email || "-";

  const companyName = client.company_name || "-";
  const username = client.username || "-";
  const email = client.email || "-";
  const userId = client._id || client.id || "-";

  const transaction = asObject(commission?.transaction);

  const ibanTransaction = asObject(commission?.iban_transaction);

  const transactionCurrency =
    transaction.currency || ibanTransaction.currency || commission?.currency;

  const transactionAmount = transaction.amount ?? ibanTransaction.amount;

  const transactionFee = transaction.fee ?? ibanTransaction.fee;

  const transactionTotal =
    transaction.total_amount ??
    transaction.total ??
    ibanTransaction.total_amount ??
    ibanTransaction.total ??
    (transactionAmount != null && transactionFee != null
      ? Number(transactionAmount) + Number(transactionFee)
      : null);

  const transactionReference =
    transaction.reference_id ||
    transaction.external_reference ||
    ibanTransaction.reference_id ||
    ibanTransaction.external_reference ||
    transaction._id ||
    ibanTransaction._id ||
    (typeof commission?.iban_transaction === "string" ? commission.iban_transaction : "");

  const transactionDate =
    transaction.createdAt || ibanTransaction.createdAt || commission?.createdAt;

  const transactionStatus = transaction.status || ibanTransaction.status;

  const serviceType =
    transaction.service_type ||
    transaction.type ||
    ibanTransaction.service_type ||
    ibanTransaction.type ||
    commission?.service_type;

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      centered
      className={styles.dialog}
      labelledBy="commission-details-title"
    >
      <ModalBody className={styles.modalBody}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>{t("Commission statement")}</span>

            <h2 id="commission-details-title">{t("Transaction details")}</h2>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t("Close")}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.sections}>
          <DetailSection
            title={t("Transaction information")}
            items={[
              // [
              //   t("Reference ID"),
              //   transactionReference,
              // ],
              [t("Transaction amount"), formatAmount(transactionAmount, transactionCurrency)],
              [t("Transaction fee"), formatAmount(transactionFee, transactionCurrency)],
              [t("Total amount"), formatAmount(transactionTotal, transactionCurrency)],
              [t("Transaction date"), formatDate(transactionDate)],
              [t("Transaction status"), transactionStatus],
              [t("Service type"), serviceType],
            ]}
          />
          <DetailSection
            title={t("Client information")}
            items={[
              [t("Name"), clientName],
              [t("Company"), companyName],
              [t("Username"), username],
              [t("Email"), email],
              [t("User ID"), userId],
            ]}
          />

          <DetailSection
            title={t("Commission information")}
            items={[
              [t("Commission amount"), formatAmount(commission?.commission, commission?.currency)],
              [t("Commission type"), commission?.commission_type],
              [t("Commission status"), commission?.status],
            ]}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CommissionDetailsModal;
