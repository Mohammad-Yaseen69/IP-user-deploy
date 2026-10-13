import React from "react";
import styles from "./styles/Wizard.module.css";

const Wizard = ({ total, current, complete = false }) => {
  const completedSteps = current;
  const incompletedSteps = total - current;

  return (
    <div className={styles["wizard-container"]}>
      <div className={styles["completed-steps"]}>
        {Array.from({ length: completedSteps }, (_, index) => (
          <div
            key={index}
            className={`${styles.step} ${styles.completed}`}
            {...(index === completedSteps - 1 && !complete
              ? { "data-last": "last" }
              : complete
                ? { "data-complete": true }
                : {})}
          ></div>
        ))}
      </div>

      <div className={styles["incompleted-steps"]}>
        {Array.from({ length: incompletedSteps }, (_, index) => (
          <div
            key={index}
            className={`${styles.step} ${styles.incompleted}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Wizard;
