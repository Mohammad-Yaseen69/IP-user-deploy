import styles from "./styles/PaySocial.module.css";
import { socialPayConfig } from "./requiredFields";
import ChannelCard from "./Channel";
import ComingSoonCard from "./ComingSoonCard";
import pinIcon from "./files/pinIcon.svg";
import heroImage from "./files/hero-bg.png";
import HiIcons from "./files/Hi.Icon.png";

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PayViaSocial = () => {
  const { header, themes, activeChannels, comingSoonChannels } = socialPayConfig;
  const { user } = header;
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pay via Social</h1>
          <p className={styles.subtitle}>Send money through Instagram, WhatsApp or Telegram</p>
        </div>

        <div className={styles.userSection}>
          <button type="button" className={styles.notificationBtn} aria-label="Notifications">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {user.notificationsCount > 0 && (
              <span className={styles.notifBadge}>{user.notificationsCount}</span>
            )}
          </button>

          <div className={styles.userBadge}>
            {user.avatar ? (
              <img src={user.avatar} alt="Neko Von Meow" className={styles.avatar} />
            ) : (
              <span className={styles.avatarFallback}>{getInitials("Neko Von Meow")}</span>
            )}
            <span className={styles.userName}>Neko Von Meow</span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </header>

      <section className={styles.hero} style={{ "--hero-bg": `url("${heroImage}")` }}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Just say{" "}
            <span className={styles.hiBubble}>
              <img src={HiIcons} alt="" />
            </span>
            to pay.
          </h2>
          <p className={styles.heroDesc}>
            Message the InstaPay bot on Instagram, WhatsApp, or Telegram - and your full wallet is
            right there in the conversation. No new app. No extra login.
          </p>
        </div>
      </section>

      <div className={styles.pinBanner}>
        <div className={styles.pinLeft}>
          <div className={styles.pinIconBox}>
            <img src={pinIcon} alt="" className={styles.pinIcon} />
          </div>
          <div>
            <h4 className={styles.pinTitle}>Update Your PIN</h4>
            <p className={styles.pinSub}>Need to change your PIN?</p>
          </div>
        </div>
        <button type="button" className={styles.pinBtn}>
          Update your PIN
        </button>
      </div>

      <section className={styles.activeGrid}>
        {activeChannels.map((item) => (
          <ChannelCard key={item.id} item={item} themes={themes} />
        ))}
      </section>

      <h3 className={styles.sectionHeading}>Coming Soon</h3>
      <section className={styles.comingSoonGrid}>
        {comingSoonChannels.map((item) => (
          <ComingSoonCard key={item.id} item={item} themes={themes} />
        ))}
      </section>
    </div>
  );
};

export default PayViaSocial;
