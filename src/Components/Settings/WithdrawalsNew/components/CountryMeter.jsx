import { useTranslation } from "react-i18next";
import styles from "../styles/WithdrawalsNew.module.css";
import { MAX_COUNTRIES } from "../withdrawalPayload";

const CountryMeter = ({ used }) => {
  const { t } = useTranslation();
  const left = Math.max(MAX_COUNTRIES - used, 0);

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
        <strong>
          {t("{{used}} of {{max}}", {
            used: Math.min(used, MAX_COUNTRIES),
            max: MAX_COUNTRIES,
          })}
        </strong>{" "}
        {t("countries used")}
        {left > 0 && (
          <span className={styles.meterMuted}>
            {" · "}
            {left === 1
              ? t("You can add one more")
              : t("You can add {{count}} more", { count: left })}
          </span>
        )}
      </p>
    </div>
  );
};

export default CountryMeter;
