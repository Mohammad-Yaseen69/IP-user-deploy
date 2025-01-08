import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Button, FormGroup, Label, Input, CardHeader } from 'reactstrap';
import { countries } from 'country-list-json';
import { H4 } from '../../AbstractElements';

const inputStyles = {
    border: "none",
    padding: "0"
}

const BankDepositForm = ({ amount, currency, formHeading }) => {
    const [showProofUpload, setShowProofUpload] = useState(false);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [accountTitle, setAccountTitle] = useState("")
    const [proof, setProof] = useState("")

    const handlePaymentClick = () => {
        setShowProofUpload(true);
    };

    const handleProofUpload = (e) => {
        e.preventDefault();
        // Perform the upload logic here
        setPaymentReceived(true);
    };

    if (paymentReceived) {
        return (
            <Card style={{ width: "100%", marginRight: "50px", height: "fit-content" }}>
                <CardBody className='text-center'>
                    <i className="fa fa-check-circle fa-5x mb-4" style={{ color: 'green' }} />
                    <h4>Your payment has been received.</h4>
                    <p>Thank you for submitting your payment proof. Your transaction is now being processed. A confirmation notification will be sent to your Insta-Pay Wallet once the funds are successfully transferred. Please note that it might take some time depending on the bank's processing time. Should you need further assistance, feel free to reach out to our customer support. Thank you for choosing Insta-Pay!</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card style={{ width: "100%", marginRight: "50px", height: "fit-content" }}>
            <CardBody>
                <h4 className='mb-3'>{formHeading}</h4>
                <form>
                    {!showProofUpload ? (
                        <>
                            <FormGroup>
                                <Label for="country">Country</Label>
                                <Input style={inputStyles} required type="text" name="iban" id="iban" readOnly value={"Pakistan"} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="iban">IBAN Number</Label>
                                <Input style={inputStyles} required type="text" name="iban" id="iban" readOnly value={"PK74 1111 2222 3333 4444"} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="accountName">Account Name</Label>
                                <Input style={inputStyles} required type="text" name="accountName" id="accountName" readOnly value={"Mr. Jonathan"} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="branchName">Branch Name</Label>
                                <Input style={inputStyles} required type="text" name="branchName" id="branchName" readOnly value={"Minara Road Sukkur Main Branch"} />
                            </FormGroup>

                            <div style={{ textAlign: "right" }}>
                                <Button color="primary" onClick={handlePaymentClick} style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none"
                                }}>
                                    Done And Deposit
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <FormGroup>
                                <Label for="branchName">Account Title <span className="req_star">*</span></Label>
                                <Input required type="text" name="branchName" id="branchName" value={accountTitle} onChange={e => setAccountTitle(e.target.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="proof">Upload the proof of your transaction <span className="req_star">*</span></Label>
                                <Input required type="file" name="proof" id="proof" value={proof} onChange={e => setProof(e.target.value)} />
                            </FormGroup>
                            <div style={{ textAlign: "right" }}>
                                <Button color="primary" onClick={handleProofUpload} style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none"
                                }} disabled={!accountTitle || !proof}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </CardBody>
        </Card>
    );
};

export default BankDepositForm;
