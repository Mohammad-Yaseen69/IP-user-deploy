import styles from "../styles/MobileStepProgress.module.css";
import { ChevronUp } from "react-feather";
import { FaQuestion } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

const MobileStepProgress = ({
  currentStep,
  getSidebarStepName,
  isSidebarStepActive,
  isSidebarStepCompleted,
  SIDEBAR_STEPS,
  handleClick
}) => {
  const { t } = useTranslation();

  const order = SIDEBAR_STEPS.map((item) => item.stepName);
  const currentSidebarStep = getSidebarStepName
    ? getSidebarStepName(currentStep)
    : currentStep;

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
          {t('Step')} {order.indexOf(currentSidebarStep) + 1} {t('of')} {SIDEBAR_STEPS.length}
          <span> · {currentSidebarStep?.toLowerCase()}</span>
        </p>
        <div className={styles.dropdownPill} onClick={handleClick} role="button" tabIndex={0}>
          <div className={styles.addIconContainer}>
            <FaQuestion size={8} />
          </div>
          <span className={styles.readyPercentage}>{t("Help")}</span>
          <ChevronUp size={12} />
        </div>
      </div>
    </>
  );
};

export default MobileStepProgress;
