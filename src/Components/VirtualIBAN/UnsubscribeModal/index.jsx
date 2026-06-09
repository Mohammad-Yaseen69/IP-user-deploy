import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import styles from "./unsubscribeModal.module.scss"

const WarningTriangleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const LockIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#fff" strokeWidth="2" />
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const REASONS = [
    "Lost device",
    "Security concern",
    "No longer needed",
    "Switching provider",
    "Other",
]

/**
 *
 * @param {boolean}  isOpen        
 * @param {function} toggle        
 * @param {boolean}  hasBalance     
 *                                 
 * @param {function} onWithdraw   
 * @param {function} onUnsubscribe 
 */
const UnsubscribeModal = ({
    isOpen,
    toggle,
    hasBalance = true,
    onWithdraw,
    onUnsubscribe,
}) => {
    const { t } = useTranslation()

    const [confirmed, setConfirmed] = useState(false)
    const [reason, setReason] = useState("Lost device")

    const resetState = () => {
        setConfirmed(false)
        setReason("Lost device")
    }

    const handleClose = () => {
        resetState()
        toggle?.()
    }

    const handleWithdraw = () => {
        handleClose()
        onWithdraw?.()
    }

    const handleUnsubscribe = () => {
        onUnsubscribe?.({ reason })
        handleClose()
    }

    const renderWithBalance = () => (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.redAsteriskBadge}>✳</div>
                <h2 className={styles.title}>{t("Unsubscribe your virtual account?")}</h2>
            </div>

            <div className={`${styles.iconBox} ${styles.iconPurple}`}>
                <WarningTriangleIcon />
            </div>

            <h3 className={styles.subtitle}>
                {t("You can't unsubscribe if you still have a balance.")}
            </h3>
            <p className={styles.description}>
                {t("You must withdraw your vIBAN balance before unsubscribing.")}
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
    )

    const renderWithoutBalance = () => (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.redAsteriskBadge}>✳</div>
                <h2 className={styles.title}>{t("Unsubscribe your virtual account?")}</h2>
            </div>

            <div className={`${styles.iconBox} ${styles.iconRed}`}>
                <LockIcon />
            </div>

            <h3 className={styles.subtitle}>
                {t("This will pause all activity")}
            </h3>
            <p className={styles.description}>
                {t("Your IBAN will reject incoming transfers and you won't be able to send or convert funds.")}
            </p>

            <div className={styles.consequenceTable}>
                <div className={styles.consequenceRow}>
                    <span className={styles.consequenceLabel}>{t("Incoming SEPA transfers")}</span>
                    <span className={styles.consequenceValue}>{t("Will be rejected and returned")}</span>
                </div>
                {/* <div className={styles.consequenceRow}>
                    <span className={styles.consequenceLabel}>{t("Card payments")}</span>
                    <span className={styles.consequenceValue}>{t("Declined")}</span>
                </div> */}
            </div>

            <div className={styles.reasonSection}>
                <label className={styles.reasonLabel}>
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

            <div className={styles.checkboxRow}>
                <input
                    type="radio"
                    className={styles.radioInput}
                    checked={confirmed}
                    onClick={() => setConfirmed(!confirmed)}
                    id="unsub-confirm"
                />
                <label htmlFor="unsub-confirm" className={styles.checkboxLabel}>
                    {t("I understand my account will be frozen until I unfreeze it.")}
                </label>
            </div>

            {/* Actions */}
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
                    className={`${styles.primaryBtn} ${styles.btnRed}`}
                    onClick={handleUnsubscribe}
                    disabled={!confirmed}
                    style={!confirmed ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                    {t("Unsubscribe")}
                </button>
            </div>
        </div>
    )

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleClose}
            centered
            style={{ maxWidth: "480px" }}
        >
            <ModalBody style={{ padding: 0, background: "transparent", border: "none" }}>
                {hasBalance ? renderWithBalance() : renderWithoutBalance()}
            </ModalBody>
        </Modal>
    )
}

export default UnsubscribeModal
