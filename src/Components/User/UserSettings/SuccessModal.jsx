import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const SuccessModal = ({ isOpen, toggle }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Success</ModalHeader>
      <ModalBody>
        <h5>Details Updated Successfully!</h5>
      </ModalBody>
    </Modal>
  );
};

export default SuccessModal;
