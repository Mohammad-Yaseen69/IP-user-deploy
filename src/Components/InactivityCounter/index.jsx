import { useContext } from "react";
import styles from "./index.module.css";
import { InactivityContext } from "../../InactivityWrapper";
import { LogOut } from "react-feather";
import { useTranslation } from "react-i18next";

const InactivityCountDownTimer = () => {
  const { timeoutDuration } = useContext(InactivityContext);
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.popup}>
        <LogOut size={18} />
        <div>
          <h5>
            {t("You will be logged out in")} {timeoutDuration} {t("Seconds")}.
          </h5>
          <p>
            {t(
              "Move your mouse or Press any key on your keyboard to reset the timer to 15 minutes.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InactivityCountDownTimer;
