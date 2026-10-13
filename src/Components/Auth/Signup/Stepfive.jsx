import { Info } from "react-feather";
import styles from "./styles/stepfive.module.css";
import { useTranslation } from "react-i18next";

const Stepfive = ({ data, dataHandler }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.inp}>
        <label>{t("Referral Code (Optional)")}</label>
        <input
          type="text"
          value={data.referral_code}
          onChange={(e) => dataHandler("referral_code", e.target.value)}
          placeholder="Ex: imtiaz0307"
        />
      </div>
      <div className={styles.info}>
        <Info color="#ffaa29" size={26} />
        <span>
          {t("It Will Be Autofill If You're Signing Up With Invitation Link")}
        </span>
      </div>
    </div>
  );
};

export default Stepfive;
