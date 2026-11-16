import styles from "./index.module.css";
import React from "react";
import { X } from "react-feather";

const SidePopup = ({ title, content = [], isOpen = true, toggle }) => {
  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
      <div className={`${styles.container} ${isOpen ? styles.open : ""}`}>
        <div className={styles.top}>
          <h5>{title}</h5>
          <X style={{ cursor: "pointer" }} onClick={toggle} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: ".5rem",
            alignItems: "flex-start",
            textAlign: "left",
          }}
        >
          {content.map((item) => (
            <p
              style={{
                marginBottom: 0,
                fontSize: ".8rem",
                fontWeight: 500,
                color: "#3e3e3e",
              }}
              key={item?._id}
            >
              {item?.note}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidePopup;
