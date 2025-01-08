import React, { useState } from 'react';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import { CheckCircle } from 'react-feather';
import Rating from 'react-rating';

const CompleteTransaction = () => {
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState('');

    const handleRatingChange = (e) => {
        setRating(e.target.value);
    };

    const handleReviewChange = (e) => {
        setReview(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('Rating:', rating);
        // console.log('Review:', review);
    };

    return (
        <Container className="text-center">
            <div className="circle">
                <CheckCircle size={100} color="green" />
            </div>
            <h5>Your transaction has been completed successfully</h5>
            <p className='mt-4'>Provide Your Feedback!</p>
            <Form onSubmit={handleSubmit}>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <FormGroup>
                            {/* <Label for="rating">Rating:</Label>
                            <Input type="select" name="rating" id="rating" value={rating} onChange={handleRatingChange}>
                                <option value="">Select rating</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </Input> */}
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: ".5rem",
                                color: "#5826f0"
                            }}>
                                <Rating initialRating={rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" onChange={(rate) => setRating(rate)}></Rating>
                            </div>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <FormGroup>
                        {/* <Label for="review">Review:</Label> */}
                        <Input type="textarea" name="review" id="review" value={review} onChange={handleReviewChange} placeholder='Write your feedback!' />
                    </FormGroup>
                </Row>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    <Button color="primary">Submit</Button>
                </div>
            </Form>
        </Container>
    );
};

export default CompleteTransaction;
