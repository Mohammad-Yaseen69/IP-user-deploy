import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Modal, ModalBody } from "reactstrap";
import alert from "./icon.svg";
import styles from "./styles.module.css";
import { ChevronRight } from "react-feather";

const ThreeDaysModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const addNow = () => {
    navigate("/settings?tab=security&editmode=true");
    toggle();
  };
  return (
    <Modal isOpen={isOpen} contentClassName={styles.content}>
      <ModalBody className={styles.body}>
        <img src={alert} alt="" />
        <h4>{t("Security Alert")}</h4>
        <p>
          {t(
            "Secure your account with just a few clicks! Set up your security questions today to add an extra layer of protection. It’s quick, easy, and ensures only you can access your financial information. Get started now in your account settings!",
          )}
        </p>
        <div>
          <button className={styles.trns} onClick={toggle}>
            {t("Remind me later")}
          </button>
          <Button onClick={addNow}>
            {t("Setup Security Questions")}{" "}
            <ChevronRight color="white" size={20} />
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ThreeDaysModal;
