import React from "react";
import styles from "./styles/NotifTable.module.scss";
import Switch from "./Switch";
import { useTranslation } from "react-i18next";

const NotifTable = () => {
  const { t } = useTranslation();
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{t("Activity")}</th>
          <th>{t("Email")}</th>
          <th>{t("Push")}</th>
          <th>{t("SMS")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Activity">{t("Recieve Payments")}</td>
          <td data-label={t("Email")}>
            <Switch condition={true} />
          </td>
          <td data-label={t("Push")}>
            <Switch condition={false} />
          </td>
          <td data-label={t("SMS")}>
            <Switch condition={true} />
          </td>
        </tr>
        <tr>
          <td data-label="Activity">{t("Bulk Payments")}</td>
          <td data-label={t("Email")}>
            <Switch condition={false} />
          </td>
          <td data-label={t("Push")}>
            <Switch condition={true} />
          </td>
          <td data-label={t("SMS")}>
            <Switch condition={false} />
          </td>
        </tr>
        <tr>
          <td data-label="Activity">{t("Activity 3")}</td>
          <td data-label={t("Email")}>
            <Switch condition={true} />
          </td>
          <td data-label={t("Push")}>
            <Switch condition={true} />
          </td>
          <td data-label={t("SMS")}>
            <Switch condition={true} />
          </td>
        </tr>
        <tr>
          <td data-label="Activity">{t("Activity 4")}</td>
          <td data-label={t("Email")}>
            <Switch condition={false} />
          </td>
          <td data-label={t("Push")}>
            <Switch condition={false} />
          </td>
          <td data-label={t("SMS")}>
            <Switch condition={false} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default NotifTable;
