import styles from "../cryptoWallet.module.scss";
import { CloseIcon } from "./icons";

/**
 * Card chrome shared by every step: header, optional step progress bar,
 * scrollable body and a footer with a back/secondary and a primary action.
 *
 * `locked` is used while a request is in flight — it hides the close button
 * and the secondary action so the step cannot be abandoned mid-request.
 */
const ModalShell = ({
  title,
  subtitle,
  onClose,
  step,
  children,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  hideSecondary = false,
  locked = false,
}) => (
  <div className={styles.shell}>
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {!locked && (
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      )}
    </div>

    {step ? (
      <div className={styles.stepBar}>
        <span className={styles.stepLabel}>{step.label}</span>
        <div className={styles.stepTrack}>
          <div className={styles.stepFill} style={{ width: `${step.percent}%` }} />
        </div>
        <span className={styles.stepLabel}>{step.name}</span>
      </div>
    ) : null}

    <div className={styles.body}>{children}</div>

    <div className={`${styles.footer} ${hideSecondary || locked ? styles.footerSingle : ""}`}>
      {!hideSecondary && !locked && (
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </div>
  </div>
);

export default ModalShell;
