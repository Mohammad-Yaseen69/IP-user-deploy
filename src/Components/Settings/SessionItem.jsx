import React, { useState } from "react";
import styles from "./styles/Sessions.module.scss";
import { Monitor, Smartphone } from "react-feather";
import { Badges } from "../../AbstractElements";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useTranslation } from "react-i18next";

const SessionItem = ({ session, index }) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  return (
    <div className={styles.session}>
      <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)}>
        <ModalHeader toggle={() => setShowModal(!showModal)}>{t("Session Details")}</ModalHeader>
        <ModalBody>
          <div
            style={{
              height: "100px",
              width: "100px",
              borderRadius: "33px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background:
                "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
              color: "white",
              margin: "0 auto",
            }}
          >
            {session?.platform === "Windows" ? <Monitor size={70} /> : <Smartphone size={70} />}
          </div>
          <ul
            style={{
              marginTop: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: ".5rem",
            }}
          >
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("Date & Time")}: </span>
              <h5 style={{ marginBottom: 0 }}>{new Date(session?.createdAt).toLocaleString()}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("Platform")}</span>
              <h5 style={{ marginBottom: 0 }}>
                {session?.platform === "Linux" ? "Mobile" : session?.platform}
              </h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("Browser Name")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.browser_name}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("Browser Version")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.browser_version}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("IP Address")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.location?.IPv4}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("City")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.location?.city}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("State")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.location?.state}</h5>
            </li>
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1rem",
              }}
            >
              <span>{t("Country")}</span>
              <h5 style={{ marginBottom: 0 }}>{session?.location?.country_name}</h5>
            </li>
            {/* <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1rem" }}>
                            <span>Coordinates</span>
                            <h5 style={{ marginBottom: 0 }}>Longitude: {session?.location?.longitude}, Latitude: {session?.location?.latitude}</h5>
                        </li> */}
          </ul>
        </ModalBody>
      </Modal>
      <div className={styles.s_left}>
        {session?.platform === "Windows" ? <Monitor /> : <Smartphone />}
        <p>
          <span>
            {session?.browser_name} <span>v{session?.browser_version}</span>
            {t("on")}
            {session?.platform === "Linux" ? "Mobile" : session?.platform}
          </span>
          {/* <span>{session?.isActive ? "Your current session" : ""}</span> */}
          <span>
            {t("IP Address")}: {session?.location?.IPv4}
          </span>
        </p>
      </div>
      <div
        className={styles.s_right}
        style={{ width: window.innerWidth < 1000 ? "100%" : "inherit" }}
      >
        {index === 0 && (
          <Badges
            attrBadge={{
              color: "success",
              variant: "rounded",
              style: { fontSize: ".7rem" },
            }}
          >
            {t("Active")?.toUpperCase()}
          </Badges>
        )}
        <p
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session?.location?.city}, {session?.location?.state}, {session?.location?.country_name}
        </p>
        <p
          style={{
            fontSize: ".8rem",
            color: "#5926f0",
            cursor: "pointer",
            marginBottom: 0,
            whiteSpace: "nowrap",
            marginLeft: "auto",
          }}
          onClick={() => setShowModal(true)}
        >
          {t("See More")} &rarr;
        </p>
      </div>
    </div>
  );
};

export default SessionItem;
