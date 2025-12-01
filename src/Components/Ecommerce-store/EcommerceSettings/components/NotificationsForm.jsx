import React from 'react'
import { useTranslation } from 'react-i18next';
import style from "../Styles/GeneralFrom.module.scss";
import { Toggle } from '../../../ReceiptInvoices/UI/FormElements';

const NotificationsForm = ({ errors, register, activeTab }) => {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <h4>{t("Notifications")}</h4>
      </div>
      <div className={style.generalForm} style={{
        borderBottom: "1px solid var(--stroke-mid-4, #F0F0F0)",
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <div>
            </div>
            <h2>{t("General notifications")}</h2>
            <p>{t("Protect your account with advanced security settings and authentication options.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >
          <div
            className={style.toggleSection}
          >
            <Toggle />
            <div>
              <label >{t("Promotional & offers")}</label>
              <p>{t("Enable this to receive exclusive deals, feature updates, and special promotions.")}</p>
            </div>
          </div>
          <div
            className={style.toggleSection}
          >
            <Toggle />
            <div>

              <label >{t("System updates")}</label>
              <p>{t("Get notified about app updates, maintenance, and new features.")}</p>
            </div>
          </div>
          <div
            className={style.toggleSection}
          >
            <Toggle />
            <div>
              <label >{t("Integration notifications")}</label>
              <p>{t("Stay informed about updates or issues with third-party integrations.")}</p>
            </div>
          </div>


        </div>
      </div >
      <div className={style.generalForm} style={{
        marginTop: activeTab === 1 ? "0px" : "50px",
        borderBottom: "1px solid var(--stroke-mid-4, #F0F0F0)"

      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>

            <h2>{t("Message notifications")}</h2>
            <p>{t("Protect your account with advanced security settings and authentication options.")}</p>
          </div>



        </div>
        <div
          className={style.form}

        >
          <div
            className={style.toggleSection}
          >
            <Toggle />
            <div>
              <label >{t("All messages")}</label>
              <p>{t("Get notified for every new message received.")}</p>
            </div>
          </div>
          <div
            className={style.toggleSection}
          >
            <Toggle />
            <div>

              <label >{t("Team chat mentions")}</label>
              <p>{t("Receive notifications only when tagged in team chats.")}</p>
            </div>
          </div>



        </div>
      </div >
    </>
  )
}

export default NotificationsForm
