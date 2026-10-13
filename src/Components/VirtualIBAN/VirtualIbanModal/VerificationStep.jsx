import { useTranslation } from "react-i18next";
import { Shield } from "react-feather";
import styles from "./virtualIbanModal.module.scss";
import MT from "./icons/mt.svg";
import GB from "./icons/uk.svg";
import { getJurisdiction } from "../../../stateMachines/virtualIbanPayment";
const FLAGS = { MT, GB };

const VerificationStep = ({ jurisdiction }) => {
  const { t } = useTranslation();
  const info = getJurisdiction(jurisdiction);

  return (
    <>
      <div className={styles.feesHeader}>
        <h4>
          <img src={FLAGS[jurisdiction]} />
          {t(info.header)}
        </h4>
        <div className={styles.badges}>
          <span className={styles.badge}>{t("SEPA")}</span>
          <span className={styles.badge}>{t("SWIFT")}</span>
        </div>
      </div>

      <div className={styles.verification}>
        <div className={styles.verificationRing}>
          <Shield size={36} />
        </div>
        <h3>{t("Please verify your identity")}</h3>
        <p>{t("Click verify identity button below, to start the verification process")}</p>
      </div>
    </>
  );
};

export default VerificationStep;
