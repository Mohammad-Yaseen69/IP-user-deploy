import { useState } from "react";
import { Check, Search } from "react-feather";
import { useTranslation } from "react-i18next";
import useWindowWidth from "../../../utils/useWindowWidth";
import TopRight from "../../topRight";
import styles from "../styles/subAgents.module.css";
import AddSubAgentModal from "./AddSubAgentModal";

const SubAgents = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Sub-Agents")}</h1>
          <p>
            {t("Grow your network. Assign leads, set commission splits and track performance.")}
          </p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input type="text" placeholder={t("Search...")} className={styles.searchInput} />
          </div>

          <div className={styles.actionGroup}>
            <button className={styles.secondaryBtn}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#344054"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              {t("Filter")}
            </button>

            <button className={styles.secondaryBtn}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#344054"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 10L1 5"></path>
                <path d="M6 19V6"></path>
                <path d="M13 19L18 14L23 19"></path>
                <path d="M18 5V18"></path>
              </svg>
              {t("Sort By")}
            </button>

            <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
              <span>+ {t("Add sub-agent")}</span>
            </button>
          </div>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.avatar} ${styles.greenAvatar}`}>
                <span>{t("BT")}</span>
              </div>

              <div className={styles.cardTitle}>
                <h4>{t("BrightSpark Trading")}</h4>
                <span>{t("San Pedro, CA")}</span>
              </div>

              <span className={`${styles.statusBadge} ${styles.active}`}>{t("Active")}</span>
            </div>

            <div className={styles.cardRows}>
              <div className={styles.infoRow}>
                <span>{t("Type")}</span>
                <span className={`${styles.typeBadge} ${styles.private}`}>{t("Private")}</span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("KYC/KYB")}</span>
                <span className={`${styles.kycBadge} ${styles.verified}`}>
                  <Check size={10} />
                  {t("Verified")}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Leads + active")}</span>
                <strong>14 - 9</strong>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Commission split")}</span>
                <strong>40%</strong>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.lightButton}>{t("Assign leads")}</button>
              <button className={styles.lightButton}>{t("Payouts")}</button>
              <button className={styles.dangerButton}>{t("Disable")}</button>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.avatar} ${styles.purpleAvatar}`}>
                <span>{t("TB")}</span>
              </div>

              <div className={styles.cardTitle}>
                <h4>{t("TradeBridge Ltd")}</h4>
                <span>{t("Accra, GH")}</span>
              </div>

              <span className={`${styles.statusBadge} ${styles.active}`}>{t("Active")}</span>
            </div>

            <div className={styles.cardRows}>
              <div className={styles.infoRow}>
                <span>{t("Type")}</span>
                <span className={`${styles.typeBadge} ${styles.corporate}`}>{t("Corporate")}</span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("KYC/KYB")}</span>
                <span className={`${styles.kycBadge} ${styles.verified}`}>
                  <Check size={10} />
                  {t("KYC verified")}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Leads + active")}</span>
                <strong>22 - 11</strong>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Commission split")}</span>
                <strong>55%</strong>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.lightButton}>{t("Assign leads")}</button>
              <button className={styles.lightButton}>{t("Payouts")}</button>
              <button className={styles.dangerButton}>{t("Disable")}</button>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.avatar} ${styles.blueAvatar}`}>
                <span>{t("AN")}</span>
              </div>

              <div className={styles.cardTitle}>
                <h4>{t("Akira Ndaye")}</h4>
                <span>{t("Dakar, SN")}</span>
              </div>

              <span className={`${styles.statusBadge} ${styles.suspended}`}>{t("Suspended")}</span>
            </div>

            <div className={styles.cardRows}>
              <div className={styles.infoRow}>
                <span>{t("Type")}</span>
                <span className={`${styles.typeBadge} ${styles.private}`}>{t("Private")}</span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("KYC/KYB")}</span>
                <span className={`${styles.kycBadge} ${styles.verified}`}>
                  <Check size={10} />
                  {t("Verified")}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Leads + active")}</span>
                <strong>8 - 5</strong>
              </div>

              <div className={styles.infoRow}>
                <span>{t("Commission split")}</span>
                <strong>35%</strong>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.lightButton}>{t("Assign leads")}</button>
              <button className={styles.lightButton}>{t("Payouts")}</button>
              <button className={styles.enableButton}>{t("Enable")}</button>
            </div>
          </div>
        </div>
      </div>

      <AddSubAgentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => console.log("New sub-agent submitted:", data)}
      />
    </div>
  );
};

export default SubAgents;
