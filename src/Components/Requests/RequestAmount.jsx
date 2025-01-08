import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, } from 'reactstrap';
import { NumberSeperator } from '../../Helper/NumberSeperator';

const RequestAmount = ({ sci, sa, amount }) => {

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
                    <Form onSubmit={(e) => {
                        e.preventDefault()
                        sci("receipt")
                    }}>
                        <FormGroup>
                            <Label htmlFor="amount">Amount  <span className="req_star">*</span></Label>
                            <Input type="text" name="amount" id="amount" placeholder="Enter amount" value={amount} onChange={(e) => NumberSeperator(e.target.value, sa)} onKeyPress={handleChangeNumber} required />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="reason">Note (optional)</Label>
                            <Input type="text" name="reason" id="reason" placeholder="Enter reason" />
                        </FormGroup>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button color="primary" style={{ borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>Continue</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default RequestAmount;
