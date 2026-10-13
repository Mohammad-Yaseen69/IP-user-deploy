import styles from "../styles/Manage.module.css";
import { ArrowRight, Download, File, Globe, Sliders } from "react-feather";
import { FaFingerprint } from "react-icons/fa6";
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const Manage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <div className={styles.section}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Sliders size={24} color="#5926F0" strokeWidth={2} />
          </div>
          <div>
            <h3>{t("Limits & controls")}</h3>
            <p>{t("Configure transfer limits and regional restrictions")}</p>
          </div>
        </div>

        {/* <div className={styles.inputs}>
                    <div className={styles.inputGroup}>
                        <label>{t("Daily outgoing limit")}</label>
                        <input type="text" value={t("€0.00")} readOnly />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t("Per transaction limit")}</label>
                        <input type="text" value={t("€0.00")} readOnly />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{t("Monthly volume threshold")}</label>
                        <input type="text" value={t("€0.00")} readOnly />
                    </div>
                </div> */}
      </div>

      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.icon}>
            <Globe color="#5926F0" />
          </div>
          <div>
            <h4>{t("Payment corridors")}</h4>
            <p>{t("Regional restrictions")}</p>
          </div>
        </div>

        <button
          className={styles.linkBtn}
          onClick={() => navigate("/geo-fencing")}
        >
          {t("Go to settings")} <ArrowRight size={15} />
        </button>
      </div>

      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.icon}>
            <File color="#5926F0" />
          </div>
          <div>
            <h4>{t("Legal agreements")}</h4>
            <p>
              {t(
                "View and download your signed agreements, MSAs, and service contracts.",
              )}
            </p>
          </div>
        </div>

        <Tooltip title="Coming Soon" arrow placement="top">
          <span>
            <button
              className={styles.linkBtn}

              disabled
            >
              {t("Download")} <Download size={15} />
            </button>
          </span>
        </Tooltip>
      </div>

      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.icon}>
            <FaFingerprint color="#5926F0" />
          </div>
          <div>
            <h4>{t("Security & 2FA")}</h4>
            <p>
              {t(
                "Manage password, two-factor authentication, and active session devices.",
              )}
            </p>
          </div>
        </div>

        <button
          className={styles.linkBtn}
          onClick={() => navigate("/settings?tab=tfa")}
        >
          {t("Go to settings")} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Manage;
