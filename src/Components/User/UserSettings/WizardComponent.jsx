import React, { useState } from 'react';
import { Button, Container, Row, Col, Progress } from 'reactstrap';

const Wizard = ({ steps, ssi }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const renderStepContent = () => {
        const StepComponent = steps[currentStep].component;
        return <StepComponent next={handleNext} prev={handlePrevious} />;
    };

    const renderNavigationButtons = () => {
        const isLastStep = currentStep === steps.length - 1;

        return (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {isLastStep && (
                    <Button color="primary" onClick={() => ssi(false)}>
                        Finish
                    </Button>
                )}
            </div>
        );
    };

    return (
        <Container style={{ marginTop: "2rem" }}>
            <Row className='mb-4'>
                <Col>
                    <Progress color='primary' value={((currentStep + 1) / steps.length) * 100} />
                </Col>
            </Row>
            <Row>
                <Col>{renderStepContent()}</Col>
            </Row>
            <Row>
                <Col>{renderNavigationButtons()}</Col>
            </Row>
        </Container>
    );
};

export default Wizard;
