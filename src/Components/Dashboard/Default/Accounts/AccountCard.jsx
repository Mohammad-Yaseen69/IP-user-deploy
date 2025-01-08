import { Card, CardHeader, Col } from "reactstrap";
import { H4 } from "../../../../AbstractElements";
import { Fragment } from "react";
import { AccountsData } from "./AccountsData";

const AccountsCard = () => {
    return (
        <Fragment>
            {AccountsData.map((data, index) => (
                <Col sm="6" lg="3" key={index}>
                    <Card
                        className={`o-hidden ${data.cardClassName ? data.cardClassName : ""}`}>
                        <div className="d-flex" style={{ alignItems: 'center', padding: "1rem" }}>
                            <div className="flex-grow-1">
                                <H4 attrH4={{ style: { fontSize: "1.2rem" } }}>{data.amount}</H4>
                                {/* <div className="progress-widget" style={{ marginTop: "1rem" }}>
                                        <div className="progress sm-progress-bar progress-animate" style={{ animation: "none" }}>
                                            <div className={data.progressClass} role="progressbar" style={{ width: `${data.progressValue}%` }} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                                            </div>
                                        </div>
                                    </div> */}
                            </div>
                            <div className="d-flex static-widget" style={{ padding: 0, margin: 0 }}>{data.svgIcon}</div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Fragment>
    );
};

export default AccountsCard;