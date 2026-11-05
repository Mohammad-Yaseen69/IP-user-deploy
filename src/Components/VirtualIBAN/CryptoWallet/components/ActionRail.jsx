import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Plus } from "react-feather";
import styles from "../cryptoPage.module.scss";

const TABS = ["Send", "Request", "Convert"];

/**
 * Send / Request / Convert panel.
 *
 * Static on purpose — these flows are not implemented yet, so every control
 * here is presentational. Only the wallet creation flow is wired up.
 */
const ActionRail = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("Send");
  const [sendTo, setSendTo] = useState("saved");

  return (
    <aside className={styles.rail}>
      <div className={styles.railTabs}>
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.railTab} ${tab === item ? styles.railTabActive : ""}`}
            onClick={() => setTab(item)}
          >
            {t(item)}
          </button>
        ))}
      </div>

      <div className={styles.railAmount}>
        <div className={styles.railAmountLabel}>{t("Enter amount")}</div>
        <div className={styles.railAmountValue}>{t("12.00 EUR")}</div>
      </div>

      <div className={styles.railBody}>
        <div>
          <span className={styles.railLabel}>{t("Pay from wallet")}</span>
          <div className={styles.railSelect}>
            <span className={styles.railAvatar}>{t("BB")}</span>
            <span className={styles.railSelectMain}>{t("BBVA SPSM")}</span>
            <span className={styles.railSelectValue}>{t("5,820.44 EUR")}</span>
            <ChevronDown size={18} className={styles.railChevron} />
          </div>
        </div>

        <div>
          <span className={styles.railLabel}>{t("Send to")}</span>
          <div className={styles.railOptions}>
            <div
              className={`${styles.railOption} ${sendTo === "saved" ? styles.railOptionActive : ""}`}
              onClick={() => setSendTo("saved")}
            >
              <span
                className={`${styles.railRadio} ${sendTo === "saved" ? styles.railRadioOn : ""}`}
              />
              <span>
                <span className={styles.railOptionTitle}>{t("Saved beneficiary")}</span>
                <p className={styles.railOptionSub}>{t("Pick a contact & their crypto channel")}</p>
              </span>
            </div>
            <div
              className={`${styles.railOption} ${sendTo === "new" ? styles.railOptionActive : ""}`}
              onClick={() => setSendTo("new")}
            >
              <span
                className={`${styles.railRadio} ${sendTo === "new" ? styles.railRadioOn : ""}`}
              />
              <span>
                <span className={styles.railOptionTitle}>{t("New wallet address")}</span>
                <p className={styles.railOptionSub}>{t("Paste an external address")}</p>
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className={styles.railLabel}>{t("Beneficiary")}</span>
          <div className={`${styles.railSelect} ${styles.railSelectSm}`}>
            <span className={styles.railSelectMain}>{t("Arnold Mbuku")}</span>
            <ChevronDown size={18} className={styles.railChevron} />
          </div>
        </div>

        <div>
          <span className={styles.railLabel}>{t("Crypto channel")}</span>
          <div className={`${styles.railSelect} ${styles.railSelectSm}`}>
            <span className={styles.railSelectMain}>{t("USDT • Tron — TQ5n8pJm2V...ONs2Lp")}</span>
            <ChevronDown size={18} className={styles.railChevron} />
          </div>
        </div>

        <button type="button" className={styles.railLink} disabled>
          <Plus size={15} />
          {t("Add new beneficiary")}
        </button>

        <button type="button" className={styles.railSubmit} disabled>
          {t(tab)} {"›››"}
        </button>
        <p className={styles.railNote}>{t("Coming Soon")}</p>
      </div>
    </aside>
  );
};

export default ActionRail;
