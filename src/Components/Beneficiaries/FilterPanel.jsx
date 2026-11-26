import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bitcoin, CreditCard, HandCoins, Landmark, Smartphone, Wallet } from "lucide-react";
import styles from "./styles/index.module.scss";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: "bank", label: "Bank account", Icon: Landmark },
  { value: "mobile", label: "Mobile wallet", Icon: Smartphone },
  { value: "wallet", label: "InstaPay Wallet", Icon: Wallet },
  { value: "crypto", label: "Crypto", Icon: Bitcoin },
  { value: "card", label: "Card", Icon: CreditCard },
  { value: "cash", label: "Cash Pickup", Icon: HandCoins },
];

const EMPTY_FILTERS = { type: "all", accountTypes: [] };

const FilterPanel = ({ value, onApply }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  const toggleAccountType = (accountType) =>
    setDraft((prev) => ({
      ...prev,
      accountTypes: prev.accountTypes.includes(accountType)
        ? prev.accountTypes.filter((v) => v !== accountType)
        : [...prev.accountTypes, accountType],
    }));

  return (
    <div className={`${styles.menu} ${styles.filter_panel}`}>
      <div className={styles.filter_label}>{t("Beneficiary type")}</div>
      <div className={styles.segmented}>
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={draft.type === o.value ? styles.segmented_active : ""}
            aria-pressed={draft.type === o.value}
            onClick={() => setDraft((prev) => ({ ...prev, type: o.value }))}
          >
            {t(o.label)}
          </button>
        ))}
      </div>

      <div className={styles.filter_label}>
        {t("Account Type")}
        <small>{t("Select one or more")}</small>
      </div>
      {ACCOUNT_TYPE_OPTIONS.map(({ value: accountType, label, Icon }) => (
        <label key={accountType} className={styles.check_row}>
          <input
            type="checkbox"
            checked={draft.accountTypes.includes(accountType)}
            onChange={() => toggleAccountType(accountType)}
          />
          <Icon size={16} />
          {t(label)}
        </label>
      ))}

      <div className={styles.filter_footer}>
        <button type="button" className={styles.clear_btn} onClick={() => onApply(EMPTY_FILTERS)}>
          {t("Clear all")}
        </button>
        <button type="button" className={styles.apply_btn} onClick={() => onApply(draft)}>
          {t("Apply")}
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
