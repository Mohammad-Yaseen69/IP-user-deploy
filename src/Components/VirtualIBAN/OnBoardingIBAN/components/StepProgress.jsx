import React, { useState } from "react";
import AssistantDrawer from "./AssistantDrawer";
import { ChevronUp, Plus } from "react-feather";
import styles from "../style/onboardingSteps.module.css";
import { useTranslation } from "react-i18next";

const StepProgress = ({ currentStep, percent }) => {
  const { t } = useTranslation();
  const [openAIDrawer, setOpenAIDrawer] = useState(false);
  const toggleAiDrawer = () => setOpenAIDrawer((prev) => !prev);

  const steps = [
    "account",
    "company",
    "activity",
    "ownership",
    "documents",
    "review",
  ];

  const totalSteps = steps.length;
  const currentStepNo = steps.findIndex((x) => x === currentStep) + 1;
  const stepsLeft = totalSteps - currentStepNo;
  return (
    <>
      <div className={styles.mobileStepContainer}>
        <p className={styles.stepCount}>
          Step {currentStepNo} of {totalSteps}
          <span> · {currentStep}</span>
        </p>
        <div className={styles.dropdownPill} onClick={toggleAiDrawer}>
          <div className={styles.addIconContainer}>
            <Plus size={10} />
          </div>
          <span className={styles.readyPercentage}>{percent}%</span>
          <span className={styles.stepsLeft}>
            · {stepsLeft > 0 ? `${stepsLeft} left` : t("ready")}
          </span>
          <ChevronUp size={12} />
        </div>
      </div>

      <AssistantDrawer open={openAIDrawer} toggleDrawer={toggleAiDrawer} percent={percent} stepsLeft={stepsLeft} currentStep={currentStep} />
    </>
  );
};

export default StepProgress;
