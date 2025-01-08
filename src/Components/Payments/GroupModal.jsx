import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Label, Input, Button, FormGroup, Col, Row, ModalFooter } from 'reactstrap';

const GroupModal = ({ modalOpen, toggleModal, srr }) => {
    const [selectedGroup, setSelectedGroup] = useState();
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');

    const [data, setData] = useState([
        {
            id: 1,
            groupName: 'Group 1',
            numberOfMembers: 5,
            groupMembers: [
                { memberName: 'Member 1', status: 'InstaPay' },
                { memberName: 'Member 2', status: 'Beneficiary' },
                { memberName: 'Member 3', status: 'InstaPay' },
                { memberName: 'Member 4', status: 'Beneficiary' },
                { memberName: 'Member 5', status: 'InstaPay' },
            ],
        },
        {
            id: 2,
            groupName: 'Group 2',
            numberOfMembers: 8,
            groupMembers: [
                { memberName: 'Member 1', status: 'Other' },
                { memberName: 'Member 2', status: 'InstaPay' },
                { memberName: 'Member 3', status: 'InstaPay' },
                { memberName: 'Member 4', status: 'Beneficiary' },
                { memberName: 'Member 5', status: 'InstaPay' },
                { memberName: 'Member 6', status: 'Beneficiary' },
                { memberName: 'Member 7', status: 'InstaPay' },
                { memberName: 'Member 8', status: 'Beneficiary' },
            ],
        },
        {
            id: 3,
            groupName: 'Group 3',
            numberOfMembers: 3,
            groupMembers: [
                { memberName: 'Member 1', status: 'Beneficiary' },
                { memberName: 'Member 2', status: 'InstaPay' },
                { memberName: 'Member 3', status: 'Other' },
            ],
        },
    ]);


    const handleOptionChange = (e) => {
        setSelectedGroup(e.target.value);
        const group = data.filter(item => item.id == selectedGroup)[0]
        // console.log(e.target.value, group)
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleCurrencyChange = (e) => {
        setSelectedCurrency(e.target.value);
    };

    const handleAddButtonClick = () => {
        const group = data.filter(item => item.id == selectedGroup)[0]
        const recipientsList = []
        group.groupMembers.map(member => {
            const memberObj = {
                ID: member.memberName,
                Amount: amount,
                Currency: selectedCurrency,
                availableCurrencies: ["USD", "PKR", "EUR"],
                Moded: "No",
                u_id: `${Date.now()}${Math.round(Math.random() * 118123)}`
            }
            recipientsList.push(memberObj)
        })
        srr(prev => [...recipientsList, ...prev]);
        toggleModal();
    };

    return (
        <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>Modal Title</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="selectGroup">Select Group</Label>
                    <Input type="select" name="selectGroup" id="selectGroup" onChange={handleOptionChange}>
                        <option value="">Select an option</option>
                        {
                            data.map(item => (
                                <option value={item.id}>{item.groupName}</option>
                            ))
                        }
                    </Input>
                </FormGroup>
                {selectedGroup && (
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="amount">Amount</Label>
                                <Input type="text" name="amount" id="amount" value={amount} onChange={handleAmountChange} />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="currency">Currency</Label>
                                <Input type="select" name="currency" id="currency" value={selectedCurrency} onChange={handleCurrencyChange}>
                                    <option value="">Select a currency</option>
                                    <option value="PKR">PKR</option>
                                    <option value="USD">USD</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                )}
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleAddButtonClick} style={{
                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                    border: "none",
                    outline: "none"
                }} disabled={!selectedGroup}>
                    Add
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default GroupModal;