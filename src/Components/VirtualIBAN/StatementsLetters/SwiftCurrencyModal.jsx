import { useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { Globe, Eye, Download, Share2, Loader, X } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "./StatementsLetters.module.css";

const SwiftCurrencyModal = ({
  isOpen,
  toggle,
  actionType = "preview",
  onConfirm,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState("usd");

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedCurrency, actionType);
    }
  };

  const getActionLabel = () => {
    const curr = selectedCurrency.toUpperCase();
    if (actionType === "preview") return `${t("Preview Letter")} (${curr})`;
    if (actionType === "download") return `${t("Download Letter")} (${curr})`;
    if (actionType === "share") return `${t("Share Letter")} (${curr})`;
    return `${t("Continue")} (${curr})`;
  };

  const getActionIcon = () => {
    if (isProcessing) return <Loader size={16} className={styles.spinIcon} />;
    if (actionType === "preview") return <Eye size={16} />;
    if (actionType === "download") return <Download size={16} />;
    if (actionType === "share") return <Share2 size={16} />;
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      style={{ maxWidth: "520px", width: "calc(100% - 32px)" }}
    >
      <ModalBody className={styles.swiftModalBody}>
        <div className={styles.swiftModalContainer}>
          <div className={styles.swiftModalHeader}>
            <div className={styles.swiftModalHeaderLeft}>
              <div className={styles.swiftModalIcon}>
                <Globe size={22} color="#5626E6" />
              </div>
              <div>
                <h2 className={styles.swiftModalTitle}>
                  {t("SWIFT Confirmation Letter")}
                </h2>
                <p className={styles.swiftModalSubtitle}>
                  {t("Select depositing currency for receiving instructions")}
                </p>
              </div>
            </div>
            <button
              className={styles.swiftModalCloseBtn}
              onClick={toggle}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.swiftModalContent}>
            <div className={styles.currencyRadioGrid}>
              <div
                className={`${styles.currencyRadioCard} ${selectedCurrency === "usd" ? styles.activeRadioCard : ""}`}
                onClick={() => setSelectedCurrency("usd")}
              >
                <div className={styles.radioIndicator}>
                  {selectedCurrency === "usd" && (
                    <div className={styles.radioIndicatorInner} />
                  )}
                </div>
                <div className={styles.currencyBadgeIcon}>$</div>
                <span className={styles.currencyLabelText}>
                  {t("Depositing in USD")}
                </span>
              </div>

              <div
                className={`${styles.currencyRadioCard} ${selectedCurrency === "eur" ? styles.activeRadioCard : ""}`}
                onClick={() => setSelectedCurrency("eur")}
              >
                <div className={styles.radioIndicator}>
                  {selectedCurrency === "eur" && (
                    <div className={styles.radioIndicatorInner} />
                  )}
                </div>
                <div className={styles.currencyBadgeIcon}>€</div>
                <span className={styles.currencyLabelText}>
                  {t("Depositing in EUR")}
                </span>
              </div>
            </div>

            <p className={styles.currencyHelpText}>
              {t("Add money to this account to top up your vIBAN.")}
            </p>
          </div>

          <div className={styles.swiftModalFooter}>
            <button
              type="button"
              className={styles.swiftCancelBtn}
              onClick={toggle}
              disabled={isProcessing}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={styles.swiftPrimaryBtn}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {getActionIcon()}
              <span>
                {isProcessing ? t("Processing...") : getActionLabel()}
              </span>
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SwiftCurrencyModal;
