import { Droplet, FileText, Home, Phone, Tv, Wifi, Zap } from "react-feather";
import styles from "../billPayments.module.scss";

const ICONS = [
  [/electric|power|energy/i, Zap],
  [/water/i, Droplet],
  [/internet|fibre|fiber|broadband|voip/i, Wifi],
  [/tv|television/i, Tv],
  [/landline|phone/i, Phone],
  [/tax|government/i, Home],
];

const BillIcon = ({ name = "", size = 16 }) => {
  const Icon = ICONS.find(([pattern]) => pattern.test(name))?.[1] || FileText;
  return (
    <span className={styles.iconBox}>
      <Icon size={size} />
    </span>
  );
};

export default BillIcon;
