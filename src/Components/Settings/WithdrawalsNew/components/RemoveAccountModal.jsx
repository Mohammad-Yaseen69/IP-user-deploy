import { useState } from "react";
import { Modal } from "@mui/material";
import { Trash2 } from "react-feather";
import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import styles from "../styles/WithdrawalsNew.module.css";

const RemoveAccountModal = ({ account, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [removing, setRemoving] = useState(false);

  const confirm = async () => {
    setRemoving(true);
    const ok = await onConfirm(account);
    setRemoving(false);
    if (ok) onClose();
  };

  const freesSlot = account && !account.isCrypto && account.isLastInRecord;
  const target =
    account?.subtitle?.split(" · ").slice(1).join(" · ") || account?.title;

  return (
    <Modal
      open={!!account}
      onClose={removing ? undefined : onClose}
      aria-labelledby="remove-withdrawal-account"
    >
      <div className={abf.root}>
        <div className={`${abf.modal} ${styles.removeModal}`}>
          <span className={styles.removeIcon}>
            <Trash2 size={18} />
          </span>
          <h3 className={styles.removeTitle} id="remove-withdrawal-account">
            {t("Remove {{name}}?", { name: account?.title ?? "" })}
          </h3>
          <p className={styles.removeText}>
            {t("You won't be able to withdraw to {{target}} anymore.", {
              target,
            })}
            {freesSlot &&
              ` ${t("{{country}} will free up a country slot.", { country: account.countryName })}`}
          </p>
          <div className={styles.removeActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onClose}
              disabled={removing}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={confirm}
              disabled={removing}
            >
              {removing ? t("Removing...") : t("Remove")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveAccountModal;
