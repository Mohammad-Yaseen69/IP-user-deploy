import { Modal, ModalBody, ModalHeader } from "reactstrap";

const ImagePreviewModal = ({ isOpen, toggle, currentImage }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Image Preview</ModalHeader>
      <ModalBody style={{ padding: 0 }}>
        <img
          src={currentImage.src}
          alt={currentImage.index}
          style={{ maxWidth: "500px", objectFit: "contain", width: "90vw" }}
        />
      </ModalBody>
    </Modal>
  );
};

export default ImagePreviewModal;
