import React, { useState } from "react";
import styles from "./styles/Sessions.module.scss";
import { Desktop, DeviceMobile } from "./Icons";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const SessionItem = ({ session, index }) => {
  const [showModal, setShowModal] = useState(false);
  const { t, i18n } = useTranslation();

  const isCurrent = index === 0;
  const platformName = session?.platform === "Linux" ? "Mobile" : session?.platform;
  const majorVersion = String(session?.browser_version ?? "").split(".")[0];
  const title = `${[session?.browser_name, majorVersion].filter(Boolean).join(" ")} ${t("on")} ${platformName ?? ""}`;
  const place = [session?.location?.city, session?.location?.country_name]
    .filter(Boolean)
    .join(", ");
  const subtitle = [
    place,
    isCurrent ? t("active now") : dayjs(session?.createdAt, { locale: i18n.language }).fromNow(),
  ]
    .filter(Boolean)
    .join(" · ");

  const DeviceIcon = session?.platform === "Windows" ? Desktop : DeviceMobile;
  const icon = (
    <span className={`${styles.tile} ${isCurrent ? styles.tileCurrent : ""}`}>
      <DeviceIcon color={isCurrent ? "#5926F0" : "#6E7687"} />
    </span>
  );
  const heading = (
    <div className={styles.rowText}>
      <div className={styles.rowTitle}>
        <span className={styles.rowName}>{title}</span>
        {isCurrent && <span className={styles.pill}>{t("This device")}</span>}
      </div>
      <p className={styles.rowSubtitle}>{subtitle}</p>
    </div>
  );

  return (
    <div className={styles.row}>
      <Modal
        isOpen={showModal}
        toggle={() => setShowModal(!showModal)}
        contentClassName={styles.modal}
      >
        <ModalHeader className={styles.modalHeader} toggle={() => setShowModal(!showModal)}>
          {t("Session Details")}
        </ModalHeader>
        <ModalBody className={styles.modalBody}>
          <div className={styles.modalSummary}>
            {icon}
            {heading}
          </div>
          <ul className={styles.details}>
            <li>
              <span>{t("Date & Time")}</span>
              <h5>{new Date(session?.createdAt).toLocaleString()}</h5>
            </li>
            <li>
              <span>{t("Platform")}</span>
              <h5>{session?.platform === "Linux" ? "Mobile" : session?.platform}</h5>
            </li>
            <li>
              <span>{t("Browser Name")}</span>
              <h5>{session?.browser_name}</h5>
            </li>
            <li>
              <span>{t("Browser Version")}</span>
              <h5>{session?.browser_version}</h5>
            </li>
            <li>
              <span>{t("IP Address")}</span>
              <h5>{session?.location?.IPv4}</h5>
            </li>
            <li>
              <span>{t("City")}</span>
              <h5>{session?.location?.city}</h5>
            </li>
            <li>
              <span>{t("State")}</span>
              <h5>{session?.location?.state}</h5>
            </li>
            <li>
              <span>{t("Country")}</span>
              <h5>{session?.location?.country_name}</h5>
            </li>
          </ul>
        </ModalBody>
      </Modal>

      {icon}
      {heading}

      <div className={styles.rowActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonTertiary}`}
          onClick={() => setShowModal(true)}
        >
          {t("View")}
        </button>
        {/* {!isCurrent && (
          <button type="button" className={`${styles.button} ${styles.buttonTertiary}`}>
            {t("Sign out")}
          </button>
        )} */}
      </div>
    </div>
  );
};

export default SessionItem;
