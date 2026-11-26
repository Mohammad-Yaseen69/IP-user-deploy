import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import { ArrowRight, X } from "react-feather";
import styles from "../style/ProviderSelectModal.module.css";
import MaltaFlag from "../../files/images/Malta.svg";
import UsFlag from "../../files/images/US.svg";

const PROVIDER_OPTIONS = [
  {
    value: "bvnk",
    flag: MaltaFlag,
    title: "Malta",
    subtitle: "EUR IBAN · SEPA + SWIFT",
  },
  {
    value: "rhub",
    flag: UsFlag,
    title: "United States",
    subtitle: "USD account · Local USD + SWIFT",
  },
];

const ProviderSelectModal = ({ isOpen, value, onChange, onClose, onNext }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      centered
      style={{ maxWidth: isMobile ? "92%" : "480px" }}
      contentClassName={styles.content}
    >
      <ModalBody className={styles.body}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{t("Choose your IBAN country")}</h3>
            <p className={styles.subtitle}>
              {t("Select where your business account will be issued.")}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeIcon}
            onClick={onClose}
            aria-label={t("Close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.optionList} role="radiogroup">
          {PROVIDER_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`${styles.option} ${isSelected ? styles.selected : ""}`}
                onClick={() => onChange(option.value)}
              >
                <span className={styles.radio} />
                <span className={styles.flagBox}>
                  <img src={option.flag} alt="" />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>{t(option.title)}</span>
                  <span className={styles.optionSubtitle}>{t(option.subtitle)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            {t("Cancel")}
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onNext} disabled={!value}>
            {t("Continue")} <ArrowRight size={16} />
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProviderSelectModal;
