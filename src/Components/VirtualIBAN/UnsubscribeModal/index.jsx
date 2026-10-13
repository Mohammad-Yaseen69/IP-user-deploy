import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import styles from "./unsubscribeModal.module.scss";

const WarningTriangleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="17"
      x2="12.01"
      y2="17"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke="#fff"
      strokeWidth="2"
    />
    <path
      d="M8 11V7a4 4 0 018 0v4"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const REASONS = [
  "Lost device",
  "Security concern",
  "No longer needed",
  "Switching provider",
  "Other",
];

const UnsubscribeModal = ({
  isOpen,
  toggle,
  hasBalance = true,
  isBlocked = false,
  isProcessing = false,
  onWithdraw,
  onToggleStatus,
}) => {
  const { t } = useTranslation();

  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("Lost device");

  const resetState = () => {
    setConfirmed(false);
    setReason("Lost device");
  };

  const handleClose = () => {
    resetState();
    toggle?.();
  };

  const handleWithdraw = () => {
    handleClose();
    onWithdraw?.();
  };

  const handleToggleStatus = async () => {
    const shouldClose = await onToggleStatus?.({
      reason,
      action: isBlocked ? "UNBLOCK" : "BLOCK",
    });
    if (shouldClose !== false) {
      handleClose();
    }
  };

  const renderWithBalance = () => (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.redAsteriskBadge}>*</div>
        <h2 className={styles.title}>{t("Pause your virtual account?")}</h2>
      </div>

      <div className={`${styles.iconBox} ${styles.iconPurple}`}>
        <WarningTriangleIcon />
      </div>

      <h3 className={styles.subtitle}>
        {t("You can't pause this IBAN if it still has a balance.")}
      </h3>
      <p className={styles.description}>
        {t("You must withdraw your vIBAN balance before pausing it.")}
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleClose}
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          className={`${styles.primaryBtn} ${styles.btnPurple}`}
          onClick={handleWithdraw}
        >
          {t("Take me to Withdraw funds")}
        </button>
      </div>
    </div>
  );

  const renderToggleStatus = () => (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.redAsteriskBadge}>*</div>
        <h2 className={styles.title}>
          {isBlocked
            ? t("Subscribe to your virtual account again?")
            : t("Unsubscribe from your virtual account?")}
        </h2>
      </div>

      <div
        className={`${styles.iconBox} ${isBlocked ? styles.iconPurple : styles.iconRed}`}
      >
        <LockIcon />
      </div>

      <h3 className={styles.subtitle}>
        {isBlocked
          ? t("This will resume account activity")
          : t("This will pause all activity.")}
      </h3>
      <p className={styles.description}>
        {isBlocked
          ? t(
              "Your IBAN will be available again for deposits, move funds, and conversion.",
            )
          : t(
              "Your IBAN will reject incoming transfers and you won't be able to deposit, move, or convert funds.",
            )}
      </p>

      <div className={styles.consequenceTable}>
        <div className={styles.consequenceRow}>
          <span className={styles.consequenceLabel}>
            {t("Incoming SEPA transfers")}
          </span>
          <span
            className={
              isBlocked
                ? styles.consequenceValuePositive
                : styles.consequenceValue
            }
          >
            {isBlocked
              ? t("Will be accepted again")
              : t("Will be rejected and returned")}
          </span>
        </div>
        <div className={styles.consequenceRow}>
          <span className={styles.consequenceLabel}>
            {t("Deposit and move funds")}
          </span>
          <span
            className={
              isBlocked
                ? styles.consequenceValuePositive
                : styles.consequenceValue
            }
          >
            {isBlocked ? t("Enabled") : t("Disabled")}
          </span>
        </div>
      </div>

      {/* {!isBlocked && (
k                    <label className={styles.reasonLabel}>
                        {t("Reason")} <span className={styles.optional}>({t("optional")})</span>
                    </label>
                    <select
                        className={styles.reasonSelect}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    >
                        {REASONS.map((r) => (
                            <option key={r} value={r}>
                                {t(r)}
                            </option>
                        ))}
                    </select>
                </div>
            )} */}

      <div className={styles.checkboxRow}>
        <input
          type="radio"
          className={styles.radioInput}
          checked={confirmed}
          onClick={() => setConfirmed(!confirmed)}
          id="unsub-confirm"
          readOnly
        />
        <label htmlFor="unsub-confirm" className={styles.checkboxLabel}>
          {isBlocked
            ? t("I understand my account activity will be re-enabled.")
            : t(
                "I understand my account will be frozen until I reactivate it.",
              )}
        </label>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleClose}
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          className={`${styles.primaryBtn} ${isBlocked ? styles.btnPurple : styles.btnRed}`}
          onClick={handleToggleStatus}
          disabled={!confirmed || isProcessing}
          style={
            !confirmed || isProcessing
              ? { opacity: 0.5, cursor: "not-allowed" }
              : {}
          }
        >
          {isProcessing
            ? t("Processing...")
            : isBlocked
              ? t("Subscribe")
              : t("Unsubscribe")}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      style={{ maxWidth: "480px" }}
    >
      <ModalBody
        style={{ padding: 0, background: "transparent", border: "none" }}
      >
        {renderToggleStatus()}
      </ModalBody>
    </Modal>
  );
};

export default UnsubscribeModal;
