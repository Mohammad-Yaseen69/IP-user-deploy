import React from 'react';
import { UserCheck } from 'react-feather';
import { Container, Row, Col, Button } from 'reactstrap';

const StepThree = ({ ssi }) => {
    return (
        <Container style={{ marginTop: "2rem" }}>
            <Row>
                <Col className="text-center">
                    <UserCheck size={80} />
                    <h3>Verification in Process</h3>
                    <p>
                        Thank you for submitting your documents. We have received them successfully and they are now being reviewed by our team .Our team will get back to you soon with further updates.
                    </p>
                    <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                        <Button color='primary' onClick={() => ssi(false)}>Done</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default StepThree;
