import styles from "../styles/MobileStepProgress.module.css";
import {
  getSidebarStepName,
  isSidebarStepActive,
  isSidebarStepCompleted,
  SIDEBAR_STEPS,
} from "../../../stateMachines/swiftTransfer";
import { ChevronUp } from "react-feather";
import { FaQuestion } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const MobileStepProgress = ({ currentStep }) => {
  const { t } = useTranslation();

  const order = SIDEBAR_STEPS.map((item) => item.stepName);
  const currentSidebarStep = getSidebarStepName(currentStep);

  return (
    <>
      <div className={styles.container}>
        {SIDEBAR_STEPS.map((step, index) => {
          const isActive = isSidebarStepActive(step, currentStep);
          const isCompleted = isSidebarStepCompleted(step, currentStep);
          return (
            <div
              key={index}
              className={`${styles.step} ${isActive ? styles.active : ""} ${isCompleted ? styles.completed : ""}`}
            >
              <div className={styles.stepLine}></div>
            </div>
          );
        })}
      </div>
      <div className={styles.mobileStepContainer}>
        <p className={styles.stepCount}>
          Step {order.indexOf(currentSidebarStep) + 1} of {SIDEBAR_STEPS.length}
          <span> · {currentSidebarStep?.toLowerCase()}</span>
        </p>
        <div className={styles.dropdownPill}>
          <div className={styles.addIconContainer}>
            <FaQuestion size={8} />
          </div>
          <span className={styles.readyPercentage}>{t('Help')}</span>
          <ChevronUp size={12} />
        </div>
      </div>
    </>
  );
};

export default MobileStepProgress;
