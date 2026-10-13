import { Modal as MuiModal } from "@mui/material";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import styles from "../styles/copyTrading.module.css";

/* MUI renders in a portal, so the DS root class is applied on the surface itself. */
export const Modal = ({ open, onClose, title, subtitle, children, footer, maxWidth }) => {
  const { t } = useTranslation();
  return (
    <MuiModal open={open} onClose={onClose} aria-labelledby="ct-modal-title">
      <div className={`${abf.root} ${styles.modal}`} style={maxWidth ? { maxWidth } : undefined}>
        <div className={styles.modalHead}>
          <div>
            <h2 id="ct-modal-title" className={styles.modalTitle}>
              {title}
            </h2>
            {subtitle && <p className={styles.modalSub}>{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t("Close")}
            >
              <X size={20} />
            </button>
          )}
        </div>
        {children}
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </MuiModal>
  );
};
