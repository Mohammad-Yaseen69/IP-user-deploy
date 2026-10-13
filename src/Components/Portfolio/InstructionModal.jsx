import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const InstructionsModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} toggle={toggle} style={{ minWidth: "50vw" }}>
      <ModalHeader toggle={toggle}>{t("Benefits Of Portfolio")}</ModalHeader>
      <ModalBody
        style={{
          containerType: "inline-size",
          display: "flex",
          gap: "1rem",
          padding: "24px 24px 24px 24px",
        }}
      >
        <div>
          <h5
            style={{
              color: "#5925f0",
              fontSize: "min(5cqi, 40px)",
              fontWeight: "700",
              marginBottom: "1.75rem",
            }}
          >
            {t("Benefits:")}
          </h5>

          <div style={{ marginBottom: "1.5rem" }}>
            <h6
              style={{
                fontSize: "min(3cqi, 21px)",
                marginBottom: "11px",
                fontWeight: "600",
              }}
            >
              {t("Enhanced Visibility:")}
            </h6>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
              }}
            >
              {t(
                "Elevate your public profile. Your portfolio acts as a dynamic showcase, accessible directly from your Payment Address.",
              )}
            </p>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h6
              style={{
                fontSize: "min(3cqi, 21px)",
                marginBottom: "11px",
                fontWeight: "600",
              }}
            >
              {t("Engage Your Audience:")}
            </h6>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
              }}
            >
              {t(
                "Connect with visitors through your creative or professional journey. Let your work speak for you, creating a deeper engagement with potential clients or supporters.",
              )}
            </p>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h6
              style={{
                fontSize: "min(3cqi, 21px)",
                marginBottom: "11px",
                fontWeight: "600",
              }}
            >
              {t("Integrated Social Proof:")}
            </h6>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
              }}
            >
              {t(
                "Display your social media influence. Visitors can see your social media reach, adding credibility and context to your portfolio.",
              )}
            </p>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h6
              style={{
                fontSize: "min(3cqi, 21px)",
                marginBottom: "11px",
                fontWeight: "600",
              }}
            >
              {t("Seamless Transactions:")}
            </h6>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
              }}
            >
              {t(
                "Enable visitors to request or initiate payments right from your public page. Your portfolio not only showcases your work but also facilitates easy financial interactions.",
              )}
            </p>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h6
              style={{
                fontSize: "min(3cqi, 21px)",
                marginBottom: "11px",
                fontWeight: "600",
              }}
            >
              {t("Personalized Storytelling:")}
            </h6>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
              }}
            >
              {t(
                "Use the 'About Me' section to share your story, mission, or vision, creating a personal connection with your audience.",
              )}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "min(2.2cqi, 15px)",
                color: "#585858",
                fontWeight: "600",
                marginBottom: 0,
              }}
            >
              {t(
                "My Portfolio' is more than just a gallery; it's a tool to build your brand, engage your audience, and streamline your financial interactions on InstaPay.",
              )}
            </p>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default InstructionsModal;
