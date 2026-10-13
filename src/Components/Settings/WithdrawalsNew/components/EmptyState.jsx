import { Plus } from "react-feather";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import styles from "../styles/WithdrawalsNew.module.css";
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

const EmptyState = ({ canAdd, onAdd }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.empty}>
      <div className={styles.emptyBadge}>
        <span>
          <Icon name="bank" size={22} color="#FFFFFF" />
        </span>
      </div>
      <h3 className={styles.emptyTitle}>{t("Add where you want to withdraw to")}</h3>
      <p className={styles.emptyText}>
        {t(
          "Link a bank account, mobile wallet or crypto wallet in your name. Then cash out your balance in a couple of taps.",
        )}
      </p>
      <button type="button" className={styles.primaryBtn} onClick={onAdd} disabled={!canAdd}>
        <Plus size={18} />
        {t("Add withdrawal account")}
      </button>

      <div className={styles.features}>
        {FEATURES.map((feature) => (
          <div key={feature.icon} className={styles.feature}>
            <span className={styles.featureIcon}>
              <Icon name={feature.icon} size={18} color="var(--abf-primary)" />
            </span>
            <p className={styles.featureTitle}>{t(feature.title, { max: MAX_COUNTRIES })}</p>
            <p className={styles.featureText}>{t(feature.body)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
