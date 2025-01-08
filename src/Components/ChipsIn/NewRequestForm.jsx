import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import { addRequest } from '../../store/slices/ChipsInRequests';
import QrReceipt from './QrReceipt';

const NewRequestForm = ({ setShowForm }) => {
    const [currency, setCurrency] = useState('USD');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [item, setItem] = useState("")
    const [showReceipt, setShowReceipt] = useState(false)
    const dispatch = useDispatch()

    const toggleReceipt = () => {
        setShowReceipt(!showReceipt)
        setShowForm(false)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const id = Math.trunc(Math.random() * 10000000)
        const currentDate = new Date()
        const payload = {
            id,
            name: title,
            wallet: currency,
            date: currentDate.toLocaleDateString().split("/").join("-"),
            time: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
            type: "Specific",
            transactions: 0,
            total_amount: amount,
            amount,
            status: "Active",
            description,
            qr_link: `https://my.insta-pay.ch/requests/${id}`
        }
        setItem(payload)
        setShowReceipt(true)
        dispatch(addRequest(payload))
    };

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }

    return (
        <Container>
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="currency">Wallet <span className="req_star">*</span></Label>
                            <Input
                                type="select"
                                name="currency"
                                id="currency"
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value)}
                                required
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="PKR">PKR</option>
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label for="title">Title <span className="req_star">*</span></Label>
                            <Input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label for="description">Description <span className="req_star">*</span></Label>
                            <Input
                                type="textarea"
                                name="description"
                                id="description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label for="amount">Amount <span className="req_star">*</span></Label>
                            <Input
                                type="text"
                                name="amount"
                                id="amount"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                required
                                onKeyPress={handleChangeNumber}
                            />
                        </FormGroup>

                        <div className="d-flex justify-content-end">
                            <Button type="submit" color="primary" style={{ borderRadius: "10px" }}>Submit</Button>
                        </div>
                        <QrReceipt isOpen={showReceipt} toggle={toggleReceipt} item={item} showDetails={true} />
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default NewRequestForm;
