import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const BenConfirmationModal = ({ isOpen, toggle, heading, message, onCancel, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{heading}</ModalHeader>
            <ModalBody>
                <p>{message}</p>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onCancel}>Cancel</Button>
                <Button color="primary" onClick={onConfirm}>Confirm</Button>
            </ModalFooter>
        </Modal>
    );
};

export default BenConfirmationModal;