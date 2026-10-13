import styles from "./index.module.css";
import user from "./user.svg";
import page from "./page.svg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const NotFound = ({ type = "User" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img
          loading="lazy"
          src={type === "User" ? user : page}
          alt="Not Found Image"
        />
        <h5>{t("User not found").replace("User", type)}</h5>
        <span>
          {t("The user you're searching for isn't available.").replace(
            "user",
            type.toLowerCase(),
          )}
        </span>
        <button onClick={() => navigate("/")}>
          {t("Go back to dashboard")}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
