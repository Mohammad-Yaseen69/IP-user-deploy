import styles from "./styles/onboard.module.scss";
import success from "./files/success_creation.png";
import { useTranslation } from "react-i18next";

const Stepfour = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "7px",
        flexDirection: "column",
        maxWidth: "100%",
      }}
    >
      <div className={styles.top}>
        <h2>
          {t("Your InstaPay Card is Ready")}
          {t("!🎉")}
        </h2>
        <p>{t("Your payment was successful, and your card is now active.")}</p>
      </div>
      <img src={success} alt="" />
    </div>
  );
};

export default Stepfour;
