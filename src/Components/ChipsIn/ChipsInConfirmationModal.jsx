import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

const ChipsInConfirmationModal = ({ isOpen, onCancel, title, message, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} toggle={onCancel}>
            <ModalHeader toggle={onCancel}>{title}</ModalHeader>
            <ModalBody>{message}</ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button color="primary" onClick={onConfirm}>
                    Confirm
                </Button>{' '}
            </ModalFooter>
        </Modal>
    )
}

export default ChipsInConfirmationModal;