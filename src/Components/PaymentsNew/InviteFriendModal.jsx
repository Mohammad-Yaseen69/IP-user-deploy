import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from 'reactstrap';

const InviteFriendModal = ({ isOpen, toggle }) => {
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleInvite = () => {
        // Perform invite logic here
        // console.log('Invite button clicked');
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleMobileNumberChange = (e) => {
        setMobileNumber(e.target.value);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Invite Friend</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="friendEmail">Friend's Email</Label>
                    <Input
                        type="email"
                        name="email"
                        id="friendEmail"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="friendMobileNumber">Friend's Mobile Number</Label>
                    <Input
                        type="tel"
                        name="mobileNumber"
                        id="friendMobileNumber"
                        value={mobileNumber}
                        onChange={handleMobileNumberChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="message">Message</Label>
                    <Input
                        type="textarea"
                        name="message"
                        id="message"
                        value={message}
                        onChange={handleMessageChange}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleInvite}
                    style={{
                        border: "none",
                        outline: "none",
                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                        backgroundBlendMode: "overlay, normal",
                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                        borderRadius: "6px",
                        padding: "7px 24px",
                        fontSize: "16px"
                    }}
                >Invite</Button>
            </ModalFooter>
        </Modal>
    );
};

export default InviteFriendModal;