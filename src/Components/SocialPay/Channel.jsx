import styles from "./styles/PaySocial.module.css";
import { useState } from "react";

export const getThemeVars = (themes, themeKey) => {
  const t = themes[themeKey] ?? themes.x;
  return {
    "--accent": t.accent,
    "--tint": t.tint,
    "--border": t.border,
    "--step-bg": t.stepBg,
    "--step-text": t.stepText,
  };
};
const ChannelCard = ({ item, themes }) => {
  const [isActive, setIsActive] = useState(item.isActive);
  return (
    <article className={styles.card} style={getThemeVars(themes, item.theme)}>
      <div>
        <div className={styles.cardHeader}>
          <div className={styles.channelMeta}>
            <img src={item.icon} alt={item.name} className={styles.channelIcon} />
            <div>
              <h4 className={styles.channelName}>{item.name}</h4>
              <span className={styles.handle}>{item.handle}</span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={`${styles.toggle} ${isActive ? styles.toggleOn : ""}`}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        <h3 className={styles.tagline}>{item.tagline}</h3>
        <p className={styles.cardDesc}>{item.description}</p>

        <div className={styles.steps}>
          {item.steps.map((s) => (
            <div key={s.step} className={styles.stepItem}>
              <span className={styles.stepBadge}>{s.step}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        {item.secondaryAction.variant === "badge" ? (
          <span className={styles.connectedBadge}>{item.secondaryAction.label}</span>
        ) : (
          <button type="button" className={styles.unlinkBtn}>
            {item.secondaryAction.label}
          </button>
        )}
        <button type="button" className={styles.primaryBtn}>
          {item.primaryAction.label}
        </button>
      </div>
    </article>
  );
};

export default ChannelCard;
