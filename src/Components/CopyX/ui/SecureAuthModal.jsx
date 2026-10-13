import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useOtpFields } from "../../../hooks/useOtpFields";
import styles from "../styles/copyTrading.module.css";
import { Modal } from "./overlays";
import { Button, Notice } from "./primitives";

/*
 * Secure confirmation step. With the mock API any 6 digits pass; when the real API is on, the
 * onAuthorize callback receives the code and sends it with the request.
 */
const SecureAuthModal = ({
  open,
  onClose,
  title,
  rows = [],
  confirmLabel,
  danger,
  onAuthorize,
}) => {
  const { t } = useTranslation();
  const { values, refs, handleChange, handleKeyDown, focusFirst, reset, isComplete } =
    useOtpFields(6);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    reset();
    setError("");
    setSubmitting(false);
    setTimeout(() => focusFirst(), 50);
  }, [open]);

  const authorize = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onAuthorize(values.join(""));
    } catch (err) {
      setError(err?.message || t("Authorization failed. Nothing was submitted."));
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={title}
      subtitle={t("Enter the 6-digit code sent to your verified InstaPay channel.")}
      maxWidth={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            {t("Cancel")}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            icon={Lock}
            onClick={authorize}
            disabled={!isComplete}
            loading={submitting}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {rows.length > 0 && (
        <div className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.otpRow} role="group" aria-label={t("Confirmation code")}>
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            className={styles.otpInput}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value}
            aria-label={t("Digit {{n}}", { n: index + 1 })}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>
      {error && (
        <div style={{ marginTop: 16 }}>
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Modal>
  );
};

export default SecureAuthModal;
