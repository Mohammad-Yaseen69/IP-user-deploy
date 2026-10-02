import { Avatar, Chip } from "@mui/material";
import styles from "../style/OwnerCard.module.css";
import Badge from "./badge";
import { useTranslation } from "react-i18next";
import { getInitials } from "../../../../utils/Functions/getInitials";

const OwnerCard = ({ owner, handleDelete }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Badge label={owner?.role} />
      <div className={styles.profileContainer}>
        <div className={styles.avatar}>{getInitials(owner.fullName)}</div>
        <div className={styles.detailsContainer}>
          <span className={styles.title}>{owner?.fullName}</span>
          <span className={styles.subtitle}>
            {owner?.role}{" "}
            {owner?.ownershipPercent && `· ${owner?.ownershipPercent}%`}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.btn}>
          {t("PEP")}: {owner.isPep ? "Yes" : "No"}
        </div>
        <div className={styles.btn} onClick={() => handleDelete(owner.id)}>
          {t("Remove")}
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;
