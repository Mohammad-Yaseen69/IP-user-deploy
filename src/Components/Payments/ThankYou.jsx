import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';

const ThankYou = ({ mobileView }) => {
    return (
        <VerticalTimelineElement
            className="vertical-timeline-element--work"
            animate={true}
            // icon={<div style={{
            //     borderRadius: "100%",
            //     height: "100%",
            //     width: "100%"
            // }}> <Check /></div>}
            iconStyle={{
                boxShadow: "none",
                padding: "5px",
                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)"
            }}
            contentStyle={{
                background: "transparent",
                padding: "1rem 1rem 0 1rem",
                height: "fit-content",
                transform: "translateY(-11px)",
                marginLeft: mobileView ? "45px" : "60px",
                textAlign: "center"
            }}
        >
            {/* <Card className="text-center"> */}
            <CardBody style={{
                boxShadow: "0 0 3px rgba(128,128,128,.5)",
                width: "fit-content",
                borderRadius: "20px",
                margin: "auto"
            }}>
                <div className="circle mb-2">
                    <FaCheckCircle size={64} color="green" />
                </div>
                <CardTitle className='mb-2'>
                    You have successfully sent money <br />to Imtiaz (1111-2222-3333-4444)
                </CardTitle>
                <h4>Thank you!</h4>
            </CardBody>
            {/* </Card> */}
        </VerticalTimelineElement>
    );
};

export default ThankYou;
