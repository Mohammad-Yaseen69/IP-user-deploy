import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const PaytentlyModal = ({ hostedUrl, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={true} toggle={onClose}>
      <ModalHeader toggle={onClose}>{t("Card payment")}</ModalHeader>
      <ModalBody>
        <iframe
          title={t("Card payment")}
          src={hostedUrl}
          allow="payment"
          style={{
            width: "100%",
            height: "clamp(620px, 85vh, 620px)",
            border: 0,
            borderRadius: "16px",
            display: "block",
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default PaytentlyModal;
