import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Modal, ModalBody } from "reactstrap";
import alert from "./icon.svg";
import styles from "./styles.module.css";
import { ChevronRight } from "react-feather";

const ThirtyDaysModal = ({ isOpen, toggle }) => {
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
            "Please remember to add your security questions for smooth experience. You will not be able to access the features of InstaPay unless You add the security questions.",
          )}
        </p>
        <div>
          <Button onClick={addNow}>
            {t("Setup Security Questions")}{" "}
            <ChevronRight color="white" size={20} />
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ThirtyDaysModal;
