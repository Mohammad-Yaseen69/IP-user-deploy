import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Btn } from '../../../../AbstractElements';

const LoadAmountModal = (props) => {
    return (
        <Modal isOpen={props.isOpen} toggle={props.toggler} size={props.size} centered>
            <ModalHeader toggle={props.toggler}>
                {props.title}
            </ModalHeader>
            <ModalBody className={props.bodyClass}>
                {props.children}
            </ModalBody>
            <ModalFooter>
                <form method="POST" action="https://payments.securetrading.net/process/payments/choice">
                    <input type="hidden" name="sitereference" value="test_kemitkingdom79109" />
                    <input type="hidden" name="stprofile" value="default" />
                    <input type="hidden" name="currencyiso3a" value="USD" />
                    <input type="hidden" name="mainamount" value="100.00" />
                    <input type="hidden" name="version" value="2" />
                    <Btn attrBtn={{ color: 'primary', type: "sumbit" }}>{props.buttonTwoText}</Btn>
                </form>
            </ModalFooter>
        </Modal>
    );
};

export default LoadAmountModal;