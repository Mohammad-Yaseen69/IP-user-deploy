import { Alert, AlertTitle } from "@mui/material";
import styles from "../style/MobileProgress.module.css";
import { useTranslation } from "react-i18next";
import AiIcon from "../../../../assets/icons/ai-icon.svg";

const AlertBox = ({ icon, description, title, variant = "info" }) => {
  const { t } = useTranslation();

  const getVariant = () => {
    let containerStyle = {};

    switch (variant) {
      case "warning":
        containerStyle = {
          boxShadow: "0px 0px 0px 1px #F5A5242E inset",
          bgcolor: "#FEF7E9",
          "& .MuiAlert-message": {
            color: "#8A5A00",
          },
        };
        break;

      default:
        containerStyle = {
          boxShadow: "0px 8px 20px -14px #5926F099",
          bgcolor: "#F3EFFE",
          "& .MuiAlert-message": {
            color: "#3B2694",
          },
        };
        break;
    }

    return containerStyle;
  };

  const containerStyle = getVariant();

  return (
    <Alert
      className={styles.alertBox}
      sx={containerStyle}
      classes={{ message: styles.alertDescription }}
      icon={icon ?? <img src={AiIcon} alt="AI Icon" width={10} height={10} />}
    >
      {title && <AlertTitle className={styles.alertTitle}>{t(title)}</AlertTitle>}
      {t(description)}
    </Alert>
  );
};

export default AlertBox;
