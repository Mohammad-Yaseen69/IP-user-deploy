import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from "reactstrap";
import * as rdd from "react-device-detect";
import instructions from "./browserInstruction.json";
import "../GoogleAuthenticatorModal/styles/modalstyles.css";

const LocationDeniedModal = ({ isOpen, toggle, onRetry }) => {
  const { t } = useTranslation();

  const getBrowserInstruction = () => {
    const browser = rdd.browserName;
    const isMobile = rdd.isMobile || rdd.isMobileSafari || rdd.isAndroid || rdd.isIOS;
    const type = isMobile ? "mobile" : "desktop";

    if (instructions[browser]) {
      return (
        instructions[browser][type] ||
        instructions[browser]["desktop"] ||
        instructions["Default"]["instruction"]
      );
    }

    if (browser.includes("Safari") && isMobile) {
      return instructions["Safari"]["iOS"];
    }

    return instructions["Default"]["instruction"];
  };

  const instruction = getBrowserInstruction();

  return (
    <Modal className="modal-margin-remove" isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h4
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "0",
              color: "black",
            }}
          >
            {t("Location Access Denied")}
          </h4>
        </div>
      </ModalHeader>
      <ModalBody>
        <p
          style={{
            fontWeight: 600,
            fontSize: "15px",
            marginBottom: "15px",
            color: "#333",
          }}
        >
          {t(
            "We noticed that location access is disabled. For your security and to follow regulatory standards, InstaPay requires your location to complete the login process.",
          )}
        </p>
        <div
          style={{
            backgroundColor: "#f0fff4",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #34a853",
            marginBottom: "15px",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "5px",
              color: "#0f9d58",
            }}
          >
            {t("How to enable location for")} {rdd.browserName}:
          </p>
          <p
            style={{
              fontSize: "13px",
              marginBottom: "0",
              color: "#137333",
              lineHeight: "1.4",
            }}
          >
            {t(instruction)}
          </p>
        </div>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "0" }}>
          {t("After enabling location, please click 'Allow' and then 'Try Again'.")}
        </p>
      </ModalBody>
      <ModalFooter style={{ borderTop: "none" }}>
        <button
          style={{
            borderRadius: "8px",
            backgroundColor: "transparent",
            color: "black",
            border: "1px solid #ddd",
            fontWeight: 600,
            padding: "8px 20px",
          }}
          onClick={toggle}
        >
          {t("Close")}
        </button>
        <button
          style={{
            borderRadius: "8px",
            backgroundColor: "#5627e2",
            fontWeight: 600,
            border: "none",
            color: "white",
            padding: "8px 24px",
          }}
          onClick={onRetry}
        >
          {t("Try Again")}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default LocationDeniedModal;
