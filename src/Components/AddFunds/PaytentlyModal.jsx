import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import useWindowWidth from "../../utils/useWindowWidth";

const PaytentlyModal = ({ hostedUrl, onClose }) => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  return (
    <Modal isOpen={true} toggle={onClose} fullscreen={width <= 575}>
      <ModalHeader toggle={onClose}>{t("Card payment")}</ModalHeader>
      <ModalBody style={{ paddingInline: "0px" }}>
        <iframe
          title={t("Card payment")}
          src={hostedUrl}
          allow="payment"
          style={{
            width: "100%",
            maxHeight: "clamp(620px, 85vh, 620px)",
            border: 0,
            borderRadius: "16px",
            display: "block",
            aspectRatio: "2 / 4",
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default PaytentlyModal;
