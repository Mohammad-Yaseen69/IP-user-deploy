import { useTranslation } from "react-i18next";
import { BankSmall, Globe, Info, Plus, UserSmall } from "../../Icons";
import styles from "../styles/Withdrawals.module.scss";
import { MAX_COUNTRIES } from "../withdrawalPayload";

const FEATURES = [
  {
    icon: "globe",
    title: "Up to {{max}} countries",
    body: "Keep accounts where you live, work or send home.",
  },
  {
    icon: "info",
    title: "Fast by default",
    body: "Bank transfers and mobile wallets usually arrive quickly.",
  },
  {
    icon: "user",
    title: "In your name",
    body: "Withdrawals only go to accounts that belong to you.",
  },
];

const FEATURE_ICONS = {
  globe: <Globe color="#5926F0" />,
  info: <Info color="#5926F0" />,
  user: <UserSmall color="#5926F0" />,
};

const EmptyState = ({ canAdd, onAdd }) => {
  const { t } = useTranslation();

  return (
    <section className={`${styles.card} ${styles.empty}`}>
      <span className={styles.emptyTile}>
        <BankSmall color="#5926F0" size={24} />
      </span>
      <h3 className={styles.emptyTitle}>{t("Add where you want to withdraw to")}</h3>
      <p className={styles.emptyText}>
        {t(
          "Link a bank account, mobile wallet or crypto wallet in your name. Then cash out your balance in a couple of taps.",
        )}
      </p>
      <button
        type="button"
        className={`${styles.button} ${styles.buttonPrimary}`}
        onClick={onAdd}
        disabled={!canAdd}
      >
        <Plus color="#FFFFFF" />
        {t("Add withdrawal account")}
      </button>

      <div className={styles.features}>
        {FEATURES.map((feature) => (
          <div key={feature.icon} className={styles.feature}>
            <span className={styles.featureTile}>{FEATURE_ICONS[feature.icon]}</span>
            <p className={styles.featureTitle}>{t(feature.title, { max: MAX_COUNTRIES })}</p>
            <p className={styles.featureText}>{t(feature.body)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EmptyState;
