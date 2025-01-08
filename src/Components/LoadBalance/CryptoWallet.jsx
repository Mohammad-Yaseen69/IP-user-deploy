import React, { useState } from 'react';
import { Card, CardBody, Button, FormGroup, Label, Input } from 'reactstrap';


const inputStyles = {
    border: "none",
    padding: "0"
}


const CryptoWallet = ({ formHeading }) => {
    const [showProofUpload, setShowProofUpload] = useState(false);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [walletNumber, setWalletNumber] = useState("")
    const [proof, setProof] = useState("")
    const [currency, setCurrency] = useState("btc")

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
                <p style={{ fontSize: ".7rem" }}>
                    {
                        showProofUpload
                            ?
                            "Remember to upload proof of your payment to complete the process. Your transaction will be processed once the proof of payment is validated. Should you need further assistance, our customer support team is ready to assist you. Thank you for choosing Insta-Pay!"
                            :
                            "Thank you for choosing the 'Crypto Wallet' as your preferred payment method. To top up your INSTA-PAY Wallet, simply transfer funds from your existing Crypto Wallet to our INSTA-PAY Crypto Wallet, held by our company, Kemit Kingdom. We currently support Ethereum and Bitcoin. Upon selection of your preferred cryptocurrency, the corresponding INSTA-PAY Crypto Wallet Address will be displayed for your transfer."
                    }
                </p>
                <form>
                    {!showProofUpload ? (
                        <>
                            <FormGroup>
                                <Label for="wallet_address">Select Cryptocurrency</Label>
                                <Input required type="select" name="iban" id="iban" value={currency} onChange={e => setCurrency(e.target.value)}>
                                    <option value="btc">Bitcoin</option>
                                    <option value="eth">Ethereum</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="wallet_address">Crypto Wallet Number</Label>
                                <Input required type="text" name="iban" id="iban" readOnly value={currency === "btc" ? `A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` : "0xb794f5ea0ba39494ce839613fffba74279579268"} />
                            </FormGroup>
                            <p style={{ fontSize: ".7rem" }}>Please note that your INSTA-PAY Wallet will be recharged in fiat currency. The conversion will be based on the market value of the cryptocurrency at the time we receive it. The converted fiat equivalent, minus transaction fees, will then be credited to your INSTA-PAY Wallet.
                            </p>

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
                                <Label for="branchName">Your Crypto Wallet Number <span className="req_star">*</span></Label>
                                <Input required type="text" name="branchName" id="branchName" placeholder='Enter your wallet number' value={walletNumber} onChange={e => setWalletNumber(e.target.value)} />
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
                                }} disabled={!walletNumber || !proof}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </CardBody>
        </Card>
    );
}

export default CryptoWallet;