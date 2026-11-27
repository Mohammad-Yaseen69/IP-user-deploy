import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const PaymentsConfirmationModal = ({
  isOpen,
  onCancel,
  title,
  message,
  onConfirm,
  btnOneText = "",
  btnTwoText = "",
}) => {
  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalHeader toggle={onCancel}>{title}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCancel}>
          {btnOneText || "No"}
        </Button>
        <Button color="primary" onClick={onConfirm}>
          {btnTwoText || "Yes"}
        </Button>{" "}
      </ModalFooter>
    </Modal>
  );
};

export default PaymentsConfirmationModal;
