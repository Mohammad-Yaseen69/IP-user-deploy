import { useTranslation } from "react-i18next";
import styles from "../styles/Withdrawals.module.scss";
import { MAX_COUNTRIES } from "../withdrawalPayload";

const CountryMeter = ({ used }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.meter}>
      <div className={styles.meterBars}>
        {Array.from({ length: MAX_COUNTRIES }, (_, index) => (
          <span
            key={index}
            className={`${styles.meterBar} ${index < used ? styles.meterBarOn : ""}`}
          />
        ))}
      </div>
      <p className={styles.meterText}>
        {t("{{used}} of {{max}} countries", {
          used: Math.min(used, MAX_COUNTRIES),
          max: MAX_COUNTRIES,
        })}
      </p>
    </div>
  );
};

export default CountryMeter;
