import styles from "./styles/ConfirmationModal.module.scss"
import { X, Check } from "react-feather"

const ConfirmationModal = ({ setShowModal }) => {
    return (
        <>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.modal_header}>
                    <span className={styles.modal_header_text}>Confirm</span>
                    <X className={styles.modal_header_icon} onClick={() => setShowModal(false)} />
                </div>

                {/* Checkmark */}
                <div className={styles.modal_checkmark}>
                    <Check size={80} color="#fff" />
                </div>

                {/* Receipt items */}
                <div className={styles.modal_receipt}>
                    <div className={styles.modal_receipt_item}>
                        <span className={styles.modal_receipt_label}>From:</span>
                        <span className={styles.modal_receipt_value}>USD</span>
                    </div>
                    <div className={styles.modal_receipt_item}>
                        <span className={styles.modal_receipt_label}>To:</span>
                        <span className={styles.modal_receipt_value}>EUR</span>
                    </div>
                    <div className={styles.modal_receipt_item}>
                        <span className={styles.modal_receipt_label}>Amount Sent:</span>
                        <span className={styles.modal_receipt_value}>$1200</span>
                    </div>
                    <div className={styles.modal_receipt_item}>
                        <span className={styles.modal_receipt_label}>To Receive:</span>
                        <span className={styles.modal_receipt_value}>1000</span>
                    </div>
                    <div className={styles.modal_receipt_item}>
                        <span className={styles.modal_receipt_label}>Charges:</span>
                        <span className={styles.modal_receipt_value}>$120</span>
                    </div>
                </div>

                {/* Market rate */}
                <div className={styles.modal_market_rate}>
                    <span>Current Market Rate: 1 USD = 0.82 EUR</span>
                </div>
            </div>
            <div className={styles.modal_overlay} onClick={() => setShowModal(false)} />
        </>
    )
}


export default ConfirmationModal