import { Avatar, Chip } from "@mui/material";
import styles from "../style/OwnerCard.module.css";
import Badge from "./badge";

const OwnerCard = ({ owner }) => {
  const name = owner?.fullName?.split(" ");

  return (
    <div className={styles.container}>
      <Badge label={owner?.role} />
      <div className={styles.profileContainer}>
        <div className={styles.avatar}>
          {name?.[0]?.[0]}{name?.[1]?.[0]}
        </div>
        <div className={styles.detailsContainer}>
          <span className={styles.title}>{owner?.fullName}</span>
          <span className={styles.subtitle}>{owner?.role} {owner?.ownershipPercent && `· ${owner?.ownershipPercent}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;
