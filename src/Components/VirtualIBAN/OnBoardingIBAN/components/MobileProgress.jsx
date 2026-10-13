import React from "react";
import styles from "../style/MobileProgress.module.css";
import { useTranslation } from "react-i18next";
import { Chip } from "@mui/material";
import AskAiIcon from "../../../../assets/icons/ask-icon.svg";
import { ArrowRight, Check } from "react-feather";
import AlertBox from "./AlertBox";
import Badge from "./badge";

const MobileProgress = ({
  percent,
  stepsLeft,
  doneCount,
  checklist,
  getStatus,
}) => {
  const { t } = useTranslation();

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

  return (
    <div className={styles.container}>
      <div className={styles.slideBtn} />
      <div className={styles.readyPercentContainer}>
        <div className={styles.percentCount}>{percent}%</div>
        <div className={styles.percentLabel}>{t("READY")}</div>
      </div>
      <Badge label={`${stepsLeft} ${t("steps left")}`} />
      <AlertBox
        title={"Assistant"}
        description={
          "Just the people left. Once owners are verified we can finalize your document checklist."
        }
      />

      <div className={styles.checklistHeader}>
        <span className={styles.checkListHeading}>{t("YOUR CHECKLIST")}</span>

        <span className={styles.checkListCount}>
          {doneCount} {t("of 5 done")}
        </span>
      </div>

      <div className={styles.checklist}>
        {checklist.map((item) => {
          const status = getStatus(item.key);
          const { label, statusBgColor, icon, textColor, iconBgColor } =
            getIcon(status);
          return (
            <div className={styles.checklistRow} key={item.key}>
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
            "https://wa.me/41783192428",
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <img src={AskAiIcon} alt="Ask Assistant Icon" width={16} height={16} />
        <span>{t("Ask the assistant")}</span>
      </button>
    </div>
  );
};

export default MobileProgress;
