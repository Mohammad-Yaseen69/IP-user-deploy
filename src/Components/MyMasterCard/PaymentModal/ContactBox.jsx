import { useTranslation } from "react-i18next";
import styles from "../styles/onboard.module.scss";
import { ChevronUp } from "lucide-react";

const ContactBox = ({ style, isMobile }) => {
  const { t } = useTranslation();
  const handleContactClick = () => {
    window.open(
      "https://guide.insta-pay.ch/faq/troubleshooting-guide",
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (isMobile) {
    return (
      <div
        style={style}
        className={styles.helpButton}
        onClick={handleContactClick}
      >
        <div className={styles.helpCircle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <span className={styles.helpText}>{t("Help")}</span>
        <ChevronUp size={16} color="#5926F0" />
      </div>
    );
  }
  return (
    <div style={style} className={styles.contact} onClick={handleContactClick}>
      <div className={styles.circle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
          <path
            d="M7.39898 7.36508C7.56628 6.88948 7.89651 6.48843 8.33118 6.23297C8.76585 5.97751 9.2769 5.88413 9.77381 5.96937C10.2707 6.0546 10.7214 6.31295 11.0461 6.69866C11.3708 7.08437 11.5485 7.57254 11.5478 8.07671C11.5478 9.49997 9.41289 10.2116 9.41289 10.2116M9.46982 13.0581H9.47694M16.5861 9.49997C16.5861 13.4302 13.4 16.6163 9.46982 16.6163C5.53959 16.6163 2.35352 13.4302 2.35352 9.49997C2.35352 5.56975 5.53959 2.38367 9.46982 2.38367C13.4 2.38367 16.5861 5.56975 16.5861 9.49997Z"
            stroke="#5926F0"
            stroke-width="1.42326"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#6F6F6F" }}>
          {t("Having Troubles?")}
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "black" }}>
          {t("Contact Us")}
        </span>
      </div>
    </div>
  );
};

export default ContactBox;
