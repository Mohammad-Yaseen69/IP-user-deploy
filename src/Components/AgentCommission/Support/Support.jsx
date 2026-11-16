import React from "react";
import useWindowWidth from "../../../utils/useWindowWidth";
import { useTranslation } from "react-i18next";
import styles from "../styles/support.module.css";
import TopRight from "../../topRight";
import { FaBookBookmark, FaHeadset } from "react-icons/fa6";
import { Star } from "react-feather";

const Support = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Support")}</h1>
          <p>{t("Help growing your book and onboarding clients.")}</p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.cardGrid}>
          <div className={styles.supportCard}>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <FaHeadset size={30} />
              </div>
              <div>
                {" "}
                <h3 className={styles.cardTitle}>{t("Reseller support")}</h3>
                <p className={styles.cardText}>{t("Dedicated agent line")}</p>
              </div>
            </div>
            <button className={styles.contactBtn}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2.03128 8.62462C1.52194 7.67307 1.37156 6.57015 1.60757 5.51698C1.84357 4.46381 2.45024 3.53053 3.31695 2.88734C4.18365 2.24415 5.25266 1.93389 6.32904 2.01313C7.40542 2.09236 8.41747 2.55583 9.18065 3.319C9.94382 4.08218 10.4073 5.09423 10.4865 6.17061C10.5658 7.24699 10.2555 8.316 9.6123 9.1827C8.96911 10.0494 8.03584 10.6561 6.98267 10.8921C5.92949 11.1281 4.82658 10.9777 3.87503 10.4684L2.14003 10.9784C2.05388 11.0037 1.9625 11.0053 1.8755 10.9831C1.7885 10.9609 1.70908 10.9157 1.64559 10.8522C1.5821 10.7887 1.53688 10.7093 1.51467 10.6223C1.49247 10.5353 1.4941 10.4439 1.5194 10.3577L2.03128 8.62462Z"
                  stroke="#F2EEFF"
                  stroke-width="1.33333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.2463 5.00684C11.0022 5.04793 11.7356 5.27909 12.3785 5.6789C13.0214 6.07872 13.553 6.63426 13.9241 7.29411C14.2953 7.95396 14.494 8.69679 14.5018 9.45381C14.5096 10.2108 14.3262 10.9576 13.9688 11.625L14.4788 13.36C14.5041 13.4461 14.5057 13.5375 14.4835 13.6245C14.4613 13.7115 14.4161 13.7909 14.3526 13.8544C14.2891 13.9179 14.2097 13.9631 14.1227 13.9853C14.0357 14.0075 13.9443 14.0059 13.8582 13.9806L12.125 13.4687C11.5525 13.7749 10.9206 13.9536 10.2725 13.9927C9.62446 14.0318 8.97561 13.9303 8.37045 13.6952C7.76529 13.46 7.21813 13.0968 6.76648 12.6304C6.31483 12.164 5.96937 11.6055 5.75378 10.9931"
                  stroke="#F2EEFF"
                  stroke-width="1.33333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {t("Start chat")}
            </button>
          </div>
          <div className={styles.supportCard}>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M16.5 3V12L13.4991 9.75L10.5 12V3"
                    stroke="#F2EEFF"
                    stroke-width="2.02941"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M4.5 20.25C4.5 19.6533 4.73705 19.081 5.15901 18.659C5.58097 18.2371 6.15326 18 6.75 18H19.5V3H6.75C6.15326 3 5.58097 3.23705 5.15901 3.65901C4.73705 4.08097 4.5 4.65326 4.5 5.25V20.25Z"
                    stroke="#F2EEFF"
                    stroke-width="2.02941"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M4.5 20.25V21H18"
                    stroke="#F2EEFF"
                    stroke-width="2.02941"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div>
                {" "}
                <h3 className={styles.cardTitle}>{t("Onboarding playbook")}</h3>
                <p className={styles.cardText}>{t("How to submit & close")}</p>
              </div>
            </div>
            <button className={styles.contactBtn1}>{t("Browse")}</button>
          </div>
          <div className={styles.supportCard}>
            <div className={styles.cardContent}>
              <div className={styles.icon}>
                <Star size={30} />
              </div>
              <div>
                {" "}
                <h3 className={styles.cardTitle}>{t("Best practices")}</h3>
                <p className={styles.cardText}>{t("Convert more leads")}</p>
              </div>
            </div>
            <button className={styles.contactBtn1}>{t("Read")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
