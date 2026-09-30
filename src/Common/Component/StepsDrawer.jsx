import { SwipeableDrawer } from "@mui/material";
import React from "react";
import styles from "./StepsDrawer.module.css";
import { useTranslation } from "react-i18next";
import { Chip } from "@mui/material";
import AskAiIcon from "../../assets/icons/ask-icon.svg";
import { ArrowRight, Check } from "react-feather";

const getIcon = (status) => {
  let icon;
  let statusBgColor = "#FEF7E9";
  let iconBgColor = "#fff";
  let textColor = "#8A5A00";
  let label = "To do";
  switch (status) {
    case "done":
      label = "Done";
      icon = <Check size={14} />;
      statusBgColor = "#E6F8F1";
      iconBgColor = "#10B981";
      textColor = "#04795A";
      break;
    case "inprogress":
      label = "In progress";
      icon = <ArrowRight size={14} />;
      statusBgColor = "#F3EFFE";
      iconBgColor = "#5926F0";
      textColor = "#5926F0";
      break;
    default:
      break;
  }
  return {
    icon,
    label,
    statusBgColor,
    textColor,
    iconBgColor,
  };
};

const StepsDrawer = ({
  open,
  toggleDrawer,
  currentStep,
  isSidebarStepActive,
  isSidebarStepCompleted,
  SIDEBAR_STEPS = [],
}) => {
  const { t } = useTranslation();
  const doneCount =
    SIDEBAR_STEPS.findIndex(
      (x) =>
        x.stepName === currentStep || x?.alsoActiveFor?.includes(currentStep),
    ) + 1;

  return (
    <SwipeableDrawer
      anchor={"bottom"}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          maxHeight: "80vh",
          borderTopLeftRadius: "25px",
          borderTopRightRadius: "25px",
        },
      }}
      onClose={()=>toggleDrawer(false)}
      onOpen={()=>toggleDrawer(true)}
    >
      <div className={styles.container}>
        <div className={styles.slideBtn} />

        <div className={styles.checklistHeader}>
          <span className={styles.checkListHeading}>{t("Where you are")}</span>

          <span className={styles.checkListCount}>
            Step {doneCount} of {SIDEBAR_STEPS.length}
          </span>
        </div>

        <div className={styles.checklist}>
          {SIDEBAR_STEPS.map((item) => {
            const isActive = isSidebarStepActive(item, currentStep);
            const isCompleted = isSidebarStepCompleted(item, currentStep);
            const { label, statusBgColor, icon, textColor, iconBgColor } =
              getIcon(
                isCompleted ? "done" : isActive ? "inprogress" : "incomplete",
              );
            return (
              <div className={styles.checklistRow} key={item.stepName}>
                <div className={styles.checklistItem}>
                  <div
                    className={styles.iconContainer}
                    style={{ backgroundColor: iconBgColor }}
                  >
                    {icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                <Chip
                  label={label}
                  className={styles.statusChip}
                  sx={{ bgcolor: statusBgColor, color: textColor }}
                />
              </div>
            );
          })}
        </div>

        <button
          className={styles.askAIBtn}
          onClick={() =>
            window.open(
              "https://guide.insta-pay.ch/faq/troubleshooting-guide",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <img src={AskAiIcon} alt="Contact Icon" width={16} height={16} />
          <span>{t("Contact us")}</span>
        </button>
      </div>
    </SwipeableDrawer>
  );
};

export default StepsDrawer;
