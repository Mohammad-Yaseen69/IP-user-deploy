import { Chip } from "@mui/material";
import styles from "../style/Badge.module.css";

const Badge = ({ label }) => {
  return <Chip label={label} className={styles.container} />;
};

export default Badge;
