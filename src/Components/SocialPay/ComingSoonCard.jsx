import { getThemeVars } from "./Channel";
import styles from "./styles/PaySocial.module.css";

const ComingSoonCard = ({ item, themes }) => (
  <article className={styles.comingCard} style={getThemeVars(themes, item.theme)}>
    <div className={styles.comingHeader}>
      <div className={styles.iconTile}>
        <img src={item.icon} alt={item.name} />
      </div>
      <div>
        <h4 className={styles.channelName}>{item.name}</h4>
        <span className={styles.handle}>{item.handle}</span>
      </div>
    </div>
    <h3 className={styles.comingTagline}>{item.tagline}</h3>
    <p className={styles.comingDesc}>{item.description}</p>
    <p className={styles.comingNote}>{item.note}</p>
  </article>
);
export default ComingSoonCard;
