import React from "react";
import styles from "../styles/index.module.scss";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const UserDets = ({ step, recipientDets }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{ margin: step !== 1 && "0 0 20px 0" }} className={styles.infoBox}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        {recipientDets?.profilePicture ? (
          <img
            style={{ height: "48px", borderRadius: "100%" }}
            src={recipientDets?.profilePicture}
            alt=""
          />
        ) : (
          <div
            style={{
              height: "48px",
              width: "48px",
              borderRadius: "100%",
              background:
                "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
              flexShrink: "0",
              display: "grid",
              placeContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "25px",
            }}
          >
            {recipientDets?.name?.[0]}
          </div>
        )}

        <div style={{ width: "100%" }}>
          <h5
            style={{
              textAlign: "left",
              fontSize: recipientDets?.name?.length > 20 && "smaller",
            }}
          >
            {recipientDets?.name}
          </h5>
          <span>@{recipientDets?.username}</span>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              <img
                style={{ width: "20px", height: "20px", borderRadius: "0" }}
                src={recipientDets.file}
                alt=""
              />{" "}
              {recipientDets?.country}
            </span>
            <p
              onClick={() => navigate(`/profile/${recipientDets?.username}`)}
              style={{
                marginBottom: "0",
                fontWeight: 600,
                color: "#5926f0",
                cursor: "pointer",
              }}
            >
              {t("View Profile")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDets;
