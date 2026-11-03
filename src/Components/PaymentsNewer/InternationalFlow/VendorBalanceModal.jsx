import { Modal, ModalBody, ModalHeader } from "reactstrap";

const VendorBalanceModal = ({ isOpen, toggle }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader style={{ paddingBottom: "6px" }} toggle={toggle}>
        <h2 style={{ fontSize: "24px" }}>{"Transfer Currently Unavailable"}</h2>
      </ModalHeader>
      <ModalBody>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
          {"This transaction cannot be completed at this time."}
        </h3>
        <p style={{ fontSize: "15px", fontWeight: 400, marginBottom: "8px" }}>
          {"Please try again shortly."}
        </p>
        <p style={{ fontSize: "15px", fontWeight: 400, marginBottom: "0" }}>
          {"If the issue persists, our support team will be happy to assist you."}
        </p>
      </ModalBody>
    </Modal>
  );
};

export default VendorBalanceModal;
