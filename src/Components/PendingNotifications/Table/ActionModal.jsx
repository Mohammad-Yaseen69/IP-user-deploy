import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Btn } from '../../../AbstractElements';

const ActionModal = (props) => {
  return (
    <Modal isOpen={props.isOpen} toggle={props.toggler} size={props.size} centered>
      <ModalHeader toggle={props.toggler}>
        {props.title}
      </ModalHeader>
      <ModalBody className={props.bodyClass}>
        {props.children}
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: 'secondary', onClick: props.toggler, onClick: () => props.toggler() }} >{props.buttonOneText}</Btn>
        <Btn attrBtn={{
          color: 'primary', onClick: props.toggler, onClick: () => {
            if (props.action === "accept") {
              props.setStatus(true)
            } else {
              props.setStatus(false)
            }
          }
        }}>{props.buttonTwoText}</Btn>
      </ModalFooter>
    </Modal>
  );
};

export default ActionModal;