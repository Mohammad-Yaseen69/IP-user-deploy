import React, { useEffect, useState } from 'react';
import { Col, Row, Card, CardBody, CardHeader, Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import ReceiptDetails from './ReceiptDetails';
// import RequestOtp from './RequestOtp';
import RequestAmount from './RequestAmount';
import CompleteTransaction from './CompleteTransaction';
import FeedbackCard from './FeedbackCard';
import "./styles/loader.css"


const EmailAndNameForm = ({ sci }) => {
    return (
        <Container>
            <Row>
                <Col>
                    <Form onSubmit={e => {
                        e.preventDefault()
                        sci("iframe")
                    }}>
                        <FormGroup>
                            <Label htmlFor="name">Your Name <span className="req_star">*</span></Label>
                            <Input type="text" name="name" id="name" placeholder="Enter your name" required />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="email">Your Email <span className="req_star">*</span></Label>
                            <Input type="email" name="email" id="email" placeholder="Enter your email" required />
                        </FormGroup>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button color="primary" style={{ borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>Continue</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}


const RequestReceipt = () => {
    const { id } = useParams()
    const [currentItem, setCurrentItem] = useState("receipt")
    const [iframeSrc, setIframeSrc] = useState("")
    const item = useSelector(state => state.chipsInRequests).filter(item => item.id == id)[0]
    const [amount, setAmount] = useState(item.amount)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (item.type === "General") {
            setCurrentItem("amount")
        }
    }, [])

    const goBackHandler = () => {
        if (item.type === "General") {
            if (currentItem == "amount") {
                navigate(-1)
            }
            if (currentItem == "receipt") {
                setCurrentItem("amount")
            }
            if (currentItem == "iframe") {
                setCurrentItem("receipt")
            }
        }
        else {
            if (currentItem == "receipt") {
                navigate(-1)
            }
            if (currentItem == "iframe") {
                setCurrentItem("receipt")
            }
        }
    }

    return (
        <Col xl="9" md="7" lg="8" className="xl-65 box-col-70">
            <Row>
                <Col sm="12">
                    <Card>
                        {
                            currentItem !== "success"
                            &&
                            <CardHeader className="pb-0" style={{ position: "relative" }}>
                                <span style={{ fontWeight: "600", color: "var(--theme-default)", cursor: "pointer", position: "absolute", left: "10px", top: "10px" }} onClick={goBackHandler}>&larr; Go Back</span>
                                <h3 className='text-center'>{item.name}</h3>
                                <p style={{ marginBottom: "1rem", color: "inherit", fontSize: "14px", textAlign: "center", width: "100%" }}>{item.description}</p>
                            </CardHeader>
                        }
                        <CardBody>
                            <Row>
                                {
                                    currentItem === "amount"
                                    &&
                                    <RequestAmount sci={setCurrentItem} amount={amount} sa={setAmount} />
                                }
                                {
                                    currentItem === "receipt"
                                    &&
                                    <ReceiptDetails item={item} sci={setCurrentItem} sis={setIframeSrc} amount={amount} />
                                }
                                {
                                    currentItem === "email-form"
                                    &&
                                    <EmailAndNameForm sci={setCurrentItem} />
                                }
                                {
                                    currentItem === "iframe" && iframeSrc
                                        ?
                                        <>
                                            {
                                                isLoading &&
                                                <div className="loader__container">
                                                    <div className="_loader"></div>
                                                </div>

                                            }
                                            <iframe style={{ width: "100%", height: "100%", minWidth: "300px", minHeight: "600px" }} src={iframeSrc} onLoad={() => setIsLoading(false)} />
                                        </>
                                        :
                                        ""
                                }
                                {
                                    currentItem === "success"
                                    &&
                                    <CompleteTransaction />
                                }
                                {
                                    currentItem !== "iframe"
                                    &&
                                    <div style={{
                                        margin: "2rem 0 0"
                                    }}>
                                        <h4 className='text-center my-4'>Reviews</h4>
                                        <FeedbackCard />
                                        <FeedbackCard />
                                        <FeedbackCard />
                                    </div>
                                }
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Col>
    );
};

export default RequestReceipt;
