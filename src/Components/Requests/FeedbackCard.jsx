import React from "react";
import { Card, CardBody, } from "reactstrap";

const FeedbackCard = () => {
    return (
        <div className="d-flex flex-start mb-4" style={{ flexWrap: "wrap" }}>
            <img
                className="rounded-circle shadow-1-strong me-3"
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).webp"
                alt="avatar"
                width="65"
                height="65"
            />

            <Card style={{ flex: "1", minWidth: "300px" }}>
                <CardBody className="p-4">
                    <div>
                        <h5 className="card-title">Johny Cash</h5>
                        <p className="small">3 hours ago</p>
                        <p>
                            Cras sit amet nibh libero, in gravida nulla. Nulla vel
                            metus scelerisque ante sollicitudin. Cras purus odio,
                            vestibulum in vulputate at, tempus viverra turpis. Fusce
                            condimentum nunc ac nisi vulputate fringilla. Donec
                            lacinia congue felis in faucibus ras purus odio,
                            vestibulum in vulputate at, tempus viverra turpis.
                        </p>

                        {/* <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <a href="#!" className="link-muted me-2">
                                    <i className="fas fa-thumbs-up me-1" />
                                    132
                                </a>
                                <a href="#!" className="link-muted">
                                    <i className="fas fa-thumbs-down me-1" />
                                    15
                                </a>
                            </div>
                            <a href="#!" className="link-muted">
                                <i className="fas fa-reply me-1" /> Reply
                            </a>
                        </div> */}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}


export default FeedbackCard