import React, { useState } from 'react';
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button,
} from 'reactstrap';
import { useDispatch } from 'react-redux';
import { addRequest } from '../../store/slices/ChipsInRequests';

const MyForm = ({ ssr, title, setTitle, amount, setAmount, description, setDescription, setItemId, stb }) => {
    const [showAmount, setShowAmount] = useState(false);
    const dispatch = useDispatch()

    const handleSubmit = (e) => {
        e.preventDefault();
        stb()
        if (showAmount) {
            ssr(true)
            const id = Math.round(Math.random() * 1000000)
            setItemId(id)
            dispatch(addRequest({
                id,
                name: title,
                description,
                date: new Date().toLocaleString().slice(0, 10).replaceAll("/", "-"),
                status: "Active",
                type: "Specific",
                amount,
                qr_link: `https://my.insta-pay.ch/requests/${id}`
            }))
        } else {
            setShowAmount(true);
        }
    };

    const handleChangeNumber = (event) => {
        const charCode = event.charCode;
        if (!/\d/.test(String.fromCharCode(charCode))) {
            event.preventDefault();
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="title">Title</Label>
                <Input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </FormGroup>
            <FormGroup>
                <Label for="description">Description</Label>
                <Input
                    type="textarea"
                    name="description"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </FormGroup>
            {showAmount && (
                <FormGroup>
                    <Label for="amount">Amount</Label>
                    <Input
                        type="text"
                        name="amount"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyPress={handleChangeNumber}
                        required
                    />
                </FormGroup>
            )}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1.5rem"
            }}>
                <Button type="submit" color='primary'>{showAmount ? 'Submit' : 'Next'}</Button>
            </div>
        </Form>
    );
};

export default MyForm;