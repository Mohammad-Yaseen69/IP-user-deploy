import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.scss";
import { ChevronRight, X } from "react-feather";

const TermsModal = ({ onContinue, setShowModal }) => {
    const [agreed, setAgreed] = useState(false);
    const { t } = useTranslation()
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <X className={styles.close} onClick={() => setShowModal(false)} />
                <h2>{t("Before you continue")}</h2>
                <p>
                    {t("You’ll be redirected to the InstaPay eShop dashboard to manage your shop and transactions. Please review and accept the Terms of Service to proceed.")}
                </p>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={() => setAgreed(!agreed)}
                    />
                    {t("I have read and agree to the InstaPay eShop Terms of Service")}
                </label>

                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={() => window.close()}>
                        {t("Cancel")}
                    </button>
                    <button
                        className={styles.continue}
                        onClick={onContinue}
                        disabled={!agreed}
                    >
                        {t("Continue to eShop")} <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
