import React, { useRef } from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';

const RequestOtp = ({ currency, sis, stc, amount }) => {
    const inputs = Array(6).fill(0); // Array to hold references to the input fields
    const firstInputRef = useRef(null);

    const handleKeyUp = (index, event) => {
        if (event.key === 'Backspace' && index > 0) {
            // Move focus to the previous input field on backspace
            inputs[index - 1].focus();
        } else if (event.key !== 'Backspace' && index < inputs.length - 1) {
            // Move focus to the next input field on entering a digit
            inputs[index + 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const url = "https://payments.securetrading.net/process/payments/choice";
        const params = new URLSearchParams(formData)
        stc("iframe")
        sis(`${url}?${params.toString()}`)
    }

    return (
        <Container>
            <Row>
                <Col className='text-center mb-2'>
                    <h5>OTP sent to <span>03001234567</span></h5>
                </Col>
            </Row>
            <Row>
                <Col className='mb-2'>
                    <form>
                        <div className="d-flex justify-content-center">
                            {inputs.map((_, index) => (
                                <Input
                                    style={{ fontSize: "30px", aspectRatio: 1, maxWidth: "80px" }}
                                    key={index}
                                    innerRef={(input) => {
                                        inputs[index] = input;
                                        if (index === 0) {
                                            firstInputRef.current = input;
                                        }
                                    }}
                                    type="text"
                                    maxLength={1}
                                    className="text-center mx-2"
                                    onKeyUp={(event) => handleKeyUp(index, event)}
                                />
                            ))}
                        </div>
                    </form>
                </Col>
            </Row>
            <Row>
                <Col className='text-center'>
                    <p>
                        <span>Didn't receive the code?</span> <a href="#">Resend code</a>
                    </p>
                </Col>
            </Row>
            <Row>
                <Col className="text-center mt-2">
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="sitereference" value="test_kemitkingdom79109" />
                        <input type="hidden" name="stprofile" value="default" />
                        <input type="hidden" name="currencyiso3a" value={currency} />
                        <input type="hidden" name="mainamount" value={amount} />
                        <input type="hidden" name="version" value="2" />
                        <Button color="primary">Confirm</Button>
                    </form>
                </Col>
            </Row>
        </Container>
    );
};

export default RequestOtp;
